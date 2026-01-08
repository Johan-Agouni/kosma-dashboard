const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const {
    createProductValidation,
    updateProductValidation,
    listProductsValidation,
} = require('../validators/productValidators');

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     tags: [Products]
 *     summary: Lister les produits
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: limit, schema: { type: integer } }
 *       - { in: query, name: search, schema: { type: string } }
 *       - { in: query, name: status, schema: { type: string, enum: [active, draft, archived] } }
 *       - { in: query, name: category, schema: { type: string } }
 *     responses:
 *       200: { description: Liste des produits paginee }
 */
router.get('/', authenticate, validate(listProductsValidation), productController.getProducts);

/**
 * @swagger
 * /api/v1/products/export/csv:
 *   get:
 *     tags: [Products]
 *     summary: Exporter les produits en CSV
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Fichier CSV }
 */
router.get('/export/csv', authenticate, authorize('admin'), productController.exportCSV);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Obtenir un produit
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Produit }
 *       404: { description: Produit introuvable }
 */
router.get('/:id', authenticate, productController.getProduct);

/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     tags: [Products]
 *     summary: Creer un produit
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Produit cree }
 */
router.post(
    '/',
    authenticate,
    authorize('admin', 'manager'),
    validate(createProductValidation),
    productController.createProduct
);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Mettre a jour un produit
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Produit mis a jour }
 */
router.put(
    '/:id',
    authenticate,
    authorize('admin', 'manager'),
    validate(updateProductValidation),
    productController.updateProduct
);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Supprimer un produit (soft delete)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Produit supprime }
 */
router.delete('/:id', authenticate, authorize('admin'), productController.deleteProduct);

/**
 * @swagger
 * /api/v1/products/{id}/images:
 *   post:
 *     tags: [Products]
 *     summary: Ajouter des images a un produit
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Images ajoutees }
 */
router.post(
    '/:id/images',
    authenticate,
    authorize('admin', 'manager'),
    upload.array('images', 5),
    productController.uploadImages
);

/**
 * @swagger
 * /api/v1/products/{id}/images/{imageId}:
 *   delete:
 *     tags: [Products]
 *     summary: Supprimer une image d'un produit
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Image supprimee }
 */
router.delete(
    '/:id/images/:imageId',
    authenticate,
    authorize('admin', 'manager'),
    productController.deleteImage
);

module.exports = router;
