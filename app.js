const express = require('express'); 
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const errorHandler = require('./middleware/error');

const debugMiddleware = (req, res, next) => {
  console.log('===== DEBUG REQUEST =====');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Headers:', req.headers);
  console.log('Query:', req.query);
  console.log('Body:', req.body);
  console.log('Params:', req.params);
  console.log('========================');
  next();
};

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const productCategoryRoutes = require('./routes/productCategories');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const paymentRoutes = require('./routes/payments');

// Import middleware
const { verifyToken, isAdmin } = require('./middleware/auth');

// Initialize express app
const app = express();

// Comprehensive Logging Middleware
app.use(debugMiddleware);
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.path}`);
  console.log('Request Body:', req.body);
  next();
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({
  // Add error handling for JSON parsing
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      console.error('Invalid JSON:', e);
      throw new Error('Invalid JSON');
    }
  }
}));
app.use(express.urlencoded({ extended: true }));

// Static files directory for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// API routes
app.use('/api/auth', authRoutes);

// Make GET routes for products public, but require auth for POST/PUT/DELETE
// No need for separate routers because our routes file already separates these concerns
app.use('/api/products', productRoutes);

// Fix the path to match client requests - from productCategories to product-categories
app.use('/api/product-categories', productCategoryRoutes);

// Create alias route for existing implementation
app.use('/api/productCategories', productCategoryRoutes);

// Protect these routes with authentication middleware
app.use('/api/cart', verifyToken, cartRoutes);
app.use('/api/orders', verifyToken, orderRoutes);
app.use('/api/users', verifyToken, userRoutes);
app.use('/api/payments', verifyToken, paymentRoutes);

// API documentation route
if (process.env.NODE_ENV !== 'production') {
  const swaggerUi = require('swagger-ui-express');
  const swaggerDocument = require('./docs/swagger.json');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to ALU Marketplace ' });
});

// 404 Handler
app.use((req, res, next) => {
  console.log(`404 - Not Found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Additional error tracking
app.use((err, req, res, next) => {
  console.error('Unhandled Error Middleware:', {
    message: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
    body: req.body
  });
  next(err);
});

// Error handling middleware
app.use(errorHandler);

// Global unhandled rejection and exception handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

module.exports = app;
