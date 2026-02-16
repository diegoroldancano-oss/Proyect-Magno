const app = require("./app");
const prisma = require("./lib/prisma");
const { env } = require("./config/env");

const server = app.listen(env.port, () => {
    console.log(`Nabook API escuchando en http://localhost:${env.port}`);
});

async function shutdown(signal) {
    console.log(`Recibida senal ${signal}. Cerrando servidor...`);
    server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
    });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
