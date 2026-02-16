const { z } = require("zod");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+()\-\d\s.]{7,20}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function hasAtLeastOneField(value) {
    return Object.keys(value).length > 0;
}

const personalPatchSchema = z
    .object({
        nombre: z.string().trim().max(80).optional(),
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
            }),
        direccion: z.string().trim().max(120).optional()
    })
    .strict()
    .refine(hasAtLeastOneField, {
        message: "Debes enviar al menos un campo para actualizar."
    });

const negocioPatchSchema = z
    .object({
        "nombre-negocio": z.string().trim().max(100).optional(),
        "tipo-negocio": z.string().trim().max(80).optional(),
        "ubicacion-negocio": z.string().trim().max(120).optional(),
        "fecha-creacion": z
            .string()
            .trim()
            .optional()
            .refine((value) => {
                if (typeof value === "undefined" || value.length === 0) {
                    return true;
                }

                if (!DATE_REGEX.test(value)) {
                    return false;
                }

                const parsedDate = new Date(`${value}T00:00:00.000Z`);
                return !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === value;
            }, "Ingresa una fecha valida.")
    })
    .strict()
    .refine(hasAtLeastOneField, {
        message: "Debes enviar al menos un campo para actualizar."
    });

module.exports = {
    personalPatchSchema,
    negocioPatchSchema
};
