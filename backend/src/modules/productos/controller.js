const service = require("./service");
const { ok, created } = require("../../utils/response");

async function list(req, res, next) {
    try {
        const result = await service.list(req.query);
        return ok(res, result.items, result.meta);
    } catch (error) {
        return next(error);
    }
}

async function createOne(req, res, next) {
    try {
        const result = await service.create(req.body);
        if (result.reactivated) {
            return ok(res, result.item);
        }

        return created(res, result.item);
    } catch (error) {
        return next(error);
    }
}

async function updateOne(req, res, next) {
    try {
        const data = await service.update(req.params.codigo, req.body);
        return ok(res, data);
    } catch (error) {
        return next(error);
    }
}

async function deleteOne(req, res, next) {
    try {
        const data = await service.remove(req.params.codigo);
        return ok(res, data);
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    list,
    createOne,
    updateOne,
    deleteOne
};
