const PERSONAL_FIELDS = Object.freeze(["nombre", "telefono", "email", "direccion"]);
const BUSINESS_FIELDS = Object.freeze([
    "nombre-negocio",
    "tipo-negocio",
    "ubicacion-negocio",
    "fecha-creacion"
]);

const THEME_STORAGE_KEY = "nabook-theme";
const DARK_THEME = "dark";
const DEFAULT_PHOTO_URL = "img/profile-img.jpg";
const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = Object.freeze(["image/png", "image/jpeg", "image/webp"]);

function sanitizeText(value, maxLength) {
    return String(value ?? "").trim().slice(0, maxLength);
}

function sanitizeDate(value) {
    const normalized = String(value ?? "").trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : "";
}

function normalizePersonal(payload = {}) {
    return {
        nombre: sanitizeText(payload.nombre, 80),
        telefono: sanitizeText(payload.telefono, 20),
        email: sanitizeText(payload.email, 120),
        direccion: sanitizeText(payload.direccion, 120)
    };
}

function normalizeBusiness(payload = {}) {
    return {
        "nombre-negocio": sanitizeText(payload["nombre-negocio"], 100),
        "tipo-negocio": sanitizeText(payload["tipo-negocio"], 80),
        "ubicacion-negocio": sanitizeText(payload["ubicacion-negocio"], 120),
        "fecha-creacion": sanitizeDate(payload["fecha-creacion"])
    };
}

function normalizeProfileState(payload = {}) {
    return {
        personal: normalizePersonal(payload.personal || {}),
        negocio: normalizeBusiness(payload.negocio || {}),
        photoUrl: sanitizeText(payload.photoUrl, 300) || DEFAULT_PHOTO_URL
    };
}

function cloneState(state) {
    return {
        personal: { ...state.personal },
        negocio: { ...state.negocio },
        photoUrl: state.photoUrl
    };
}

function isValidEmail(email) {
    if (!email) {
        return true;
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    if (!phone) {
        return true;
    }

    return /^[+()\-\d\s.]{7,20}$/.test(phone);
}

function isValidDate(value) {
    if (!value) {
        return true;
    }

    const date = new Date(`${value}T00:00:00`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validatePersonal(payload) {
    const errors = {};

    if (payload.email && !isValidEmail(payload.email)) {
        errors.email = "Ingresa un correo valido.";
    }

    if (payload.telefono && !isValidPhone(payload.telefono)) {
        errors.telefono = "Ingresa un telefono valido.";
    }

    return errors;
}

function validateBusiness(payload) {
    const errors = {};

    if (payload["fecha-creacion"] && !isValidDate(payload["fecha-creacion"])) {
        errors["fecha-creacion"] = "Ingresa una fecha valida.";
    }

    return errors;
}

function validatePhotoFile(file) {
    if (!file) {
        return "Selecciona una imagen para continuar.";
    }

    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
        return "Formato de imagen no permitido. Usa PNG, JPG o WEBP.";
    }

    if (file.size > MAX_PHOTO_SIZE_BYTES) {
        return "La imagen supera el limite tecnico de 5 MB.";
    }

    return "";
}

class PerfilApiError extends Error {
    constructor(message, status = 0) {
        super(message);
        this.name = "PerfilApiError";
        this.status = status;
    }
}

export class PerfilModel {
    constructor(seed = {}) {
        const normalized = normalizeProfileState(seed);
        this.baseState = cloneState(normalized);
        this.currentState = cloneState(normalized);
    }

    hidratar(seed = {}) {
        const normalized = normalizeProfileState(seed);
        this.baseState = cloneState(normalized);
        this.currentState = cloneState(normalized);
    }

    obtenerEstado() {
        return cloneState(this.currentState);
    }

    obtenerFoto() {
        return this.currentState.photoUrl;
    }

    actualizarPersonal(payload) {
        this.currentState.personal = normalizePersonal(payload);
    }

    actualizarNegocio(payload) {
        this.currentState.negocio = normalizeBusiness(payload);
    }

    actualizarFoto(photoUrl) {
        this.currentState.photoUrl = sanitizeText(photoUrl, 300) || DEFAULT_PHOTO_URL;
    }

    obtenerCambiosPersonal() {
        return this.obtenerCambiosSeccion("personal");
    }

    obtenerCambiosNegocio() {
        return this.obtenerCambiosSeccion("negocio");
    }

    obtenerCambiosSeccion(section) {
        const base = this.baseState[section];
        const current = this.currentState[section];
        const changes = {};

        Object.keys(current).forEach((key) => {
            if (current[key] !== base[key]) {
                changes[key] = current[key];
            }
        });

        return changes;
    }

    confirmarPersonal() {
        this.baseState.personal = { ...this.currentState.personal };
    }

    confirmarNegocio() {
        this.baseState.negocio = { ...this.currentState.negocio };
    }

    confirmarFoto() {
        this.baseState.photoUrl = this.currentState.photoUrl;
    }

    revertirPersonal() {
        this.currentState.personal = { ...this.baseState.personal };
    }

    revertirNegocio() {
        this.currentState.negocio = { ...this.baseState.negocio };
    }

    revertirFoto() {
        this.currentState.photoUrl = this.baseState.photoUrl;
    }
}

export class PerfilView {
    constructor(doc = document) {
        this.doc = doc;

        this.formPersonal = this.doc.getElementById("form-perfil-personal");
        this.formNegocio = this.doc.getElementById("form-perfil-negocio");

        this.feedbackPersonal = this.doc.getElementById("perfil-personal-feedback");
        this.feedbackNegocio = this.doc.getElementById("perfil-negocio-feedback");

        this.photoPreview = this.doc.getElementById("perfil-photo-preview");
        this.photoInput = this.doc.getElementById("perfil-photo-input");
        this.btnCambiarFoto = this.doc.getElementById("btn-cambiar-foto");
        this.btnToggleTheme = this.doc.getElementById("btn-toggle-theme");

        this.businessTitle = this.doc.getElementById("perfil-business-title");
        this.businessSubtitle = this.doc.getElementById("perfil-business-subtitle");

        this.initialBusinessTitle = this.businessTitle ? this.businessTitle.textContent.trim() : "";
        this.initialBusinessSubtitle = this.businessSubtitle ? this.businessSubtitle.textContent.trim() : "";
    }

    disponible() {
        return Boolean(this.formPersonal && this.formNegocio && this.photoPreview);
    }

    leerEstadoInicial() {
        return {
            personal: this.serializarFormulario(this.formPersonal, PERSONAL_FIELDS),
            negocio: this.serializarFormulario(this.formNegocio, BUSINESS_FIELDS),
            photoUrl: this.photoPreview ? this.photoPreview.getAttribute("src") : DEFAULT_PHOTO_URL
        };
    }

    bindSubmitPersonal(handler) {
        if (!this.formPersonal) {
            return;
        }

        this.formPersonal.addEventListener("submit", (event) => {
            event.preventDefault();
            handler(this.serializarFormulario(this.formPersonal, PERSONAL_FIELDS));
        });

        this.formPersonal.addEventListener("input", (event) => {
            const target = event.target;
            if (target && typeof target.setCustomValidity === "function") {
                target.setCustomValidity("");
            }
        });
    }

    bindSubmitNegocio(handler) {
        if (!this.formNegocio) {
            return;
        }

        this.formNegocio.addEventListener("submit", (event) => {
            event.preventDefault();
            handler(this.serializarFormulario(this.formNegocio, BUSINESS_FIELDS));
        });

        this.formNegocio.addEventListener("input", (event) => {
            const target = event.target;
            if (target && typeof target.setCustomValidity === "function") {
                target.setCustomValidity("");
            }
        });
    }

    bindPhotoActions({ onCambiarFoto, onSeleccionarFoto, onToggleTheme }) {
        if (this.btnCambiarFoto) {
            this.btnCambiarFoto.addEventListener("click", onCambiarFoto);
        }

        if (this.photoInput) {
            this.photoInput.addEventListener("change", () => {
                const file = this.photoInput.files && this.photoInput.files[0] ? this.photoInput.files[0] : null;
                onSeleccionarFoto(file);
                this.photoInput.value = "";
            });
        }

        if (this.btnToggleTheme) {
            this.btnToggleTheme.addEventListener("click", onToggleTheme);
        }
    }

    abrirSelectorFoto() {
        if (this.photoInput) {
            this.photoInput.click();
        }
    }

    render(state) {
        this.asignarValoresFormulario(this.formPersonal, PERSONAL_FIELDS, state.personal);
        this.asignarValoresFormulario(this.formNegocio, BUSINESS_FIELDS, state.negocio);

        if (this.photoPreview) {
            this.photoPreview.src = state.photoUrl || DEFAULT_PHOTO_URL;
        }

        if (this.businessTitle) {
            this.businessTitle.textContent = state.negocio["nombre-negocio"] || this.initialBusinessTitle;
        }

        if (this.businessSubtitle) {
            this.businessSubtitle.textContent = state.negocio["tipo-negocio"] || this.initialBusinessSubtitle;
        }
    }

    setLoading(scope, isLoading) {
        const form = scope === "personal" ? this.formPersonal : this.formNegocio;
        if (!form) {
            return;
        }

        const elements = Array.from(form.elements);
        elements.forEach((element) => {
            element.disabled = isLoading;
        });

        const submitButton = form.querySelector("button[type='submit']");
        if (!submitButton) {
            return;
        }

        if (isLoading) {
            submitButton.dataset.label = submitButton.textContent || "Guardar Cambios";
            submitButton.textContent = "Guardando...";
            return;
        }

        submitButton.textContent = submitButton.dataset.label || "Guardar Cambios";
    }

    setPhotoLoading(isLoading) {
        if (this.btnCambiarFoto) {
            this.btnCambiarFoto.disabled = isLoading;
        }

        if (this.btnToggleTheme) {
            this.btnToggleTheme.disabled = isLoading;
        }

        if (this.btnCambiarFoto) {
            if (isLoading) {
                this.btnCambiarFoto.dataset.label = this.btnCambiarFoto.textContent || "Cambiar foto";
                this.btnCambiarFoto.textContent = "Procesando...";
                return;
            }

            this.btnCambiarFoto.textContent = this.btnCambiarFoto.dataset.label || "Cambiar foto";
        }
    }

    setThemeToggleState(isDarkTheme) {
        if (!this.btnToggleTheme) {
            return;
        }

        this.btnToggleTheme.textContent = isDarkTheme ? "Modo normal" : "Modo oscuro";
        this.btnToggleTheme.setAttribute("aria-pressed", isDarkTheme ? "true" : "false");
    }

    mostrarFeedback(scope, message, type = "info") {
        const container = scope === "personal" ? this.feedbackPersonal : this.feedbackNegocio;
        if (!container) {
            return;
        }

        container.textContent = message;
        container.dataset.status = type;
    }

    limpiarFeedback(scope) {
        const container = scope === "personal" ? this.feedbackPersonal : this.feedbackNegocio;
        if (!container) {
            return;
        }

        container.textContent = "";
        delete container.dataset.status;
    }

    limpiarErroresCampos(scope) {
        const form = scope === "personal" ? this.formPersonal : this.formNegocio;
        if (!form) {
            return;
        }

        const inputs = form.querySelectorAll("input");
        inputs.forEach((input) => {
            input.setCustomValidity("");
        });
    }

    mostrarErroresCampos(scope, errors) {
        const form = scope === "personal" ? this.formPersonal : this.formNegocio;
        if (!form) {
            return;
        }

        Object.entries(errors).forEach(([fieldName, errorMessage]) => {
            const input = form.elements.namedItem(fieldName);
            if (input && typeof input.setCustomValidity === "function") {
                input.setCustomValidity(errorMessage);
            }
        });

        form.reportValidity();
    }

    serializarFormulario(form, fields) {
        if (!form) {
            return {};
        }

        const data = {};
        const formData = new FormData(form);

        fields.forEach((field) => {
            data[field] = String(formData.get(field) ?? "");
        });

        return data;
    }

    asignarValoresFormulario(form, fields, values) {
        if (!form) {
            return;
        }

        fields.forEach((field) => {
            const input = form.elements.namedItem(field);
            if (!input) {
                return;
            }

            input.value = values[field] || "";
        });
    }
}

export class PerfilApi {
    constructor({ baseUrl = (window.NABOOK_API_BASE_URL || ""), fetchImpl = window.fetch.bind(window) } = {}) {
        this.baseUrl = String(baseUrl || "").trim().replace(/\/+$/, "");
        this.fetchImpl = fetchImpl;
    }

    estaDisponible() {
        return Boolean(this.baseUrl);
    }

    async obtenerPerfil(signal) {
        return this.request("/api/perfil", { method: "GET", signal });
    }

    async actualizarPersonal(payload, signal) {
        return this.request("/api/perfil/personal", {
            method: "PATCH",
            body: payload,
            signal
        });
    }

    async actualizarNegocio(payload, signal) {
        return this.request("/api/perfil/negocio", {
            method: "PATCH",
            body: payload,
            signal
        });
    }

    async subirFoto(file, signal) {
        const body = new FormData();
        body.append("foto", file);

        return this.request("/api/perfil/foto", {
            method: "POST",
            body,
            signal
        });
    }

    async request(path, { method = "GET", body, signal } = {}) {
        if (!this.estaDisponible()) {
            return null;
        }

        const options = {
            method,
            signal,
            headers: {}
        };

        if (body instanceof FormData) {
            options.body = body;
        } else if (typeof body !== "undefined") {
            options.headers["Content-Type"] = "application/json";
            options.body = JSON.stringify(body);
        }

        const response = await this.fetchImpl(`${this.baseUrl}${path}`, options);
        const contentType = response.headers.get("content-type") || "";

        let payload = null;
        if (contentType.includes("application/json")) {
            payload = await response.json();
        } else {
            const text = await response.text();
            payload = text ? { message: text } : null;
        }

        if (!response.ok) {
            const message = payload && payload.message ? payload.message : `Error HTTP ${response.status}`;
            throw new PerfilApiError(message, response.status);
        }

        return payload;
    }
}

export class PerfilController {
    constructor({ model, view, api }) {
        this.model = model;
        this.view = view;
        this.api = api;

        this.previewObjectUrl = "";
        this.pendingControllers = new Set();

        this.handleSubmitPersonal = this.handleSubmitPersonal.bind(this);
        this.handleSubmitNegocio = this.handleSubmitNegocio.bind(this);
        this.handleCambiarFoto = this.handleCambiarFoto.bind(this);
        this.handleSeleccionarFoto = this.handleSeleccionarFoto.bind(this);
        this.handleToggleTheme = this.handleToggleTheme.bind(this);
    }

    init() {
        if (!this.view.disponible()) {
            return;
        }

        const initialState = this.view.leerEstadoInicial();
        this.model.hidratar(initialState);
        this.view.render(this.model.obtenerEstado());
        this.inicializarTema();

        this.view.bindSubmitPersonal(this.handleSubmitPersonal);
        this.view.bindSubmitNegocio(this.handleSubmitNegocio);
        this.view.bindPhotoActions({
            onCambiarFoto: this.handleCambiarFoto,
            onSeleccionarFoto: this.handleSeleccionarFoto,
            onToggleTheme: this.handleToggleTheme
        });

        this.cargarPerfilRemoto();
    }

    // ===== LOGICA DE TEMA (MODO OSCURO / MODO NORMAL) =====
    inicializarTema() {
        const savedTheme = this.leerTemaPersistido();
        const initialTheme = savedTheme === DARK_THEME ? DARK_THEME : "light";
        this.aplicarTema(initialTheme);
    }

    leerTemaPersistido() {
        try {
            return localStorage.getItem(THEME_STORAGE_KEY) || "";
        } catch (_error) {
            return "";
        }
    }

    persistirTema(theme) {
        try {
            if (theme === DARK_THEME) {
                localStorage.setItem(THEME_STORAGE_KEY, DARK_THEME);
                return;
            }

            localStorage.removeItem(THEME_STORAGE_KEY);
        } catch (_error) {
            // No bloquea la UI si el navegador no permite storage.
        }
    }

    obtenerTemaActual() {
        const currentTheme = this.view.doc.documentElement.getAttribute("data-theme");
        return currentTheme === DARK_THEME ? DARK_THEME : "light";
    }

    aplicarTema(theme) {
        const isDarkTheme = theme === DARK_THEME;
        if (isDarkTheme) {
            this.view.doc.documentElement.setAttribute("data-theme", DARK_THEME);
        } else {
            this.view.doc.documentElement.removeAttribute("data-theme");
        }

        this.view.setThemeToggleState(isDarkTheme);
    }

    handleToggleTheme() {
        const nextTheme = this.obtenerTemaActual() === DARK_THEME ? "light" : DARK_THEME;
        this.aplicarTema(nextTheme);
        this.persistirTema(nextTheme);
    }

    async cargarPerfilRemoto() {
        if (!this.api.estaDisponible()) {
            return;
        }

        const requestController = this.crearRequestController();

        try {
            const payload = await this.api.obtenerPerfil(requestController.signal);
            const normalizedPayload = this.extraerPayloadPerfil(payload);
            if (!normalizedPayload) {
                return;
            }

            this.model.hidratar(normalizedPayload);
            this.view.render(this.model.obtenerEstado());
            this.view.limpiarFeedback("personal");
            this.view.limpiarFeedback("negocio");
        } catch (error) {
            if (error.name === "AbortError") {
                return;
            }

            this.view.mostrarFeedback("personal", "No fue posible cargar datos remotos. Se mantiene modo local.", "error");
        } finally {
            this.finalizarRequestController(requestController);
        }
    }

    async handleSubmitPersonal(rawPayload) {
        this.view.limpiarErroresCampos("personal");
        this.view.limpiarFeedback("personal");

        const payload = normalizePersonal(rawPayload);
        const errors = validatePersonal(payload);
        if (Object.keys(errors).length) {
            this.view.mostrarErroresCampos("personal", errors);
            return;
        }

        this.model.actualizarPersonal(payload);

        const changes = this.model.obtenerCambiosPersonal();
        if (!Object.keys(changes).length) {
            this.view.mostrarFeedback("personal", "No hay cambios para guardar.", "info");
            return;
        }

        this.view.setLoading("personal", true);
        const requestController = this.crearRequestController();

        try {
            const response = await this.api.actualizarPersonal(changes, requestController.signal);
            const normalizedPayload = this.extraerPayloadPerfil(response);
            if (normalizedPayload && normalizedPayload.personal) {
                this.model.actualizarPersonal(normalizedPayload.personal);
            }

            this.model.confirmarPersonal();
            this.view.render(this.model.obtenerEstado());

            const feedback = this.api.estaDisponible()
                ? "Cambios enviados. Pendiente de reglas de negocio en backend."
                : "Cambios guardados en modo local (pre-backend).";
            this.view.mostrarFeedback("personal", feedback, "success");
        } catch (error) {
            if (error.name === "AbortError") {
                return;
            }

            this.model.revertirPersonal();
            this.view.render(this.model.obtenerEstado());
            this.view.mostrarFeedback("personal", this.formatearError(error), "error");
        } finally {
            this.finalizarRequestController(requestController);
            this.view.setLoading("personal", false);
        }
    }

    async handleSubmitNegocio(rawPayload) {
        this.view.limpiarErroresCampos("negocio");
        this.view.limpiarFeedback("negocio");

        const payload = normalizeBusiness(rawPayload);
        const errors = validateBusiness(payload);
        if (Object.keys(errors).length) {
            this.view.mostrarErroresCampos("negocio", errors);
            return;
        }

        this.model.actualizarNegocio(payload);

        const changes = this.model.obtenerCambiosNegocio();
        if (!Object.keys(changes).length) {
            this.view.mostrarFeedback("negocio", "No hay cambios para guardar.", "info");
            return;
        }

        this.view.setLoading("negocio", true);
        const requestController = this.crearRequestController();

        try {
            const response = await this.api.actualizarNegocio(changes, requestController.signal);
            const normalizedPayload = this.extraerPayloadPerfil(response);
            if (normalizedPayload && normalizedPayload.negocio) {
                this.model.actualizarNegocio(normalizedPayload.negocio);
            }

            this.model.confirmarNegocio();
            this.view.render(this.model.obtenerEstado());

            const feedback = this.api.estaDisponible()
                ? "Cambios enviados. Pendiente de reglas de negocio en backend."
                : "Cambios guardados en modo local (pre-backend).";
            this.view.mostrarFeedback("negocio", feedback, "success");
        } catch (error) {
            if (error.name === "AbortError") {
                return;
            }

            this.model.revertirNegocio();
            this.view.render(this.model.obtenerEstado());
            this.view.mostrarFeedback("negocio", this.formatearError(error), "error");
        } finally {
            this.finalizarRequestController(requestController);
            this.view.setLoading("negocio", false);
        }
    }

    handleCambiarFoto() {
        this.view.limpiarFeedback("negocio");
        this.view.abrirSelectorFoto();
    }

    async handleSeleccionarFoto(file) {
        this.view.limpiarFeedback("negocio");

        const error = validatePhotoFile(file);
        if (error) {
            this.view.mostrarFeedback("negocio", error, "error");
            return;
        }

        this.revokePreviewUrl();

        const previewUrl = URL.createObjectURL(file);
        this.previewObjectUrl = previewUrl;

        this.model.actualizarFoto(previewUrl);
        this.view.render(this.model.obtenerEstado());
        this.view.setPhotoLoading(true);

        const requestController = this.crearRequestController();

        try {
            const response = await this.api.subirFoto(file, requestController.signal);
            const normalizedPayload = this.extraerPayloadPerfil(response);
            if (normalizedPayload && normalizedPayload.photoUrl) {
                this.model.actualizarFoto(normalizedPayload.photoUrl);
                this.revokePreviewUrl();
            }

            this.model.confirmarFoto();
            this.view.render(this.model.obtenerEstado());

            const feedback = this.api.estaDisponible()
                ? "Foto enviada. Pendiente validacion de backend."
                : "Foto actualizada en modo local (pre-backend).";
            this.view.mostrarFeedback("negocio", feedback, "success");
        } catch (requestError) {
            if (requestError.name === "AbortError") {
                return;
            }

            this.model.revertirFoto();
            this.revokePreviewUrl();
            this.view.render(this.model.obtenerEstado());
            this.view.mostrarFeedback("negocio", this.formatearError(requestError), "error");
        } finally {
            this.finalizarRequestController(requestController);
            this.view.setPhotoLoading(false);
        }
    }

    extraerPayloadPerfil(response) {
        if (!response) {
            return null;
        }

        if (response.personal || response.negocio || response.photoUrl) {
            return response;
        }

        if (response.data && (response.data.personal || response.data.negocio || response.data.photoUrl)) {
            return response.data;
        }

        return null;
    }

    formatearError(error) {
        if (error instanceof PerfilApiError) {
            return error.message;
        }

        return "No fue posible completar la operacion de perfil.";
    }

    crearRequestController() {
        const controller = new AbortController();
        this.pendingControllers.add(controller);
        return controller;
    }

    finalizarRequestController(controller) {
        this.pendingControllers.delete(controller);
    }

    revokePreviewUrl() {
        if (!this.previewObjectUrl) {
            return;
        }

        URL.revokeObjectURL(this.previewObjectUrl);
        this.previewObjectUrl = "";
    }
}

export function init() {
    const model = new PerfilModel();
    const view = new PerfilView();
    const api = new PerfilApi();
    const controller = new PerfilController({ model, view, api });
    controller.init();
}
