require("dotenv").config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  
  jwt: {
    secret: process.env.JWT_SECRET || "your-secret-key",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  
  mysql: {
    host: process.env.MYSQL_HOST || "localhost",
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "password",
    database: process.env.MYSQL_DATABASE || "white_owl",
  },
  
  mongodb: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017/white_owl",
  },
  
  routingService: {
    url: process.env.ROUTING_SERVICE_URL || "http://localhost:8000",
  },
  
  frontend: {
    url: process.env.FRONTEND_URL || "http://localhost:3000",
  },
};
