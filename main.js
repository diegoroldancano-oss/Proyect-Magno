const cacheVistas = {};

const skipLink = document.querySelector('.skip-link');
const mainContent = document.getElementById('contenido');
const sidebar = document.getElementById('idSidebar');
const sidebarToggleButton = document.getElementById('btn-sidebar-toggle');
const mobileSidebarMedia = window.matchMedia('(max-width: 767px)');

let sidebarOpen = false;

function activarFocoVisibleConsistente() {
    if (document.getElementById('a11y-focus-visible-style')) return;

    const style = document.createElement('style');
    style.id = 'a11y-focus-visible-style';
    style.textContent = `
        a:focus-visible,
        button:focus-visible,
        input:focus-visible,
        select:focus-visible,
        textarea:focus-visible,
        summary:focus-visible,
        [tabindex]:focus-visible {
            outline: 2px solid #2563eb !important;
            outline-offset: 2px !important;
        }
    `;
    document.head.append(style);
}

function getPrimerLinkSidebar() {
    if (!sidebar) return null;
    return sidebar.querySelector('.content__nav a, .content__nav-footer a');
}

function sincronizarEstadoSidebar(nextOpen, options = {}) {
    if (!sidebar || !sidebarToggleButton) return;

    const { moveFocus = false, returnFocus = false } = options;
    const isMobile = mobileSidebarMedia.matches;

    if (!isMobile) {
        sidebarOpen = false;
        document.body.classList.remove('sidebar-open');
        sidebarToggleButton.setAttribute('aria-expanded', 'false');
        sidebarToggleButton.setAttribute('aria-label', 'Abrir menu de navegacion');
        sidebar.removeAttribute('aria-hidden');
        sidebar.removeAttribute('inert');
        return;
    }

    sidebarOpen = nextOpen;
    document.body.classList.toggle('sidebar-open', sidebarOpen);
    sidebarToggleButton.setAttribute('aria-expanded', String(sidebarOpen));
    sidebarToggleButton.setAttribute(
        'aria-label',
        sidebarOpen ? 'Cerrar menu de navegacion' : 'Abrir menu de navegacion'
    );

    if (sidebarOpen) {
        sidebar.removeAttribute('aria-hidden');
        sidebar.removeAttribute('inert');

        if (moveFocus) {
            const primerLink = getPrimerLinkSidebar();
            if (primerLink) primerLink.focus();
        }
    } else {
        sidebar.setAttribute('aria-hidden', 'true');
        sidebar.setAttribute('inert', '');

        if (returnFocus) {
            sidebarToggleButton.focus();
        }
    }
}

function actualizarAriaCurrent(hash) {
    const links = document.querySelectorAll('.content__nav a[href^="#"], .content__nav-footer a[href^="#"]');
    const hashActual = `#${hash}`;

    links.forEach((link) => {
        if (link.getAttribute('href') === hashActual) {
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    });
}

function prepararTogglesAccesibles(hash) {
    if (!mainContent) return;

    const detalles = mainContent.querySelectorAll('details');
    detalles.forEach((detalle, index) => {
        if (!detalle.id) {
            detalle.id = `toggle-${hash}-${index + 1}`;
        }

        const summary = detalle.querySelector('summary');
        if (!summary) return;

        summary.setAttribute('aria-controls', detalle.id);
        summary.setAttribute('aria-expanded', String(detalle.open));

        if (detalle.dataset.a11yBound === 'true') return;
        detalle.addEventListener('toggle', () => {
            summary.setAttribute('aria-expanded', String(detalle.open));
        });
        detalle.dataset.a11yBound = 'true';
    });
}

function prepararBotonesIconoAccesibles(hash) {
    if (!mainContent) return;

    const tablas = mainContent.querySelectorAll('table');
    tablas.forEach((tabla) => {
        const filas = tabla.querySelectorAll('tbody tr');
        filas.forEach((fila) => {
            const celdasIcono = fila.querySelectorAll('td[data-label="icon"]');
            celdasIcono.forEach((celdaIcono) => {
                const boton = celdaIcono.querySelector('button');
                if (!boton) return;

                boton.type = 'button';
                if (boton.hasAttribute('aria-label')) return;

                const indiceCelda = Array.from(fila.children).indexOf(celdaIcono);
                const th = tabla.querySelector(`thead tr th:nth-child(${indiceCelda + 1})`);
                const accion = th?.textContent?.trim() || 'Accion';
                const contexto = hash === 'ventas'
                    ? 'item de venta'
                    : hash === 'facturacion'
                        ? 'item de factura'
                        : 'registro';

                boton.setAttribute('aria-label', `${accion} ${contexto}`);
                boton.setAttribute('title', accion);
            });
        });
    });
}

function enfocarSeccionActiva() {
    if (!mainContent) return;

    const objetivoFoco =
        mainContent.querySelector('[data-focus-start], h2, h1, form, table, section, article') || mainContent;

    if (!objetivoFoco.hasAttribute('tabindex')) {
        objetivoFoco.setAttribute('tabindex', '-1');
    }

    requestAnimationFrame(() => {
        objetivoFoco.focus({ preventScroll: true });
    });
}

function cerrarUltimoDetailsAbierto() {
    if (!mainContent) return false;

    const abiertos = Array.from(mainContent.querySelectorAll('details[open]'));
    if (!abiertos.length) return false;

    const ultimoAbierto = abiertos[abiertos.length - 1];
    ultimoAbierto.open = false;
    const summary = ultimoAbierto.querySelector('summary');
    if (summary) summary.focus();
    return true;
}

if (skipLink && mainContent) {
    skipLink.addEventListener('click', () => {
        mainContent.focus();
    });
}

if (sidebar && sidebarToggleButton) {
    sidebarToggleButton.setAttribute('aria-controls', 'idSidebar');
    sincronizarEstadoSidebar(false);

    sidebarToggleButton.addEventListener('click', () => {
        sincronizarEstadoSidebar(!sidebarOpen, {
            moveFocus: !sidebarOpen,
            returnFocus: sidebarOpen,
        });
    });

    sidebar.addEventListener('click', (event) => {
        const linkMenu = event.target.closest('a[href^="#"]');
        if (!linkMenu || !mobileSidebarMedia.matches) return;
        sincronizarEstadoSidebar(false);
    });

    const handleViewportChange = () => sincronizarEstadoSidebar(false);
    if (mobileSidebarMedia.addEventListener) {
        mobileSidebarMedia.addEventListener('change', handleViewportChange);
    } else if (mobileSidebarMedia.addListener) {
        mobileSidebarMedia.addListener(handleViewportChange);
    }
}

document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;

    if (sidebarOpen && mobileSidebarMedia.matches) {
        event.preventDefault();
        sincronizarEstadoSidebar(false, { returnFocus: true });
        return;
    }

    if (cerrarUltimoDetailsAbierto()) {
        event.preventDefault();
    }
});

async function cargarContenido(options = {}) {
    const { focusOnSectionChange = false } = options;
    const hash = window.location.hash.slice(1) || 'inicio';
    const contentDiv = document.getElementById('contenido');

    if (!contentDiv) return;

    try {
        if (cacheVistas[hash]) {
            contentDiv.innerHTML = cacheVistas[hash];
            console.log(`Recuperado de cache: ${hash}`);
        } else {
            const respuestaHtml = await fetch(`./sections/${hash}.html`);

            if (respuestaHtml.ok) {
                const html = await respuestaHtml.text();
                cacheVistas[hash] = html;
                contentDiv.innerHTML = html;
            } else {
                contentDiv.innerHTML = '<h2>Error 404</h2>';
                return;
            }
        }

        try {
            const modulo = await import(`./controller/${hash}.js`);
            if (modulo.init) modulo.init();
        } catch (errorJs) {
            console.log(`Nota: no se cargo script para ${hash}`);
        }

        actualizarAriaCurrent(hash);
        prepararTogglesAccesibles(hash);
        prepararBotonesIconoAccesibles(hash);

        if (focusOnSectionChange) {
            enfocarSeccionActiva();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

activarFocoVisibleConsistente();

window.addEventListener('load', () => cargarContenido());
window.addEventListener('hashchange', () => cargarContenido({ focusOnSectionChange: true }));
