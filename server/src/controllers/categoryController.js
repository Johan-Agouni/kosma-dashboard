const Category = require('../models/Category');
const Product = require('../models/Product');
const { recordAudit } = require('../middleware/auditLog');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const getCategories = asyncHandler(async (_req, res) => {
    const categories = await Category.find()
        .populate('parent', 'name slug')
        .sort('sortOrder name')
        .lean();

    const productCounts = await Product.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const countsMap = {};
    productCounts.forEach(pc => {
        countsMap[pc._id.toString()] = pc.count;
    });

    const categoriesWithCount = categories.map(cat => ({
        ...cat,
        productCount: countsMap[cat._id.toString()] || 0,
    }));

    res.json({ status: 200, data: categoriesWithCount });
});

const getCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id).populate('parent', 'name slug');
    if (!category) {
        throw ApiError.notFound('Categorie introuvable');
    }

    res.json({ status: 200, data: category });
});

const createCategory = asyncHandler(async (req, res) => {
    if (req.body.parent) {
        const parent = await Category.findById(req.body.parent);
        if (!parent) {
            throw ApiError.badRequest('Categorie parent introuvable');
        }
    }

    const category = await Category.create(req.body);

    await recordAudit(req, {
        action: 'create',
        resource: 'category',
        resourceId: category._id,
        details: { name: category.name },
    });

    res.status(201).json({
        status: 201,
        message: 'Categorie creee',
        data: category,
    });
});

const updateCategory = asyncHandler(async (req, res) => {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!category) {
        throw ApiError.notFound('Categorie introuvable');
    }

    await recordAudit(req, {
        action: 'update',
        resource: 'category',
        resourceId: category._id,
        details: req.body,
    });

    res.json({
        status: 200,
        message: 'Categorie mise a jour',
        data: category,
    });
});

const deleteCategory = asyncHandler(async (req, res) => {
    const productCount = await Product.countDocuments({
        category: req.params.id,
        isDeleted: false,
    });

    if (productCount > 0) {
        throw ApiError.badRequest(
            `Impossible de supprimer: ${productCount} produit(s) dans cette categorie`
        );
    }

    const childCount = await Category.countDocuments({ parent: req.params.id });
    if (childCount > 0) {
        throw ApiError.badRequest(
            `Impossible de supprimer: ${childCount} sous-categorie(s) existante(s)`
        );
    }

    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
        throw ApiError.notFound('Categorie introuvable');
    }

    await recordAudit(req, {
        action: 'delete',
        resource: 'category',
        resourceId: category._id,
        details: { name: category.name },
    });

    res.json({ status: 200, message: 'Categorie supprimee' });
});

module.exports = { getCategories, getCategory, createCategory, updateCategory, deleteCategory };
