const { z } = require("zod");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+()\-\d\s.]{7,20}$/;

const listClientesQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    q: z.string().trim().max(120).optional()
});

const clienteParamsSchema = z.object({
    cedula: z.string().trim().min(1).max(20)
});

const createClienteSchema = z.object({
    cedula: z.string().trim().min(1).max(20),
    nombre: z.string().trim().min(1).max(120),
    telefono: z
        .string()
        .trim()
        .max(20)
        .refine((value) => value.length === 0 || PHONE_REGEX.test(value), "Ingresa un telefono valido."),
    correo: z
        .string()
        .trim()
        .max(120)
        .refine((value) => value.length === 0 || EMAIL_REGEX.test(value), "Ingresa un correo valido."),
    direccion: z.string().trim().max(120)
});

const updateClienteSchema = z
    .object({
        nombre: z.string().trim().min(1).max(120).optional(),
        telefono: z
            .string()
            .trim()
            .max(20)
            .optional()
            .refine((value) => typeof value === "undefined" || value.length === 0 || PHONE_REGEX.test(value), {
                message: "Ingresa un telefono valido."
            }),
        correo: z
            .string()
            .trim()
            .max(120)
            .optional()
            .refine((value) => typeof value === "undefined" || value.length === 0 || EMAIL_REGEX.test(value), {
                message: "Ingresa un correo valido."
            }),
        direccion: z.string().trim().max(120).optional()
    })
    .strict()
    .refine((value) => Object.keys(value).length > 0, {
        message: "Debes enviar al menos un campo para actualizar."
    });

module.exports = {
    listClientesQuerySchema,
    clienteParamsSchema,
    createClienteSchema,
    updateClienteSchema
};
