/**
 * Controller Product — CRUD complet du catalogue.
 *
 * Toutes les fonctions utilisent asyncHandler pour centraliser
 * la gestion d'erreurs (pas de try/catch partout). Chaque action
 * sensible (creation, modification, suppression) est tracee
 * dans l'audit log.
 */
const Product = require('../models/Product');
const { buildPagination, paginatedResponse } = require('../utils/pagination');
const { recordAudit } = require('../middleware/auditLog');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// ──────────────────────────────────────────
// Liste paginee avec filtres
// ──────────────────────────────────────────

const getProducts = asyncHandler(async (req, res) => {
    const { page, limit, skip, sort } = buildPagination(req.query);

    // Construction dynamique du filtre MongoDB
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.minPrice || req.query.maxPrice) {
        filter.price = {};
        if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
        if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }
    if (req.query.search) {
        filter.$text = { $search: req.query.search };
    }

    // Requete + count en parallele (plus rapide qu'en sequentiel)
    const [products, total] = await Promise.all([
        Product.find(filter)
            .populate('category', 'name slug')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
        Product.countDocuments(filter),
    ]);

    res.json({
        status: 200,
        ...paginatedResponse(products, total, { page, limit }),
    });
});

// ──────────────────────────────────────────
// Detail d'un produit
// ──────────────────────────────────────────

const getProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
        .populate('category', 'name slug')
        .populate('createdBy', 'firstName lastName');

    if (!product) {
        throw ApiError.notFound('Produit introuvable');
    }

    res.json({ status: 200, data: product });
});

// ──────────────────────────────────────────
// Creation
// ──────────────────────────────────────────

const createProduct = asyncHandler(async (req, res) => {
    req.body.createdBy = req.user.id;

    const product = await Product.create(req.body);
    await product.populate('category', 'name slug');

    await recordAudit(req, {
        action: 'create',
        resource: 'product',
        resourceId: product._id,
        details: { name: product.name, price: product.price },
    });

    res.status(201).json({
        status: 201,
        message: 'Produit cree avec succes',
        data: product,
    });
});

// ──────────────────────────────────────────
// Mise a jour
// ──────────────────────────────────────────

const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    }).populate('category', 'name slug');

    if (!product) {
        throw ApiError.notFound('Produit introuvable');
    }

    await recordAudit(req, {
        action: 'update',
        resource: 'product',
        resourceId: product._id,
        details: req.body,
    });

    res.json({
        status: 200,
        message: 'Produit mis a jour',
        data: product,
    });
});

// ──────────────────────────────────────────
// Suppression (soft-delete)
// ──────────────────────────────────────────

// On ne supprime jamais vraiment un produit : on le marque isDeleted
// et on passe son statut a "archived". Le hook pre-find du model
// le masque automatiquement des resultats.
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndUpdate(
        req.params.id,
        { isDeleted: true, status: 'archived' },
        { new: true }
    );

    if (!product) {
        throw ApiError.notFound('Produit introuvable');
    }

    await recordAudit(req, {
        action: 'delete',
        resource: 'product',
        resourceId: product._id,
        details: { name: product.name },
    });

    res.json({ status: 200, message: 'Produit supprime' });
});

// ──────────────────────────────────────────
// Gestion des images
// ──────────────────────────────────────────

const uploadImages = asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
        throw ApiError.badRequest('Aucune image fournie');
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
        throw ApiError.notFound('Produit introuvable');
    }

    // La premiere image uploadee sur un produit sans images
    // devient automatiquement l'image principale.
    const newImages = req.files.map((file, index) => ({
        url: `/uploads/${file.filename}`,
        alt: product.name,
        isPrimary: product.images.length === 0 && index === 0,
    }));

    product.images.push(...newImages);
    await product.save();

    res.json({
        status: 200,
        message: 'Images ajoutees',
        data: product.images,
    });
});

const deleteImage = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        throw ApiError.notFound('Produit introuvable');
    }

    product.images = product.images.filter(
        img => img._id.toString() !== req.params.imageId
    );
    await product.save();

    res.json({
        status: 200,
        message: 'Image supprimee',
        data: product.images,
    });
});

// ──────────────────────────────────────────
// Export CSV
// ──────────────────────────────────────────

// Export brut du catalogue en CSV. Le BOM UTF-8 (\uFEFF) en tete
// permet a Excel d'ouvrir le fichier correctement avec les accents.
const exportCSV = asyncHandler(async (_req, res) => {
    const products = await Product.find()
        .populate('category', 'name')
        .lean();

    const headers = 'Nom,SKU,Prix,Stock,Categorie,Statut\n';
    const rows = products
        .map(p =>
            [
                `"${p.name}"`,
                p.sku || '',
                p.price,
                p.stock,
                p.category?.name || '',
                p.status,
            ].join(',')
        )
        .join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=produits-kosma.csv');
    res.send('\uFEFF' + headers + rows);
});

module.exports = {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadImages,
    deleteImage,
    exportCSV,
};
