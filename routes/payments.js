const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Create a new payment
router.post('/', verifyToken, paymentController.createPayment);

// Get payment by ID
router.get('/:id', verifyToken, paymentController.getPaymentById);

// Update payment status (admin only)
router.patch('/:id/status', verifyToken, isAdmin, paymentController.updatePaymentStatus);

 module.exports = router;