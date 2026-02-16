process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../../src/app");
const prisma = require("../../src/lib/prisma");
const { hashPassword } = require("../../src/lib/password");

const RUN_ID = String(Date.now());
const SHORT_ID = RUN_ID.slice(-8);

const TEST_USER_EMAIL = `it-admin-${RUN_ID}@nabook.local`;
const TEST_USER_PASSWORD = "Admin12345!";

const CLIENTE_CEDULA = `IT${SHORT_ID}01`;
const PROVEEDOR_NIT = `NIT${SHORT_ID}01`;
const PRODUCTO_CODIGO = 900000 + (Number(SHORT_ID) % 9000);

let accessToken = "";

function authHeader() {
    return `Bearer ${accessToken}`;
}

beforeAll(async () => {
    const passwordHash = await hashPassword(TEST_USER_PASSWORD);
    const user = await prisma.user.create({
        data: {
            email: TEST_USER_EMAIL,
            passwordHash,
            role: "ADMIN"
        }
    });

    await prisma.profile.create({
        data: {
            userId: user.id,
            negocioNombre: "Mercados Doris",
            negocioTipo: "Mini Mercado",
            photoUrl: "img/profile-img.jpg"
        }
    });

    const loginResponse = await request(app).post("/api/auth/login").send({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD
    });

    accessToken = loginResponse.body.data.accessToken;
});

afterAll(async () => {
    await prisma.cliente.deleteMany({
        where: {
            cedula: {
                startsWith: `IT${SHORT_ID}`
            }
        }
    });

    await prisma.proveedor.deleteMany({
        where: {
            nit: {
                startsWith: `NIT${SHORT_ID}`
            }
        }
    });

    await prisma.producto.deleteMany({
        where: {
            codigo: {
                gte: PRODUCTO_CODIGO,
                lte: PRODUCTO_CODIGO + 20
            }
        }
    });

    await prisma.user.deleteMany({
        where: {
            email: TEST_USER_EMAIL
        }
    });

    await prisma.$disconnect();
});

test("GET /api/health responde 200", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe("ok");
});

test("POST /api/auth/login con credenciales validas retorna token", async () => {
    const response = await request(app).post("/api/auth/login").send({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD
    });

    expect(response.status).toBe(200);
    expect(response.body.data.accessToken).toBeTruthy();
});

test("POST /api/auth/login con credenciales invalidas retorna 401", async () => {
    const response = await request(app).post("/api/auth/login").send({
        email: TEST_USER_EMAIL,
        password: "incorrect-password"
    });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("AUTH_INVALID_CREDENTIALS");
});

test("Endpoint protegido sin token retorna 401", async () => {
    const response = await request(app).get("/api/clientes");
    expect(response.status).toBe(401);
});

test("GET /api/perfil con token valido retorna DTO completo", async () => {
    const response = await request(app).get("/api/perfil").set("Authorization", authHeader());

    expect(response.status).toBe(200);
    expect(response.body.data.personal).toBeDefined();
    expect(response.body.data.negocio).toBeDefined();
    expect(response.body.data.photoUrl).toBeDefined();
});

test("PATCH /api/perfil/personal con correo invalido retorna 422", async () => {
    const response = await request(app)
        .patch("/api/perfil/personal")
        .set("Authorization", authHeader())
        .send({ email: "correo-invalido" });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
});

test("PATCH /api/perfil/negocio con fecha invalida retorna 422", async () => {
    const response = await request(app)
        .patch("/api/perfil/negocio")
        .set("Authorization", authHeader())
        .send({ "fecha-creacion": "2026-99-99" });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
});

test("POST /api/perfil/foto con archivo >5MB retorna 413", async () => {
    const hugeBuffer = Buffer.alloc(5 * 1024 * 1024 + 1, "a");
    const response = await request(app)
        .post("/api/perfil/foto")
        .set("Authorization", authHeader())
        .attach("foto", hugeBuffer, {
            filename: "too-large.jpg",
            contentType: "image/jpeg"
        });

    expect(response.status).toBe(413);
    expect(response.body.error.code).toBe("FILE_TOO_LARGE");
});

test("POST /api/perfil/foto con mime invalido retorna 415", async () => {
    const response = await request(app)
        .post("/api/perfil/foto")
        .set("Authorization", authHeader())
        .attach("foto", Buffer.from("fake-image"), {
            filename: "invalid.txt",
            contentType: "text/plain"
        });

    expect(response.status).toBe(415);
    expect(response.body.error.code).toBe("UNSUPPORTED_MEDIA_TYPE");
});

test("CRUD cliente + borrado logico", async () => {
    const createResponse = await request(app).post("/api/clientes").set("Authorization", authHeader()).send({
        cedula: CLIENTE_CEDULA,
        nombre: "Cliente Integracion",
        telefono: "3001112233",
        correo: "cliente.integration@nabook.local",
        direccion: "Calle Test 10"
    });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.data.cedula).toBe(CLIENTE_CEDULA);

    const listResponse = await request(app)
        .get("/api/clientes")
        .set("Authorization", authHeader())
        .query({ page: 1, pageSize: 20, q: CLIENTE_CEDULA });

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data.some((item) => item.cedula === CLIENTE_CEDULA)).toBe(true);

    const patchResponse = await request(app)
        .patch(`/api/clientes/${CLIENTE_CEDULA}`)
        .set("Authorization", authHeader())
        .send({
            nombre: "Cliente Integracion Actualizado"
        });

    expect(patchResponse.status).toBe(200);
    expect(patchResponse.body.data.nombre).toBe("Cliente Integracion Actualizado");

    const deleteResponse = await request(app)
        .delete(`/api/clientes/${CLIENTE_CEDULA}`)
        .set("Authorization", authHeader());

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.data.deleted).toBe(true);

    const listAfterDelete = await request(app)
        .get("/api/clientes")
        .set("Authorization", authHeader())
        .query({ page: 1, pageSize: 20, q: CLIENTE_CEDULA });

    expect(listAfterDelete.status).toBe(200);
    expect(listAfterDelete.body.data.some((item) => item.cedula === CLIENTE_CEDULA)).toBe(false);
});

test("Recrear cliente eliminado con misma cedula reactiva registro", async () => {
    const response = await request(app).post("/api/clientes").set("Authorization", authHeader()).send({
        cedula: CLIENTE_CEDULA,
        nombre: "Cliente Reactivado",
        telefono: "3001112233",
        correo: "cliente.reactivado@nabook.local",
        direccion: "Calle Test 11"
    });

    expect(response.status).toBe(200);
    expect(response.body.data.nombre).toBe("Cliente Reactivado");
});

test("CRUD proveedor + borrado logico + reactivacion", async () => {
    const createResponse = await request(app).post("/api/proveedores").set("Authorization", authHeader()).send({
        nit: PROVEEDOR_NIT,
        nombre: "Proveedor Integracion",
        direccion: "Avenida Test 1",
        telefono: "3100001122",
        email: "proveedor.integration@nabook.local"
    });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.data.nit).toBe(PROVEEDOR_NIT);

    const listResponse = await request(app)
        .get("/api/proveedores")
        .set("Authorization", authHeader())
        .query({ page: 1, pageSize: 20, q: PROVEEDOR_NIT });

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data.some((item) => item.nit === PROVEEDOR_NIT)).toBe(true);

    const patchResponse = await request(app)
        .patch(`/api/proveedores/${PROVEEDOR_NIT}`)
        .set("Authorization", authHeader())
        .send({
            nombre: "Proveedor Integracion Actualizado"
        });

    expect(patchResponse.status).toBe(200);
    expect(patchResponse.body.data.nombre).toBe("Proveedor Integracion Actualizado");

    const deleteResponse = await request(app)
        .delete(`/api/proveedores/${PROVEEDOR_NIT}`)
        .set("Authorization", authHeader());

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.data.deleted).toBe(true);

    const recreateResponse = await request(app).post("/api/proveedores").set("Authorization", authHeader()).send({
        nit: PROVEEDOR_NIT,
        nombre: "Proveedor Reactivado",
        direccion: "Avenida Test 2",
        telefono: "3100002233",
        email: "proveedor.reactivado@nabook.local"
    });

    expect(recreateResponse.status).toBe(200);
    expect(recreateResponse.body.data.nombre).toBe("Proveedor Reactivado");
});

test("CRUD producto valida IVA y calcula precioIva", async () => {
    const createResponse = await request(app).post("/api/productos").set("Authorization", authHeader()).send({
        codigo: PRODUCTO_CODIGO,
        nombre: "Producto Integracion",
        precio: 2100,
        iva: "19%"
    });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.data.precioIva).toBe(2499);

    const patchResponse = await request(app)
        .patch(`/api/productos/${PRODUCTO_CODIGO}`)
        .set("Authorization", authHeader())
        .send({
            precio: 1000,
            iva: "5%"
        });

    expect(patchResponse.status).toBe(200);
    expect(patchResponse.body.data.precioIva).toBe(1050);

    const deleteResponse = await request(app)
        .delete(`/api/productos/${PRODUCTO_CODIGO}`)
        .set("Authorization", authHeader());

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.data.deleted).toBe(true);

    const recreateResponse = await request(app).post("/api/productos").set("Authorization", authHeader()).send({
        codigo: PRODUCTO_CODIGO,
        nombre: "Producto Reactivado",
        precio: 1200,
        iva: "19%"
    });

    expect(recreateResponse.status).toBe(200);
    expect(recreateResponse.body.data.precioIva).toBe(1428);
});

test("Duplicado activo en cedula, nit y codigo retorna 409", async () => {
    const clienteDuplicate = await request(app).post("/api/clientes").set("Authorization", authHeader()).send({
        cedula: CLIENTE_CEDULA,
        nombre: "Cliente Duplicado",
        telefono: "3000000000",
        correo: "duplicado1@nabook.local",
        direccion: "Calle Duplicado"
    });
    expect(clienteDuplicate.status).toBe(409);

    const proveedorDuplicate = await request(app).post("/api/proveedores").set("Authorization", authHeader()).send({
        nit: PROVEEDOR_NIT,
        nombre: "Proveedor Duplicado",
        direccion: "Avenida Duplicada",
        telefono: "3000000000",
        email: "duplicado2@nabook.local"
    });
    expect(proveedorDuplicate.status).toBe(409);

    const productoDuplicate = await request(app).post("/api/productos").set("Authorization", authHeader()).send({
        codigo: PRODUCTO_CODIGO,
        nombre: "Producto Duplicado",
        precio: 1000,
        iva: "19%"
    });
    expect(productoDuplicate.status).toBe(409);
});

test("GET /api/openapi.json expone rutas principales", async () => {
    const response = await request(app).get("/api/openapi.json");
    expect(response.status).toBe(200);
    expect(response.body.paths["/api/auth/login"]).toBeDefined();
    expect(response.body.paths["/api/perfil"]).toBeDefined();
    expect(response.body.paths["/api/clientes"]).toBeDefined();
    expect(response.body.paths["/api/proveedores"]).toBeDefined();
    expect(response.body.paths["/api/productos"]).toBeDefined();
});
