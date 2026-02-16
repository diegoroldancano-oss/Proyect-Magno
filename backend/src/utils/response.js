function buildPayload(data, meta) {
    const payload = { data };
    if (meta && Object.keys(meta).length > 0) {
        payload.meta = meta;
    }
    return payload;
}

function ok(res, data = {}, meta) {
    return res.status(200).json(buildPayload(data, meta));
}

function created(res, data = {}, meta) {
    return res.status(201).json(buildPayload(data, meta));
}

module.exports = {
    ok,
    created
};
