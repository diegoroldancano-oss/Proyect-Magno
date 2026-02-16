const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const INITIAL_CLIENTES = [
    {
        cedula: "1234567890",
        nombre: "Juan Perez",
        telefono: "0987654321",
        correo: "juan.perez@example.com",
        direccion: "Av. Siempre Viva 123"
    },
    {
        cedula: "1098765432",
        nombre: "Ana Gomez",
        telefono: "3201234567",
        correo: "ana.gomez@example.com",
        direccion: "Calle 45 #12-30"
    },
    {
        cedula: "1002003004",
        nombre: "Carlos Ruiz",
        telefono: "3159876543",
        correo: "carlos.ruiz@example.com",
        direccion: "Cra 10 #8-20"
    }
];

const INITIAL_PROVEEDORES = [
    {
        nit: "900100001",
        nombre: "SuperOriente",
        direccion: "Calle 123",
        telefono: "123456789",
        email: "superoriente@example.com"
    },
    {
        nit: "900100002",
        nombre: "SuperOccidente",
        direccion: "Avenida 456",
        telefono: "987654321",
        email: "superoccidente@example.com"
    },
    {
        nit: "900100003",
        nombre: "Alimentos Central",
        direccion: "Carrera 78",
        telefono: "321654987",
        email: "central@example.com"
    }
];

const INITIAL_PRODUCTOS = [
    { codigo: 1, nombre: "Coca Cola", precio: 2100, ivaPercent: 19 },
    { codigo: 2, nombre: "Papas Margarita", precio: 1500, ivaPercent: 0 },
    { codigo: 3, nombre: "Arroz Diana", precio: 3200, ivaPercent: 19 }
];

async function seedAdminUserAndProfile() {
    const adminEmail = String(process.env.ADMIN_EMAIL || "admin@nabook.local")
        .trim()
        .toLowerCase();
    const adminPassword = String(process.env.ADMIN_PASSWORD || "Admin12345!");
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const user = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            passwordHash,
            role: "ADMIN"
        },
        create: {
            email: adminEmail,
            passwordHash,
            role: "ADMIN"
        }
    });

    await prisma.profile.upsert({
        where: { userId: user.id },
        update: {
            negocioNombre: "Mercados Doris",
            negocioTipo: "Mini Mercado",
            negocioUbicacion: "",
            photoUrl: "img/profile-img.jpg"
        },
        create: {
            userId: user.id,
            personalNombre: "",
            personalTelefono: "",
            personalEmail: "",
            personalDireccion: "",
            negocioNombre: "Mercados Doris",
            negocioTipo: "Mini Mercado",
            negocioUbicacion: "",
            photoUrl: "img/profile-img.jpg"
        }
    });
}

async function seedClientes() {
    for (const cliente of INITIAL_CLIENTES) {
        await prisma.cliente.upsert({
            where: { cedula: cliente.cedula },
            update: {
                ...cliente,
                deletedAt: null
            },
            create: cliente
        });
    }
}

async function seedProveedores() {
    for (const proveedor of INITIAL_PROVEEDORES) {
        await prisma.proveedor.upsert({
            where: { nit: proveedor.nit },
            update: {
                ...proveedor,
                deletedAt: null
            },
            create: proveedor
        });
    }
}

async function seedProductos() {
    for (const producto of INITIAL_PRODUCTOS) {
        await prisma.producto.upsert({
            where: { codigo: producto.codigo },
            update: {
                ...producto,
                deletedAt: null
            },
            create: producto
        });
    }
}

async function main() {
    await seedAdminUserAndProfile();
    await seedClientes();
    await seedProveedores();
    await seedProductos();
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (error) => {
        console.error("Error en seed:", error);
        await prisma.$disconnect();
        process.exit(1);
    });
