const repository = require("./repository");
const { AppError } = require("../../lib/errors");
const { buildPaginationMeta } = require("../../utils/pagination");

function sanitizeText(value, maxLength) {
    return String(value ?? "").trim().slice(0, maxLength);
}

function toDto(proveedor) {
    return {
        nit: proveedor.nit,
        nombre: proveedor.nombre,
        direccion: proveedor.direccion,
        telefono: proveedor.telefono,
        email: proveedor.email
    };
}

function normalizeCreatePayload(payload) {
    return {
        nit: sanitizeText(payload.nit, 30),
        nombre: sanitizeText(payload.nombre, 120),
        direccion: sanitizeText(payload.direccion, 120),
        telefono: sanitizeText(payload.telefono, 20),
        email: sanitizeText(payload.email, 120)
    };
}

function normalizeUpdatePayload(payload) {
    const changes = {};

    if (Object.prototype.hasOwnProperty.call(payload, "nombre")) {
        changes.nombre = sanitizeText(payload.nombre, 120);
    }

    if (Object.prototype.hasOwnProperty.call(payload, "direccion")) {
        changes.direccion = sanitizeText(payload.direccion, 120);
    }

    if (Object.prototype.hasOwnProperty.call(payload, "telefono")) {
        changes.telefono = sanitizeText(payload.telefono, 20);
    }

    if (Object.prototype.hasOwnProperty.call(payload, "email")) {
        changes.email = sanitizeText(payload.email, 120);
    }

    return changes;
}

async function list(query) {
    const { page, pageSize, q } = query;
    const { total, items } = await repository.listActive({
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
    const existing = await repository.findByNit(normalized.nit);

    if (existing && !existing.deletedAt) {
        throw new AppError({
            status: 409,
            code: "CONFLICT",
            message: "Ya existe un proveedor activo con ese NIT."
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

async function update(nit, payload) {
    const existing = await repository.findByNit(nit);

    if (!existing || existing.deletedAt) {
        throw new AppError({
            status: 404,
            code: "NOT_FOUND",
            message: "Proveedor no encontrado."
        });
    }

    const changes = normalizeUpdatePayload(payload);
    const updated = await repository.updateById(existing.id, changes);
    return toDto(updated);
}

async function remove(nit) {
    const existing = await repository.findByNit(nit);

    if (!existing || existing.deletedAt) {
        throw new AppError({
            status: 404,
            code: "NOT_FOUND",
            message: "Proveedor no encontrado."
        });
    }

    await repository.updateById(existing.id, { deletedAt: new Date() });
    return {
        deleted: true,
        nit: existing.nit
    };
}

module.exports = {
    list,
    create,
    update,
    remove
};
