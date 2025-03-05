import React from 'react';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import PaymentForm from '../PaymentForm/PaymentForm';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../lib/store';

const CartModal = ({ 
  showCart, 
  setShowCart, 
  showPayment, 
  setShowPayment, 
  items, 
  total, 
  handleCheckout,
  handlePaymentSubmit,
  clearCart 
}) => {
  const navigate = useNavigate();
  const { updateQuantity, removeItem } = useCartStore();

  const handleBackToShop = () => {
    setShowCart(false);
    navigate('/user/shop');
  };

  return (
    <>
      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-10 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Shopping Cart</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleBackToShop}
                  className="px-4 py-2 text-blue-600 hover:text-blue-800"
                >
                  Back to Shop
                </button>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Your cart is empty</p>
                <button
                  onClick={handleBackToShop}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
               Continue Shopping   
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.product._id} className="flex items-center justify-between border-b pb-4">
                      <div className="flex items-center space-x-4">
                        <img
                          src={item.product.imageUrl || '/placeholder.png'}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div>
                          <h3 className="font-medium">{item.product.name}</h3>
                          <p className="text-sm text-gray-500">
                            {item.product.category?.main} {item.product.category?.sub && `› ${item.product.category.sub}`}
                          </p>
                          <p className="text-blue-600">{item.product.price} TND</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.product._id, Math.max(0, item.quantity - 1))}
                            className="p-1 text-gray-500 hover:text-gray-700"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                            className="p-1 text-gray-500 hover:text-gray-700"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.product._id)}
                          className="p-1 text-red-500 hover:text-red-700"
                          title="Remove from cart"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-blue-600">{typeof total === 'function' ? total().toFixed(2) : total.toFixed(2)} TND</span>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={handleBackToShop}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={handleCheckout}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-10 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Checkout</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleBackToShop}
                  className="px-4 py-2 text-blue-600 hover:text-blue-800"
                >
                  Back to Shop
                </button>
                <button
                  onClick={() => setShowPayment(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <PaymentForm onSubmit={handlePaymentSubmit} />
          </div>
        </div>
      )}
    </>
  );
};

export default CartModal;
