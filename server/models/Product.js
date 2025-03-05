const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  category: {
    main: { type: String, required: true },
    sub: { type: String, default: '' }
  },
  imageUrl: { type: String, default: 'placeholder.png' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

// Validate and transform image URL
productSchema.methods.toJSON = function() {
  const obj = this.toObject();
  const apiUrl = process.env.API_URL || 'http://localhost:5000';
  
  if (!obj.imageUrl || obj.imageUrl === 'placeholder.png') {
    obj.imageUrl = `${apiUrl}/placeholder.png`;
  } else if (!obj.imageUrl.startsWith('http')) {
    const imagePath = obj.imageUrl.startsWith('/') ? obj.imageUrl.substring(1) : obj.imageUrl;
    obj.imageUrl = `${apiUrl}/uploads/${imagePath}`;
  }

  return obj;
};

module.exports = mongoose.model('Product', productSchema);