// middleware/auth.js
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

// Middleware to verify JWT token
exports.verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded Token:', decoded); // Debugging
    } catch (err) {
      console.error('JWT Verification Error:', err);
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }

    // Ensure decoded has an id
    if (!decoded.id) {
      console.error('JWT does not contain user ID');
      return res.status(401).json({ success: false, message: 'Invalid token. User ID missing.' });
    }

    // Check if user exists in the database
    const [users] = await pool.query('SELECT id, username, email, role FROM users WHERE id = ?', [decoded.id]);

    console.log('User Query Result:', users); // Debugging

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid token. User not found.' });
    }

    // Attach user info to request object
    req.user = users[0];
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Middleware to check if user is an admin
exports.isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  console.log('User Role:', req.user.role); // Debugging

  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden. Admin access required.' });
  }

  next();
};
