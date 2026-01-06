const config = require('../config/env');
const logger = require('../utils/logger');

const loginAttempts = new Map();

const CLEANUP_INTERVAL = 60 * 60 * 1000;

if (config.nodeEnv !== 'test') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, data] of loginAttempts.entries()) {
            if (now - data.lastAttempt > config.bruteForce.lockTimeMinutes * 60 * 1000) {
                loginAttempts.delete(key);
            }
        }
    }, CLEANUP_INTERVAL);
}

const getBruteForceKey = req => {
    return `${req.ip}_${req.body.email || 'unknown'}`;
};

const checkBruteForce = (req, res, next) => {
    const key = getBruteForceKey(req);
    const record = loginAttempts.get(key);

    if (record) {
        const lockExpiry = record.lastAttempt + config.bruteForce.lockTimeMinutes * 60 * 1000;

        if (record.attempts >= config.bruteForce.maxAttempts && Date.now() < lockExpiry) {
            const remainingMs = lockExpiry - Date.now();
            const remainingMin = Math.ceil(remainingMs / 60000);

            logger.warn('Brute force - account locked', {
                ip: req.ip,
                email: req.body.email,
                attempts: record.attempts,
            });

            return res.status(429).json({
                status: 429,
                message: `Compte verrouille. Reessayez dans ${remainingMin} minute(s)`,
            });
        }

        if (Date.now() >= lockExpiry) {
            loginAttempts.delete(key);
        }
    }

    next();
};

const recordFailedAttempt = req => {
    const key = getBruteForceKey(req);
    const record = loginAttempts.get(key) || { attempts: 0, lastAttempt: 0 };

    record.attempts += 1;
    record.lastAttempt = Date.now();
    loginAttempts.set(key, record);

    logger.warn('Failed login attempt', {
        ip: req.ip,
        email: req.body.email,
        attempts: record.attempts,
    });
};

const resetAttempts = req => {
    const key = getBruteForceKey(req);
    loginAttempts.delete(key);
};

const _getAttemptsMap = () => loginAttempts;

module.exports = { checkBruteForce, recordFailedAttempt, resetAttempts, _getAttemptsMap };
