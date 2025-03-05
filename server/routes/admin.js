const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Middleware pour vérifier les droits admin
router.use(auth);
router.use(admin);

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    // Initialize default stats
    const defaultStats = {
      totalUsers: 0,
      totalProducts: 0,
      totalOrders: 0,
      revenue: 0,
      recentSales: []
    };

    // Fetch actual data
    const [users, products, orders] = await Promise.all([
      User.countDocuments() || 0,
      Product.countDocuments() || 0,
      Order.countDocuments() || 0
    ]);

    const revenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]).catch(() => [{ total: 0 }]);

    const recentSales = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'username')
      .catch(() => []);

    // Update stats with actual values, using nullish coalescing
    const stats = {
      totalUsers: users ?? defaultStats.totalUsers,
      totalProducts: products ?? defaultStats.totalProducts,
      totalOrders: orders ?? defaultStats.totalOrders,
      revenue: revenue[0]?.total ?? defaultStats.revenue,
      recentSales: recentSales ?? defaultStats.recentSales
    };

    return res.json(stats);
  } catch (err) {
    console.error('Stats error:', err);
    // Return default values with 200 status to prevent frontend errors
    return res.json({
      totalUsers: 0,
      totalProducts: 0,
      totalOrders: 0,
      revenue: 0,
      recentSales: [],
      error: 'Erreur serveur'
    });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error('Users error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get all products with user details
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find()
      .populate('user', 'username email')
      .sort({ createdAt: -1 });
    
    // Format the response with null checks
    const formattedProducts = products.map(product => ({
      _id: product._id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      category: product.category,
      stock: product.stock,
      user: {
        username: product.user?.username || 'Unknown User',
        email: product.user?.email || 'N/A'
      },
      createdAt: product.createdAt
    }));

    res.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Get recent activities
router.get('/activities', async (req, res) => {
  try {
    const [recentOrders, recentUsers, recentProducts] = await Promise.all([
      Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'username'),
      User.find().sort({ createdAt: -1 }).limit(5).select('username createdAt'),
      Product.find().sort({ createdAt: -1 }).limit(5).populate('user', 'username')
    ]);

    const activities = [
      ...recentOrders.map(order => ({
        type: 'order',
        user: order.user?.username || 'Unknown User',
        details: `Nouvelle commande de ${order.total}€`,
        date: order.createdAt
      })),
      ...recentUsers.map(user => ({
        type: 'user',
        user: user?.username || 'Unknown User',
        details: 'Nouvel utilisateur inscrit',
        date: user?.createdAt || new Date()
      })),
      ...recentProducts.map(product => ({
        type: 'product',
        user: product.user?.username || 'Unknown User',
        details: `Nouveau produit: ${product.name || 'Sans nom'}`,
        date: product.createdAt
      }))
    ].sort((a, b) => b.date - a.date).slice(0, 10);

    res.json(activities);
  } catch (err) {
    console.error('Activities error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get top sellers
router.get('/top-sellers', async (req, res) => {
  try {
    const topSellers = await User.find({ isSeller: true })
      .sort({ totalSales: -1 })
      .limit(5)
      .select('username totalSales revenue');
    res.json(topSellers);
  } catch (err) {
    console.error('Top sellers error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Block/unblock user
router.put('/users/:id/block', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({ message: `Utilisateur ${user.isBlocked ? 'bloqué' : 'débloqué'}` });
  } catch (err) {
    console.error('Block user error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    if (user.isAdmin) {
      return res.status(403).json({ message: 'Impossible de supprimer un administrateur' });
    }

    await User.deleteOne({ _id: req.params.id });
    res.json({ message: 'Utilisateur supprimé' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    await Product.deleteOne({ _id: req.params.id });
    
    // Mettre à jour les statistiques du vendeur
    const seller = await User.findById(product.user);
    if (seller) {
      seller.productsCount -= 1;
      await seller.save();
    }

    res.json({ message: 'Produit supprimé' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
