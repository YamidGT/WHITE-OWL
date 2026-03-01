const bcrypt = require("bcryptjs");
const jwt = require("../utils/jwt");
const { User } = require("../models/user.model");

const register = async (email, password, name) => {
  // Validar que el correo sea de UNAL
  if (!email.endsWith("@unal.edu.co")) {
    throw new Error("Solo se permiten correos institucionales @unal.edu.co");
  }

  // Verificar si el usuario ya existe
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    throw new Error("El usuario ya existe");
  }

  // Encriptar contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  // Crear usuario
  const user = await User.create({
    email,
    password: hashedPassword,
    name,
    role: "student",
  });

  // Generar token
  const token = jwt.generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    token,
  };
};

const login = async (email, password) => {
  // Buscar usuario
  const user = await User.findByEmail(email);
  if (!user) {
    throw new Error("Credenciales inválidas");
  }

  // Verificar contraseña
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Credenciales inválidas");
  }

  // Generar token
  const token = jwt.generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    token,
  };
};

const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
};

module.exports = {
  register,
  login,
  getUserById,
};
