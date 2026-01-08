const { body, query } = require('express-validator');

const createProductValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Le nom du produit est requis')
        .isLength({ max: 200 })
        .withMessage('Le nom ne doit pas depasser 200 caracteres'),
    body('description')
        .optional()
        .isLength({ max: 2000 })
        .withMessage('La description ne doit pas depasser 2000 caracteres'),
    body('price')
        .isFloat({ min: 0 })
        .withMessage('Le prix doit etre un nombre positif'),
    body('compareAtPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Le prix compare doit etre un nombre positif'),
    body('sku').optional().trim().isLength({ max: 50 }),
    body('stock')
        .isInt({ min: 0 })
        .withMessage('Le stock doit etre un entier positif'),
    body('category')
        .isMongoId()
        .withMessage('ID de categorie invalide'),
    body('status')
        .optional()
        .isIn(['active', 'draft', 'archived'])
        .withMessage('Statut invalide'),
    body('tags').optional().isArray(),
    body('tags.*').optional().isString().trim(),
];

const updateProductValidation = [
    body('name')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Le nom ne doit pas depasser 200 caracteres'),
    body('description')
        .optional()
        .isLength({ max: 2000 }),
    body('price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Le prix doit etre un nombre positif'),
    body('stock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Le stock doit etre un entier positif'),
    body('category')
        .optional()
        .isMongoId()
        .withMessage('ID de categorie invalide'),
    body('status')
        .optional()
        .isIn(['active', 'draft', 'archived'])
        .withMessage('Statut invalide'),
];

const listProductsValidation = [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'draft', 'archived']),
    query('category').optional().isMongoId(),
    query('minPrice').optional().isFloat({ min: 0 }),
    query('maxPrice').optional().isFloat({ min: 0 }),
];

module.exports = { createProductValidation, updateProductValidation, listProductsValidation };
