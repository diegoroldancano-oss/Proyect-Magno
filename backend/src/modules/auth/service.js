const repository = require("./repository");
const { verifyPassword } = require("../../lib/password");
const { signAccessToken } = require("../../lib/jwt");
const { env } = require("../../config/env");
const { AppError } = require("../../lib/errors");

async function login({ email, password }) {
    const normalizedEmail = String(email || "").trim().toLowerCase();

    const user = await repository.findUserByEmail(normalizedEmail);
    if (!user) {
        throw new AppError({
            status: 401,
            code: "AUTH_INVALID_CREDENTIALS",
            message: "Credenciales invalidas."
        });
    }

    const passwordMatches = await verifyPassword(password, user.passwordHash);
    if (!passwordMatches) {
        throw new AppError({
            status: 401,
            code: "AUTH_INVALID_CREDENTIALS",
            message: "Credenciales invalidas."
        });
    }

    const token = signAccessToken(user);
    return {
        accessToken: token,
        tokenType: "Bearer",
        expiresIn: env.jwtExpiresInSeconds,
        user: {
            id: user.id,
            email: user.email,
            role: user.role
        }
    };
}

module.exports = {
    login
};
