const mysql = require("mysql2/promise");
const mongoose = require("mongoose");

let mysqlPool = null;
let mongoConnection = null;

const mysqlConfig = {
  host: process.env.MYSQL_HOST || "localhost",
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "password",
  database: process.env.MYSQL_DATABASE || "white_owl",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const mongoConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const connectDatabases = async () => {
  try {
    // Conectar a MySQL
    mysqlPool = mysql.createPool(mysqlConfig);
    console.log("✅ MySQL connected");

    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/white_owl", mongoConfig);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ Database connection error:", error);
    throw error;
  }
};

const getConnection = async () => {
  if (!mysqlPool) {
    throw new Error("MySQL pool not initialized");
  }
  return mysqlPool.getConnection();
};

module.exports = {
  connectDatabases,
  getConnection,
  mongoose,
};
