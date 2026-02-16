function requestLogger(req, res, next) {
    const startNs = process.hrtime.bigint();

    res.on("finish", () => {
        const endNs = process.hrtime.bigint();
        const durationMs = Number(endNs - startNs) / 1_000_000;

        const entry = {
            timestamp: new Date().toISOString(),
            requestId: req.requestId || "",
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            durationMs: Number(durationMs.toFixed(2))
        };

        console.log(JSON.stringify(entry));
    });

    next();
}

module.exports = requestLogger;
