/**
 * Controller Order — gestion du cycle de vie des commandes.
 *
 * Les transitions de statut sont strictement validees via VALID_TRANSITIONS.
 * On ne peut pas sauter d'etapes (ex: pending -> delivered) ni revenir
 * en arriere. Chaque changement est historise dans statusHistory.
 */
const Order = require('../models/Order');
const { buildPagination, paginatedResponse } = require('../utils/pagination');
const { recordAudit } = require('../middleware/auditLog');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// Machine a etats des commandes.
// Les cles sont les statuts actuels, les valeurs les statuts atteignables.
const VALID_TRANSITIONS = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [], // statut final
    cancelled: [], // statut final
};

// ──────────────────────────────────────────
// Liste paginee avec filtres
// ──────────────────────────────────────────

const getOrders = asyncHandler(async (req, res) => {
    const { page, limit, skip, sort } = buildPagination(req.query, { sort: 'createdAt' });

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.customer) {
        filter['customer.email'] = { $regex: req.query.customer, $options: 'i' };
    }
    if (req.query.dateFrom || req.query.dateTo) {
        filter.createdAt = {};
        if (req.query.dateFrom) filter.createdAt.$gte = new Date(req.query.dateFrom);
        if (req.query.dateTo) filter.createdAt.$lte = new Date(req.query.dateTo);
    }

    const [orders, total] = await Promise.all([
        Order.find(filter).sort(sort).skip(skip).limit(limit).lean(),
        Order.countDocuments(filter),
    ]);

    res.json({
        status: 200,
        ...paginatedResponse(orders, total, { page, limit }),
    });
});

// ──────────────────────────────────────────
// Detail d'une commande
// ──────────────────────────────────────────

const getOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('items.product', 'name slug images')
        .populate('statusHistory.changedBy', 'firstName lastName')
        .populate('notes.createdBy', 'firstName lastName');

    if (!order) {
        throw ApiError.notFound('Commande introuvable');
    }

    res.json({ status: 200, data: order });
});

// ──────────────────────────────────────────
// Changement de statut
// ──────────────────────────────────────────

const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status, note } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
        throw ApiError.notFound('Commande introuvable');
    }

    // Verification de la transition via la machine a etats
    const allowedTransitions = VALID_TRANSITIONS[order.status];
    if (!allowedTransitions.includes(status)) {
        throw ApiError.badRequest(`Transition de '${order.status}' vers '${status}' non autorisee`);
    }

    order.status = status;
    order.statusHistory.push({
        status,
        changedBy: req.user.id,
        changedAt: new Date(),
        note: note || `Statut change vers ${status}`,
    });

    // Quand une commande est livree, on considere le paiement valide
    if (status === 'delivered') {
        order.paymentStatus = 'paid';
    }

    await order.save();

    await recordAudit(req, {
        action: 'status_change',
        resource: 'order',
        resourceId: order._id,
        details: { orderNumber: order.orderNumber, newStatus: status },
    });

    res.json({
        status: 200,
        message: `Commande ${order.orderNumber} mise a jour: ${status}`,
        data: order,
    });
});

// ──────────────────────────────────────────
// Notes internes
// ──────────────────────────────────────────

const addOrderNote = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        throw ApiError.notFound('Commande introuvable');
    }

    order.notes.push({
        content: req.body.content,
        createdBy: req.user.id,
    });

    await order.save();

    res.status(201).json({
        status: 201,
        message: 'Note ajoutee',
        data: order.notes,
    });
});

// ──────────────────────────────────────────
// Timeline (historique des statuts)
// ──────────────────────────────────────────

const getOrderTimeline = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .select('orderNumber statusHistory')
        .populate('statusHistory.changedBy', 'firstName lastName');

    if (!order) {
        throw ApiError.notFound('Commande introuvable');
    }

    res.json({
        status: 200,
        data: {
            orderNumber: order.orderNumber,
            timeline: order.statusHistory,
        },
    });
});

module.exports = { getOrders, getOrder, updateOrderStatus, addOrderNote, getOrderTimeline };
