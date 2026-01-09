const Order = require('../models/Order');
const { buildPagination, paginatedResponse } = require('../utils/pagination');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const getCustomers = asyncHandler(async (req, res) => {
    const { page, limit, skip } = buildPagination(req.query);

    const matchStage = {};
    if (req.query.search) {
        matchStage.$or = [
            { 'customer.name': { $regex: req.query.search, $options: 'i' } },
            { 'customer.email': { $regex: req.query.search, $options: 'i' } },
        ];
    }

    const pipeline = [
        { $match: matchStage },
        {
            $group: {
                _id: '$customer.email',
                name: { $first: '$customer.name' },
                email: { $first: '$customer.email' },
                phone: { $first: '$customer.phone' },
                totalOrders: { $sum: 1 },
                totalSpent: { $sum: '$total' },
                lastOrderDate: { $max: '$createdAt' },
                firstOrderDate: { $min: '$createdAt' },
            },
        },
        { $sort: { lastOrderDate: -1 } },
        {
            $facet: {
                data: [{ $skip: skip }, { $limit: limit }],
                total: [{ $count: 'count' }],
            },
        },
    ];

    const [result] = await Order.aggregate(pipeline);
    const customers = result.data;
    const total = result.total[0]?.count || 0;

    res.json({
        status: 200,
        ...paginatedResponse(customers, total, { page, limit }),
    });
});

const getCustomer = asyncHandler(async (req, res) => {
    const customerEmail = req.params.id;

    const pipeline = [
        { $match: { 'customer.email': customerEmail } },
        {
            $group: {
                _id: '$customer.email',
                name: { $first: '$customer.name' },
                email: { $first: '$customer.email' },
                phone: { $first: '$customer.phone' },
                address: { $first: '$customer.address' },
                totalOrders: { $sum: 1 },
                totalSpent: { $sum: '$total' },
                averageOrderValue: { $avg: '$total' },
                lastOrderDate: { $max: '$createdAt' },
                firstOrderDate: { $min: '$createdAt' },
            },
        },
    ];

    const [customer] = await Order.aggregate(pipeline);
    if (!customer) {
        throw ApiError.notFound('Client introuvable');
    }

    res.json({ status: 200, data: customer });
});

const getCustomerOrders = asyncHandler(async (req, res) => {
    const { page, limit, skip, sort } = buildPagination(req.query, { sort: 'createdAt' });
    const customerEmail = req.params.id;

    const filter = { 'customer.email': customerEmail };

    const [orders, total] = await Promise.all([
        Order.find(filter).sort(sort).skip(skip).limit(limit).lean(),
        Order.countDocuments(filter),
    ]);

    res.json({
        status: 200,
        ...paginatedResponse(orders, total, { page, limit }),
    });
});

module.exports = { getCustomers, getCustomer, getCustomerOrders };
