const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

const mongoSanitizer = mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
        const logger = require('../utils/logger');
        logger.warn('NoSQL injection attempt blocked', {
            ip: req.ip,
            key,
            path: req.originalUrl,
        });
    },
});

const parameterPollution = hpp({
    whitelist: ['sort', 'order', 'page', 'limit', 'status', 'category'],
});

module.exports = { mongoSanitizer, parameterPollution };
