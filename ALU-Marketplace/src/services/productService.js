// src/services/productService.js
import API from './api';

const ProductService = {
  // Get all products with optional filters
  getAllProducts: async (params = {}) => {
    try {
      const response = await API.get('/products', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get product by ID
  getProductById: async (id) => {
    try {
      const response = await API.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new product (admin only)
  createProduct: async (productData) => {
    try {
      // Use FormData for handling file uploads
      const formData = new FormData();
      
      // Append all product data
      Object.keys(productData).forEach(key => {
        if (key === 'image' && productData[key] instanceof File) {
          formData.append('image', productData[key]);
        } else {
          formData.append(key, productData[key]);
        }
      });

      const response = await API.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update product (admin only)
  updateProduct: async (id, productData) => {
    try {
      // Use FormData for handling file uploads
      const formData = new FormData();
      
      // Append all product data
      Object.keys(productData).forEach(key => {
        if (key === 'image' && productData[key] instanceof File) {
          formData.append('image', productData[key]);
        } else {
          formData.append(key, productData[key]);
        }
      });

      const response = await API.put(`/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete product (admin only)
  deleteProduct: async (id) => {
    try {
      const response = await API.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default ProductService;