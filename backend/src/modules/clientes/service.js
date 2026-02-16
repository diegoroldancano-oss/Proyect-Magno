const repository = require("./repository");
const { AppError } = require("../../lib/errors");
const { buildPaginationMeta } = require("../../utils/pagination");

function sanitizeText(value, maxLength) {
    return String(value ?? "").trim().slice(0, maxLength);
}

function toDto(cliente) {
    return {
        cedula: cliente.cedula,
        nombre: cliente.nombre,
        telefono: cliente.telefono,
        correo: cliente.correo,
        direccion: cliente.direccion
    };
}

function normalizeCreatePayload(payload) {
    return {
        cedula: sanitizeText(payload.cedula, 20),
        nombre: sanitizeText(payload.nombre, 120),
        telefono: sanitizeText(payload.telefono, 20),
        correo: sanitizeText(payload.correo, 120),
        direccion: sanitizeText(payload.direccion, 120)
    };
}

function normalizeUpdatePayload(payload) {
    const changes = {};

    if (Object.prototype.hasOwnProperty.call(payload, "nombre")) {
        changes.nombre = sanitizeText(payload.nombre, 120);
    }

    if (Object.prototype.hasOwnProperty.call(payload, "telefono")) {
        changes.telefono = sanitizeText(payload.telefono, 20);
    }

    if (Object.prototype.hasOwnProperty.call(payload, "correo")) {
        changes.correo = sanitizeText(payload.correo, 120);
    }

    if (Object.prototype.hasOwnProperty.call(payload, "direccion")) {
        changes.direccion = sanitizeText(payload.direccion, 120);
    }

    return changes;
}

async function list(query) {
    const { page, pageSize, q } = query;
    const { items, total } = await repository.listActive({
        page,
        pageSize,
        q: q || undefined
    });

    return {
        items: items.map(toDto),
        meta: buildPaginationMeta({ page, pageSize, total })
    };
}

async function create(payload) {
    const normalized = normalizeCreatePayload(payload);
    const existing = await repository.findByCedula(normalized.cedula);

    if (existing && !existing.deletedAt) {
        throw new AppError({
            status: 409,
            code: "CONFLICT",
            message: "Ya existe un cliente activo con esa cedula."
        });
    }

    if (existing && existing.deletedAt) {
        const reactivated = await repository.updateById(existing.id, {
            ...normalized,
            deletedAt: null
        });

        return {
            item: toDto(reactivated),
            reactivated: true
        };
    }

    const created = await repository.create(normalized);
    return {
        item: toDto(created),
        reactivated: false
    };
}

async function update(cedula, payload) {
    const existing = await repository.findByCedula(cedula);

    if (!existing || existing.deletedAt) {
        throw new AppError({
            status: 404,
            code: "NOT_FOUND",
            message: "Cliente no encontrado."
        });
    }

    const changes = normalizeUpdatePayload(payload);
    const updated = await repository.updateById(existing.id, changes);
    return toDto(updated);
}

async function remove(cedula) {
    const existing = await repository.findByCedula(cedula);

    if (!existing || existing.deletedAt) {
        throw new AppError({
            status: 404,
            code: "NOT_FOUND",
            message: "Cliente no encontrado."
        });
    }

    await repository.updateById(existing.id, { deletedAt: new Date() });
    return { deleted: true, cedula: existing.cedula };
}

module.exports = {
    list,
    create,
    update,
    remove
};
