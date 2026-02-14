# Baseline - Etapa 1 (Diagnostico Inicial)

Fecha: 2026-02-14
Scope: SPA HTML/CSS/JS (`index.html`, `style.css`, `main.js`, `sections/*`, `controller/*`)
Objetivo de esta tarea: documentar estado inicial de accesibilidad y responsive sin cambiar UI.

## Baseline

| Pantalla / Componente | Lighthouse A11y | Principales issues | Prioridad |
|---|---:|---|---|
| Global (header + sidebar + contenedor SPA) | Pendiente de medicion | No hay "skip link"; enlaces de icono sin nombre accesible explicito; foco no definido de forma consistente | Critico |
| Navegacion lateral (rutas hash) | Pendiente de medicion | Orden de tab largo sin atajo a contenido; estado activo de seccion no expuesto de forma accesible | Medio |
| `#inicio` (`sections/inicio.html`) | Pendiente de medicion | Tarjetas y grafica solo visuales; falta texto alternativo/resumen para datos de grafica | Medio |
| `#productos` (`sections/productos.html`, `controller/productos.js`) | Pendiente de medicion | Tabla ancha fija (`77rem`) con riesgo de overflow; botones editar/eliminar con icono/emoji sin etiqueta accesible | Critico |
| `#proveedores` (`sections/proveedores.html`, `controller/proveedores.js`) | Pendiente de medicion | Mismo patron de tabla fija; acciones de fila sin nombre accesible | Critico |
| `#clientes` (`sections/clientes.html`, `controller/clientes.js`) | Pendiente de medicion | Mismo patron de tabla fija; dependencia de color en boton "Venta"; acciones por icono sin etiqueta | Critico |
| `#ventas` (`sections/ventas.html`) | Pendiente de medicion | Varios `label` sin `for` y inputs sin `id`; typo `ckass`; acciones de tabla con emoji sin nombre accesible | Critico |
| `#facturacion` (`sections/facturacion.html`) | Pendiente de medicion | Varios `label` sin asociacion explicita; acciones de tabla con icono sin etiqueta; ayuda de formato limitada | Critico |
| `#perfil` (`sections/perfil.html`) | Pendiente de medicion | Formularios mayormente correctos; falta validar jerarquia de foco y textos de accion secundarios | Bajo |
| `#configuracion` (`sections/configuracion.html`) | Pendiente de medicion | Validar foco visible y orden en `details/summary`, checkboxes, radios y selects | Medio |

## Checklist teclado por secciones

Marcar durante la prueba manual (sin mouse):

| Seccion | Tab recorre todos los controles | Enter/Espacio activa | Foco visible siempre | Shift+Tab correcto | Bloqueos detectados |
|---|---|---|---|---|---|
| Global (header + sidebar) | [ ] | [ ] | [ ] | [ ] | [ ] |
| `#inicio` | [ ] | [ ] | [ ] | [ ] | [ ] |
| `#productos` | [ ] | [ ] | [ ] | [ ] | [ ] |
| `#proveedores` | [ ] | [ ] | [ ] | [ ] | [ ] |
| `#clientes` | [ ] | [ ] | [ ] | [ ] | [ ] |
| `#ventas` | [ ] | [ ] | [ ] | [ ] | [ ] |
| `#facturacion` | [ ] | [ ] | [ ] | [ ] | [ ] |
| `#perfil` | [ ] | [ ] | [ ] | [ ] | [ ] |
| `#configuracion` | [ ] | [ ] | [ ] | [ ] | [ ] |

## Como correr Lighthouse (exacto)

Importante: correr sobre servidor local (`http://localhost`), no con `file://`.

### Opcion A: Chrome DevTools

1. Desde la raiz del proyecto, levanta servidor:
   - `npx serve .`
   - alternativa: `python -m http.server 5500`
2. Abre en Chrome: `http://localhost:5500`.
3. Repite auditoria por cada ruta:
   - `http://localhost:5500/#inicio`
   - `http://localhost:5500/#productos`
   - `http://localhost:5500/#proveedores`
   - `http://localhost:5500/#clientes`
   - `http://localhost:5500/#ventas`
   - `http://localhost:5500/#facturacion`
   - `http://localhost:5500/#perfil`
   - `http://localhost:5500/#configuracion`
4. En DevTools: `Lighthouse` -> seleccionar solo `Accessibility` -> `Analyze page load`.
5. Ejecutar dos pasadas por ruta:
   - Emulacion mobile
   - Desktop
6. Registrar el score en la tabla Baseline.

### Opcion B: Lighthouse CLI

1. Con servidor activo en `http://localhost:5500`, ejecutar por ruta:
   - `lighthouse "http://localhost:5500/#inicio" --only-categories=accessibility --output=html --output-path="./docs/lh-inicio-a11y.html"`
2. Repetir comando para cada hash cambiando URL y archivo de salida.
3. Copiar score y hallazgos principales al bloque Baseline.

## Como probar teclado (exacto)

Probar cada ruta hash en anchos `320`, `768`, `1024`, `1440` px.

1. Entrar a la ruta y no usar mouse.
2. Presionar `Tab` desde el inicio de la pagina hasta el ultimo control.
3. Verificar en cada paso:
   - foco visible;
   - orden logico (header -> sidebar -> contenido);
   - sin saltos inesperados.
4. En cada elemento interactivo validar:
   - `Enter` activa enlaces/botones;
   - `Espacio` activa botones/checkbox/radio;
   - `Shift+Tab` regresa correctamente.
5. En formularios validar que todos los campos y botones submit sean alcanzables por teclado.
6. En `details/summary` (configuracion), validar expandir/colapsar con `Enter` y `Espacio`.
7. Marcar checklist por seccion y clasificar bloqueos:
   - Critico: impide completar flujo.
   - Medio: flujo posible con friccion alta.
   - Bajo: mejora deseable sin bloqueo.

## Nota de estado

- Esta Tarea 1 documenta baseline inicial.
- No se realizaron cambios de UI ni ajustes de CSS/JS en este paso.


## Prioridad de ejecución (orden sugerido)

1. Skip link + landmarks globales
2. Corrección de tablas con ancho fijo
3. Labels e inputs sin asociación
4. Botones icon-only sin nombre accesible
5. Foco visible global
