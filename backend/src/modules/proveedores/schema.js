const { z } = require("zod");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+()\-\d\s.]{7,20}$/;

const listProveedoresQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    q: z.string().trim().max(120).optional()
});

const proveedorParamsSchema = z.object({
    nit: z.string().trim().min(1).max(30)
});

const createProveedorSchema = z.object({
    nit: z.string().trim().min(1).max(30),
    nombre: z.string().trim().min(1).max(120),
    direccion: z.string().trim().max(120),
    telefono: z
        .string()
        .trim()
        .max(20)
        .refine((value) => value.length === 0 || PHONE_REGEX.test(value), "Ingresa un telefono valido."),
    email: z
        .string()
        .trim()
        .max(120)
        .refine((value) => value.length === 0 || EMAIL_REGEX.test(value), "Ingresa un correo valido.")
});

const updateProveedorSchema = z
    .object({
        nombre: z.string().trim().min(1).max(120).optional(),
        direccion: z.string().trim().max(120).optional(),
        telefono: z
            .string()
            .trim()
            .max(20)
            .optional()
            .refine((value) => typeof value === "undefined" || value.length === 0 || PHONE_REGEX.test(value), {
                message: "Ingresa un telefono valido."
            }),
        email: z
            .string()
            .trim()
            .max(120)
            .optional()
            .refine((value) => typeof value === "undefined" || value.length === 0 || EMAIL_REGEX.test(value), {
                message: "Ingresa un correo valido."
            })
    })
    .strict()
    .refine((value) => Object.keys(value).length > 0, {
        message: "Debes enviar al menos un campo para actualizar."
    });

module.exports = {
    listProveedoresQuerySchema,
    proveedorParamsSchema,
    createProveedorSchema,
    updateProveedorSchema
};
