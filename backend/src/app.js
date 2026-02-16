const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const { env } = require("./config/env");
const requestId = require("./middleware/requestId");
const requestLogger = require("./middleware/requestLogger");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const authJwt = require("./middleware/authJwt");
const openApiDocument = require("./docs/openapi");

const healthRoutes = require("./modules/health/routes");
const authRoutes = require("./modules/auth/routes");
const perfilRoutes = require("./modules/perfil/routes");
const clientesRoutes = require("./modules/clientes/routes");
const proveedoresRoutes = require("./modules/proveedores/routes");
const productosRoutes = require("./modules/productos/routes");

const app = express();
const apiBasePath = env.apiBasePath;

function isAllowedOrigin(origin) {
    if (!origin) {
        return true;
    }

    if (env.corsOrigins.includes("*")) {
        return true;
    }

    return env.corsOrigins.includes(origin);
}

app.disable("x-powered-by");
app.use(requestId);
app.use(requestLogger);
app.use(
    cors({
        origin: (origin, callback) => {
            if (isAllowedOrigin(origin)) {
                callback(null, true);
                return;
            }

            callback(null, false);
        }
    })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/uploads/profiles", express.static(env.uploadDir));
app.get(`${apiBasePath}/openapi.json`, (_req, res) => res.json(openApiDocument));
app.use(`${apiBasePath}/docs`, swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use(`${apiBasePath}/health`, healthRoutes);
app.use(`${apiBasePath}/auth`, authRoutes);
app.use(`${apiBasePath}/perfil`, authJwt, perfilRoutes);
app.use(`${apiBasePath}/clientes`, authJwt, clientesRoutes);
app.use(`${apiBasePath}/proveedores`, authJwt, proveedoresRoutes);
app.use(`${apiBasePath}/productos`, authJwt, productosRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
