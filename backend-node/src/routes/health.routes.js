const express = require("express");
const router = express.Router();

// GET /api/health - Verificar estado del servidor
router.get("/", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "white-owl-backend",
    version: "1.0.0"
  });
});

module.exports = router;
