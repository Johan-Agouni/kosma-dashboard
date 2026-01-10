const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');

/**
 * @swagger
 * /api/v1/settings/store:
 *   get:
 *     tags: [Settings]
 *     summary: Parametres de la boutique
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Parametres }
 */
router.get('/store', authenticate, settingsController.getStoreSettings);

/**
 * @swagger
 * /api/v1/settings/store:
 *   put:
 *     tags: [Settings]
 *     summary: Mettre a jour les parametres
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Parametres mis a jour }
 */
router.put('/store', authenticate, authorize('admin'), settingsController.updateStoreSettings);

/**
 * @swagger
 * /api/v1/settings/audit-log:
 *   get:
 *     tags: [Settings]
 *     summary: Journal d'audit
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Logs d'audit }
 */
router.get('/audit-log', authenticate, authorize('admin'), settingsController.getAuditLog);

module.exports = router;
