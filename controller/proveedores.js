const INITIAL_PROVEEDORES = Object.freeze([
    {
        nit: "900100001",
        nombre: "SuperOriente",
        direccion: "Calle 123",
        telefono: "123456789",
        email: "superoriente@example.com"
    },
    {
        nit: "900100002",
        nombre: "SuperOccidente",
        direccion: "Avenida 456",
        telefono: "987654321",
        email: "superoccidente@example.com"
    },
    {
        nit: "900100003",
        nombre: "Alimentos Central",
        direccion: "Carrera 78",
        telefono: "321654987",
        email: "central@example.com"
    }
]);

function normalizarProveedor(proveedor) {
    return {
        nit: String(proveedor.nit || ""),
        nombre: String(proveedor.nombre || ""),
        direccion: String(proveedor.direccion || ""),
        telefono: String(proveedor.telefono || ""),
        email: String(proveedor.email || "")
    };
}

export class ProveedoresModel {
    constructor(seed = INITIAL_PROVEEDORES) {
        this.proveedores = seed.map(normalizarProveedor);
    }

    obtenerTodos() {
        return this.proveedores.map((proveedor) => ({ ...proveedor }));
    }

    obtenerPorNit(nit) {
        return this.proveedores.find((proveedor) => proveedor.nit === String(nit)) || null;
    }

    eliminarPorNit(nit) {
        const nitStr = String(nit);
        const index = this.proveedores.findIndex((proveedor) => proveedor.nit === nitStr);

        if (index < 0) {
            return false;
        }

        this.proveedores.splice(index, 1);
        return true;
    }
}

export class ProveedoresView {
    constructor(doc = document) {
        this.doc = doc;
        this.btnNuevo = this.doc.getElementById("btn-Proveedores");
        this.tbody = this.doc.querySelector("#tbodyProveedores tbody");
    }

    disponible() {
        return Boolean(this.tbody);
    }

    bindNuevoProveedor(handler) {
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

            const row = button.closest("tr[data-nit]");
            if (!row) {
                return;
            }

            const nit = row.dataset.nit;

            if (button.dataset.action === "editar") {
                onEditar(nit);
                return;
            }

            if (button.dataset.action === "eliminar") {
                onEliminar(nit);
            }
        });
    }

    render(proveedores) {
        if (!this.tbody) {
            return;
        }

        if (!proveedores.length) {
            const row = this.doc.createElement("tr");
            const cell = this.doc.createElement("td");
            cell.colSpan = 7;
            cell.textContent = "No hay proveedores cargados.";
            row.appendChild(cell);
            this.tbody.replaceChildren(row);
            return;
        }

        const fragment = this.doc.createDocumentFragment();
        proveedores.forEach((proveedor) => {
            fragment.appendChild(this.crearFila(proveedor));
        });

        this.tbody.replaceChildren(fragment);
    }

    crearFila(proveedor) {
        const row = this.doc.createElement("tr");
        row.dataset.nit = proveedor.nit;

        row.appendChild(this.crearCelda(proveedor.nit));
        row.appendChild(this.crearCelda(proveedor.nombre));
        row.appendChild(this.crearCelda(proveedor.direccion));
        row.appendChild(this.crearCelda(proveedor.telefono));
        row.appendChild(this.crearCelda(proveedor.email));
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

export class ProveedoresController {
    constructor({ model, view }) {
        this.model = model;
        this.view = view;

        this.handleNuevoProveedor = this.handleNuevoProveedor.bind(this);
        this.handleEditarProveedor = this.handleEditarProveedor.bind(this);
        this.handleEliminarProveedor = this.handleEliminarProveedor.bind(this);
    }

    init() {
        if (!this.view.disponible()) {
            return;
        }

        console.log("Iniciando modulo de Proveedores...");
        this.view.bindNuevoProveedor(this.handleNuevoProveedor);
        this.view.bindAccionesTabla({
            onEditar: this.handleEditarProveedor,
            onEliminar: this.handleEliminarProveedor
        });
        this.render();
    }

    render() {
        this.view.render(this.model.obtenerTodos());
    }

    handleNuevoProveedor() {
        alert("Flujo de creacion de proveedor pendiente de backend.");
    }

    handleEditarProveedor(nit) {
        const proveedor = this.model.obtenerPorNit(nit);
        if (!proveedor) {
            return;
        }

        alert(`Edicion pendiente de backend para: ${proveedor.nombre}`);
    }

    handleEliminarProveedor(nit) {
        const proveedor = this.model.obtenerPorNit(nit);
        if (!proveedor) {
            return;
        }

        const confirmar = confirm(`Deseas eliminar a \"${proveedor.nombre}\"?`);
        if (!confirmar) {
            return;
        }

        this.model.eliminarPorNit(nit);
        this.render();
    }
}

export function init() {
    const model = new ProveedoresModel();
    const view = new ProveedoresView();
    const controller = new ProveedoresController({ model, view });
    controller.init();
}
