export function init() {
    console.log('Iniciando módulo de Productos...');

    const btnNuevo = document.getElementById('btn-nuevo-producto');
    if (btnNuevo) {
        btnNuevo.addEventListener('click', () => alert('Crear producto'));
    }

    cargarTablaProductos();
    configurarAccionesTablaProductos();
}

function cargarTablaProductos() {
    const mockData = [
        { codigo: 1, nombre: 'Coca Cola', precio: 2100, iva: '19%', precioIva: 2600 },
        { codigo: 2, nombre: 'Papas Margarita', precio: 1500, iva: '0%', precioIva: 1500 },
        { codigo: 3, nombre: 'Arroz Diana', precio: 3200, iva: '19%', precioIva: 3800 },
        { codigo: 3, nombre: 'Arroz Diana', precio: 3200, iva: '19%', precioIva: 3800 },
        { codigo: 3, nombre: 'Arroz Diana', precio: 3200, iva: '19%', precioIva: 3800 },
        { codigo: 3, nombre: 'Arroz Diana', precio: 3200, iva: '19%', precioIva: 3800 },
        { codigo: 3, nombre: 'Arroz Diana', precio: 3200, iva: '19%', precioIva: 3800 },
        { codigo: 3, nombre: 'Arroz Diana', precio: 3200, iva: '19%', precioIva: 3800 },
        { codigo: 3, nombre: 'Arroz Diana', precio: 3200, iva: '19%', precioIva: 3800 },
    ];

    const tbody = document.querySelector('#tabla-productos tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    mockData.forEach((producto) => {
        const fila = `
            <tr>
                <td>${producto.codigo}</td>
                <td>${producto.nombre}</td>
                <td>$${producto.precio}</td>
                <td>${producto.iva}</td>
                <td>$${producto.precioIva}</td>
                <td>
                    <button type="button" class="btn-editar" aria-label="Editar producto ${producto.nombre}" title="Editar producto">&#9998;</button>
                </td>
                <td>
                    <button type="button" class="btn-eliminar" aria-label="Eliminar producto ${producto.nombre}" title="Eliminar producto">&#128465;</button>
                </td>
            </tr>
        `;

        tbody.innerHTML += fila;
    });
}

function configurarAccionesTablaProductos() {
    const tabla = document.getElementById('tabla-productos');
    if (!tabla || tabla.dataset.actionsBound === 'true') return;

    tabla.addEventListener('click', (event) => {
        const boton = event.target.closest('button');
        if (!boton) return;

        const fila = boton.closest('tr');
        const nombreProducto = fila?.children?.[1]?.textContent?.trim() || '';

        if (boton.classList.contains('btn-editar')) {
            alert(`Editar producto: ${nombreProducto}`);
        }

        if (boton.classList.contains('btn-eliminar')) {
            alert(`Eliminar producto: ${nombreProducto}`);
        }
    });

    tabla.dataset.actionsBound = 'true';
}
