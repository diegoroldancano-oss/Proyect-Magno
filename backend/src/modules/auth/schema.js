const { z } = require("zod");

const loginSchema = z.object({
    email: z.string().trim().email().max(120),
    password: z.string().min(1).max(128)
});

module.exports = {
    loginSchema
};
