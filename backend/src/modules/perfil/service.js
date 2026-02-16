const fs = require("fs/promises");
const path = require("path");
const repository = require("./repository");
const { env } = require("../../config/env");

const DEFAULT_PHOTO_URL = "img/profile-img.jpg";

function sanitizeText(value, maxLength) {
    return String(value ?? "").trim().slice(0, maxLength);
}

function toDateOrNull(value) {
    const normalized = String(value ?? "").trim();
    if (!normalized) {
        return null;
    }

    return new Date(`${normalized}T00:00:00.000Z`);
}

function formatDate(value) {
    if (!value) {
        return "";
    }

    return new Date(value).toISOString().slice(0, 10);
}

function toPerfilDto(profile) {
    return {
        personal: {
            nombre: profile.personalNombre || "",
            telefono: profile.personalTelefono || "",
            email: profile.personalEmail || "",
            direccion: profile.personalDireccion || ""
        },
        negocio: {
            "nombre-negocio": profile.negocioNombre || "",
            "tipo-negocio": profile.negocioTipo || "",
            "ubicacion-negocio": profile.negocioUbicacion || "",
            "fecha-creacion": formatDate(profile.negocioFechaCreacion)
        },
        photoUrl: profile.photoUrl || DEFAULT_PHOTO_URL
    };
}

function normalizePersonalPatch(payload = {}) {
    const data = {};

    if (Object.prototype.hasOwnProperty.call(payload, "nombre")) {
        data.personalNombre = sanitizeText(payload.nombre, 80);
    }

    if (Object.prototype.hasOwnProperty.call(payload, "telefono")) {
        data.personalTelefono = sanitizeText(payload.telefono, 20);
    }

    if (Object.prototype.hasOwnProperty.call(payload, "email")) {
        data.personalEmail = sanitizeText(payload.email, 120);
    }

    if (Object.prototype.hasOwnProperty.call(payload, "direccion")) {
        data.personalDireccion = sanitizeText(payload.direccion, 120);
    }

    return data;
}

function normalizeNegocioPatch(payload = {}) {
    const data = {};

    if (Object.prototype.hasOwnProperty.call(payload, "nombre-negocio")) {
        data.negocioNombre = sanitizeText(payload["nombre-negocio"], 100);
    }

    if (Object.prototype.hasOwnProperty.call(payload, "tipo-negocio")) {
        data.negocioTipo = sanitizeText(payload["tipo-negocio"], 80);
    }

    if (Object.prototype.hasOwnProperty.call(payload, "ubicacion-negocio")) {
        data.negocioUbicacion = sanitizeText(payload["ubicacion-negocio"], 120);
    }

    if (Object.prototype.hasOwnProperty.call(payload, "fecha-creacion")) {
        data.negocioFechaCreacion = toDateOrNull(payload["fecha-creacion"]);
    }

    return data;
}

async function getPerfil(userId) {
    await repository.ensureProfileExists(userId);
    const profile = await repository.findByUserId(userId);
    return toPerfilDto(profile);
}

async function updatePersonal(userId, payload) {
    await repository.ensureProfileExists(userId);
    const changes = normalizePersonalPatch(payload);
    const profile = await repository.updateByUserId(userId, changes);
    return toPerfilDto(profile);
}

async function updateNegocio(userId, payload) {
    await repository.ensureProfileExists(userId);
    const changes = normalizeNegocioPatch(payload);
    const profile = await repository.updateByUserId(userId, changes);
    return toPerfilDto(profile);
}

async function removeOldPhotoIfNeeded(currentPhotoUrl, nextPhotoUrl) {
    if (!currentPhotoUrl) {
        return;
    }

    if (currentPhotoUrl === DEFAULT_PHOTO_URL || currentPhotoUrl === nextPhotoUrl) {
        return;
    }

    if (!currentPhotoUrl.startsWith("/uploads/profiles/")) {
        return;
    }

    const fileName = path.basename(currentPhotoUrl);
    const filePath = path.resolve(env.uploadDir, fileName);
    await fs.unlink(filePath).catch(() => {});
}

async function updatePhoto(userId, photoUrl) {
    await repository.ensureProfileExists(userId);
    const current = await repository.findByUserId(userId);

    const profile = await repository.updateByUserId(userId, {
        photoUrl
    });

    await removeOldPhotoIfNeeded(current.photoUrl, photoUrl);

    return toPerfilDto(profile);
}

module.exports = {
    getPerfil,
    updatePersonal,
    updateNegocio,
    updatePhoto
};
