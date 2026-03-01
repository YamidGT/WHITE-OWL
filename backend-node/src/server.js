require("dotenv").config();
const app = require("./app");
const { connectDatabases } = require("./config/db");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Conectar a las bases de datos
    await connectDatabases();
    console.log("✅ Databases connected");

    // Iniciar el servidor
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📚 REST API: http://localhost:${PORT}/api`);
      console.log(`📊 GraphQL: http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
