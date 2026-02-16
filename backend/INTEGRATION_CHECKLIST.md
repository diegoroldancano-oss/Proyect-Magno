# Checklist de Integracion Frontend-Backend

- Definir `window.NABOOK_API_BASE_URL` apuntando al backend (ejemplo: `http://localhost:4000`).
- Ejecutar login y almacenar `accessToken`.
- Enviar `Authorization: Bearer <token>` en los requests protegidos.
- Confirmar que `GET /api/perfil` responde con shape:
  - `data.personal`
  - `data.negocio`
  - `data.photoUrl`
- Confirmar que `PATCH /api/perfil/personal` y `PATCH /api/perfil/negocio` aceptan updates parciales.
- Confirmar que `POST /api/perfil/foto` usa multipart con campo `foto`.
- Reemplazar arrays locales en `clientes`, `proveedores`, `productos` por consumo real de API.
- Consumir listados con paginacion (`page`, `pageSize`) y busqueda (`q`).
- Tratar `409` como error de duplicado de clave activa.
- Tratar `422` como error de validacion de formulario.
- Tratar `401` como sesion invalida/expirada.
- Verificar que `/api/openapi.json` y `/api/docs` sean accesibles.
