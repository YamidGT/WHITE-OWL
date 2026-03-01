const express = require("express");
const router = express.Router();
const routingController = require("../controllers/routing.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// POST /api/routing/calculate - Calcular ruta
router.post("/calculate", authMiddleware.verifyToken, routingController.calculateRoute);

// GET /api/routing/history - Historial de rutas
router.get("/history", authMiddleware.verifyToken, routingController.getRouteHistory);

module.exports = router;
