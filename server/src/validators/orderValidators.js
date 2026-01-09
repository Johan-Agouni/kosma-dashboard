const { body, query } = require('express-validator');

const updateOrderStatusValidation = [
    body('status')
        .isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])
        .withMessage('Statut invalide'),
    body('note').optional().trim().isLength({ max: 500 }),
];

const addOrderNoteValidation = [
    body('content')
        .trim()
        .notEmpty()
        .withMessage('Le contenu de la note est requis')
        .isLength({ max: 500 })
        .withMessage('La note ne doit pas depasser 500 caracteres'),
];

const listOrdersValidation = [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
    query('dateFrom').optional().isISO8601(),
    query('dateTo').optional().isISO8601(),
];

module.exports = { updateOrderStatusValidation, addOrderNoteValidation, listOrdersValidation };
