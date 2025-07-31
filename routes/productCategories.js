// routes/productCategories.js
const express = require('express');
const router = express.Router();
const productCategoryController = require('../controllers/productCategoryController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Public routes - no authentication required
router.get('/', productCategoryController.getAllCategories);
router.get('/:id', productCategoryController.getCategoryById);

// Protected routes - admin only
router.post('/', verifyToken, isAdmin, productCategoryController.createCategory);
router.put('/:id', verifyToken, isAdmin, productCategoryController.updateCategory);
router.delete('/:id', verifyToken, isAdmin, productCategoryController.deleteCategory);

module.exports = router;
