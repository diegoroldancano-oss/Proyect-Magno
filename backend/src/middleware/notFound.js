const { AppError } = require("../lib/errors");

function notFound(_req, _res, next) {
    next(
        new AppError({
            status: 404,
            code: "NOT_FOUND",
            message: "Ruta no encontrada."
        })
    );
}

module.exports = notFound;
