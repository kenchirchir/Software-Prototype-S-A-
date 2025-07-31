// src/services/orderService.js
import API from './api';

const OrderService = {
  // Get all orders for current user
  getOrders: async () => {
    try {
      const response = await API.get('/orders');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get order by ID
  getOrderById: async (id) => {
    try {
      const response = await API.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create a new order from cart
  createOrder: async (orderData) => {
    try {
      const response = await API.post('/orders', orderData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update order status (admin only)
  updateOrderStatus: async (id, status) => {
    try {
      const response = await API.put(`/orders/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default OrderService;