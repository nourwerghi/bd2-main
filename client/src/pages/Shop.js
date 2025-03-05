import React, { useEffect, useState } from 'react';
import { Search, ShoppingCart, Home } from 'lucide-react';
import { useCartStore } from '../lib/store';
import { api } from '../lib/api';
import { categories } from '../constants/categories';
import CartModal from '../components/CartModal/CartModal';
import { useNavigate } from 'react-router-dom';
import './Shop.css';

export default function Shop() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const { items, addItem, total, clearCart } = useCartStore();

  useEffect(() => {
    fetchProducts();
  }, [selectedMainCategory, selectedSubCategory, searchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await api.products.getAll(
        selectedMainCategory === 'all' ? undefined : selectedMainCategory,
        selectedSubCategory === 'all' ? undefined : selectedSubCategory,
        searchQuery
      );
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMainCategorySelect = (categoryId) => {
    setSelectedMainCategory(categoryId);
    setSelectedSubCategory('all');
  };

  // Filter products based on selected categories
  const filteredProducts = products.filter(product => {
    if (!product.category || !product.category.main) return false;
    
    if (selectedMainCategory === 'all') return true;
    if (selectedSubCategory === 'all') return product.category.main === selectedMainCategory;
    return product.category.main === selectedMainCategory && product.category.sub === selectedSubCategory;
  });

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
        alert('Order placed successfully! You will receive a confirmation email shortly.');
      } else {
        throw new Error('Failed to process order');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white header-animation">
      {/* Header */}
      <div className="bg-white shadow glass-effect">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 category-button"
              >
                <Home className="w-6 h-6" />
                <span>Accueil</span>
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">Shop</h1>
            </div>
            
            {/* Search and Cart */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 search-input"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              
              <button
                onClick={() => setShowCart(true)}
                className="relative p-2 text-gray-600 hover:text-gray-900 cart-button"
              >
                <ShoppingCart className="w-6 h-6" />
                {items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center cart-count">
                    {items.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Categories */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSelectedMainCategory('all');
                    setSelectedSubCategory('all');
                  }}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    selectedMainCategory === 'all'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  🏷️ All Categories
                  <span className="float-right text-sm text-gray-500">
                    {products.length}
                  </span>
                </button>

                {categories.map((category) => (
                  <div key={category.id} className="space-y-1">
                    <button
                      onClick={() => handleMainCategorySelect(category.name)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        selectedMainCategory === category.name
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {category.icon} {category.name}
                      <span className="float-right text-sm text-gray-500">
                        {products.filter(p => p.category?.main === category.name).length}
                      </span>
                    </button>

                    {selectedMainCategory === category.name && (
                      <div className="ml-4 space-y-1">
                        {category.subcategories.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => setSelectedSubCategory(sub.name)}
                            className={`w-full text-left px-4 py-2 rounded-lg transition-colors text-sm ${
                              selectedSubCategory === sub.name
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {sub.name}
                            <span className="float-right text-sm text-gray-500">
                              {products.filter(p => 
                                p.category?.main === category.name && 
                                p.category?.sub === sub.name
                              ).length}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No products found.</p>
              </div>
            ) : (
              <div className="products-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product._id} className="bg-white rounded-lg shadow-lg overflow-hidden product-card">
                    <div className="aspect-w-3 aspect-h-2">
                      <img
                        src={product.imageUrl || '/placeholder.png'}
                        alt={product.name}
                        className="w-full h-48 object-cover product-image"
                      />
                    </div>
                    <div className="p-4">
                      <div className="mb-2">
                        <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded category-count">
                          {product.category?.main} {product.category?.sub && `› ${product.category.sub}`}
                        </span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">{product.description}</p>
                      <div className="mt-4 flex justify-between items-center">
                        <span className="text-lg font-bold text-blue-600 price-tag">{product.price} TND</span>
                        <button
                          onClick={() => {
                            addItem(product);
                            setShowCart(true);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors add-to-cart-btn"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}