const prisma = require("../../lib/prisma");

async function listActive({ page, pageSize, q }) {
    const skip = (page - 1) * pageSize;

    const where = {
        deletedAt: null
    };

    if (q) {
        where.OR = [
            { cedula: { contains: q, mode: "insensitive" } },
            { nombre: { contains: q, mode: "insensitive" } },
            { telefono: { contains: q, mode: "insensitive" } },
            { correo: { contains: q, mode: "insensitive" } },
            { direccion: { contains: q, mode: "insensitive" } }
        ];
    }

    const [total, items] = await prisma.$transaction([
        prisma.cliente.count({ where }),
        prisma.cliente.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: pageSize
        })
    ]);

    return { total, items };
}

async function findByCedula(cedula) {
    return prisma.cliente.findUnique({
        where: { cedula }
    });
}

async function create(data) {
    return prisma.cliente.create({ data });
}

async function updateById(id, data) {
    return prisma.cliente.update({
        where: { id },
        data
    });
}

module.exports = {
    listActive,
    findByCedula,
    create,
    updateById
};
