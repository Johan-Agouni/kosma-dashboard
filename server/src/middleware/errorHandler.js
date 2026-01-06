const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

const errorHandler = (err, _req, res, _next) => {
    let error = err;

    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        error = ApiError.badRequest('Erreur de validation', errors);
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        error = ApiError.conflict(`La valeur du champ '${field}' existe deja`);
    }

    if (err.name === 'CastError') {
        error = ApiError.badRequest(`ID invalide: ${err.value}`);
    }

    if (err.name === 'JsonWebTokenError') {
        error = ApiError.unauthorized('Token invalide');
    }

    if (err.name === 'TokenExpiredError') {
        error = ApiError.unauthorized('Token expire');
    }

    const statusCode = error.statusCode || 500;
    const message = error.message || 'Erreur serveur interne';

    if (statusCode === 500) {
        logger.error('Server error', {
            message: err.message,
            stack: err.stack,
        });
    }

    res.status(statusCode).json({
        status: statusCode,
        message,
        ...(error.errors?.length && { errors: error.errors }),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = errorHandler;
