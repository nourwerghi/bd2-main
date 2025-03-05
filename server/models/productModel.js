const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter product name'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Please enter product price'],
    min: 0
  },
  description: {
    type: String,
    required: [true, 'Please enter product description']
  },
  category: {
    type: String,
    required: [true, 'Please select product category'],
    enum: ['electronics', 'clothing', 'books', 'home', 'sports', 'toys', 'beauty', 'automotive', 'jewelry', 'food']
  },
  stock: {
    type: Number,
    required: [true, 'Please enter product stock'],
    min: 0,
    default: 0
  },
  image: {
    type: String,
    required: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);