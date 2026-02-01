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
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Kosma API Documentation',
}));
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

// ─── Seed Endpoint (temporaire — a retirer apres le premier seed) ─
app.post('/api/v1/seed', async (req, res) => {
    const key = req.headers['x-seed-key'];
    if (key !== 'kosma-seed-2024-secret') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    try {
        const User = require('./models/User');
        const Category = require('./models/Category');
        const Product = require('./models/Product');
        const Order = require('./models/Order');
        const usersData = require('../seed/data/users.json');
        const categoriesData = require('../seed/data/categories.json');
        const productsData = require('../seed/data/products.json');
        const ordersData = require('../seed/data/orders.json');

        const CATEGORY_BY_SKU_PREFIX = {
            ELEC: 'Electronique', VET: 'Vetements',
            MAI: 'Maison & Jardin', SPO: 'Sports & Loisirs',
            LIV: 'Livres', ALI: 'Alimentation',
        };

        await Promise.all([User.deleteMany({}), Category.deleteMany({}), Product.deleteMany({}), Order.deleteMany({})]);
        const users = await User.create(usersData);
        const categories = await Category.create(categoriesData);
        const categoryMap = {};
        categories.forEach(cat => { categoryMap[cat.name] = cat._id; });
        const productDocs = productsData.map(p => {
            const prefix = p.sku.split('-')[0];
            return { ...p, category: categoryMap[CATEGORY_BY_SKU_PREFIX[prefix] || 'Electronique'], createdBy: users[0]._id };
        });
        const products = await Product.create(productDocs);
        const orders = [];
        for (const orderData of ordersData) {
            const numItems = Math.floor(Math.random() * 3) + 1;
            const items = [];
            let subtotal = 0;
            for (let i = 0; i < numItems; i++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const quantity = Math.floor(Math.random() * 3) + 1;
                const total = product.price * quantity;
                items.push({ product: product._id, name: product.name, price: product.price, quantity, total });
                subtotal += total;
            }
            const tax = Math.round(subtotal * 0.2 * 100) / 100;
            const shippingCost = subtotal > 50 ? 0 : 5.99;
            const order = await Order.create({ ...orderData, items, subtotal, tax, shippingCost, total: Math.round((subtotal + tax + shippingCost) * 100) / 100 });
            orders.push(order);
        }
        res.json({ status: 'ok', users: users.length, categories: categories.length, products: products.length, orders: orders.length });
    } catch (error) {
        res.status(500).json({ message: 'Seed failed', error: error.message });
    }
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
