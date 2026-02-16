const express = require("express");
const validate = require("../../middleware/validate");
const controller = require("./controller");
const {
    listProductosQuerySchema,
    productoParamsSchema,
    createProductoSchema,
    updateProductoSchema
} = require("./schema");

const router = express.Router();

router.get("/", validate(listProductosQuerySchema, "query"), controller.list);
router.post("/", validate(createProductoSchema), controller.createOne);
router.patch(
    "/:codigo",
    validate(productoParamsSchema, "params"),
    validate(updateProductoSchema),
    controller.updateOne
);
router.delete("/:codigo", validate(productoParamsSchema, "params"), controller.deleteOne);

module.exports = router;
