export function init() {
    const btnNuevoCliente = document.getElementById('btn-cliente');

    if (btnNuevoCliente) {
        btnNuevoCliente.addEventListener('click', () => alert('Agregar nuevo cliente'));
    }

    cargarTablaClientes();
    configurarAccionesTablaClientes();
}

function cargarTablaClientes() {
    const dataClientes = [
        { cedula: '1234567890', nombre: 'Juan Pérez', telefono: '0987654321', correo: 'client@example', direccion: 'Av. Siempre Viva 123' },
        { cedula: '1234567890', nombre: 'Juan Pérez', telefono: '0987654321', correo: 'client@example', direccion: 'Av. Siempre Viva 123' },
        { cedula: '1234567890', nombre: 'Juan Pérez', telefono: '0987654321', correo: 'client@example', direccion: 'Av. Siempre Viva 123' },
        { cedula: '1234567890', nombre: 'Juan Pérez', telefono: '0987654321', correo: 'client@example', direccion: 'Av. Siempre Viva 123' },
        { cedula: '1234567890', nombre: 'Juan Pérez', telefono: '0987654321', correo: 'client@example', direccion: 'Av. Siempre Viva 123' },
        { cedula: '1234567890', nombre: 'Juan Pérez', telefono: '0987654321', correo: 'client@example', direccion: 'Av. Siempre Viva 123' },
        { cedula: '1234567890', nombre: 'Juan Pérez', telefono: '0987654321', correo: 'client@example', direccion: 'Av. Siempre Viva 123' },
        { cedula: '1234567890', nombre: 'Juan Pérez', telefono: '0987654321', correo: 'client@example', direccion: 'Av. Siempre Viva 123' },
        { cedula: '1234567890', nombre: 'Juan Pérez', telefono: '0987654321', correo: 'client@example', direccion: 'Av. Siempre Viva 123' },
        { cedula: '1234567890', nombre: 'Juan Pérez', telefono: '0987654321', correo: 'client@example', direccion: 'Av. Siempre Viva 123' },
        { cedula: '1234567890', nombre: 'Juan Pérez', telefono: '0987654321', correo: 'client@example', direccion: 'Av. Siempre Viva 123' },
    ];

    const tbody = document.querySelector('#tbodyClientes tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    dataClientes.forEach((cliente) => {
        const fila = `
            <tr>
                <td>${cliente.cedula}</td>
                <td>${cliente.nombre}</td>
                <td>${cliente.telefono}</td>
                <td>${cliente.correo}</td>
                <td>${cliente.direccion}</td>
                <td>
                    <button type="button" class="btn-editar" aria-label="Editar cliente ${cliente.nombre}" title="Editar cliente">&#9998;</button>
                </td>
                <td>
                    <button type="button" class="btn-eliminar" aria-label="Eliminar cliente ${cliente.nombre}" title="Eliminar cliente">&#128465;</button>
                </td>
            </tr>
        `;

        tbody.innerHTML += fila;
    });
}

function configurarAccionesTablaClientes() {
    const tabla = document.getElementById('tbodyClientes');
    if (!tabla || tabla.dataset.actionsBound === 'true') return;

    tabla.addEventListener('click', (event) => {
        const boton = event.target.closest('button');
        if (!boton) return;

        const fila = boton.closest('tr');
        const nombreCliente = fila?.children?.[1]?.textContent?.trim() || '';

        if (boton.classList.contains('btn-editar')) {
            alert(`Editar cliente: ${nombreCliente}`);
        }

        if (boton.classList.contains('btn-eliminar')) {
            alert(`Eliminar cliente: ${nombreCliente}`);
        }
    });

    tabla.dataset.actionsBound = 'true';
}
