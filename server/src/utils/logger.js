const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const config = require('../config/env');

const logDir = path.join(__dirname, '../../logs');

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] ${level}: ${message}${metaStr}`;
    })
);

const transports = [
    new winston.transports.Console({
        format: consoleFormat,
        level: config.nodeEnv === 'test' ? 'error' : config.logging.level,
    }),
];

if (config.nodeEnv !== 'test') {
    transports.push(
        new DailyRotateFile({
            dirname: logDir,
            filename: 'kosma-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxSize: config.logging.maxSize,
            maxFiles: config.logging.maxFiles,
            format: logFormat,
        }),
        new DailyRotateFile({
            dirname: logDir,
            filename: 'error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxSize: config.logging.maxSize,
            maxFiles: config.logging.maxFiles,
            format: logFormat,
        })
    );
}

const logger = winston.createLogger({
    level: config.logging.level,
    format: logFormat,
    transports,
    exitOnError: false,
});

module.exports = logger;
