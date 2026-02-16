const express = require("express");
const validate = require("../../middleware/validate");
const controller = require("./controller");
const { loginSchema } = require("./schema");

const router = express.Router();

router.post("/login", validate(loginSchema), controller.login);

module.exports = router;
