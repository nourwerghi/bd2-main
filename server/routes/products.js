const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query).populate('user', 'username');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get user's products
router.get('/user', auth, async (req, res) => {
  try {
    const products = await Product.find({ user: req.user._id });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Create product
router.post('/', auth, async (req, res) => {
  try {
    if (!req.user.isSeller && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Vous devez être vendeur ou administrateur pour créer un produit' });
    }

    // Validate category data
    const mainCategory = req.body.category?.main || req.body.mainCategory;
    const subCategory = req.body.category?.sub || req.body.subCategory;

    if (!mainCategory) {
      return res.status(400).json({ message: 'La catégorie principale est requise' });
    }

    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: {
        main: mainCategory,
        sub: subCategory || ''
      },
      stock: req.body.stock || 0,
      imageUrl: req.body.imageUrl || 'placeholder.png',
      user: req.user._id
    });

    await product.save();

    // Mettre à jour les statistiques du vendeur
    if (req.user.isSeller) {
      req.user.productsCount += 1;
      await req.user.save();
    }

    res.status(201).json(product);
  } catch (err) {
    console.error('Erreur création produit:', err);
    res.status(500).json({ message: 'Erreur serveur: ' + err.message });
  }
});

// Update product
router.put('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    Object.assign(product, req.body);
    await product.save();

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Delete product
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    await Product.deleteOne({ _id: req.params.id });

    // Mettre à jour les statistiques du vendeur
    req.user.productsCount -= 1;
    await req.user.save();

    res.json({ message: 'Produit supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
