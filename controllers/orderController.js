// controllers/orderController.js
const Order = require('../models/orderModel');

const orderController = {
  // Get all orders
  getAllOrders: async (req, res) => {
    try {
      // If user is not admin, only show their orders
      const userId = req.user.role === 'admin' ? null : req.user.id;
      
      const orders = await Order.findAll(userId);
        
      return res.status(200).json({
        success: true,
        count: orders.length,
        message: 'Orders retrieved successfully',
        data: orders
      });
    } catch (error) {
      console.error('Error getting orders:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve orders',
        error: error.message
      });
    }
  },

  // Get order by ID
  getOrderById: async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);
        
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      
      // Check if the user is authorized to view the order
      if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this order'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Order retrieved successfully',
        data: order
      });
    } catch (error) {
      console.error('Error getting order by ID:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve order',
        error: error.message
      });
    }
  },

  // Create a new order
  createOrder: async (req, res) => {
    try {
      const { items, totalPrice, shipping, payment } = req.body;
      
      if (!items || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No order items provided'
        });
      }
      
      if (!shipping || !shipping.shippingAddress || !shipping.phone) {
        return res.status(400).json({
          success: false,
          message: 'Shipping information is required'
        });
      }
      
      // Create new order
      const orderData = {
        userId: req.user.id,
        totalPrice,
        items,
        shipping,
        payment,
        status: 'pending'
      };
      
      const order = await Order.create(orderData);
      
      return res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order
      });
    } catch (error) {
      console.error('Error creating order:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create order',
        error: error.message
      });
    }
  },

  // Update order status
  updateOrderStatus: async (req, res) => {
    try {
      const { status } = req.body;
      
      if (!status || !['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Valid status is required'
        });
      }
      
      const order = await Order.updateStatus(req.params.id, status);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        data: order
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update order status',
        error: error.message
      });
    }
  },
  
  // Update payment information
  updatePayment: async (req, res) => {
    try {
      const { paymentMethod, paymentStatus, transactionId } = req.body;
      
      if (!paymentMethod || !paymentStatus) {
        return res.status(400).json({
          success: false,
          message: 'Payment method and status are required'
        });
      }
      
      const paymentData = {
        paymentMethod,
        paymentStatus,
        transactionId
      };
      
      const order = await Order.updatePayment(req.params.id, paymentData);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Payment information updated successfully',
        data: order
      });
    } catch (error) {
      console.error('Error updating payment information:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update payment information',
        error: error.message
      });
    }
  },
  
  // Delete order - admin only
  deleteOrder: async (req, res) => {
    try {
      const deleted = await Order.delete(req.params.id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Order deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting order:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete order',
        error: error.message
      });
    }
  },
  
  // Get orders by status
  getOrdersByStatus: async (req, res) => {
    try {
      const { status } = req.params;
      
      if (!status || !['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Valid status is required'
        });
      }
      
      let orders = await Order.findByStatus(status);
      
      // If not admin, filter to only show user's orders
      if (req.user.role !== 'admin') {
        orders = orders.filter(order => order.user_id === req.user.id);
      }
      
      return res.status(200).json({
        success: true,
        count: orders.length,
        message: `Orders with status '${status}' retrieved successfully`,
        data: orders
      });
    } catch (error) {
      console.error('Error getting orders by status:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve orders',
        error: error.message
      });
    }
  }
};

module.exports = orderController;
