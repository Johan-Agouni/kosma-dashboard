const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/env');
const RefreshToken = require('../models/RefreshToken');

const generateAccessToken = user => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.role,
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
    );
};

const generateRefreshToken = async user => {
    const token = crypto.randomBytes(40).toString('hex');

    const expiresAt = new Date();
    const days = parseInt(config.jwt.refreshExpiresIn, 10) || 7;
    expiresAt.setDate(expiresAt.getDate() + days);

    await RefreshToken.create({
        token,
        user: user._id,
        expiresAt,
    });

    return token;
};

const verifyAccessToken = token => {
    return jwt.verify(token, config.jwt.secret);
};

const verifyRefreshToken = async token => {
    const refreshToken = await RefreshToken.findOne({ token }).populate('user');
    if (!refreshToken) return null;

    if (refreshToken.expiresAt < new Date()) {
        await RefreshToken.deleteOne({ _id: refreshToken._id });
        return null;
    }

    return refreshToken;
};

const revokeRefreshToken = async token => {
    await RefreshToken.deleteOne({ token });
};

const revokeAllUserTokens = async userId => {
    await RefreshToken.deleteMany({ user: userId });
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    revokeRefreshToken,
    revokeAllUserTokens,
};
