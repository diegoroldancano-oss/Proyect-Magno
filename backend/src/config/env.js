const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const DEFAULT_CORS_ORIGINS = "http://127.0.0.1:5500,http://localhost:5500,http://localhost:3000";
const DEFAULT_UPLOAD_DIR = "uploads/profiles";

function parseNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function parseJwtExpiresInSeconds(raw) {
    const value = String(raw || "").trim();
    if (!value) {
        return 8 * 60 * 60;
    }

    if (/^\d+$/.test(value)) {
        return Number(value);
    }

    const match = value.match(/^(\d+)([smhd])$/i);
    if (!match) {
        return 8 * 60 * 60;
    }

    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();
    if (unit === "s") return amount;
    if (unit === "m") return amount * 60;
    if (unit === "h") return amount * 60 * 60;
    if (unit === "d") return amount * 60 * 60 * 24;
    return 8 * 60 * 60;
}

const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || DEFAULT_UPLOAD_DIR);
fs.mkdirSync(uploadDir, { recursive: true });

const env = {
    nodeEnv: process.env.NODE_ENV || "development",
    port: parseNumber(process.env.PORT, 4000),
    apiBasePath: "/api",
    databaseUrl: process.env.DATABASE_URL || "",
    jwtSecret: process.env.JWT_SECRET || "change-this-secret",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h",
    jwtExpiresInSeconds: parseJwtExpiresInSeconds(process.env.JWT_EXPIRES_IN || "8h"),
    corsOrigins: String(process.env.CORS_ORIGINS || DEFAULT_CORS_ORIGINS)
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    uploadDir,
    adminEmail: process.env.ADMIN_EMAIL || "admin@nabook.local",
    adminPassword: process.env.ADMIN_PASSWORD || "Admin12345!"
};

module.exports = { env };
