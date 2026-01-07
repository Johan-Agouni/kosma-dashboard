/**
 * Middleware d'authentification JWT.
 *
 * Verifie le token Bearer dans le header Authorization,
 * decode le payload, et attache les infos utilisateur a req.user.
 * Si le token est absent, invalide ou expire, renvoie une 401.
 */
const { verifyAccessToken } = require('../services/authService');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const authenticate = asyncHandler(async (req, _res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw ApiError.unauthorized('Token manquant');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    // On re-fetch l'utilisateur a chaque requete pour s'assurer
    // que le compte est toujours actif (pas desactive entre-temps).
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
        throw ApiError.unauthorized('Utilisateur introuvable ou desactive');
    }

    // On attache un sous-ensemble des champs a req.user
    // (pas le document Mongoose complet, juste ce dont on a besoin).
    req.user = {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
    };

    next();
});

module.exports = authenticate;
