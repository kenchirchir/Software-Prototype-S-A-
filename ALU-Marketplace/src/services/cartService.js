// src/services/cartService.js
import API from './api';

const CartService = {
  // Get user's cart
  getCart: async () => {
    try {
      const response = await API.get('/cart');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add item to cart
  addToCart: async (productId, quantity = 1) => {
    try {
      const response = await API.post('/cart', { productId, quantity });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update cart item quantity
  updateCartItem: async (cartItemId, quantity) => {
    try {
      const response = await API.put(`/cart/${cartItemId}`, { quantity });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Remove item from cart
  removeFromCart: async (cartItemId) => {
    try {
      const response = await API.delete(`/cart/${cartItemId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Clear cart
  clearCart: async () => {
    try {
      const response = await API.delete('/cart');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default CartService;