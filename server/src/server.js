const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const config = require('./config/env');
const connectDB = require('./config/database');
const swaggerSpec = require('./config/swagger');
const logger = require('./utils/logger');

// Security
const securityHeaders = require('./security/securityHeaders');
const { apiLimiter } = require('./security/rateLimiting');
const { mongoSanitizer, parameterPollution } = require('./security/sanitize');

// Middleware
const errorHandler = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const customerRoutes = require('./routes/customers');
const categoryRoutes = require('./routes/categories');
const dashboardRoutes = require('./routes/dashboard');
const settingsRoutes = require('./routes/settings');

const app = express();

// ─── Security Middleware ─────────────────────────────────────────
app.use(securityHeaders);
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(apiLimiter);

// ─── Body Parsing ────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── Sanitization ────────────────────────────────────────────────
app.use(mongoSanitizer);
app.use(parameterPollution);

// ─── Static Files ────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── API Documentation ──────────────────────────────────────────
app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Kosma API Documentation',
    })
);
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));

// ─── Health Check ────────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        service: 'kosma-api',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.nodeEnv,
    });
});

// ─── API Routes ──────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/settings', settingsRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({
        status: 404,
        message: 'Route introuvable',
    });
});

// ─── Error Handler ───────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────────
const startServer = async () => {
    await connectDB();

    const server = app.listen(config.port, () => {
        logger.info(`Kosma API running on port ${config.port} [${config.nodeEnv}]`);
        logger.info(`API Docs: http://localhost:${config.port}/api-docs`);
    });

    // Graceful shutdown
    const shutdown = signal => {
        logger.info(`${signal} received. Shutting down gracefully...`);
        server.close(() => {
            logger.info('Server closed');
            process.exit(0);
        });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
};

// Only start if not in test mode
if (config.nodeEnv !== 'test') {
    startServer();
}

module.exports = app;
