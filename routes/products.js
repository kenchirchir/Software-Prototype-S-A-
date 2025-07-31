const express = require('express');
const router = express.Router();
const multer = require('multer');
const { 
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const auth = require('../middleware/auth');
const { rateLimit } = require('../middleware/security');
const { validateProduct } = require('../middleware/validation');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Apply rate limiting to all product routes
const productLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

router.use(productLimiter);

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Protected routes (admin only)
router.post('/', 
  auth.verifyToken, 
  auth.isAdmin, 
  upload.single('image'), 
  validateProduct,  // Add this validation middleware
  createProduct
);
router.put('/:id', 
  auth.verifyToken, 
  auth.isAdmin, 
  upload.single('image'), 
  validateProduct,  // Add this validation middleware
  updateProduct
);
router.delete('/:id', auth.verifyToken, auth.isAdmin, deleteProduct);

module.exports = router;
