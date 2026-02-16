const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 10;

async function hashPassword(plainText) {
    return bcrypt.hash(String(plainText), SALT_ROUNDS);
}

async function verifyPassword(plainText, hashedValue) {
    return bcrypt.compare(String(plainText), String(hashedValue || ""));
}

module.exports = {
    hashPassword,
    verifyPassword
};
