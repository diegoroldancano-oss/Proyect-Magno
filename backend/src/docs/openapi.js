const openApiDocument = {
    openapi: "3.0.3",
    info: {
        title: "Nabook API",
        version: "1.0.0",
        description: "API backend para Nabook (perfil, clientes, proveedores y productos)."
    },
    servers: [
        {
            url: "/",
            description: "Servidor actual"
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT"
            }
        },
        schemas: {
            ErrorResponse: {
                type: "object",
                properties: {
                    error: {
                        type: "object",
                        properties: {
                            code: { type: "string", example: "VALIDATION_ERROR" },
                            message: { type: "string", example: "El payload no cumple las reglas de validacion." },
                            details: {
                                type: "array",
                                items: { type: "object" }
                            },
                            requestId: { type: "string" }
                        },
                        required: ["code", "message", "details"]
                    }
                },
                required: ["error"]
            },
            LoginRequest: {
                type: "object",
                properties: {
                    email: { type: "string", format: "email", example: "admin@nabook.local" },
                    password: { type: "string", example: "Admin12345!" }
                },
                required: ["email", "password"]
            },
            LoginResponse: {
                type: "object",
                properties: {
                    data: {
                        type: "object",
                        properties: {
                            accessToken: { type: "string" },
                            tokenType: { type: "string", example: "Bearer" },
                            expiresIn: { type: "integer", example: 28800 },
                            user: {
                                type: "object",
                                properties: {
                                    id: { type: "string", format: "uuid" },
                                    email: { type: "string", format: "email" },
                                    role: { type: "string", example: "ADMIN" }
                                },
                                required: ["id", "email", "role"]
                            }
                        },
                        required: ["accessToken", "tokenType", "expiresIn", "user"]
                    }
                },
                required: ["data"]
            },
            Perfil: {
                type: "object",
                properties: {
                    personal: {
                        type: "object",
                        properties: {
                            nombre: { type: "string" },
                            telefono: { type: "string" },
                            email: { type: "string" },
                            direccion: { type: "string" }
                        },
                        required: ["nombre", "telefono", "email", "direccion"]
                    },
                    negocio: {
                        type: "object",
                        properties: {
                            "nombre-negocio": { type: "string" },
                            "tipo-negocio": { type: "string" },
                            "ubicacion-negocio": { type: "string" },
                            "fecha-creacion": { type: "string", example: "2026-01-15" }
                        },
                        required: ["nombre-negocio", "tipo-negocio", "ubicacion-negocio", "fecha-creacion"]
                    },
                    photoUrl: { type: "string", example: "/uploads/profiles/archivo.webp" }
                },
                required: ["personal", "negocio", "photoUrl"]
            },
            PerfilPersonalPatch: {
                type: "object",
                properties: {
                    nombre: { type: "string" },
                    telefono: { type: "string" },
                    email: { type: "string" },
                    direccion: { type: "string" }
                },
                additionalProperties: false
            },
            PerfilNegocioPatch: {
                type: "object",
                properties: {
                    "nombre-negocio": { type: "string" },
                    "tipo-negocio": { type: "string" },
                    "ubicacion-negocio": { type: "string" },
                    "fecha-creacion": { type: "string", example: "2026-01-15" }
                },
                additionalProperties: false
            },
            Cliente: {
                type: "object",
                properties: {
                    cedula: { type: "string" },
                    nombre: { type: "string" },
                    telefono: { type: "string" },
                    correo: { type: "string" },
                    direccion: { type: "string" }
                },
                required: ["cedula", "nombre", "telefono", "correo", "direccion"]
            },
            Proveedor: {
                type: "object",
                properties: {
                    nit: { type: "string" },
                    nombre: { type: "string" },
                    direccion: { type: "string" },
                    telefono: { type: "string" },
                    email: { type: "string" }
                },
                required: ["nit", "nombre", "direccion", "telefono", "email"]
            },
            Producto: {
                type: "object",
                properties: {
                    codigo: { type: "integer" },
                    nombre: { type: "string" },
                    precio: { type: "integer" },
                    iva: { type: "string", enum: ["0%", "5%", "19%"] },
                    precioIva: { type: "integer" }
                },
                required: ["codigo", "nombre", "precio", "iva", "precioIva"]
            },
            ListMeta: {
                type: "object",
                properties: {
                    page: { type: "integer", example: 1 },
                    pageSize: { type: "integer", example: 20 },
                    total: { type: "integer", example: 3 },
                    totalPages: { type: "integer", example: 1 }
                },
                required: ["page", "pageSize", "total", "totalPages"]
            }
        }
    },
    paths: {
        "/api/health": {
            get: {
                tags: ["Health"],
                summary: "Estado del servicio",
                responses: {
                    "200": {
                        description: "Servicio disponible"
                    }
                }
            }
        },
        "/api/auth/login": {
            post: {
                tags: ["Auth"],
                summary: "Login con JWT",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/LoginRequest" }
                        }
                    }
                },
                responses: {
                    "200": {
                        description: "Login exitoso",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/LoginResponse" }
                            }
                        }
                    },
                    "401": {
                        description: "Credenciales invalidas",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" }
                            }
                        }
                    }
                }
            }
        },
        "/api/perfil": {
            get: {
                tags: ["Perfil"],
                summary: "Obtener perfil",
                security: [{ bearerAuth: [] }],
                responses: {
                    "200": {
                        description: "Perfil del usuario autenticado",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        data: { $ref: "#/components/schemas/Perfil" }
                                    },
                                    required: ["data"]
                                }
                            }
                        }
                    },
                    "401": {
                        description: "No autenticado",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" }
                            }
                        }
                    }
                }
            }
        },
        "/api/perfil/personal": {
            patch: {
                tags: ["Perfil"],
                summary: "Actualizar informacion personal",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/PerfilPersonalPatch" }
                        }
                    }
                },
                responses: {
                    "200": {
                        description: "Perfil actualizado",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        data: { $ref: "#/components/schemas/Perfil" }
                                    }
                                }
                            }
                        }
                    },
                    "422": {
                        description: "Validacion fallida",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" }
                            }
                        }
                    }
                }
            }
        },
        "/api/perfil/negocio": {
            patch: {
                tags: ["Perfil"],
                summary: "Actualizar informacion de negocio",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/PerfilNegocioPatch" }
                        }
                    }
                },
                responses: {
                    "200": {
                        description: "Perfil actualizado",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        data: { $ref: "#/components/schemas/Perfil" }
                                    }
                                }
                            }
                        }
                    },
                    "422": {
                        description: "Validacion fallida",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" }
                            }
                        }
                    }
                }
            }
        },
        "/api/perfil/foto": {
            post: {
                tags: ["Perfil"],
                summary: "Subir foto de perfil",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "multipart/form-data": {
                            schema: {
                                type: "object",
                                properties: {
                                    foto: { type: "string", format: "binary" }
                                },
                                required: ["foto"]
                            }
                        }
                    }
                },
                responses: {
                    "200": {
                        description: "Foto actualizada",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        data: { $ref: "#/components/schemas/Perfil" }
                                    }
                                }
                            }
                        }
                    },
                    "413": {
                        description: "Archivo demasiado grande",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" }
                            }
                        }
                    },
                    "415": {
                        description: "Formato no permitido",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" }
                            }
                        }
                    }
                }
            }
        },
        "/api/clientes": {
            get: {
                tags: ["Clientes"],
                summary: "Listar clientes",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { in: "query", name: "page", schema: { type: "integer", default: 1 } },
                    { in: "query", name: "pageSize", schema: { type: "integer", default: 20 } },
                    { in: "query", name: "q", schema: { type: "string" } }
                ],
                responses: {
                    "200": {
                        description: "Listado paginado",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        data: {
                                            type: "array",
                                            items: { $ref: "#/components/schemas/Cliente" }
                                        },
                                        meta: { $ref: "#/components/schemas/ListMeta" }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                tags: ["Clientes"],
                summary: "Crear cliente",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/Cliente" }
                        }
                    }
                },
                responses: {
                    "201": {
                        description: "Cliente creado"
                    },
                    "409": {
                        description: "Conflicto por clave unica",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" }
                            }
                        }
                    }
                }
            }
        },
        "/api/clientes/{cedula}": {
            patch: {
                tags: ["Clientes"],
                summary: "Actualizar cliente",
                security: [{ bearerAuth: [] }],
                parameters: [{ in: "path", name: "cedula", required: true, schema: { type: "string" } }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    nombre: { type: "string" },
                                    telefono: { type: "string" },
                                    correo: { type: "string" },
                                    direccion: { type: "string" }
                                }
                            }
                        }
                    }
                },
                responses: {
                    "200": { description: "Cliente actualizado" },
                    "404": {
                        description: "Cliente no encontrado",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" }
                            }
                        }
                    }
                }
            },
            delete: {
                tags: ["Clientes"],
                summary: "Borrado logico de cliente",
                security: [{ bearerAuth: [] }],
                parameters: [{ in: "path", name: "cedula", required: true, schema: { type: "string" } }],
                responses: {
                    "200": { description: "Cliente eliminado logicamente" },
                    "404": {
                        description: "Cliente no encontrado",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" }
                            }
                        }
                    }
                }
            }
        },
        "/api/proveedores": {
            get: {
                tags: ["Proveedores"],
                summary: "Listar proveedores",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { in: "query", name: "page", schema: { type: "integer", default: 1 } },
                    { in: "query", name: "pageSize", schema: { type: "integer", default: 20 } },
                    { in: "query", name: "q", schema: { type: "string" } }
                ],
                responses: {
                    "200": {
                        description: "Listado paginado",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        data: {
                                            type: "array",
                                            items: { $ref: "#/components/schemas/Proveedor" }
                                        },
                                        meta: { $ref: "#/components/schemas/ListMeta" }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                tags: ["Proveedores"],
                summary: "Crear proveedor",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/Proveedor" }
                        }
                    }
                },
                responses: {
                    "201": { description: "Proveedor creado" },
                    "409": {
                        description: "Conflicto por clave unica",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" }
                            }
                        }
                    }
                }
            }
        },
        "/api/proveedores/{nit}": {
            patch: {
                tags: ["Proveedores"],
                summary: "Actualizar proveedor",
                security: [{ bearerAuth: [] }],
                parameters: [{ in: "path", name: "nit", required: true, schema: { type: "string" } }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    nombre: { type: "string" },
                                    direccion: { type: "string" },
                                    telefono: { type: "string" },
                                    email: { type: "string" }
                                }
                            }
                        }
                    }
                },
                responses: {
                    "200": { description: "Proveedor actualizado" },
                    "404": {
                        description: "Proveedor no encontrado",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" }
                            }
                        }
                    }
                }
            },
            delete: {
                tags: ["Proveedores"],
                summary: "Borrado logico de proveedor",
                security: [{ bearerAuth: [] }],
                parameters: [{ in: "path", name: "nit", required: true, schema: { type: "string" } }],
                responses: {
                    "200": { description: "Proveedor eliminado logicamente" },
                    "404": {
                        description: "Proveedor no encontrado",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" }
                            }
                        }
                    }
                }
            }
        },
        "/api/productos": {
            get: {
                tags: ["Productos"],
                summary: "Listar productos",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { in: "query", name: "page", schema: { type: "integer", default: 1 } },
                    { in: "query", name: "pageSize", schema: { type: "integer", default: 20 } },
                    { in: "query", name: "q", schema: { type: "string" } }
                ],
                responses: {
                    "200": {
                        description: "Listado paginado",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        data: {
                                            type: "array",
                                            items: { $ref: "#/components/schemas/Producto" }
                                        },
                                        meta: { $ref: "#/components/schemas/ListMeta" }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                tags: ["Productos"],
                summary: "Crear producto",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    codigo: { type: "integer" },
                                    nombre: { type: "string" },
                                    precio: { type: "integer" },
                                    iva: { type: "string", enum: ["0%", "5%", "19%"] }
                                },
                                required: ["codigo", "nombre", "precio", "iva"]
                            }
                        }
                    }
                },
                responses: {
                    "201": { description: "Producto creado" },
                    "409": {
                        description: "Conflicto por clave unica",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" }
                            }
                        }
                    }
                }
            }
        },
        "/api/productos/{codigo}": {
            patch: {
                tags: ["Productos"],
                summary: "Actualizar producto",
                security: [{ bearerAuth: [] }],
                parameters: [{ in: "path", name: "codigo", required: true, schema: { type: "integer" } }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    nombre: { type: "string" },
                                    precio: { type: "integer" },
                                    iva: { type: "string", enum: ["0%", "5%", "19%"] }
                                }
                            }
                        }
                    }
                },
                responses: {
                    "200": { description: "Producto actualizado" },
                    "404": {
                        description: "Producto no encontrado",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" }
                            }
                        }
                    }
                }
            },
            delete: {
                tags: ["Productos"],
                summary: "Borrado logico de producto",
                security: [{ bearerAuth: [] }],
                parameters: [{ in: "path", name: "codigo", required: true, schema: { type: "integer" } }],
                responses: {
                    "200": { description: "Producto eliminado logicamente" },
                    "404": {
                        description: "Producto no encontrado",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" }
                            }
                        }
                    }
                }
            }
        }
    }
};

module.exports = openApiDocument;
