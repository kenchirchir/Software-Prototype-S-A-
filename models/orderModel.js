// models/Order.js
const { pool } = require('../config/db');

const Order = {
  // Create a new order with items and shipping details
  create: async (orderData) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Step 1: Insert into orders table
      const [orderResult] = await connection.query(
        'INSERT INTO orders (user_id, total_price, status) VALUES (?, ?, ?)',
        [
          orderData.userId,
          orderData.totalPrice,
          orderData.status || 'pending'
        ]
      );
      
      const orderId = orderResult.insertId;
      
      // Step 2: Insert order items
      for (const item of orderData.items) {
        await connection.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
          [orderId, item.productId, item.quantity, item.price]
        );
      }
      
      // Step 3: Insert shipping details
      await connection.query(
        'INSERT INTO order_shipping (order_id, shipping_address, phone) VALUES (?, ?, ?)',
        [orderId, orderData.shipping.shippingAddress, orderData.shipping.phone]
      );
      
      // Step 4: Create payment record if payment info is provided
if (orderData.payment) {
  await connection.query(
      'INSERT INTO payments (order_id, payment_method, payment_status, transaction_id, total_amount) VALUES (?, ?, ?, ?, ?)',
      [
          orderId,
          orderData.payment.paymentMethod,
          orderData.payment.paymentStatus || 'pending',
          orderData.payment.transactionId || null,
          orderData.totalPrice // Ensure total_amount is passed
      ]
  );
}
      
      await connection.commit();
      
      // Return the created order with all details
      return await Order.findById(orderId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
  
  // Get all orders with optional filtering by user
  findAll: async (userId = null) => {
    try {
      let query = `
        SELECT o.*, u.username, u.email 
        FROM orders o
        JOIN users u ON o.user_id = u.id
      `;
      
      const params = [];
      
      if (userId) {
        query += ' WHERE o.user_id = ?';
        params.push(userId);
      }
      
      query += ' ORDER BY o.created_at DESC';
      
      const [orders] = await pool.query(query, params);
      
      // Get order items for each order
      for (const order of orders) {
        // Get items
        const [items] = await pool.query(
          `SELECT oi.*, p.name as product_name 
           FROM order_items oi
           JOIN product p ON oi.product_id = p.id
           WHERE oi.order_id = ?`,
          [order.id]
        );
        
        // Get shipping info
        const [shippingInfo] = await pool.query(
          'SELECT * FROM order_shipping WHERE order_id = ?',
          [order.id]
        );
        
        // Get payment info
        const [paymentInfo] = await pool.query(
          'SELECT * FROM payments WHERE order_id = ?',
          [order.id]
        );
        
        order.items = items;
        order.shipping = shippingInfo[0] || null;
        order.payment = paymentInfo[0] || null;
      }
      
      return orders;
    } catch (error) {
      throw error;
    }
  },
  
  // Get a single order by ID with all related data
  findById: async (orderId) => {
    try {
      const [orders] = await pool.query(
        `SELECT o.*, u.username, u.email
         FROM orders o
         JOIN users u ON o.user_id = u.id
         WHERE o.id = ?`,
        [orderId]
      );
      
      if (orders.length === 0) {
        return null;
      }
      
      const order = orders[0];
      
      // Get order items
      const [items] = await pool.query(
        `SELECT oi.*, p.name as product_name, p.description as product_description
         FROM order_items oi
         JOIN product p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [orderId]
      );
      
      // Get shipping info
      const [shippingInfo] = await pool.query(
        'SELECT * FROM order_shipping WHERE order_id = ?',
        [orderId]
      );
      
      // Get payment info
      const [paymentInfo] = await pool.query(
        'SELECT * FROM payments WHERE order_id = ?',
        [orderId]
      );
      
      order.items = items;
      order.shipping = shippingInfo[0] || null;
      order.payment = paymentInfo[0] || null;
      
      return order;
    } catch (error) {
      throw error;
    }
  },
  
  // Update an order's status
  updateStatus: async (orderId, status) => {
    try {
      const [result] = await pool.query(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, orderId]
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      // Return the updated order
      return await Order.findById(orderId);
    } catch (error) {
      throw error;
    }
  },
  
  // Update payment status
  updatePayment: async (orderId, paymentData) => {
    try {
      const [payments] = await pool.query(
        'SELECT id FROM payments WHERE order_id = ?',
        [orderId]
      );
      
      if (payments.length === 0) {
        // Create new payment record if it doesn't exist
        await pool.query(
          'INSERT INTO payments (order_id, payment_method, payment_status, transaction_id) VALUES (?, ?, ?, ?)',
          [
            orderId,
            paymentData.paymentMethod,
            paymentData.paymentStatus,
            paymentData.transactionId || null
          ]
        );
      } else {
        // Update existing payment record
        await pool.query(
          'UPDATE payments SET payment_method = ?, payment_status = ?, transaction_id = ? WHERE order_id = ?',
          [
            paymentData.paymentMethod,
            paymentData.paymentStatus,
            paymentData.transactionId || null,
            orderId
          ]
        );
      }
      
      return await Order.findById(orderId);
    } catch (error) {
      throw error;
    }
  },
  
  // Delete an order and all related records
  delete: async (orderId) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Due to foreign key constraints with ON DELETE CASCADE,
      // deleting the order will automatically delete related records
      const [result] = await connection.query(
        'DELETE FROM orders WHERE id = ?',
        [orderId]
      );
      
      await connection.commit();
      
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
  
  // Get orders by status
  findByStatus: async (status) => {
    try {
      const [orders] = await pool.query(
        `SELECT o.*, u.username, u.email 
         FROM orders o
         JOIN users u ON o.user_id = u.id
         WHERE o.status = ?
         ORDER BY o.created_at DESC`,
        [status]
      );
      
      // Get related data for each order
      for (const order of orders) {
        const [items] = await pool.query(
          `SELECT oi.*, p.name as product_name 
           FROM order_items oi
           JOIN product p ON oi.product_id = p.id
           WHERE oi.order_id = ?`,
          [order.id]
        );
        
        order.items = items;
      }
      
      return orders;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Order;
