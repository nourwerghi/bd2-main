const Product = require('../models/Product');
const upload = require('../middleware/upload');

// Get all products with filtering
exports.getAllProducts = async (req, res) => {
  try {
    const { mainCategory, subCategory, search } = req.query;
    let query = {};

    // Build category filter
    if (mainCategory && mainCategory !== 'all') {
      query['category.main'] = mainCategory;
      if (subCategory && subCategory !== 'all') {
        query['category.sub'] = subCategory;
      }
    }

    // Add search filter if present
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
};

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    console.log('Received product data:', req.body); // Debug log

    const { name, description, price, category, stock, imageUrl } = req.body;
    
    // Validation basique des champs
    if (!name || !description || !price || !category || !category.main) {
      return res.status(400).json({
        success: false,
        message: 'Les champs nom, description, prix et catégorie principale sont requis'
      });
    }

    // Création du produit avec les données validées
    const productData = {
      name,
      description,
      price: Number(price),
      category: {
        main: category.main,
        sub: category.sub || ''
      },
      stock: Number(stock) || 0,
      user: req.user._id
    };

    // Ajouter l'URL de l'image si elle existe
    if (imageUrl) {
      productData.imageUrl = imageUrl;
    }

    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Produit créé avec succès',
      product
    });
  } catch (error) {
    console.error('Error in createProduct:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la création du produit'
    });
  }
};

exports.uploadImage = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({
        message: 'Error uploading file',
        error: err
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    try {
      // Update the product with the new image URL
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      product.imageUrl = req.file.filename;
      await product.save();

      res.json({
        success: true,
        imageUrl: req.file.filename,
        fullUrl: `${process.env.API_URL}/uploads/${req.file.filename}`
      });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ message: 'Error updating product', error: error.message });
    }
  });
};