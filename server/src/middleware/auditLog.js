const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

const audit = (action, resource) => {
    return async (req, _res, next) => {
        req._audit = { action, resource };
        next();
    };
};

const recordAudit = async (req, { action, resource, resourceId, details }) => {
    try {
        if (!req.user) return;

        await AuditLog.create({
            user: req.user.id,
            action,
            resource,
            resourceId,
            details,
            ip: req.ip,
            userAgent: req.get('user-agent'),
        });
    } catch (err) {
        logger.error('Audit log error', { error: err.message });
    }
};

module.exports = { audit, recordAudit };
