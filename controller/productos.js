const IVA_RATES = Object.freeze({
    "0%": 0,
    "5%": 0.05,
    "19%": 0.19
});

const INITIAL_PRODUCTS = Object.freeze([
    { codigo: 1, nombre: "Coca Cola", precio: 2100, iva: "19%" },
    { codigo: 2, nombre: "Papas Margarita", precio: 1500, iva: "0%" },
    { codigo: 3, nombre: "Arroz Diana", precio: 3200, iva: "19%" }
]);

function calcularPrecioIva(precio, iva) {
    const rate = IVA_RATES[iva] ?? 0;
    return Math.round(precio * (1 + rate));
}

function normalizarProducto(producto) {
    const precio = Number(producto.precio) || 0;
    const iva = typeof producto.iva === "string" ? producto.iva : "0%";

    return {
        codigo: Number(producto.codigo),
        nombre: String(producto.nombre || ""),
        precio,
        iva,
        precioIva: Number(producto.precioIva) || calcularPrecioIva(precio, iva)
    };
}

export class ProductosModel {
    constructor(seedProducts = INITIAL_PRODUCTS) {
        this.productos = seedProducts.map(normalizarProducto);
    }

    obtenerTodos() {
        return this.productos.map((producto) => ({ ...producto }));
    }

    obtenerPorCodigo(codigo) {
        return this.productos.find((producto) => producto.codigo === codigo) || null;
    }

    eliminarPorCodigo(codigo) {
        const index = this.productos.findIndex((producto) => producto.codigo === codigo);
        if (index < 0) {
            return false;
        }

        this.productos.splice(index, 1);
        return true;
    }
}

export class ProductosView {
    constructor(doc = document) {
        this.doc = doc;
        this.btnNuevo = this.doc.getElementById("btn-nuevo-producto");
        this.tbody = this.doc.querySelector("#tabla-productos tbody");
        this.currencyFormatter = new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0
        });
    }

    disponible() {
        return Boolean(this.tbody);
    }

    bindNuevoProducto(handler) {
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

            const row = button.closest("tr[data-codigo]");
            if (!row) {
                return;
            }

            const codigo = Number(row.dataset.codigo);

            if (button.dataset.action === "editar") {
                onEditar(codigo);
                return;
            }

            if (button.dataset.action === "eliminar") {
                onEliminar(codigo);
            }
        });
    }

    render(productos) {
        if (!this.tbody) {
            return;
        }

        if (!productos.length) {
            const row = this.doc.createElement("tr");
            const cell = this.doc.createElement("td");
            cell.colSpan = 7;
            cell.textContent = "No hay productos cargados.";
            row.appendChild(cell);
            this.tbody.replaceChildren(row);
            return;
        }

        const fragment = this.doc.createDocumentFragment();
        productos.forEach((producto) => {
            fragment.appendChild(this.crearFila(producto));
        });

        this.tbody.replaceChildren(fragment);
    }

    crearFila(producto) {
        const row = this.doc.createElement("tr");
        row.dataset.codigo = String(producto.codigo);

        row.appendChild(this.crearCelda(producto.codigo));
        row.appendChild(this.crearCelda(producto.nombre));
        row.appendChild(this.crearCelda(this.currencyFormatter.format(producto.precio)));
        row.appendChild(this.crearCelda(producto.iva));
        row.appendChild(this.crearCelda(this.currencyFormatter.format(producto.precioIva)));
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

export class ProductosController {
    constructor({ model, view }) {
        this.model = model;
        this.view = view;

        this.handleNuevoProducto = this.handleNuevoProducto.bind(this);
        this.handleEditarProducto = this.handleEditarProducto.bind(this);
        this.handleEliminarProducto = this.handleEliminarProducto.bind(this);
    }

    init() {
        if (!this.view.disponible()) {
            return;
        }

        console.log("Iniciando modulo de Productos...");
        this.view.bindNuevoProducto(this.handleNuevoProducto);
        this.view.bindAccionesTabla({
            onEditar: this.handleEditarProducto,
            onEliminar: this.handleEliminarProducto
        });
        this.render();
    }

    render() {
        this.view.render(this.model.obtenerTodos());
    }

    handleNuevoProducto() {
        alert("Flujo de creacion pendiente de backend.");
    }

    handleEditarProducto(codigo) {
        const producto = this.model.obtenerPorCodigo(codigo);
        if (!producto) {
            return;
        }

        alert(`Edicion pendiente de backend para: ${producto.nombre}`);
    }

    handleEliminarProducto(codigo) {
        const producto = this.model.obtenerPorCodigo(codigo);
        if (!producto) {
            return;
        }

        const confirmar = confirm(`Deseas eliminar \"${producto.nombre}\"?`);
        if (!confirmar) {
            return;
        }

        this.model.eliminarPorCodigo(codigo);
        this.render();
    }
}

export function init() {
    const model = new ProductosModel();
    const view = new ProductosView();
    const controller = new ProductosController({ model, view });
    controller.init();
}
