export function init() {
    const btnNuevoProveedor = document.getElementById('btn-Proveedores');

    if (btnNuevoProveedor) {
        btnNuevoProveedor.addEventListener('click', () => alert('Agregar nuevo proveedor'));
    }

    cargarTablaProveedores();
    configurarAccionesTablaProveedores();
}

function cargarTablaProveedores() {
    const dataProveedores = [
        { nit: 1, nombre: 'SuperOriente', telefono: '123456789', direccion: 'Calle 123', email: 'Superori@example.com' },
        { nit: 2, nombre: 'SuperOccidente', telefono: '987654321', direccion: 'Avenida 456', email: 'nuevoprove@example.com' },
        { nit: 2, nombre: 'SuperOccidente', telefono: '987654321', direccion: 'Avenida 456', email: 'nuevoprove@example.com' },
        { nit: 2, nombre: 'SuperOccidente', telefono: '987654321', direccion: 'Avenida 456', email: 'nuevoprove@example.com' },
        { nit: 2, nombre: 'SuperOccidente', telefono: '987654321', direccion: 'Avenida 456', email: 'nuevoprove@example.com' },
        { nit: 2, nombre: 'SuperOccidente', telefono: '987654321', direccion: 'Avenida 456', email: 'nuevoprove@example.com' },
        { nit: 2, nombre: 'SuperOccidente', telefono: '987654321', direccion: 'Avenida 456', email: 'nuevoprove@example.com' },
        { nit: 2, nombre: 'SuperOccidente', telefono: '987654321', direccion: 'Avenida 456', email: 'nuevoprove@example.com' },
        { nit: 2, nombre: 'SuperOccidente', telefono: '987654321', direccion: 'Avenida 456', email: 'nuevoprove@example.com' },
        { nit: 2, nombre: 'SuperOccidente', telefono: '987654321', direccion: 'Avenida 456', email: 'nuevoprove@example.com' },
    ];

    const tbody = document.querySelector('#tbodyProveedores tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    dataProveedores.forEach((proveedor) => {
        const fila = `
            <tr>
                <td>${proveedor.nit}</td>
                <td>${proveedor.nombre}</td>
                <td>${proveedor.telefono}</td>
                <td>${proveedor.direccion}</td>
                <td>${proveedor.email}</td>
                <td>
                    <button type="button" class="btn-editar" aria-label="Editar proveedor ${proveedor.nombre}" title="Editar proveedor">&#9998;</button>
                </td>
                <td>
                    <button type="button" class="btn-eliminar" aria-label="Eliminar proveedor ${proveedor.nombre}" title="Eliminar proveedor">&#128465;</button>
                </td>
            </tr>
        `;

        tbody.innerHTML += fila;
    });
}

function configurarAccionesTablaProveedores() {
    const tabla = document.getElementById('tbodyProveedores');
    if (!tabla || tabla.dataset.actionsBound === 'true') return;

    tabla.addEventListener('click', (event) => {
        const boton = event.target.closest('button');
        if (!boton) return;

        const fila = boton.closest('tr');
        const nombreProveedor = fila?.children?.[1]?.textContent?.trim() || '';

        if (boton.classList.contains('btn-editar')) {
            alert(`Editar proveedor: ${nombreProveedor}`);
        }

        if (boton.classList.contains('btn-eliminar')) {
            alert(`Eliminar proveedor: ${nombreProveedor}`);
        }
    });

    tabla.dataset.actionsBound = 'true';
}
