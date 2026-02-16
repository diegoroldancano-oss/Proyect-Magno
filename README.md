# Nabook / Market D&D

Aplicación web SPA (Single Page Application) para la gestión operativa de un negocio pequeño/mediano: productos, clientes, proveedores, ventas, facturación, perfil y configuración de reportes.

> Estado actual: **frontend funcional sin backend obligatorio**. El módulo de perfil incluye una capa API opcional para integrarse con servicios remotos cuando se define `window.NABOOK_API_BASE_URL`.

---

## 1 Objetivo del proyecto

Este proyecto centraliza tareas frecuentes de operación comercial:

- Control visual de inventario y catálogo de productos.
- Gestión básica de clientes y proveedores.
- Flujo de ventas y facturación (UI preparada).
- Perfil de usuario/negocio con validaciones de formulario, carga de foto y modo oscuro.
- Configuración de reportes y notificaciones (UI de preferencias).

---

## 2 Stack y enfoque técnico

- **HTML5 + CSS3 + JavaScript ES Modules (vanilla)**.
- **Arquitectura SPA por hash-routing** (`#inicio`, `#productos`, etc.).
- **Carga dinámica de vistas y controladores** desde `sections/` y `controller/`.
- **Sin dependencias externas obligatorias** para ejecución local estática.
- **Persistencia principal en memoria** (excepto tema visual en `localStorage`).

---

## 3 Estructura real del proyecto

```text
.
├── index.html
├── main.js
├── style.css
├── fonts.css
├── sections/
│   ├── inicio.html
│   ├── productos.html
│   ├── clientes.html
│   ├── proveedores.html
│   ├── ventas.html
│   ├── facturacion.html
│   ├── perfil.html
│   └── configuracion.html
├── controller/
│   ├── productos.js
│   ├── clientes.js
│   ├── proveedores.js
│   └── perfil.js
├── img/
│   ├── favicon-32x32.png
│   ├── favicon1-32x32.png
│   └── profile-img.jpg
└── fonts/
    └── Roboto-*.ttf
```

---

## 4 Flujo de navegación SPA (`main.js`)

`main.js` implementa el enrutamiento por hash y una caché en memoria de vistas:

1. Lee el hash actual (`window.location.hash.slice(1)`), usando `inicio` por defecto.
2. Busca en `cacheVistas` si ya existe HTML de esa sección.
3. Si no existe, hace `fetch('./sections/${hash}.html')`.
4. Inserta el HTML en `#contenido`.
5. Intenta `import('./controller/${hash}.js')`.
6. Si el módulo exporta `init()`, lo ejecuta.

También escucha:

- `window.load`
- `window.hashchange`

Si no existe controlador para una vista, se registra una nota en consola y la vista sigue funcionando como HTML estático.

---

## 5 Descripción por vista (`sections/`)

### `sections/inicio.html`

Panel de resumen con:

- Indicadores de ventas, compras, facturas pendientes.
- Tarjeta de estadísticas visual (barras).
- Botones de acción rápida (importar / nueva venta).

### `sections/productos.html`

- Encabezado de gestión de productos.
- Botón `#btn-nuevo-producto`.
- Tabla `#tabla-productos` preparada para render dinámico vía JS.

### `sections/clientes.html`

- Acciones rápidas (`Venta` y `Nuevo Cliente`).
- Tabla `#tbodyClientes` con `<caption>` accesible.
- Render dinámico y acciones de editar/eliminar.

### `sections/proveedores.html`

- Botón `#btn-Proveedores` para creación.
- Tabla `#tbodyProveedores` con `aria-live="polite"` en `tbody`.
- Integración con controlador para CRUD visual.

### `sections/ventas.html`

- Formulario de captura de productos en venta (código, nombre, cantidad, precio).
- Tabla de detalle con datos actualmente de ejemplo.
- En esta versión no hay `controller/ventas.js` (módulo UI estático).

### `sections/facturacion.html`

- Formulario de facturación (NIT, número, IVA, costo, cantidad).
- Tabla de productos facturados con datos de muestra.
- En esta versión no hay `controller/facturacion.js`.

### `sections/perfil.html`

- Bloque de perfil con foto y nombre del negocio.
- Botones de **cambiar foto** y **alternar tema oscuro/normal**.
- Formulario de información personal.
- Formulario de información del negocio.
- Contenedores de feedback accesible (`role="status"`, `aria-live`).

### `sections/configuracion.html`

- Configuración de reportes mediante `details/summary`:
  - Tipos de reporte (checkboxes).
  - Frecuencia (radio buttons).
  - Formato de exportación (select).
  - Frecuencia y canales de notificación.
- Vista de configuración actualmente sin controlador JS dedicado.

---

## 6 Controladores (`controller/`)

## `controller/productos.js`

Patrón tipo MVC simple:

- **Model** (`ProductosModel`):
  - seed local (`INITIAL_PRODUCTS`)
  - `obtenerTodos`, `obtenerPorCodigo`, `eliminarPorCodigo`
- **View** (`ProductosView`):
  - Render de tabla
  - Delegación de eventos para editar/eliminar
  - Formateo moneda COP (`Intl.NumberFormat('es-CO')`)
- **Controller** (`ProductosController`):
  - Inicializa módulo
  - Maneja alertas para crear/editar
  - Elimina registro con `confirm()` y re-render

Incluye cálculo de precio con IVA (`0%`, `5%`, `19%`).

### `controller/clientes.js`

Mismo patrón MVC:

- Seed local de clientes.
- Operaciones: listar, buscar por cédula, eliminar.
- Render dinámico de tabla.
- Acciones: nuevo, editar (alert placeholder), eliminar con confirmación.

### `controller/proveedores.js`

Mismo patrón MVC:

- Seed local de proveedores.
- Operaciones: listar, buscar por NIT, eliminar.
- Render dinámico de tabla.
- Acciones: nuevo, editar (placeholder), eliminar con confirmación.

### `controller/perfil.js`

Módulo más completo del proyecto. Incluye:

- **Sanitización y normalización** de entradas (`personal`, `negocio`, `photoUrl`).
- **Validaciones de negocio frontend**:
  - Email
  - Teléfono
  - Fecha
  - Archivo de imagen (tipo y tamaño máximo 5MB)
- **Modelo de estado con base + cambios**:
  - detectar diferencias por sección
  - confirmar/revertir cambios
- **Vista**:
  - serialización de formularios
  - render bidireccional de estado
  - loading states
  - feedback y errores por campo con `setCustomValidity`
- **Tema oscuro**:
  - alterna atributo `data-theme` en `<html>`
  - persiste en `localStorage` (`nabook-theme`)
- **Capa API opcional** (`PerfilApi`):
  - si `window.NABOOK_API_BASE_URL` existe, habilita requests
  - endpoints previstos:
    - `GET /api/perfil`
    - `PATCH /api/perfil/personal`
    - `PATCH /api/perfil/negocio`
    - `POST /api/perfil/foto`
  - manejo de errores HTTP mediante `PerfilApiError`
- **Fallback local sin backend**:
  - si no hay base URL, conserva funcionamiento en modo local.

---

## 7 Estilos y UI

### `style.css`

- Define layout principal del dashboard (header, aside, main content).
- Incluye estilos para:
  - tablas de módulos
  - formularios
  - botones de acción
  - sección de perfil
  - sección de facturación/ventas
  - responsive por breakpoints
- Usa variables CSS para tema claro y oscuro.

### `fonts.css` y `fonts/`

- Declaración de familia Roboto en múltiples pesos/variantes.
- Carga local de tipografías desde `fonts/Roboto-*.ttf`.

---

## 8 Accesibilidad implementada

El proyecto incorpora mejoras accesibles en múltiples componentes:

- Uso extendido de `aria-label`, `aria-labelledby`, `aria-describedby`.
- `role="search"`, `role="group"`, `role="radiogroup"`, `role="status"` según contexto.
- Tabla de clientes con `<caption>` oculto visualmente y semánticamente activo.
- Feedback de formularios con regiones `aria-live`.
- Botón de alternancia de tema con `aria-pressed`.

---

## 9 Estado funcional por módulo

| Módulo | Estado | Persistencia | Controlador |
|---|---|---|---|
| Inicio | Funcional (UI) | No | No |
| Productos | Funcional (CRUD visual parcial) | Memoria | Sí |
| Clientes | Funcional (CRUD visual parcial) | Memoria | Sí |
| Proveedores | Funcional (CRUD visual parcial) | Memoria | Sí |
| Ventas | UI base | No | No |
| Facturación | UI base | No | No |
| Perfil | Funcional avanzado | Memoria + opcional API | Sí |
| Configuración | UI base de preferencias | No | No |

---

## 10 Integración backend (pendiente / opcional)

Actualmente la aplicación puede ejecutarse solo en frontend. Para integrar backend:

1. Definir en runtime `window.NABOOK_API_BASE_URL`.
2. Implementar los endpoints del módulo perfil.
3. Extender endpoints para productos/clientes/proveedores.
4. Sustituir seeds locales por consumo real de API.

---

## 11 Limitaciones conocidas

- No existe autenticación/autorización.
- No hay almacenamiento persistente para productos/clientes/proveedores.
- Las secciones ventas, facturación y configuración están en fase UI.
- No hay suite de pruebas automatizadas integrada.

---

## 12 Siguientes pasos recomendados

1. Implementar backend REST completo para todos los módulos.
2. Agregar validaciones de negocio de servidor y mensajes unificados.
3. Incorporar persistencia real (BD) y auditoría de cambios.
4. Añadir tests unitarios e integración (frontend + API).
5. Definir pipeline CI/CD y versionado de entregas.

---

## 13 Ejecución local

Como es un frontend estático con ES modules, sirve el proyecto desde un servidor HTTP local para evitar restricciones del navegador al cargar módulos (`import`) y archivos HTML dinámicos (`fetch`).

Ejemplo (si ya cuentas con Python en el entorno):

```bash
python -m http.server 5500
```

Luego abrir:

```text
http://localhost:5500
```

> Nota: no se requiere instalación de dependencias del proyecto.
