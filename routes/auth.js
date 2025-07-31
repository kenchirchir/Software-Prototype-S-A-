const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Register a user
router.post('/register', async (req, res, next) => {
  const { username, email, password } = req.body;

  console.log('Registration Request:', { username, email });

  if (!username || !email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'All fields are required' 
    });
  }

  try {
    // Verify email is unique
    const [emailCheck] = await db.pool.query(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    );

    if (emailCheck.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already exists' 
      });
    }

    // Verify username is unique
    const [usernameCheck] = await db.pool.query(
      'SELECT * FROM users WHERE username = ?', 
      [username]
    );

    if (usernameCheck.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await db.pool.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)', 
      [username, email, hashedPassword]
    );

    console.log('User Registered Successfully:', { 
      userId: result.insertId, 
      username 
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: { 
        id: result.insertId, 
        username, 
        email 
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    next(error);
  }
});

//  Add Login Route
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  console.log('Login Request:', { email });

  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email and password are required' 
    });
  }

  try {
    // Check if user exists
    const [users] = await db.pool.query(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    const user = users[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ 
      success: true, 
      message: 'Login successful', 
      token 
    });
  } catch (error) {
    console.error('Login Error:', error);
    next(error);
  }
});

 module.exports = router;

