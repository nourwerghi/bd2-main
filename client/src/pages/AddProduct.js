import React, { useState } from 'react';
import { api } from '../lib/api';
import { toast } from 'react-hot-toast';
import { categories } from '../constants/categories';
import CartModal from '../components/CartModal/CartModal';
import { useCartStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import './AddProduct.css';

const AddProduct = ({ onProductAdded }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const { items, total, clearCart } = useCartStore();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '0.00',
    stock: '1',
    category: {
      main: '',
      sub: ''
    },
    image: null
  });
  const [imagePreview, setImagePreview] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMainCategoryChange = (e) => {
    setFormData(prev => ({
      ...prev,
      category: {
        ...prev.category,
        main: e.target.value,
        sub: ''
      }
    }));
  };

  const handleSubCategoryChange = (e) => {
    setFormData(prev => ({
      ...prev,
      category: {
        ...prev.category,
        sub: e.target.value
      }
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.price || !formData.stock || !formData.category.main) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }

    try {
      setLoading(true);

      // Trouver les noms des catégories sélectionnées
      const selectedMainCategory = categories.find(cat => cat.name === formData.category.main);
      const selectedSubCategory = selectedMainCategory?.subcategories.find(sub => sub.name === formData.category.sub);

      const productToCreate = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: {
          main: selectedMainCategory?.name || '',
          sub: selectedSubCategory?.name || ''
        }
      };

      // Si une image est sélectionnée, l'uploader d'abord
      if (formData.image) {
        try {
          const formDataImg = new FormData();
          formDataImg.append('image', formData.image);
          const uploadResponse = await api.upload.image(formDataImg);
          if (uploadResponse && uploadResponse.url) {
            productToCreate.imageUrl = uploadResponse.url;
          }
        } catch (uploadError) {
          console.error('Erreur upload image:', uploadError);
          // Continuer sans image si l'upload échoue
        }
      }

      const response = await api.products.create(productToCreate);
      
      if (response.success) {
        toast.success('Produit ajouté avec succès');
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          price: '0.00',
          stock: '1',
          category: {
            main: '',
            sub: ''
          },
          image: null
        });
        setImagePreview('');
        
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
        
        // Notify parent component
        if (onProductAdded) {
          onProductAdded();
        }

        // Ne pas rediriger l'utilisateur
        // navigate('/user');
      } else {
        throw new Error(response.message || 'Erreur lors de l\'ajout du produit');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors de l\'ajout du produit');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    setShowCart(false);
    setShowPayment(true);
  };

  const handlePaymentSubmit = async (paymentData) => {
    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.product._id,
          quantity: item.quantity,
          price: item.product.price
        })),
        total: total(),
        paymentMethod: paymentData.paymentMethod,
        deliveryAddress: paymentData.formData.deliveryAddress,
        city: paymentData.formData.city,
        postalCode: paymentData.formData.postalCode,
        phone: paymentData.formData.phone
      };

      const response = await api.orders.create(orderData);

      if (response.success) {
        setShowPayment(false);
        clearCart();
        toast.success('Order placed successfully! You will receive a confirmation email shortly.');
      } else {
        throw new Error('Failed to process order');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    }
  };

  return (
    <div className="add-product-container">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <Home className="w-6 h-6" />
          <span>Retour à l'accueil</span>
        </button>
        <h2 className="text-2xl font-semibold">Ajouter un nouveau produit</h2>
        <div className="w-24"></div> {/* Pour centrer le titre */}
      </div>

      <form onSubmit={handleSubmit} className="add-product-form">
        <div className="form-group">
          <label htmlFor="name">Nom du produit</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">Prix (dt)</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="stock">Stock</label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={formData.stock}
            onChange={handleInputChange}
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="main-category">Catégorie principale</label>
          <select
            id="main-category"
            value={formData.category.main}
            onChange={handleMainCategoryChange}
            required
          >
            <option value="">Sélectionnez une catégorie</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {formData.category.main && (
          <div className="form-group">
            <label htmlFor="sub-category">Sous-catégorie</label>
            <select
              id="sub-category"
              value={formData.category.sub}
              onChange={handleSubCategoryChange}
            >
              <option value="">Sélectionnez une sous-catégorie</option>
              {categories
                .find((cat) => cat.name === formData.category.main)
                ?.subcategories.map((sub) => (
                  <option key={sub.id} value={sub.name}>
                    {sub.name}
                  </option>
                ))}
            </select>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="image">Image</label>
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleImageChange}
            accept="image/*"
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="mt-2 w-32 h-32 object-cover rounded"
            />
          )}
        </div>

        <button 
          type="submit" 
          className="submit-button" 
          disabled={loading}
        >
          {loading ? 'Ajout en cours...' : 'Ajouter le produit'}
        </button>
      </form>

      <CartModal
        showCart={showCart}
        setShowCart={setShowCart}
        showPayment={showPayment}
        setShowPayment={setShowPayment}
        items={items}
        total={total}
        handleCheckout={handleCheckout}
        handlePaymentSubmit={handlePaymentSubmit}
      />
    </div>
  );
};

export default AddProduct;