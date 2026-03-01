const errorMiddleware = (err, req, res, next) => {
  console.error("Error:", err);

  // Error de validación
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation Error",
      message: err.message,
    });
  }

  // Error de autenticación
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({
      error: "Unauthorized",
      message: err.message,
    });
  }

  // Error de base de datos
  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      error: "Conflict",
      message: "El registro ya existe",
    });
  }

  // Error genérico
  res.status(err.status || 500).json({
    error: err.name || "Internal Server Error",
    message: err.message || "Something went wrong",
  });
};

module.exports = errorMiddleware;
