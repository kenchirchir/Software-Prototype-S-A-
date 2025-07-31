const { pool } = require('../config/db');

class Product {
  // Find all products with filters
  static async findAll({ page = 1, limit = 10, category = null, search = null, sort = 'newest' }) {
    const offset = (page - 1) * limit;
    let query = 'SELECT p.*, c.name as category_name, pi.quantity as stock FROM product p LEFT JOIN product_category c ON p.category_id = c.id LEFT JOIN product_inventory pi ON p.inventory_id = pi.id WHERE p.deleted_at IS NULL';
    let countQuery = 'SELECT COUNT(*) as total FROM product p LEFT JOIN product_category c ON p.category_id = c.id WHERE p.deleted_at IS NULL';
    let queryParams = [];
    
    // Apply category filter
    if (category) {
      query += ' AND c.name = ?';
      countQuery += ' AND c.name = ?';
      queryParams.push(category);
    }
    
    // Apply search filter
    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)';
      countQuery += ' AND (p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)';
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    // Apply sorting
    switch(sort) {
      case 'price_asc':
        query += ' ORDER BY p.price ASC';
        break;
      case 'price_desc':
        query += ' ORDER BY p.price DESC';
        break;
      case 'newest':
      default:
        query += ' ORDER BY p.created_at DESC';
        break;
    }
    
    query += ' LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);
    
    const [products] = await pool.query(query, queryParams);
    
    // Remove limit and offset for count query
    const countParams = queryParams.slice(0, queryParams.length - 2);
    const [countResult] = await pool.query(countQuery, countParams);
    
    return {
      products,
      total: countResult[0].total
    };
  }

  // Find product by ID
  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT p.*, c.name as category_name, pi.quantity as stock 
       FROM product p 
       LEFT JOIN product_category c ON p.category_id = c.id 
       LEFT JOIN product_inventory pi ON p.inventory_id = pi.id 
       WHERE p.id = ? AND p.deleted_at IS NULL`,
      [id]
    );
    
    return rows[0];
  }

  // Create a new product
  static async create(productData) {
    const { name, description, SKU, category_id, price, quantity, image_url } = productData;
    
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Create inventory first
      const [inventoryResult] = await connection.query(
        'INSERT INTO product_inventory (quantity) VALUES (?)',
        [quantity || 0]
      );
      
      const inventory_id = inventoryResult.insertId;
      
      // Then create product with inventory_id
      const [productResult] = await connection.query(
        'INSERT INTO product (name, description, SKU, category_id, inventory_id, price, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, description, SKU, category_id, inventory_id, price, image_url]
      );
      
      await connection.commit();
      
      // Return the newly created product
      const [product] = await connection.query(
        `SELECT p.*, c.name as category_name, pi.quantity as stock 
         FROM product p 
         LEFT JOIN product_category c ON p.category_id = c.id 
         LEFT JOIN product_inventory pi ON p.inventory_id = pi.id 
         WHERE p.id = ?`,
        [productResult.insertId]
      );
      
      return product[0];
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Update an existing product
  static async update(id, productData) {
    const { name, description, SKU, category_id, price, quantity, image_url } = productData;
    
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Get current product data
      const [currentProduct] = await connection.query(
        'SELECT inventory_id FROM product WHERE id = ? AND deleted_at IS NULL',
        [id]
      );
      
      if (currentProduct.length === 0) {
        throw new Error('Product not found');
      }
      
      // Update inventory if quantity provided
      if (quantity !== undefined) {
        await connection.query(
          'UPDATE product_inventory SET quantity = ?, modified_at = CURRENT_TIMESTAMP WHERE id = ?',
          [quantity, currentProduct[0].inventory_id]
        );
      }
      
      // Build update query dynamically
      let updateFields = [];
      let updateValues = [];
      
      if (name !== undefined) {
        updateFields.push('name = ?');
        updateValues.push(name);
      }
      
      if (description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(description);
      }
      
      if (SKU !== undefined) {
        updateFields.push('SKU = ?');
        updateValues.push(SKU);
      }
      
      if (category_id !== undefined) {
        updateFields.push('category_id = ?');
        updateValues.push(category_id);
      }
      
      if (price !== undefined) {
        updateFields.push('price = ?');
        updateValues.push(price);
      }
      
      if (image_url !== undefined) {
        updateFields.push('image_url = ?');
        updateValues.push(image_url);
      }
      
      if (updateFields.length > 0) {
        updateFields.push('modified_at = CURRENT_TIMESTAMP');
        
        const query = `UPDATE product SET ${updateFields.join(', ')} WHERE id = ? AND deleted_at IS NULL`;
        updateValues.push(id);
        
        await connection.query(query, updateValues);
      }
      
      await connection.commit();
      
      // Return the updated product
      const [updatedProduct] = await connection.query(
        `SELECT p.*, c.name as category_name, pi.quantity as stock 
         FROM product p 
         LEFT JOIN product_category c ON p.category_id = c.id 
         LEFT JOIN product_inventory pi ON p.inventory_id = pi.id 
         WHERE p.id = ?`,
        [id]
      );
      
      return updatedProduct[0];
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Delete a product (soft delete)
  static async delete(id) {
    const [result] = await pool.query(
      'UPDATE product SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    
    return result.affectedRows > 0;
  }

  // Find products by category ID
  static async findByCategory(categoryId, { page = 1, limit = 10, sort = 'newest' }) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT p.*, c.name as category_name, pi.quantity as stock 
      FROM product p 
      LEFT JOIN product_category c ON p.category_id = c.id 
      LEFT JOIN product_inventory pi ON p.inventory_id = pi.id 
      WHERE p.deleted_at IS NULL AND p.category_id = ?
    `;
    
    let countQuery = 'SELECT COUNT(*) as total FROM product p WHERE p.deleted_at IS NULL AND p.category_id = ?';
    
    // Apply sorting
    switch(sort) {
      case 'price_asc':
        query += ' ORDER BY p.price ASC';
        break;
      case 'price_desc':
        query += ' ORDER BY p.price DESC';
        break;
      case 'newest':
      default:
        query += ' ORDER BY p.created_at DESC';
        break;
    }
    
    query += ' LIMIT ? OFFSET ?';
    
    const [products] = await pool.query(query, [categoryId, limit, offset]);
    const [countResult] = await pool.query(countQuery, [categoryId]);
    
    return {
      products,
      total: countResult[0].total
    };
  }

  // Search products
  static async search(term, { page = 1, limit = 10, sort = 'newest' }) {
    const offset = (page - 1) * limit;
    const searchTerm = `%${term}%`;
    
    let query = `
      SELECT p.*, c.name as category_name, pi.quantity as stock 
      FROM product p 
      LEFT JOIN product_category c ON p.category_id = c.id 
      LEFT JOIN product_inventory pi ON p.inventory_id = pi.id 
      WHERE p.deleted_at IS NULL AND (p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)
    `;
    
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM product p 
      LEFT JOIN product_category c ON p.category_id = c.id 
      WHERE p.deleted_at IS NULL AND (p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)
    `;
    
    // Apply sorting
    switch(sort) {
      case 'price_asc':
        query += ' ORDER BY p.price ASC';
        break;
      case 'price_desc':
        query += ' ORDER BY p.price DESC';
        break;
      case 'newest':
      default:
        query += ' ORDER BY p.created_at DESC';
        break;
    }
    
    query += ' LIMIT ? OFFSET ?';
    
    const [products] = await pool.query(query, [searchTerm, searchTerm, searchTerm, limit, offset]);
    const [countResult] = await pool.query(countQuery, [searchTerm, searchTerm, searchTerm]);
    
    return {
      products,
      total: countResult[0].total
    };
  }
}

module.exports = Product;