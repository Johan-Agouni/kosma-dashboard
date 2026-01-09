const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const authenticate = require('../middleware/auth');

/**
 * @swagger
 * /api/v1/customers:
 *   get:
 *     tags: [Customers]
 *     summary: Lister les clients
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: limit, schema: { type: integer } }
 *       - { in: query, name: search, schema: { type: string } }
 *     responses:
 *       200: { description: Liste des clients }
 */
router.get('/', authenticate, customerController.getCustomers);

/**
 * @swagger
 * /api/v1/customers/{id}:
 *   get:
 *     tags: [Customers]
 *     summary: Obtenir un client (par email)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Client }
 */
router.get('/:id', authenticate, customerController.getCustomer);

/**
 * @swagger
 * /api/v1/customers/{id}/orders:
 *   get:
 *     tags: [Customers]
 *     summary: Commandes d'un client
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Commandes du client }
 */
router.get('/:id/orders', authenticate, customerController.getCustomerOrders);

module.exports = router;
