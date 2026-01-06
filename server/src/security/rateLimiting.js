const rateLimit = require('express-rate-limit');
const config = require('../config/env');

const isTest = config.nodeEnv === 'test';
const passthrough = (_req, _res, next) => next();

const apiLimiter = isTest
    ? passthrough
    : rateLimit({
          windowMs: config.rateLimit.windowMs,
          max: config.rateLimit.maxRequests,
          message: {
              status: 429,
              message: 'Trop de requetes depuis cette IP, reessayez dans 15 minutes',
          },
          standardHeaders: true,
          legacyHeaders: false,
      });

const authLimiter = isTest
    ? passthrough
    : rateLimit({
          windowMs: config.rateLimit.authWindowMs,
          max: config.rateLimit.authMaxRequests,
          message: {
              status: 429,
              message: 'Trop de tentatives de connexion, reessayez dans 15 minutes',
          },
          standardHeaders: true,
          legacyHeaders: false,
          skipSuccessfulRequests: true,
      });

module.exports = { apiLimiter, authLimiter };
