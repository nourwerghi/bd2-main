import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import AddProduct from './AddProduct';
import ProductImage from '../components/ProductImage/ProductImage';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0,
    recentSales: []
  });

  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [topSellers, setTopSellers] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, usersData, productsData, activitiesData, sellersData] = await Promise.all([
          api.admin.getStats(),
          api.admin.getUsers(),
          api.admin.getProducts(),
          api.admin.getActivities(),
          api.admin.getTopSellers()
        ]);

        setStats(statsData.data);
        setUsers(usersData.data);
        setProducts(productsData.data);
        setRecentActivities(activitiesData.data);
        setTopSellers(sellersData.data);
        setLoading(false);
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleBlockUser = async (userId) => {
    try {
      await api.admin.blockUser(userId);
      setUsers(users.map(user => 
        user._id === userId ? { ...user, isBlocked: !user.isBlocked } : user
      ));
    } catch (err) {
      console.error('Error blocking user:', err);
      setError('Failed to block user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await api.admin.deleteUser(userId);
        setUsers(users.filter(user => user._id !== userId));
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user');
      }
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await api.admin.deleteProduct(productId);
        setProducts(products.filter(product => product._id !== productId));
      } catch (err) {
        console.error('Error deleting product:', err);
        setError('Failed to delete product');
      }
    }
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const renderOverview = () => (
    <div className="overview">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Utilisateurs</h3>
          <p>{stats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Produits</h3>
          <p>{stats.totalProducts}</p>
        </div>
        <div className="stat-card">
          <h3>Commandes</h3>
          <p>{stats.totalOrders}</p>
        </div>
        <div className="stat-card">
          <h3>Revenus</h3>
          <p>{stats.revenue}TND</p>
        </div>
      </div>

      <div className="recent-sales">
        <h3>Ventes Récentes</h3>
        <ul>
          {stats.recentSales.map(sale => (
            <li key={sale._id}>
              Commande par {sale.user.username} - {sale.total}TND
            </li>
          ))}
        </ul>
      </div>

      <div className="top-sellers">
        <h3>Meilleurs Vendeurs</h3>
        <ul>
          {topSellers.map(seller => (
            <li key={seller._id}>
              {seller.username} - {seller.totalSales} ventes - {seller.revenue}TND
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="users">
      <h3>Gestion des Utilisateurs</h3>
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Type</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.isSeller ? 'Vendeur' : 'Client'}</td>
              <td>{user.isBlocked ? 'Bloqué' : 'Actif'}</td>
              <td>
                <button onClick={() => handleBlockUser(user._id)}>
                  {user.isBlocked ? 'Débloquer' : 'Bloquer'}
                </button>
                {!user.isAdmin && (
                  <button onClick={() => handleDeleteUser(user._id)}>Supprimer</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderProducts = () => (
    <div className="products">
      <div className="products-header">
        <h3>Gestion des Produits</h3>
        <button 
          className="add-product-btn"
          onClick={() => setActiveTab('addProduct')}
        >
          Ajouter un Produit
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Image</th>
            <th>Nom</th>
            <th>Prix</th>
            <th>Vendeur</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product._id}>
              <td>
                <div className="product-image">
                  <ProductImage
                    imageUrl={product.imageUrl}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
              </td>
              <td>{product.name}</td>
              <td>{product.price}TND</td>
              <td>{product.user.username}</td>
              <td>
                <button onClick={() => handleDeleteProduct(product._id)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderActivities = () => (
    <div className="activities">
      <h3>Activités Récentes</h3>
      <ul>
        {recentActivities.map((activity, index) => (
          <li key={index} className={`activity-${activity.type}`}>
            <span className="activity-user">{activity.user}</span>
            <span className="activity-details">{activity.details}</span>
            <span className="activity-date">
              {new Date(activity.date).toLocaleDateString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="admin-dashboard">
      <h2>Tableau de Bord Administrateur</h2>
      
      <div className="tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''} 
          onClick={() => setActiveTab('overview')}
        >
          Vue d'ensemble
        </button>
        <button 
          className={activeTab === 'users' ? 'active' : ''} 
          onClick={() => setActiveTab('users')}
        >
          Utilisateurs
        </button>
        <button 
          className={activeTab === 'products' ? 'active' : ''} 
          onClick={() => setActiveTab('products')}
        >
          Produits
        </button>
        <button 
          className={activeTab === 'addProduct' ? 'active' : ''} 
          onClick={() => setActiveTab('addProduct')}
        >
          Ajouter un Produit
        </button>
        <button 
          className={activeTab === 'activities' ? 'active' : ''} 
          onClick={() => setActiveTab('activities')}
        >
          Activités
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'products' && renderProducts()}
        {activeTab === 'addProduct' && <AddProduct />}
        {activeTab === 'activities' && renderActivities()}
      </div>
    </div>
  );
};

export default AdminDashboard;