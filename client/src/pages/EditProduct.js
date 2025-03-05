import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { toast } from 'react-hot-toast';
import { categories } from '../constants/categories';
import { Home } from 'lucide-react';
import './AddProduct.css';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
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

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.products.getById(id);
        if (response.success) {
          const product = response.data;
          setFormData({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            stock: product.stock.toString(),
            category: {
              main: product.category.main,
              sub: product.category.sub || ''
            }
          });
          if (product.imageUrl) {
            setImagePreview(product.imageUrl);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Erreur lors du chargement du produit');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

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

      const productToUpdate = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: {
          main: formData.category.main,
          sub: formData.category.sub
        }
      };

      // Si une nouvelle image est sélectionnée, l'uploader d'abord
      if (formData.image) {
        try {
          const formDataImg = new FormData();
          formDataImg.append('image', formData.image);
          const uploadResponse = await api.upload.image(formDataImg);
          if (uploadResponse && uploadResponse.url) {
            productToUpdate.imageUrl = uploadResponse.url;
          }
        } catch (uploadError) {
          console.error('Erreur upload image:', uploadError);
          // Continuer sans image si l'upload échoue
        }
      }

      const response = await api.products.update(id, productToUpdate);
      
      if (response.success) {
        toast.success('Produit modifié avec succès');
        // Navigate to shop page after successful edit
        navigate('/user/shop');
      } else {
        throw new Error(response.message || 'Erreur lors de la modification du produit');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors de la modification du produit');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="add-product-container">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/user/shop')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <Home className="w-6 h-6" />
          <span>Retour à la boutique</span>
        </button>
        <h2 className="text-2xl font-semibold">Modifier le produit</h2>
        <div className="w-24"></div>
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
          {loading ? 'Modification en cours...' : 'Modifier le produit'}
        </button>
      </form>
    </div>
  );
};

export default EditProduct;
