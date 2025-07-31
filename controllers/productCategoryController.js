const { pool } = require('../config/db');

// Get all categories with pagination and search
exports.getAllCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM product_category WHERE deleted_at IS NULL';
    let countQuery = 'SELECT COUNT(*) as total FROM product_category WHERE deleted_at IS NULL';
    const queryParams = [];
    
    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      countQuery += ' AND (name LIKE ? OR description LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY name ASC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), parseInt(offset));
    
    const [categories] = await pool.query(query, queryParams);
    const [totalCount] = await pool.query(countQuery, search ? [`%${search}%`, `%${search}%`] : []);
    
    const totalPages = Math.ceil(totalCount[0].total / limit);
    
    res.status(200).json({
      success: true,
      count: categories.length,
      pagination: {
        total: totalCount[0].total,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit)
      },
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get single category
exports.getCategoryById = async (req, res) => {
  try {
    const [category] = await pool.query(
      'SELECT * FROM product_category WHERE id = ? AND deleted_at IS NULL',
      [req.params.id]
    );
    
    if (category.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: category[0]
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create new category
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }
    
    const [existingCategory] = await pool.query(
      'SELECT * FROM product_category WHERE name = ? AND deleted_at IS NULL',
      [name]
    );
    
    if (existingCategory.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }
    
    const [result] = await pool.query(
      'INSERT INTO product_category (name, description) VALUES (?, ?)',
      [name, description || null]
    );
    
    const [newCategory] = await pool.query(
      'SELECT * FROM product_category WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: newCategory[0]
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const categoryId = req.params.id;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }
    
    // Check if category exists
    const [category] = await pool.query(
      'SELECT * FROM product_category WHERE id = ? AND deleted_at IS NULL',
      [categoryId]
    );
    
    if (category.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Check if name is already taken by another category
    const [existingCategory] = await pool.query(
      'SELECT * FROM product_category WHERE name = ? AND id != ? AND deleted_at IS NULL',
      [name, categoryId]
    );
    
    if (existingCategory.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }
    
    await pool.query(
      'UPDATE product_category SET name = ?, description = ?, modified_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, description || null, categoryId]
    );
    
    const [updatedCategory] = await pool.query(
      'SELECT * FROM product_category WHERE id = ?',
      [categoryId]
    );
    
    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory[0]
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Delete category (soft delete)
exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    // Check if category exists
    const [category] = await pool.query(
      'SELECT * FROM product_category WHERE id = ? AND deleted_at IS NULL',
      [categoryId]
    );
    
    if (category.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Check if category is being used by products
    const [products] = await pool.query(
      'SELECT COUNT(*) as count FROM product WHERE category_id = ? AND deleted_at IS NULL',
      [categoryId]
    );
    
    if (products[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category that is associated with products'
      });
    }
    
    await pool.query(
      'UPDATE product_category SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
      [categoryId]
    );
    
    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
