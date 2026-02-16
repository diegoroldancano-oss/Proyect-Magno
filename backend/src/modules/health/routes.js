const express = require("express");
const { ok } = require("../../utils/response");

const router = express.Router();

router.get("/", (_req, res) => {
    return ok(res, {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: Number(process.uptime().toFixed(2))
    });
});

module.exports = router;
