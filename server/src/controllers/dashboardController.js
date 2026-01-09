const Order = require('../models/Order');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

const getStats = asyncHandler(async (_req, res) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
        totalOrders,
        pendingOrders,
        totalProducts,
        activeProducts,
        monthRevenue,
        todayRevenue,
        lowStockCount,
        newCustomersMonth,
    ] = await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ status: 'pending' }),
        Product.countDocuments({ isDeleted: false }),
        Product.countDocuments({ isDeleted: false, status: 'active' }),
        Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfMonth },
                    status: { $ne: 'cancelled' },
                    paymentStatus: 'paid',
                },
            },
            { $group: { _id: null, total: { $sum: '$total' } } },
        ]),
        Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfToday },
                    status: { $ne: 'cancelled' },
                    paymentStatus: 'paid',
                },
            },
            { $group: { _id: null, total: { $sum: '$total' } } },
        ]),
        Product.countDocuments({
            isDeleted: false,
            status: 'active',
            $expr: { $lte: ['$stock', '$lowStockThreshold'] },
        }),
        Order.aggregate([
            { $match: { createdAt: { $gte: startOfMonth } } },
            { $group: { _id: '$customer.email' } },
            { $count: 'count' },
        ]),
    ]);

    res.json({
        status: 200,
        data: {
            revenue: {
                today: todayRevenue[0]?.total || 0,
                month: monthRevenue[0]?.total || 0,
            },
            orders: {
                total: totalOrders,
                pending: pendingOrders,
            },
            products: {
                total: totalProducts,
                active: activeProducts,
                lowStock: lowStockCount,
            },
            customers: {
                newThisMonth: newCustomersMonth[0]?.count || 0,
            },
        },
    });
});

const getRevenue = asyncHandler(async (req, res) => {
    const months = parseInt(req.query.months, 10) || 12;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const revenue = await Order.getRevenueByPeriod(startDate, new Date());

    res.json({ status: 200, data: revenue });
});

const getTopProducts = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 10;

    const topProducts = await Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $unwind: '$items' },
        {
            $group: {
                _id: '$items.product',
                name: { $first: '$items.name' },
                totalSold: { $sum: '$items.quantity' },
                totalRevenue: { $sum: '$items.total' },
            },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: limit },
    ]);

    res.json({ status: 200, data: topProducts });
});

const getRecentOrders = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 10;

    const orders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('orderNumber customer.name total status createdAt')
        .lean();

    res.json({ status: 200, data: orders });
});

const getLowStock = asyncHandler(async (req, res) => {
    const threshold = parseInt(req.query.threshold, 10) || 10;

    const products = await Product.find({
        isDeleted: false,
        status: 'active',
        $expr: { $lte: ['$stock', threshold] },
    })
        .select('name sku stock lowStockThreshold images')
        .sort('stock')
        .limit(20)
        .lean();

    res.json({ status: 200, data: products });
});

module.exports = { getStats, getRevenue, getTopProducts, getRecentOrders, getLowStock };
