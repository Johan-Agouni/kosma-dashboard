const ApiError = require('../utils/ApiError');

const authorize = (...roles) => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(ApiError.unauthorized('Authentification requise'));
        }

        if (!roles.includes(req.user.role)) {
            return next(
                ApiError.forbidden(
                    `Role '${req.user.role}' non autorise pour cette action`
                )
            );
        }

        next();
    };
};

module.exports = authorize;
