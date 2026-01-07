/**
 * Controller Auth — inscription, connexion, refresh, deconnexion.
 *
 * Flux JWT classique en deux tokens :
 *   - accessToken (courte duree, en memoire cote client)
 *   - refreshToken (longue duree, stocke en base, revocable)
 *
 * La protection brute-force est geree par le module security/bruteForce :
 * apres X tentatives ratees, l'IP est temporairement bloquee.
 */
const User = require('../models/User');
const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    revokeRefreshToken,
    revokeAllUserTokens,
} = require('../services/authService');
const { recordFailedAttempt, resetAttempts } = require('../security/bruteForce');
const { recordAudit } = require('../middleware/auditLog');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// ──────────────────────────────────────────
// Inscription
// ──────────────────────────────────────────

const register = asyncHandler(async (req, res) => {
    const { email, password, firstName, lastName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw ApiError.conflict('Un compte avec cet email existe deja');
    }

    const user = await User.create({ email, password, firstName, lastName });

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    await recordAudit(req, {
        action: 'create',
        resource: 'auth',
        resourceId: user._id,
        details: { email: user.email },
    });

    res.status(201).json({
        status: 201,
        message: 'Compte cree avec succes',
        data: {
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
            accessToken,
            refreshToken,
        },
    });
});

// ──────────────────────────────────────────
// Connexion
// ──────────────────────────────────────────

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // select('+password') car le champ est exclu par defaut dans le schema
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        recordFailedAttempt(req);
        throw ApiError.unauthorized('Email ou mot de passe incorrect');
    }

    if (!user.isActive) {
        throw ApiError.unauthorized('Compte desactive');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        recordFailedAttempt(req);
        throw ApiError.unauthorized('Email ou mot de passe incorrect');
    }

    // Connexion OK : on reset le compteur brute-force et on met a jour lastLogin
    resetAttempts(req);
    user.lastLogin = new Date();
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    await recordAudit(req, {
        action: 'login',
        resource: 'auth',
        resourceId: user._id,
        details: { email: user.email },
    });

    res.json({
        status: 200,
        message: 'Connexion reussie',
        data: {
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                avatar: user.avatar,
            },
            accessToken,
            refreshToken,
        },
    });
});

// ──────────────────────────────────────────
// Refresh token (rotation)
// ──────────────────────────────────────────

// On utilise la rotation de refresh tokens : a chaque refresh,
// l'ancien token est revoque et un nouveau est emis.
// Ca limite la fenetre d'exploitation si un token fuite.
const refresh = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        throw ApiError.badRequest('Refresh token requis');
    }

    const stored = await verifyRefreshToken(refreshToken);
    if (!stored || !stored.user) {
        throw ApiError.unauthorized('Refresh token invalide ou expire');
    }

    await revokeRefreshToken(refreshToken);

    const accessToken = generateAccessToken(stored.user);
    const newRefreshToken = await generateRefreshToken(stored.user);

    res.json({
        status: 200,
        data: {
            accessToken,
            refreshToken: newRefreshToken,
        },
    });
});

// ──────────────────────────────────────────
// Deconnexion
// ──────────────────────────────────────────

const logout = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (refreshToken) {
        await revokeRefreshToken(refreshToken);
    }

    // Revocation de TOUS les tokens de l'utilisateur
    // (securite : deconnecte aussi les autres sessions)
    if (req.user) {
        await revokeAllUserTokens(req.user.id);
        await recordAudit(req, {
            action: 'logout',
            resource: 'auth',
            resourceId: req.user.id,
        });
    }

    res.json({ status: 200, message: 'Deconnexion reussie' });
});

// ──────────────────────────────────────────
// Profil utilisateur
// ──────────────────────────────────────────

const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        throw ApiError.notFound('Utilisateur introuvable');
    }

    res.json({
        status: 200,
        data: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            avatar: user.avatar,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
        },
    });
});

const updateMe = asyncHandler(async (req, res) => {
    const { firstName, lastName, email } = req.body;
    const updates = {};

    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (email && email !== req.user.email) {
        const existing = await User.findOne({ email });
        if (existing) throw ApiError.conflict('Cet email est deja utilise');
        updates.email = email;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
        new: true,
        runValidators: true,
    });

    await recordAudit(req, {
        action: 'update',
        resource: 'user',
        resourceId: user._id,
        details: updates,
    });

    res.json({
        status: 200,
        message: 'Profil mis a jour',
        data: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            avatar: user.avatar,
        },
    });
});

// ──────────────────────────────────────────
// Changement de mot de passe
// ──────────────────────────────────────────

// Apres changement, on revoque tous les tokens existants et on en emet
// de nouveaux. L'utilisateur reste connecte, mais toutes ses autres
// sessions sont invalidees (mesure de securite).
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
        throw ApiError.notFound('Utilisateur introuvable');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        throw ApiError.unauthorized('Mot de passe actuel incorrect');
    }

    user.password = newPassword;
    await user.save();

    await revokeAllUserTokens(user._id);

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    await recordAudit(req, {
        action: 'password_change',
        resource: 'auth',
        resourceId: user._id,
    });

    res.json({
        status: 200,
        message: 'Mot de passe modifie avec succes',
        data: { accessToken, refreshToken },
    });
});

module.exports = { register, login, refresh, logout, getMe, updateMe, changePassword };
