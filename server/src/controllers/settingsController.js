const AuditLog = require('../models/AuditLog');
const { buildPagination, paginatedResponse } = require('../utils/pagination');
const asyncHandler = require('../utils/asyncHandler');

// Store settings in memory (in production, use a Settings model)
let storeSettings = {
    name: 'Kosma Store',
    currency: 'EUR',
    timezone: 'Europe/Paris',
    taxRate: 20,
    shippingFlatRate: 5.99,
    lowStockThreshold: 10,
    orderPrefix: 'KSM',
};

const getStoreSettings = asyncHandler(async (_req, res) => {
    res.json({ status: 200, data: storeSettings });
});

const updateStoreSettings = asyncHandler(async (req, res) => {
    const allowed = [
        'name',
        'currency',
        'timezone',
        'taxRate',
        'shippingFlatRate',
        'lowStockThreshold',
    ];

    for (const key of allowed) {
        if (req.body[key] !== undefined) {
            storeSettings[key] = req.body[key];
        }
    }

    res.json({
        status: 200,
        message: 'Parametres mis a jour',
        data: storeSettings,
    });
});

const getAuditLog = asyncHandler(async (req, res) => {
    const { page, limit, skip } = buildPagination(req.query);

    const filter = {};
    if (req.query.action) filter.action = req.query.action;
    if (req.query.resource) filter.resource = req.query.resource;

    const [logs, total] = await Promise.all([
        AuditLog.find(filter)
            .populate('user', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        AuditLog.countDocuments(filter),
    ]);

    res.json({
        status: 200,
        ...paginatedResponse(logs, total, { page, limit }),
    });
});

module.exports = { getStoreSettings, updateStoreSettings, getAuditLog };
