const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db'); // Ensure this points to your db connection file

const authController = {
  // User Login
  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required' });
      }

      // Check if user exists
      const [users] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);

      if (users.length === 0) {
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
      }

      const user = users[0];

      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
      }

      // Generate JWT Token
      const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.json({ success: true, message: 'Login successful', token, user: { id: user.id, username: user.username } });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // User Registration
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
      }

      // Check if username or email already exists
      const [existingUsers] = await pool.query("SELECT * FROM users WHERE username = ? OR email = ?", [username, email]);

      if (existingUsers.length > 0) {
        return res.status(400).json({ success: false, message: 'Username or email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user into the database
      const [result] = await pool.query(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
        [username, email, hashedPassword]
      );

      res.status(201).json({ success: true, message: 'User registered successfully', userId: result.insertId });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // User Logout
  logout: (req, res) => {
    res.json({ success: true, message: 'Logout successful' });
  }
};

module.exports = authController;
