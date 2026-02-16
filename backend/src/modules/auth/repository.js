const prisma = require("../../lib/prisma");

async function findUserByEmail(email) {
    return prisma.user.findUnique({
        where: {
            email
        }
    });
}

module.exports = {
    findUserByEmail
};
