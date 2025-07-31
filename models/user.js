const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
  // Create a new user
  create: async ({ username, email, password }) => {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const [result] = await pool.query(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, hashedPassword]
      );

      return { id: result.insertId, username, email };
    } catch (error) {
      throw new Error('Error creating user');
    }
  },

  // Find user by email
  findByEmail: async (email) => {
    try {
      const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

      return users.length > 0 ? users[0] : null;
    } catch (error) {
      throw new Error('Error finding user by email');
    }
  },

  // Find user by ID
  findById: async (id) => {
    try {
      const [users] = await pool.query('SELECT id, username, email FROM users WHERE id = ?', [id]);

      return users.length > 0 ? users[0] : null;
    } catch (error) {
      throw new Error('Error finding user by ID');
    }
  },

  // Get all users
  findAll: async () => {
    try {
      const [users] = await pool.query('SELECT id, username, email FROM users');

      return users;
    } catch (error) {
      throw new Error('Error retrieving users');
    }
  },

  // Update user
  update: async (id, { username, email, password }) => {
    try {
      const user = await User.findById(id);
      if (!user) {
        throw new Error('User not found');
      }

      const updatedUser = {
        username: username || user.username,
        email: email || user.email,
        password: password ? await bcrypt.hash(password, 10) : user.password
      };

      await pool.query(
        'UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?',
        [updatedUser.username, updatedUser.email, updatedUser.password, id]
      );

      return updatedUser;
    } catch (error) {
      throw new Error('Error updating user');
    }
  },

  // Delete user
  delete: async (id) => {
    try {
      const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error('Error deleting user');
    }
  }
};

module.exports = User;
