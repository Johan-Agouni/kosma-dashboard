const { body } = require('express-validator');

const createCategoryValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Le nom de la categorie est requis')
        .isLength({ max: 100 })
        .withMessage('Le nom ne doit pas depasser 100 caracteres'),
    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('La description ne doit pas depasser 500 caracteres'),
    body('parent').optional().isMongoId().withMessage('ID parent invalide'),
    body('isActive').optional().isBoolean(),
    body('sortOrder').optional().isInt({ min: 0 }),
];

const updateCategoryValidation = [
    body('name')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Le nom ne doit pas depasser 100 caracteres'),
    body('description').optional().isLength({ max: 500 }),
    body('parent').optional().isMongoId().withMessage('ID parent invalide'),
    body('isActive').optional().isBoolean(),
    body('sortOrder').optional().isInt({ min: 0 }),
];

module.exports = { createCategoryValidation, updateCategoryValidation };
