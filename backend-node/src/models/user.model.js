const mysql = require("mysql2/promise");
const db = require("../config/db");

const User = {
  async create(userData) {
    const connection = await db.getConnection();
    try {
      const [result] = await connection.execute(
        "INSERT INTO users (email, password, name, role, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())",
        [userData.email, userData.password, userData.name, userData.role]
      );
      return { id: result.insertId, ...userData };
    } finally {
      connection.release();
    }
  },

  async findById(id) {
    const connection = await db.getConnection();
    try {
      const [rows] = await connection.execute(
        "SELECT * FROM users WHERE id = ?",
        [id]
      );
      return rows[0] || null;
    } finally {
      connection.release();
    }
  },

  async findByEmail(email) {
    const connection = await db.getConnection();
    try {
      const [rows] = await connection.execute(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );
      return rows[0] || null;
    } finally {
      connection.release();
    }
  },

  async findAll() {
    const connection = await db.getConnection();
    try {
      const [rows] = await connection.execute("SELECT * FROM users");
      return rows;
    } finally {
      connection.release();
    }
  },

  async update(id, userData) {
    const connection = await db.getConnection();
    try {
      const [result] = await connection.execute(
        "UPDATE users SET name = ?, role = ?, updated_at = NOW() WHERE id = ?",
        [userData.name, userData.role, id]
      );
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  },

  async delete(id) {
    const connection = await db.getConnection();
    try {
      const [result] = await connection.execute(
        "DELETE FROM users WHERE id = ?",
        [id]
      );
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  },
};

module.exports = User;
