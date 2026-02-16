const express = require("express");
const controller = require("./controller");
const validate = require("../../middleware/validate");
const upload = require("../../middleware/upload");
const { personalPatchSchema, negocioPatchSchema } = require("./schema");

const router = express.Router();

router.get("/", controller.getPerfil);
router.patch("/personal", validate(personalPatchSchema), controller.patchPersonal);
router.patch("/negocio", validate(negocioPatchSchema), controller.patchNegocio);
router.post("/foto", upload.single("foto"), controller.uploadPhoto);

module.exports = router;
