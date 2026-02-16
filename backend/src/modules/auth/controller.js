const service = require("./service");
const { ok } = require("../../utils/response");

async function login(req, res, next) {
    try {
        const payload = await service.login(req.body);
        return ok(res, payload);
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    login
};
