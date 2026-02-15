# Nabook

Panel administrativo web (SPA ligera) orientado a la gestión comercial de pequeños negocios: inventario, clientes, proveedores, ventas, facturación y configuración.

## 📌 Estado actual del proyecto

Actualmente el proyecto se encuentra en una fase **funcional de frontend**, con:

- Estructura principal del dashboard terminada (header, navegación lateral y área de contenido dinámico).
- Carga de vistas por secciones usando `hash routing` (ejemplo: `#inicio`, `#productos`, `#clientes`).
- Módulos JavaScript separados por dominio en `controller/`.
- Estilos globales y responsive en `style.css`, incluyendo variables para tema claro/oscuro.
- Datos en memoria para algunos módulos (sin conexión a backend todavía).

## 🧱 Arquitectura y organización

```text
Nabook/
├── index.html            # Shell principal de la aplicación
├── main.js               # Router por hash + carga dinámica de vistas/controladores
├── style.css             # Estilos globales y responsive
├── sections/             # Vistas HTML por módulo
│   ├── inicio.html
│   ├── productos.html
│   ├── clientes.html
│   ├── proveedores.html
│   ├── ventas.html
│   ├── facturacion.html
│   ├── perfil.html
│   └── configuracion.html
├── controller/           # Lógica JS por módulo
│   ├── productos.js
│   ├── clientes.js
│   └── proveedores.js
├── img/                  # Recursos gráficos
└── fonts/                # Tipografías locales
```

### Patrón aplicado

En los módulos de `productos`, `clientes` y `proveedores` se usa una separación tipo **MVC simple**:

- **Model**: administra colecciones en memoria y operaciones básicas (listar, buscar, eliminar).
- **View**: renderiza tablas y escucha eventos de UI.
- **Controller**: conecta modelo y vista, y coordina acciones del usuario.

## ✅ Funcionalidades implementadas

### Navegación dinámica

- Carga de contenido según `window.location.hash`.
- Carga de vistas desde `sections/*.html`.
- Importación dinámica de controladores desde `controller/*.js`.
- Caché en memoria de vistas ya cargadas para evitar `fetch` repetidos.

### Módulo de productos

- Render de tabla de productos.
- Formateo de moneda (COP).
- Cálculo de precio con IVA.
- Acciones de editar/eliminar (flujo visual, sin persistencia backend).

### Módulo de clientes

- Render de listado de clientes.
- Acciones de nuevo cliente, editar y eliminar.
- Eliminación con confirmación y actualización de tabla.

### Módulo de proveedores

- Render de listado de proveedores.
- Acciones de nuevo proveedor, editar y eliminar.
- Eliminación con confirmación y actualización de tabla.

### UI/UX y estilos

- Diseño responsive para escritorio, tablet y móvil.
- Sistema de variables CSS para colores, bordes y sombras.
- Estructura visual de dashboard empresarial.

## 🚧 Próximos pasos sugeridos

- Integrar API/backend para persistencia real de datos.
- Implementar formularios de creación/edición completos.
- Añadir validaciones de negocio y mensajes de error/éxito.
- Incorporar autenticación y manejo de roles.
- Agregar pruebas automatizadas (unitarias y de integración).
- Definir pipeline de CI/CD.

## 📝 Resumen de lo realizado hasta el momento

- Se construyó una base sólida del dashboard administrativo.
- Se modularizó la lógica por áreas de negocio.
- Se habilitó navegación SPA por secciones con carga dinámica.
- Se dejaron listos flujos de interacción (CRUD parcial en frontend) para conectarse posteriormente al backend.

---

Si quieres, en el siguiente paso también puedo preparar un **CHANGELOG.md** y una **hoja de ruta (ROADMAP.md)** para ordenar entregables por versiones.
