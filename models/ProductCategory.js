const { pool } = require('../config/db');

class ProductCategory {
  static async findAll({ page = 1, limit = 10, search }) {
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM product_category WHERE deleted_at IS NULL';
    let countQuery = 'SELECT COUNT(*) as total FROM product_category WHERE deleted_at IS NULL';
    const queryParams = [];
    
    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      countQuery += ' AND (name LIKE ? OR description LIKE ?)';
      const searchParam = `%${search}%`;
      queryParams.push(searchParam, searchParam);
    }
    
    query += ' ORDER BY name ASC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), parseInt(offset));
    
    const [categories] = await pool.query(query, queryParams);
    const [totalResult] = await pool.query(countQuery, search ? [`%${search}%`, `%${search}%`] : []);
    
    return {
      categories,
      total: totalResult[0].total
    };
  }
  
  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM product_category WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    
    return rows[0];
  }
  
  static async findByName(name) {
    const [rows] = await pool.query(
      'SELECT * FROM product_category WHERE name = ? AND deleted_at IS NULL',
      [name]
    );
    
    return rows[0];
  }
  
  static async create(categoryData) {
    const { name, description } = categoryData;
    
    const [result] = await pool.query(
      'INSERT INTO product_category (name, description) VALUES (?, ?)',
      [name, description || null]
    );
    
    const [newCategory] = await pool.query(
      'SELECT * FROM product_category WHERE id = ?',
      [result.insertId]
    );
    
    return newCategory[0];
  }
  
  static async update(id, categoryData) {
    const { name, description } = categoryData;
    
    await pool.query(
      'UPDATE product_category SET name = ?, description = ?, modified_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, description || null, id]
    );
    
    const [updatedCategory] = await pool.query(
      'SELECT * FROM product_category WHERE id = ?',
      [id]
    );
    
    return updatedCategory[0];
  }
  
  static async delete(id) {
    const [result] = await pool.query(
      'UPDATE product_category SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }
  
  static async getProductCount(categoryId) {
    const [result] = await pool.query(
      'SELECT COUNT(*) as count FROM product WHERE category_id = ? AND deleted_at IS NULL',
      [categoryId]
    );
    
    return result[0].count;
  }
}

module.exports = ProductCategory;
