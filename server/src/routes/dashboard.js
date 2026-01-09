const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authenticate = require('../middleware/auth');

/**
 * @swagger
 * /api/v1/dashboard/stats:
 *   get:
 *     tags: [Dashboard]
 *     summary: Statistiques generales
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Statistiques }
 */
router.get('/stats', authenticate, dashboardController.getStats);

/**
 * @swagger
 * /api/v1/dashboard/revenue:
 *   get:
 *     tags: [Dashboard]
 *     summary: Donnees de revenus
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: months, schema: { type: integer, default: 12 } }
 *     responses:
 *       200: { description: Revenus par mois }
 */
router.get('/revenue', authenticate, dashboardController.getRevenue);

/**
 * @swagger
 * /api/v1/dashboard/top-products:
 *   get:
 *     tags: [Dashboard]
 *     summary: Produits les plus vendus
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Top produits }
 */
router.get('/top-products', authenticate, dashboardController.getTopProducts);

/**
 * @swagger
 * /api/v1/dashboard/recent-orders:
 *   get:
 *     tags: [Dashboard]
 *     summary: Commandes recentes
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Commandes recentes }
 */
router.get('/recent-orders', authenticate, dashboardController.getRecentOrders);

/**
 * @swagger
 * /api/v1/dashboard/low-stock:
 *   get:
 *     tags: [Dashboard]
 *     summary: Alertes stock bas
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Produits en stock bas }
 */
router.get('/low-stock', authenticate, dashboardController.getLowStock);

module.exports = router;
