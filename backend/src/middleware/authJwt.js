const { verifyAccessToken } = require("../lib/jwt");
const { AppError } = require("../lib/errors");

function authJwt(req, _res, next) {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
        return next(
            new AppError({
                status: 401,
                code: "AUTH_UNAUTHORIZED",
                message: "Token de acceso requerido."
            })
        );
    }

    try {
        const payload = verifyAccessToken(token);
        req.auth = payload;
        return next();
    } catch (_error) {
        return next(
            new AppError({
                status: 401,
                code: "AUTH_UNAUTHORIZED",
                message: "Token invalido o expirado."
            })
        );
    }
}

module.exports = authJwt;
