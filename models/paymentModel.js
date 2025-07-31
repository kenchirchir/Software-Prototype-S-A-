const { pool } = require('../config/db');

class Payment {
  // Create a new payment
  static async create(paymentData) {
    const { 
      user_id, 
      total_amount, 
      payment_method, 
      products, 
      shipping_address, 
      status = 'pending' 
    } = paymentData;

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Insert payment record
      const [paymentResult] = await connection.query(
        'INSERT INTO payments (user_id, total_amount, payment_method, shipping_address, status) VALUES (?, ?, ?, ?, ?)',
        [user_id, total_amount, payment_method, shipping_address, status]
      );

      const payment_id = paymentResult.insertId;

      // Insert payment items
      const paymentItemsQuery = 'INSERT INTO payment_items (payment_id, product_id, quantity, price) VALUES ?';
      const paymentItemsValues = products.map(product => [
        payment_id, 
        product.product_id, 
        product.quantity, 
        product.price
      ]);

      await connection.query(paymentItemsQuery, [paymentItemsValues]);

      await connection.commit();

      // Fetch and return full payment details
      const [paymentDetails] = await connection.query(
        `SELECT p.*, 
                pi.product_id, 
                pi.quantity as item_quantity, 
                pr.name as product_name, 
                pr.price as product_price
         FROM payments p
         JOIN payment_items pi ON p.id = pi.payment_id
         JOIN product pr ON pi.product_id = pr.id
         WHERE p.id = ?`,
        [payment_id]
      );

      return {
        payment_id,
        ...paymentDetails[0],
        items: paymentDetails
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Find payment by ID
  static async findById(id) {
    const [payments] = await pool.query(
      `SELECT p.*, 
              pi.product_id, 
              pi.quantity as item_quantity, 
              pr.name as product_name, 
              pr.price as product_price
       FROM payments p
       JOIN payment_items pi ON p.id = pi.payment_id
       JOIN product pr ON pi.product_id = pr.id
       WHERE p.id = ?`,
      [id]
    );

    return payments.length > 0 ? {
      ...payments[0],
      items: payments
    } : null;
  }

  // Update payment status
  static async updateStatus(id, status) {
    const [result] = await pool.query(
      'UPDATE payments SET status = ?, modified_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );

    return result.affectedRows > 0;
  }
}

module.exports = Payment;