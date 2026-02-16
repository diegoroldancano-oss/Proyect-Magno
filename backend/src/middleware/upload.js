const path = require("path");
const multer = require("multer");
const { randomUUID } = require("crypto");
const { env } = require("../config/env");
const { AppError } = require("../lib/errors");

const ALLOWED_TYPES = Object.freeze({
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp"
});

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const storage = multer.diskStorage({
    destination: (_req, _file, callback) => {
        callback(null, env.uploadDir);
    },
    filename: (_req, file, callback) => {
        const extension = ALLOWED_TYPES[file.mimetype] || path.extname(file.originalname).toLowerCase();
        const safeName = `${Date.now()}-${randomUUID()}${extension}`;
        callback(null, safeName);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: MAX_FILE_SIZE
    },
    fileFilter: (_req, file, callback) => {
        if (!ALLOWED_TYPES[file.mimetype]) {
            callback(
                new AppError({
                    status: 415,
                    code: "UNSUPPORTED_MEDIA_TYPE",
                    message: "Formato de imagen no permitido. Usa PNG, JPG o WEBP."
                })
            );
            return;
        }

        callback(null, true);
    }
});

module.exports = upload;
