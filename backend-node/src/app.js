const express = require("express");
const cors = require("cors");
const graphqlHTTP = require("express-graphql");
const { graphQLSchema } = require("./graphql/schema");
const authRoutes = require("./routes/auth.routes");
const routingRoutes = require("./routes/routing.routes");
const healthRoutes = require("./routes/health.routes");
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas REST
app.use("/api/auth", authRoutes);
app.use("/api/routing", routingRoutes);
app.use("/api/health", healthRoutes);

// GraphQL
app.use("/graphql", graphqlHTTP({
  schema: graphQLSchema,
  graphiql: process.env.NODE_ENV !== "production",
}));

// Middleware de manejo de errores
app.use(errorMiddleware);

// Ruta 404
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

module.exports = app;
