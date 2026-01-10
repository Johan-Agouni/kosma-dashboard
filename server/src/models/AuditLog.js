const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    action: {
        type: String,
        required: true,
        enum: ['create', 'update', 'delete', 'login', 'logout', 'status_change', 'password_change'],
    },
    resource: {
        type: String,
        required: true,
        enum: ['product', 'order', 'user', 'category', 'settings', 'auth'],
    },
    resourceId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
    },
    ip: String,
    userAgent: String,
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 7776000, // 90 days TTL
    },
});

auditLogSchema.index({ user: 1 });
auditLogSchema.index({ resource: 1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
