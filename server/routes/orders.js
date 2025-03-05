const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendOrderNotification } = require('../utils/emailService');
const Notification = require('../models/Notification');

// Create order
router.post('/', auth, async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    // Calculer le total et vérifier le stock
    let total = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: 'Produit non trouvé' });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: 'Stock insuffisant' });
      }
      total += product.price * item.quantity;
    }

    // Créer la commande
    const order = new Order({
      user: req.user._id,
      items,
      total,
      shippingAddress
    });

    await order.save();

    // Récupérer le top admin
    const topAdmin = await User.findOne({ isTopAdmin: true });
    
    // Préparer les détails de la commande pour la notification
    const orderDetails = items.map(item => `${item.quantity}x ${item.product.name}`).join('\n');
    const shippingInfo = `Adresse de livraison:\n${shippingAddress.street}\n${shippingAddress.city}, ${shippingAddress.postalCode}`;

    // Envoyer la notification détaillée au top admin
    const adminNotification = {
      sender: req.user._id,
      recipient: topAdmin._id,
      title: 'Nouvelle commande en attente',
      message: `Nouvelle commande de ${req.user.username}\n\nDétails de la commande:\n${orderDetails}\n\nTotal: ${total}€\n\n${shippingInfo}`,
      type: 'alert'
    };
    await Notification.create(adminNotification);

    // Marquer la commande comme en attente d'approbation
    order.status = 'En attente';
    await order.save();

    // Send email notification to admin
    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'username')
      .populate('items.product', 'name');
    await sendOrderNotification(populatedOrder);

    // Mettre à jour le stock et les statistiques des vendeurs
    for (const item of items) {
      const product = await Product.findById(item.product);
      product.stock -= item.quantity;
      await product.save();

      // Mettre à jour les statistiques du vendeur
      const seller = await User.findById(product.user);
      seller.totalSales += item.quantity;
      seller.revenue += product.price * item.quantity;
      await seller.save();
    }

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get user's orders
router.get('/user', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get seller's orders
router.get('/seller', auth, async (req, res) => {
  try {
    if (!req.user.isSeller) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const orders = await Order.find({
      'items.product': { $in: await Product.find({ user: req.user._id }).select('_id') }
    })
      .populate('user', 'username')
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Update order status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    // Vérifier que l'utilisateur est le vendeur d'au moins un produit de la commande
    const userProducts = await Product.find({ user: req.user._id }).select('_id');
    const hasProduct = order.items.some(item => 
      userProducts.some(product => product._id.equals(item.product))
    );

    if (!hasProduct && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
