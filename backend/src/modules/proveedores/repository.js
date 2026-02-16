const prisma = require("../../lib/prisma");

async function listActive({ page, pageSize, q }) {
    const skip = (page - 1) * pageSize;

    const where = {
        deletedAt: null
    };

    if (q) {
        where.OR = [
            { nit: { contains: q, mode: "insensitive" } },
            { nombre: { contains: q, mode: "insensitive" } },
            { direccion: { contains: q, mode: "insensitive" } },
            { telefono: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } }
        ];
    }

    const [total, items] = await prisma.$transaction([
        prisma.proveedor.count({ where }),
        prisma.proveedor.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: pageSize
        })
    ]);

    return { total, items };
}

async function findByNit(nit) {
    return prisma.proveedor.findUnique({
        where: { nit }
    });
}

async function create(data) {
    return prisma.proveedor.create({ data });
}

async function updateById(id, data) {
    return prisma.proveedor.update({
        where: { id },
        data
    });
}

module.exports = {
    listActive,
    findByNit,
    create,
    updateById
};
