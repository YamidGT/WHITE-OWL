const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// POST /api/auth/register
router.post("/register", authController.register);

// POST /api/auth/login
router.post("/login", authController.login);

// GET /api/auth/me - Obtener usuario actual
router.get("/me", authMiddleware.verifyToken, authController.getCurrentUser);

// POST /api/auth/logout
router.post("/logout", authController.logout);

module.exports = router;
