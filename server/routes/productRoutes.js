const express = require('express');
const router = express.Router();
const { createProduct, getAllProducts, getUserProducts, deleteProduct, uploadImage } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getAllProducts); // Public route to get all products
router.post('/', protect, createProduct);
router.get('/user', protect, getUserProducts);
router.delete('/:id', protect, deleteProduct);
router.post('/upload', protect, uploadImage);

module.exports = router;