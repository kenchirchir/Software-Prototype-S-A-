// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const orderController = require('../controllers/orderController');

// Define middleware for checking admin role
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Unauthorized: Admin access required'
    });
  }
};

// Get all orders (admin gets all, users get their own)
router.get('/', auth.verifyToken, orderController.getAllOrders);

// Get orders by status
router.get('/status/:status', auth.verifyToken, orderController.getOrdersByStatus);

// Get order by ID
router.get('/:id', auth.verifyToken, orderController.getOrderById);

// Create a new order
router.post('/', auth.verifyToken, orderController.createOrder);

// Update order status (admin only)
router.put('/:id/status', auth.verifyToken, isAdmin, orderController.updateOrderStatus);

// Update payment information
router.put('/:id/payment', auth.verifyToken, orderController.updatePayment);

// Delete order (admin only)
router.delete('/:id', auth.verifyToken, isAdmin, orderController.deleteOrder);

module.exports = router;
