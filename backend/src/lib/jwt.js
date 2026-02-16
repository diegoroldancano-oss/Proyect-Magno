const jwt = require("jsonwebtoken");
const { env } = require("../config/env");

function signAccessToken(user) {
    const payload = {
        sub: user.id,
        email: user.email,
        role: user.role
    };

    return jwt.sign(payload, env.jwtSecret, {
        expiresIn: env.jwtExpiresIn
    });
}

function verifyAccessToken(token) {
    return jwt.verify(token, env.jwtSecret);
}

module.exports = {
    signAccessToken,
    verifyAccessToken
};
