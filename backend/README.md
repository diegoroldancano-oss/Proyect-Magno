# Nabook Backend (v1)

Backend desacoplado para Nabook con:
- Node.js + Express
- PostgreSQL + Prisma
- JWT basico
- OpenAPI (JSON y Swagger UI)
- Subida de foto de perfil en disco local
- Pruebas de integracion (Jest + Supertest)

## 1) Requisitos
- Node.js LTS
- Docker (para PostgreSQL local)

## 2) Configuracion
1. Copia `.env.example` a `.env`.
2. Ajusta `DATABASE_URL` y `JWT_SECRET`.

## 3) Flujo local recomendado
1. Levanta DB:
```bash
docker compose up -d
```
2. Instala dependencias:
```bash
npm install
```
3. Genera cliente Prisma:
```bash
npm run prisma:generate
```
4. Aplica migraciones:
```bash
npm run prisma:migrate
```
5. Carga seed:
```bash
npm run prisma:seed
```
6. Inicia API:
```bash
npm run dev
```

## 4) Endpoints publicos
- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/openapi.json`
- `GET /api/docs`

## 5) Endpoints protegidos con JWT
- `GET /api/perfil`
- `PATCH /api/perfil/personal`
- `PATCH /api/perfil/negocio`
- `POST /api/perfil/foto`
- CRUD completo:
  - `/api/clientes`
  - `/api/proveedores`
  - `/api/productos`

## 6) Formato de respuestas
Exito:
```json
{ "data": {}, "meta": {} }
```

Error:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Mensaje legible",
    "details": []
  }
}
```

## 7) Pruebas
```bash
npm test
```

> Las pruebas de integracion requieren base de datos disponible y migrada.
