const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const validate = require('../middleware/validate');
const {
    updateOrderStatusValidation,
    addOrderNoteValidation,
    listOrdersValidation,
} = require('../validators/orderValidators');

/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     tags: [Orders]
 *     summary: Lister les commandes
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: limit, schema: { type: integer } }
 *       - { in: query, name: status, schema: { type: string } }
 *       - { in: query, name: dateFrom, schema: { type: string, format: date } }
 *       - { in: query, name: dateTo, schema: { type: string, format: date } }
 *     responses:
 *       200: { description: Liste des commandes }
 */
router.get('/', authenticate, validate(listOrdersValidation), orderController.getOrders);

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Obtenir une commande
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Commande }
 */
router.get('/:id', authenticate, orderController.getOrder);

/**
 * @swagger
 * /api/v1/orders/{id}/status:
 *   put:
 *     tags: [Orders]
 *     summary: Mettre a jour le statut d'une commande
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Statut mis a jour }
 */
router.put(
    '/:id/status',
    authenticate,
    authorize('admin', 'manager'),
    validate(updateOrderStatusValidation),
    orderController.updateOrderStatus
);

/**
 * @swagger
 * /api/v1/orders/{id}/notes:
 *   post:
 *     tags: [Orders]
 *     summary: Ajouter une note a une commande
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Note ajoutee }
 */
router.post(
    '/:id/notes',
    authenticate,
    authorize('admin', 'manager'),
    validate(addOrderNoteValidation),
    orderController.addOrderNote
);

/**
 * @swagger
 * /api/v1/orders/{id}/timeline:
 *   get:
 *     tags: [Orders]
 *     summary: Obtenir la timeline d'une commande
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Timeline }
 */
router.get('/:id/timeline', authenticate, orderController.getOrderTimeline);

module.exports = router;
