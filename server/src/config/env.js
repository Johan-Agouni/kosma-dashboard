require('dotenv').config();

module.exports = {
    port: parseInt(process.env.PORT, 10) || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/kosma',
    jwt: {
        secret: process.env.JWT_SECRET || 'dev-secret-change-me',
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    },
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
        authWindowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 10) || 900000,
        authMaxRequests: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS, 10) || 10,
    },
    bruteForce: {
        maxAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10) || 5,
        lockTimeMinutes: parseInt(process.env.LOCK_TIME_MINUTES, 10) || 30,
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        maxSize: process.env.LOG_MAX_SIZE || '20m',
        maxFiles: process.env.LOG_MAX_FILES || '14d',
    },
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5242880,
        path: process.env.UPLOAD_PATH || 'uploads',
    },
};
