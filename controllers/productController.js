const { pool } = require('../config/db');
const Product = require('../models/Product');
const { validateProductFunction } = require('../middleware/validation');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Get all products with pagination and search
exports.getAllProducts = async (req, res) => {
  try {
    const { page, limit, category, search, sort } = req.query;
    
    const result = await Product.findAll({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      category,
      search,
      sort
    });
    
    const totalPages = Math.ceil(result.total / (parseInt(limit) || 10));
    
    res.status(200).json({
      success: true,
      count: result.products.length,
      pagination: {
        total: result.total,
        totalPages,
        currentPage: parseInt(page) || 1,
        limit: parseInt(limit) || 10
      },
      data: result.products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get single product
exports.getProductById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name as category_name, pi.quantity as stock 
       FROM product p 
       LEFT JOIN product_category c ON p.category_id = c.id 
       LEFT JOIN product_inventory pi ON p.inventory_id = pi.id 
       WHERE p.id = ? AND p.deleted_at IS NULL`,
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create new product with inventory and image
exports.createProduct = async (req, res) => {
  try {
    // Use function-based validation
    const { error } = validateProductFunction(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        errors: error.details
      });
    }
    
    const { name, description, SKU, category_id, price, quantity } = req.body;
    
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Handle image upload
      let imagePath = null;
      if (req.file) {
        const uniqueFilename = `${uuidv4()}${path.extname(req.file.originalname)}`;
        imagePath = `/uploads/products/${uniqueFilename}`;
        
        const uploadPath = path.join(__dirname, '../public', imagePath);
        fs.writeFileSync(uploadPath, req.file.buffer);
      }
      
      // Create inventory first
      const [inventoryResult] = await connection.query(
        'INSERT INTO product_inventory (quantity) VALUES (?)',
        [quantity || 0]
      );
      
      const inventory_id = inventoryResult.insertId;
      
      // Then create product with inventory_id
      const [productResult] = await connection.query(
        'INSERT INTO product (name, description, SKU, category_id, inventory_id, price, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, description, SKU, category_id, inventory_id, price, imagePath]
      );
      
      await connection.commit();
      
      const [product] = await connection.query(
        `SELECT p.*, c.name as category_name, pi.quantity as stock 
         FROM product p 
         LEFT JOIN product_category c ON p.category_id = c.id 
         LEFT JOIN product_inventory pi ON p.inventory_id = pi.id 
         WHERE p.id = ?`,
        [productResult.insertId]
      );
      
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product[0]
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, SKU, category_id, price, quantity } = req.body;
    const productId = req.params.id;
    
    // Validate input
    const { error } = validateProductFunction(req.body, true); // true for update operation
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Handle image upload
      let imagePath = null;
      if (req.file) {
        // Delete old image if exists
        const [oldImage] = await connection.query(
          'SELECT image_url FROM product WHERE id = ?',
          [productId]
        );
        
        if (oldImage[0].image_url) {
          const oldImagePath = path.join(__dirname, '../public', oldImage[0].image_url);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        
        const uniqueFilename = `${uuidv4()}${path.extname(req.file.originalname)}`;
        imagePath = `/uploads/products/${uniqueFilename}`;
        
        const uploadPath = path.join(__dirname, '../public', imagePath);
        fs.writeFileSync(uploadPath, req.file.buffer);
      }
      
      // Get current inventory_id
      const [currentProduct] = await connection.query(
        'SELECT inventory_id FROM product WHERE id = ? AND deleted_at IS NULL',
        [productId]
      );
      
      if (currentProduct.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
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
      
      if (imagePath !== null) {
        updateFields.push('image_url = ?');
        updateValues.push(imagePath);
      }
      
      if (updateFields.length > 0) {
        updateFields.push('modified_at = CURRENT_TIMESTAMP');
        
        const query = `UPDATE product SET ${updateFields.join(', ')} WHERE id = ? AND deleted_at IS NULL`;
        updateValues.push(productId);
        
        await connection.query(query, updateValues);
      }
      
      await connection.commit();
      
      const [updatedProduct] = await connection.query(
        `SELECT p.*, c.name as category_name, pi.quantity as stock 
         FROM product p 
         LEFT JOIN product_category c ON p.category_id = c.id 
         LEFT JOIN product_inventory pi ON p.inventory_id = pi.id 
         WHERE p.id = ?`,
        [productId]
      );
      
      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct[0]
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Delete product (soft delete)
exports.deleteProduct = async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE product SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
