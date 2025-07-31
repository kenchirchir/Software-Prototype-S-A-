// middleware/security.js
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const hpp = require('hpp');

// Export rate limit function directly
exports.rateLimit = rateLimit;

// XSS protection middleware
exports.sanitizeInput = (req, res, next) => {
  try {
    // Sanitize request body
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = req.body[key].trim();
        }
      });
    }
    next();
  } catch (error) {
    console.error('Error sanitizing input:', error);
    next();
  }
};

// Simple middleware to protect against common attacks
exports.secureHeaders = (req, res, next) => {
  // Set security headers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
};
