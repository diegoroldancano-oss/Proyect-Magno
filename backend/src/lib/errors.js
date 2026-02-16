class AppError extends Error {
    constructor({ status = 500, code = "INTERNAL_ERROR", message = "Error interno del servidor.", details = [] } = {}) {
        super(message);
        this.name = "AppError";
        this.status = status;
        this.code = code;
        this.details = Array.isArray(details) ? details : [];
    }
}

function isAppError(error) {
    return error instanceof AppError;
}

module.exports = {
    AppError,
    isAppError
};
