const multer = require("multer");
const { ZodError } = require("zod");
const { isAppError, AppError } = require("../lib/errors");

function zodToDetails(error) {
    return error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message
    }));
}

function errorHandler(error, req, res, _next) {
    let handledError = error;

    if (error instanceof ZodError) {
        handledError = new AppError({
            status: 422,
            code: "VALIDATION_ERROR",
            message: "El payload no cumple las reglas de validacion.",
            details: zodToDetails(error)
        });
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
        handledError = new AppError({
            status: 413,
            code: "FILE_TOO_LARGE",
            message: "La imagen supera el limite tecnico de 5 MB."
        });
    }

    if (!isAppError(handledError)) {
        handledError = new AppError({
            status: 500,
            code: "INTERNAL_ERROR",
            message: "Error interno del servidor."
        });
    }

    const body = {
        error: {
            code: handledError.code,
            message: handledError.message,
            details: handledError.details || []
        }
    };

    if (req.requestId) {
        body.error.requestId = req.requestId;
    }

    res.status(handledError.status).json(body);
}

module.exports = errorHandler;
