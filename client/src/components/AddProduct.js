import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { api } from '../lib/api';
import { categories } from '../constants/categories';

export default function AddProduct() {
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image: null,
    category: {
      main: 'tech',
      sub: 'smartphones'
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMainCategoryChange = (e) => {
    const mainCategory = e.target.value;
    setProductData(prev => ({
      ...prev,
      category: {
        main: mainCategory,
        sub: '' // Reset subcategory when main category changes
      }
    }));
  };

  const handleSubCategoryChange = (e) => {
    const subCategory = e.target.value;
    setProductData(prev => ({
      ...prev,
      category: {
        ...prev.category,
        sub: subCategory
      }
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Enhanced validation for categories
    if (!productData.category.main) {
      toast.error('Veuillez sélectionner une catégorie principale');
      return;
    }
    if (!productData.category.sub) {
      toast.error('Veuillez sélectionner une sous-catégorie');
      return;
    }

    setIsLoading(true);
    try {
      let imageUrl = '';
      if (productData.image) {
        try {
          const formDataImg = new FormData();
          formDataImg.append('image', productData.image);
          const uploadResponse = await api.upload.image(formDataImg);
          if (uploadResponse && uploadResponse.url) {
            imageUrl = uploadResponse.url;
          }
        } catch (uploadError) {
          console.error('Erreur upload image:', uploadError);
          // Continuer sans image si l'upload échoue
        }
      }

      const productToCreate = {
        name: productData.name,
        description: productData.description,
        price: parseFloat(productData.price),
        stock: parseInt(productData.stock),
        imageUrl: imageUrl,
        category: {
          main: productData.category.main,
          sub: productData.category.sub
        }
      };

      await api.products.create(productToCreate);

      toast.success('Produit ajouté avec succès');
      setImagePreview('');
      setProductData({
        name: '',
        description: '',
        price: '',
        stock: '',
        image: null,
        category: {
          main: '',
          sub: ''
        }
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Erreur lors de l\'ajout du produit');
    } finally {
      setIsLoading(false);
    }
  };

  // Get subcategories for selected main category
  const selectedMainCategory = categories.find(cat => cat.id === productData.category.main);
  const subcategories = selectedMainCategory?.subcategories || [];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Ajouter un nouveau produit</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nom du produit</label>
          <input
            type="text"
            name="name"
            value={productData.name}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={productData.description}
            onChange={handleInputChange}
            required
            rows="4"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Prix (€)</label>
            <input
              type="number"
              name="price"
              value={productData.price}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Stock</label>
            <input
              type="number"
              name="stock"
              value={productData.stock}
              onChange={handleInputChange}
              required
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie principale</label>
            <select
              value={productData.category.main}
              onChange={handleMainCategoryChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
            >
              <option value="">Sélectionnez une catégorie</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sous-catégorie</label>
            <select
              value={productData.category.sub}
              onChange={handleSubCategoryChange}
              required
              disabled={!productData.category.main}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white ${!productData.category.main ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="">Sélectionnez une sous-catégorie</option>
              {subcategories.map(sub => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
            {!productData.category.main && (
              <p className="mt-1 text-sm text-gray-500">Veuillez d'abord sélectionner une catégorie principale</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Image du produit</label>
          <div className="mt-1 flex items-center space-x-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Aperçu"
                className="h-20 w-20 object-cover rounded-md"
              />
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Ajout en cours...' : 'Ajouter le produit'}
        </button>
      </form>
    </div>
  );
}