import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';
import Navbar from './components/Navbar/Navbar';
import PrivateRoute from './components/routes/PrivateRoute';
import AdminRoute from './components/routes/AdminRoute';
import ReclamationForm from './components/ReclamationForm/ReclamationForm';
import ReclamationList from './components/ReclamationList/ReclamationList';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Shop from './pages/Shop';
import Profile from './pages/Profile';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import { api } from './lib/api';

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Set token in axios defaults
          api.setAuthToken(token);
          
          const user = JSON.parse(localStorage.getItem('user'));
          if (user) {
            setUser(user);
          } else {
            throw new Error('User data not found');
          }
        }
      } catch (error) {
        console.error('Authentication error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <NotificationProvider>
      <div>
      {location.pathname !== '/' && <Navbar user={user} setUser={setUser} />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home user={user} setUser={setUser} />} />
        <Route 
          path="/login" 
          element={user ? <Navigate to={user.isAdmin ? "/admin" : "/"} /> : <Login setUser={setUser} />} 
        />
        <Route 
          path="/register" 
          element={user ? <Navigate to="/" /> : <Register />} 
        />
        
        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <Routes>
                <Route index element={<AdminDashboard />} />
                {/* Add more admin routes here */}
              </Routes>
            </AdminRoute>
          }
        />
        
        {/* User Routes */}
        <Route
          path="/user/*"
          element={
            <PrivateRoute>
              <Routes>
                <Route index element={<Dashboard />} />
                <Route path="shop" element={<Shop />} />
                <Route path="add-product" element={<AddProduct />} />
                <Route path="edit-product/:id" element={<EditProduct />} />
                <Route path="profile" element={<Profile />} />
                <Route path="reclamation" element={<>
                  <ReclamationForm />
                  <div className="mt-8">
                    <ReclamationList />
                  </div>
                </>} />
                {/* Add more user routes here */}
              </Routes>
            </PrivateRoute>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
    </NotificationProvider>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;