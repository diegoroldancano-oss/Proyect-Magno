const prisma = require("../../lib/prisma");

async function ensureProfileExists(userId) {
    return prisma.profile.upsert({
        where: { userId },
        update: {},
        create: { userId }
    });
}

async function findByUserId(userId) {
    return prisma.profile.findUnique({
        where: { userId }
    });
}

async function updateByUserId(userId, data) {
    return prisma.profile.update({
        where: { userId },
        data
    });
}

module.exports = {
    ensureProfileExists,
    findByUserId,
    updateByUserId
};
