const express = require("express");
const validate = require("../../middleware/validate");
const controller = require("./controller");
const {
    listClientesQuerySchema,
    clienteParamsSchema,
    createClienteSchema,
    updateClienteSchema
} = require("./schema");

const router = express.Router();

router.get("/", validate(listClientesQuerySchema, "query"), controller.list);
router.post("/", validate(createClienteSchema), controller.createOne);
router.patch(
    "/:cedula",
    validate(clienteParamsSchema, "params"),
    validate(updateClienteSchema),
    controller.updateOne
);
router.delete("/:cedula", validate(clienteParamsSchema, "params"), controller.deleteOne);

module.exports = router;
