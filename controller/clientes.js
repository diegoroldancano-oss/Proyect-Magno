const INITIAL_CLIENTES = Object.freeze([
    {
        cedula: "1234567890",
        nombre: "Juan Perez",
        telefono: "0987654321",
        correo: "juan.perez@example.com",
        direccion: "Av. Siempre Viva 123"
    },
    {
        cedula: "1098765432",
        nombre: "Ana Gomez",
        telefono: "3201234567",
        correo: "ana.gomez@example.com",
        direccion: "Calle 45 #12-30"
    },
    {
        cedula: "1002003004",
        nombre: "Carlos Ruiz",
        telefono: "3159876543",
        correo: "carlos.ruiz@example.com",
        direccion: "Cra 10 #8-20"
    }
]);

function normalizarCliente(cliente) {
    return {
        cedula: String(cliente.cedula || ""),
        nombre: String(cliente.nombre || ""),
        telefono: String(cliente.telefono || ""),
        correo: String(cliente.correo || ""),
        direccion: String(cliente.direccion || "")
    };
}

export class ClientesModel {
    constructor(seed = INITIAL_CLIENTES) {
        this.clientes = seed.map(normalizarCliente);
    }

    obtenerTodos() {
        return this.clientes.map((cliente) => ({ ...cliente }));
    }

    obtenerPorCedula(cedula) {
        return this.clientes.find((cliente) => cliente.cedula === String(cedula)) || null;
    }

    eliminarPorCedula(cedula) {
        const cedulaStr = String(cedula);
        const index = this.clientes.findIndex((cliente) => cliente.cedula === cedulaStr);

        if (index < 0) {
            return false;
        }

        this.clientes.splice(index, 1);
        return true;
    }
}

export class ClientesView {
    constructor(doc = document) {
        this.doc = doc;
        this.btnNuevo = this.doc.getElementById("btn-cliente");
        this.tbody = this.doc.querySelector("#tbodyClientes tbody");
    }

    disponible() {
        return Boolean(this.tbody);
    }

    bindNuevoCliente(handler) {
        if (!this.btnNuevo) {
            return;
        }

        this.btnNuevo.addEventListener("click", handler);
    }

    bindAccionesTabla({ onEditar, onEliminar }) {
        if (!this.tbody) {
            return;
        }

        this.tbody.addEventListener("click", (event) => {
            const button = event.target.closest("button[data-action]");
            if (!button) {
                return;
            }

            const row = button.closest("tr[data-cedula]");
            if (!row) {
                return;
            }

            const cedula = row.dataset.cedula;

            if (button.dataset.action === "editar") {
                onEditar(cedula);
                return;
            }

            if (button.dataset.action === "eliminar") {
                onEliminar(cedula);
            }
        });
    }

    render(clientes) {
        if (!this.tbody) {
            return;
        }

        if (!clientes.length) {
            const row = this.doc.createElement("tr");
            const cell = this.doc.createElement("td");
            cell.colSpan = 7;
            cell.textContent = "No hay clientes cargados.";
            row.appendChild(cell);
            this.tbody.replaceChildren(row);
            return;
        }

        const fragment = this.doc.createDocumentFragment();
        clientes.forEach((cliente) => {
            fragment.appendChild(this.crearFila(cliente));
        });

        this.tbody.replaceChildren(fragment);
    }

    crearFila(cliente) {
        const row = this.doc.createElement("tr");
        row.dataset.cedula = cliente.cedula;

        row.appendChild(this.crearCelda(cliente.cedula));
        row.appendChild(this.crearCelda(cliente.nombre));
        row.appendChild(this.crearCelda(cliente.telefono));
        row.appendChild(this.crearCelda(cliente.correo));
        row.appendChild(this.crearCelda(cliente.direccion));
        row.appendChild(this.crearCeldaBoton("Editar", "btn-editar", "editar"));
        row.appendChild(this.crearCeldaBoton("Eliminar", "btn-eliminar", "eliminar"));

        return row;
    }

    crearCelda(valor) {
        const cell = this.doc.createElement("td");
        cell.textContent = String(valor);
        return cell;
    }

    crearCeldaBoton(label, className, action) {
        const cell = this.doc.createElement("td");
        const button = this.doc.createElement("button");
        button.type = "button";
        button.className = className;
        button.dataset.action = action;
        button.textContent = label;
        cell.appendChild(button);
        return cell;
    }
}

export class ClientesController {
    constructor({ model, view }) {
        this.model = model;
        this.view = view;

        this.handleNuevoCliente = this.handleNuevoCliente.bind(this);
        this.handleEditarCliente = this.handleEditarCliente.bind(this);
        this.handleEliminarCliente = this.handleEliminarCliente.bind(this);
    }

    init() {
        if (!this.view.disponible()) {
            return;
        }

        console.log("Iniciando modulo de Clientes...");
        this.view.bindNuevoCliente(this.handleNuevoCliente);
        this.view.bindAccionesTabla({
            onEditar: this.handleEditarCliente,
            onEliminar: this.handleEliminarCliente
        });
        this.render();
    }

    render() {
        this.view.render(this.model.obtenerTodos());
    }

    handleNuevoCliente() {
        alert("Flujo de creacion de cliente pendiente de backend.");
    }

    handleEditarCliente(cedula) {
        const cliente = this.model.obtenerPorCedula(cedula);
        if (!cliente) {
            return;
        }

        alert(`Edicion pendiente de backend para: ${cliente.nombre}`);
    }

    handleEliminarCliente(cedula) {
        const cliente = this.model.obtenerPorCedula(cedula);
        if (!cliente) {
            return;
        }

        const confirmar = confirm(`Deseas eliminar a \"${cliente.nombre}\"?`);
        if (!confirmar) {
            return;
        }

        this.model.eliminarPorCedula(cedula);
        this.render();
    }
}

export function init() {
    const model = new ClientesModel();
    const view = new ClientesView();
    const controller = new ClientesController({ model, view });
    controller.init();
}
