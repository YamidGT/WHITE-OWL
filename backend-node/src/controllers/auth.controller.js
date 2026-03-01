const authService = require("../services/auth.service");

const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const result = await authService.register(email, password, name);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await authService.getUserById(userId);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  // En JWT, el logout se maneja en el cliente eliminando el token
  res.json({ message: "Logged out successfully" });
};

module.exports = {
  register,
  login,
  getCurrentUser,
  logout,
};
