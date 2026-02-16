const repository = require("./repository");
const { AppError } = require("../../lib/errors");
const { buildPaginationMeta } = require("../../utils/pagination");

const IVA_TO_PERCENT = Object.freeze({
    "0%": 0,
    "5%": 5,
    "19%": 19
});

const PERCENT_TO_IVA = Object.freeze({
    0: "0%",
    5: "5%",
    19: "19%"
});

function sanitizeText(value, maxLength) {
    return String(value ?? "").trim().slice(0, maxLength);
}

function calcularPrecioIva(precio, ivaPercent) {
    return Math.round(Number(precio) * (1 + Number(ivaPercent) / 100));
}

function toDto(producto) {
    return {
        codigo: producto.codigo,
        nombre: producto.nombre,
        precio: producto.precio,
        iva: PERCENT_TO_IVA[producto.ivaPercent] || "0%",
        precioIva: calcularPrecioIva(producto.precio, producto.ivaPercent)
    };
}

function normalizeCreatePayload(payload) {
    return {
        codigo: Number(payload.codigo),
        nombre: sanitizeText(payload.nombre, 120),
        precio: Number(payload.precio),
        ivaPercent: IVA_TO_PERCENT[payload.iva]
    };
}

function normalizeUpdatePayload(payload) {
    const changes = {};

    if (Object.prototype.hasOwnProperty.call(payload, "nombre")) {
        changes.nombre = sanitizeText(payload.nombre, 120);
    }

    if (Object.prototype.hasOwnProperty.call(payload, "precio")) {
        changes.precio = Number(payload.precio);
    }

    if (Object.prototype.hasOwnProperty.call(payload, "iva")) {
        changes.ivaPercent = IVA_TO_PERCENT[payload.iva];
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
    const existing = await repository.findByCodigo(normalized.codigo);

    if (existing && !existing.deletedAt) {
        throw new AppError({
            status: 409,
            code: "CONFLICT",
            message: "Ya existe un producto activo con ese codigo."
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

async function update(codigo, payload) {
    const existing = await repository.findByCodigo(Number(codigo));
    if (!existing || existing.deletedAt) {
        throw new AppError({
            status: 404,
            code: "NOT_FOUND",
            message: "Producto no encontrado."
        });
    }

    const changes = normalizeUpdatePayload(payload);
    const updated = await repository.updateById(existing.id, changes);
    return toDto(updated);
}

async function remove(codigo) {
    const existing = await repository.findByCodigo(Number(codigo));
    if (!existing || existing.deletedAt) {
        throw new AppError({
            status: 404,
            code: "NOT_FOUND",
            message: "Producto no encontrado."
        });
    }

    await repository.updateById(existing.id, {
        deletedAt: new Date()
    });

    return {
        deleted: true,
        codigo: existing.codigo
    };
}

module.exports = {
    list,
    create,
    update,
    remove
};
