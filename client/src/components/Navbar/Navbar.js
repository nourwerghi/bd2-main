import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../lib/api';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '../../lib/store';
import CartModal from '../CartModal/CartModal';
import { toast } from 'react-hot-toast';
import './Navbar.css';

const Navbar = ({ user, setUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [showCart, setShowCart] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const { items, total, clearCart } = useCartStore();

  const isHomePage = location.pathname === '/';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
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
    <>
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isHomePage ? 'bg-transparent' : 'bg-white shadow-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link
              to="/"
              className={`flex items-center font-bold text-xl ${
                isHomePage ? 'text-white' : 'text-gray-900'
              }`}
            >
              Mayamarket
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {user ? (
              <>
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isHomePage
                      ? 'text-white hover:bg-white/10'
                      : 'text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/user/shop"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isHomePage
                      ? 'text-white hover:bg-white/10'
                      : 'text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Shop
                </Link>
                <button
                  onClick={() => setShowCart(true)}
                  className={`relative px-3 py-2 rounded-md text-sm font-medium ${
                    isHomePage
                      ? 'text-white hover:bg-white/10'
                      : 'text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <ShoppingCart className="w-6 h-6" />
                  {items.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {items.length}
                    </span>
                  )}
                </button>
                {user.isAdmin && (
                  <Link
                    to="/admin"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isHomePage
                        ? 'text-white hover:bg-white/10'
                        : 'text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Admin
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isHomePage
                      ? 'text-white hover:bg-white/10'
                      : 'text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isHomePage
                      ? 'text-white hover:bg-white/10'
                      : 'text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md ${
                isHomePage ? 'text-white' : 'text-gray-900'
              } hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white`}
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden bg-white`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {user ? (
            <>
              <Link
                to="/"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100"
              >
                Home
              </Link>
              <Link
                to="/user/shop"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100"
              >
                Shop
              </Link>
              {user.isAdmin && (
                <Link
                  to="/admin"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
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
    </>
  );
};

export default Navbar;
{/* Add Home link to mobile menu */}
<>
  <Link
    to="/"
    className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100"
  >
    Home
  </Link>
  <Link
    to="/user/shop"
    className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100"
  >
    Shop
  </Link>
</>