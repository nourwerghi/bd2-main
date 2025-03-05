const User = require('../models/User');
const Product = require('../models/productModel');
const Order = require('../models/Order');

// Get admin dashboard analytics
exports.getAnalytics = async (req, res) => {
  try {
    // Get total counts
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();
    
    // Get recent products
    const recentProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'username');

    // Get products by category
    const products = await Product.find();
    const productsByCategory = products.reduce((acc, product) => {
      const category = product.category || 'uncategorized';
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category]++;
      return acc;
    }, {});

    // Get total sales
    const totalSales = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$total' }
        }
      }
    ]);

    res.json({
      totalProducts,
      totalUsers,
      totalSales: totalSales[0]?.total || 0,
      recentProducts,
      productsByCategory
    });
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({
      message: 'Error getting analytics',
      error: error.message
    });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await user.remove();
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.isAdmin = req.body.isAdmin;
    await user.save();
    
    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: 'Error updating user role',
      error: error.message
    });
  }
};

// Check admin status
exports.checkStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized as admin' });
    }
    res.json({ message: 'Admin status confirmed' });
  } catch (error) {
    res.status(500).json({
      message: 'Error checking admin status',
      error: error.message
    });
  }
};
