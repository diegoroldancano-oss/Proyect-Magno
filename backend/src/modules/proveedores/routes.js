const express = require("express");
const validate = require("../../middleware/validate");
const controller = require("./controller");
const {
    listProveedoresQuerySchema,
    proveedorParamsSchema,
    createProveedorSchema,
    updateProveedorSchema
} = require("./schema");

const router = express.Router();

router.get("/", validate(listProveedoresQuerySchema, "query"), controller.list);
router.post("/", validate(createProveedorSchema), controller.createOne);
router.patch(
    "/:nit",
    validate(proveedorParamsSchema, "params"),
    validate(updateProveedorSchema),
    controller.updateOne
);
router.delete("/:nit", validate(proveedorParamsSchema, "params"), controller.deleteOne);

module.exports = router;
