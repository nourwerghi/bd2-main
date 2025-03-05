import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../lib/api';
import './Navbar.css';
import NotificationButton from './NotificationButton';
import { useCartStore } from '../../lib/store';
import { ShoppingCart } from 'lucide-react';
import CartModal from '../CartModal/CartModal';

const HomeNavbar = ({ user, setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [activeLink, setActiveLink] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const { items, total, clearCart } = useCartStore();

  useEffect(() => {
    let lastScroll = 0;
    const handleScroll = () => {
      const currentScroll = window.pageYOffset;
      setIsVisible(lastScroll > currentScroll || currentScroll < 50);
      setScrollPosition(currentScroll);
      lastScroll = currentScroll;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location]);

  const handleLogout = () => {
    api.auth.logout();
    setUser(null);
    navigate('/');
  };

  const navbarClass = `fixed w-full transition-all duration-300 z-50 ${scrollPosition > 50 ? 'bg-opacity-95 backdrop-blur-md bg-gradient-to-r from-purple-600 to-blue-500 shadow-lg' : 'bg-transparent'} ${isVisible ? 'translate-y-0' : '-translate-y-full'}`;

  const linkClass = (path) =>
    `relative text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:text-purple-200 group ${activeLink === path ? 'text-purple-200' : ''}`;

  const activeLinkIndicator = (path) =>
    activeLink === path && (
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-200 transform scale-x-100 transition-transform duration-300" />
    );

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
      <nav className={navbarClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex-shrink-0 group">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl md:text-3xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 group-hover:from-purple-500 group-hover:to-blue-600 transition-all duration-300">
                Maya
                <span className="text-white group-hover:text-purple-200">Market</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link to="/" className={linkClass('/')}>
                Home
                {activeLinkIndicator('/')}
                <div className="absolute inset-0 bg-white/5 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-md"></div>
              </Link>

              {user ? (
                <>
                  {user.isAdmin ? (
                    <>
                      <Link to="/admin" className={linkClass('/admin')}>
                        Dashboard
                        {activeLinkIndicator('/admin')}
                      </Link>
                      <Link to="/admin/users" className={linkClass('/admin/users')}>
                        Users
                        {activeLinkIndicator('/admin/users')}
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/user/shop" className={linkClass('/user/shop')}>
                        Shop
                        {activeLinkIndicator('/user/shop')}
                      </Link>
                      <button
                        onClick={() => setShowCart(true)}
                        className={`relative px-3 py-2 rounded-md text-sm font-medium text-white hover:text-purple-200 transition-all duration-300`}
                      >
                        <ShoppingCart className="w-6 h-6" />
                        {items.length > 0 && (
                          <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {items.length}
                          </span>
                        )}
                      </button>
                    </>
                  )}
                  
                  {/* User Menu */}
                  <div className="relative ml-3">
                    <div className="flex items-center space-x-3">
                      <NotificationButton />
                      <button
                        type="button"
                        className="group relative"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                      >
                        <div className="absolute inset-0 bg-white rounded-full transform group-hover:scale-110 transition-transform duration-300 opacity-20 blur-lg"></div>
                        <div className="relative h-9 w-9 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold transform group-hover:rotate-12 transition-all duration-300 shadow-lg">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      </button>
                      <span className="text-white text-sm font-medium group-hover:text-purple-200 transition-colors duration-300">
                        {user.username}
                      </span>
                    </div>
                    
                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-1 bg-white/10 backdrop-blur-lg border border-white/20 focus:outline-none z-50 transform transition-all duration-300">
                        <Link
                          to="/user/profile"
                          className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors duration-200"
                        >
                          Your Profile
                        </Link>
                        <Link
                          to="/user"
                          className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors duration-200"
                        >
                          Dashboard
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors duration-200"
                        >
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login" className={linkClass('/login')}>
                    Login
                    {activeLinkIndicator('/login')}
                  </Link>
                  <Link
                    to="/register"
                    className="relative px-4 py-2 rounded-md text-white font-medium overflow-hidden group"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-500 transform group-hover:scale-105 transition-transform duration-300"></span>
                    <span className="relative">Register</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative inline-flex items-center justify-center p-2 rounded-md text-white group"
            >
              <div className="absolute inset-0 bg-white/5 rounded-md transform group-hover:scale-105 transition-transform duration-300"></div>
              <div className="relative flex flex-col space-y-1.5 w-6">
                <span className={`h-0.5 w-full bg-white transform transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`h-0.5 w-full bg-white transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`h-0.5 w-full bg-white transform transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 transform ${isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-gradient-to-r from-purple-600/95 to-blue-500/95 backdrop-blur-md">
          <Link
            to="/"
            className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10 transition-colors duration-200"
          >
            Home
          </Link>
          {user ? (
            <>
              {user.isAdmin ? (
                <>
                  <Link
                    to="/admin"
                    className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10 transition-colors duration-200"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/users"
                    className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10 transition-colors duration-200"
                  >
                    Users
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/user/shop"
                    className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10 transition-colors duration-200"
                  >
                    Shop
                  </Link>
                  <Link
                    to="/user"
                    className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors duration-200"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/user/profile"
                    className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors duration-200"
                  >
                    Your Profile
                  </Link>
                  <button
                    onClick={() => setShowCart(true)}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10 transition-colors duration-200"
                  >
                    Cart ({items.length})
                  </button>
                </>
              )}
              <div className="pt-4 pb-3 border-t border-white/10">
                <div className="flex items-center px-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">{user.username}</div>
                    <NotificationButton />
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Link
                    to="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10 transition-colors duration-200"
                  >
                    Your Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10 transition-colors duration-200"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10 transition-colors duration-200"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="pt-4 pb-3 space-y-1">
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10 transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10 transition-colors duration-200"
              >
                Register
              </Link>
            </div>
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

export default HomeNavbar;
