const { z } = require("zod");

const IVA_VALUES = ["0%", "5%", "19%"];

const listProductosQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    q: z.string().trim().max(120).optional()
});

const productoParamsSchema = z.object({
    codigo: z.coerce.number().int().positive()
});

const createProductoSchema = z.object({
    codigo: z.coerce.number().int().positive(),
    nombre: z.string().trim().min(1).max(120),
    precio: z.coerce.number().int().min(0),
    iva: z.enum(IVA_VALUES)
});

const updateProductoSchema = z
    .object({
        nombre: z.string().trim().min(1).max(120).optional(),
        precio: z.coerce.number().int().min(0).optional(),
        iva: z.enum(IVA_VALUES).optional()
    })
    .strict()
    .refine((value) => Object.keys(value).length > 0, {
        message: "Debes enviar al menos un campo para actualizar."
    });

module.exports = {
    IVA_VALUES,
    listProductosQuerySchema,
    productoParamsSchema,
    createProductoSchema,
    updateProductoSchema
};
