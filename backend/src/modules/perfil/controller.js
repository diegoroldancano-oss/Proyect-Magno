const path = require("path");
const service = require("./service");
const { ok } = require("../../utils/response");
const { AppError } = require("../../lib/errors");

function getAuthenticatedUserId(req) {
    const userId = req.auth && req.auth.sub ? String(req.auth.sub) : "";
    if (!userId) {
        throw new AppError({
            status: 401,
            code: "AUTH_UNAUTHORIZED",
            message: "Sesion invalida."
        });
    }

    return userId;
}

async function getPerfil(req, res, next) {
    try {
        const userId = getAuthenticatedUserId(req);
        const data = await service.getPerfil(userId);
        return ok(res, data);
    } catch (error) {
        return next(error);
    }
}

async function patchPersonal(req, res, next) {
    try {
        const userId = getAuthenticatedUserId(req);
        const data = await service.updatePersonal(userId, req.body);
        return ok(res, data);
    } catch (error) {
        return next(error);
    }
}

async function patchNegocio(req, res, next) {
    try {
        const userId = getAuthenticatedUserId(req);
        const data = await service.updateNegocio(userId, req.body);
        return ok(res, data);
    } catch (error) {
        return next(error);
    }
}

async function uploadPhoto(req, res, next) {
    try {
        const userId = getAuthenticatedUserId(req);
        const file = req.file;

        if (!file) {
            throw new AppError({
                status: 400,
                code: "MISSING_FILE",
                message: "Selecciona una imagen para continuar."
            });
        }

        const photoUrl = `/uploads/profiles/${path.basename(file.filename)}`;
        const data = await service.updatePhoto(userId, photoUrl);
        return ok(res, data);
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    getPerfil,
    patchPersonal,
    patchNegocio,
    uploadPhoto
};
