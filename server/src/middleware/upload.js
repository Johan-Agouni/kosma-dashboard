const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const config = require('../config/env');
const ApiError = require('../utils/ApiError');

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, path.join(__dirname, '../../', config.upload.path));
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = crypto.randomBytes(16).toString('hex');
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${uniqueSuffix}${ext}`);
    },
});

const fileFilter = (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(ApiError.badRequest('Format de fichier non supporte. Utilisez JPEG, PNG, WebP ou GIF'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: config.upload.maxFileSize,
        files: 5,
    },
});

module.exports = upload;
