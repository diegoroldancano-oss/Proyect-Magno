const prisma = require("../../lib/prisma");

async function listActive({ page, pageSize, q }) {
    const skip = (page - 1) * pageSize;

    const where = {
        deletedAt: null
    };

    if (q) {
        const possibleCodigo = Number(q);
        where.OR = [{ nombre: { contains: q, mode: "insensitive" } }];

        if (Number.isInteger(possibleCodigo)) {
            where.OR.push({ codigo: possibleCodigo });
        }
    }

    const [total, items] = await prisma.$transaction([
        prisma.producto.count({ where }),
        prisma.producto.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: pageSize
        })
    ]);

    return { total, items };
}

async function findByCodigo(codigo) {
    return prisma.producto.findUnique({
        where: { codigo }
    });
}

async function create(data) {
    return prisma.producto.create({
        data
    });
}

async function updateById(id, data) {
    return prisma.producto.update({
        where: { id },
        data
    });
}

module.exports = {
    listActive,
    findByCodigo,
    create,
    updateById
};
