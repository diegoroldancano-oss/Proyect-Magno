const { randomUUID } = require("crypto");

function requestId(req, res, next) {
    const incomingRequestId = req.headers["x-request-id"];
    req.requestId = incomingRequestId ? String(incomingRequestId) : randomUUID();
    res.setHeader("x-request-id", req.requestId);
    next();
}

module.exports = requestId;
