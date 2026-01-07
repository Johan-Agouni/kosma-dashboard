const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter } = require('../security/rateLimiting');
const { checkBruteForce } = require('../security/bruteForce');
const {
    registerValidation,
    loginValidation,
    changePasswordValidation,
    updateProfileValidation,
} = require('../validators/authValidators');

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Creer un nouveau compte
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, firstName, lastName]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               firstName: { type: string }
 *               lastName: { type: string }
 *     responses:
 *       201: { description: Compte cree }
 *       409: { description: Email deja utilise }
 */
router.post('/register', authLimiter, validate(registerValidation), authController.register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Connexion
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: Connexion reussie }
 *       401: { description: Identifiants invalides }
 */
router.post(
    '/login',
    authLimiter,
    checkBruteForce,
    validate(loginValidation),
    authController.login
);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Rafraichir le token d'acces
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200: { description: Nouveaux tokens }
 */
router.post('/refresh', authController.refresh);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Deconnexion
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Deconnexion reussie }
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Obtenir le profil de l'utilisateur connecte
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Profil utilisateur }
 */
router.get('/me', authenticate, authController.getMe);

/**
 * @swagger
 * /api/v1/auth/me:
 *   put:
 *     tags: [Auth]
 *     summary: Mettre a jour le profil
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Profil mis a jour }
 */
router.put('/me', authenticate, validate(updateProfileValidation), authController.updateMe);

/**
 * @swagger
 * /api/v1/auth/change-password:
 *   put:
 *     tags: [Auth]
 *     summary: Changer le mot de passe
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Mot de passe modifie }
 */
router.put(
    '/change-password',
    authenticate,
    validate(changePasswordValidation),
    authController.changePassword
);

module.exports = router;
