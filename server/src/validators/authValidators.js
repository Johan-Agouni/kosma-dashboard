const { body } = require('express-validator');

const registerValidation = [
    body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Le mot de passe doit contenir au moins 8 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Le mot de passe doit contenir une majuscule, une minuscule et un chiffre'),
    body('firstName')
        .trim()
        .notEmpty()
        .withMessage('Le prenom est requis')
        .isLength({ max: 50 })
        .withMessage('Le prenom ne doit pas depasser 50 caracteres'),
    body('lastName')
        .trim()
        .notEmpty()
        .withMessage('Le nom est requis')
        .isLength({ max: 50 })
        .withMessage('Le nom ne doit pas depasser 50 caracteres'),
];

const loginValidation = [
    body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
    body('password').notEmpty().withMessage('Le mot de passe est requis'),
];

const changePasswordValidation = [
    body('currentPassword').notEmpty().withMessage('Le mot de passe actuel est requis'),
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('Le nouveau mot de passe doit contenir au moins 8 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Le mot de passe doit contenir une majuscule, une minuscule et un chiffre'),
];

const updateProfileValidation = [
    body('firstName')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Le prenom ne doit pas depasser 50 caracteres'),
    body('lastName')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Le nom ne doit pas depasser 50 caracteres'),
    body('email').optional().isEmail().withMessage('Email invalide').normalizeEmail(),
];

module.exports = {
    registerValidation,
    loginValidation,
    changePasswordValidation,
    updateProfileValidation,
};
