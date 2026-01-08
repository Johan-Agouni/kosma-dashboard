const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const validate = require('../middleware/validate');
const {
    createCategoryValidation,
    updateCategoryValidation,
} = require('../validators/categoryValidators');

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     tags: [Categories]
 *     summary: Lister les categories
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Liste des categories }
 */
router.get('/', authenticate, categoryController.getCategories);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: Obtenir une categorie
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Categorie }
 */
router.get('/:id', authenticate, categoryController.getCategory);

/**
 * @swagger
 * /api/v1/categories:
 *   post:
 *     tags: [Categories]
 *     summary: Creer une categorie
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Categorie creee }
 */
router.post(
    '/',
    authenticate,
    authorize('admin'),
    validate(createCategoryValidation),
    categoryController.createCategory
);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   put:
 *     tags: [Categories]
 *     summary: Mettre a jour une categorie
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Categorie mise a jour }
 */
router.put(
    '/:id',
    authenticate,
    authorize('admin'),
    validate(updateCategoryValidation),
    categoryController.updateCategory
);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   delete:
 *     tags: [Categories]
 *     summary: Supprimer une categorie
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Categorie supprimee }
 */
router.delete('/:id', authenticate, authorize('admin'), categoryController.deleteCategory);

module.exports = router;
