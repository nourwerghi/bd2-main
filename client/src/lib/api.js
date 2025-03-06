import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => localStorage.getItem('token');

// Helper function to get current user
const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Helper function to set auth token
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Initialize token if it exists
const token = getAuthToken();
if (token) {
  setAuthToken(token);
}

const api = {
  setAuthToken,
  
  // Add base HTTP methods
  async get(url, config = {}) {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${BASE_URL}${url}`, {
        ...config,
        headers: {
          ...config.headers,
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`GET ${url} error:`, error.response?.data || error);
      throw error.response?.data || { message: 'An error occurred while fetching data' };
    }
  },

  async post(url, data, config = {}) {
    try {
      const token = getAuthToken();
      const response = await axios.post(`${BASE_URL}${url}`, data, {
        ...config,
        headers: {
          ...config.headers,
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`POST ${url} error:`, error.response?.data || error);
      throw error.response?.data || { message: 'An error occurred while sending data' };
    }
  },

  async put(url, data, config = {}) {
    try {
      const token = getAuthToken();
      const response = await axios.put(`${BASE_URL}${url}`, data, {
        ...config,
        headers: {
          ...config.headers,
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`PUT ${url} error:`, error.response?.data || error);
      throw error.response?.data || { message: 'An error occurred while updating data' };
    }
  },

  async delete(url, config = {}) {
    try {
      const token = getAuthToken();
      const response = await axios.delete(`${BASE_URL}${url}`, {
        ...config,
        headers: {
          ...config.headers,
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`DELETE ${url} error:`, error.response?.data || error);
      throw error.response?.data || { message: 'An error occurred while deleting data' };
    }
  },
  
  auth: {
    login: async (credentials) => {
      try {
        console.log('Attempting login with:', credentials);
        const response = await axios.post(`${BASE_URL}/auth/login`, credentials);
        console.log('Login response:', response.data);
        
        if (response.data.success) {
          // Set token for future requests
          setAuthToken(response.data.token);
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        return response.data;
      } catch (error) {
        console.error('Login error:', error.response?.data || error);
        throw error.response?.data || { message: 'Une erreur est survenue lors de la connexion' };
      }
    },

    register: async (userData) => {
      try {
        const response = await axios.post(`${BASE_URL}/auth/register`, userData);
        
        if (response.data.success) {
          // Set token for future requests
          setAuthToken(response.data.token);
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        return response.data;
      } catch (error) {
        console.error('Register error:', error.response?.data || error);
        throw error.response?.data || { message: 'Une erreur est survenue lors de l\'inscription' };
      }
    },

    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setAuthToken(null);
    },

    getProfile: async () => {
      try {
        const token = getAuthToken();
        const response = await axios.get(`${BASE_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        return { success: true, data: response.data };
      } catch (error) {
        console.error('Get profile error:', error.response?.data || error);
        throw error.response?.data || { message: 'Une erreur est survenue lors de la récupération du profil' };
      }
    },

    updateProfile: async (userData) => {
      try {
        const token = getAuthToken();
        const response = await axios.put(`${BASE_URL}/auth/profile`, userData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        return { success: true, data: response.data };
      } catch (error) {
        console.error('Update profile error:', error.response?.data || error);
        throw error.response?.data || { message: 'Une erreur est survenue lors de la mise à jour du profil' };
      }
    },
    
    getCurrentUser: () => getCurrentUser(),
    getCurrentUserId: () => {
      const user = getCurrentUser();
      return user ? user._id : null;
    },
  },
  
  users: {
    becomeSeller: async () => {
      try {
        const token = getAuthToken();
        const response = await axios.put(`${BASE_URL}/users/become-seller`, null, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.data) {
          // Mettre à jour les informations de l'utilisateur dans le localStorage
          const currentUser = JSON.parse(localStorage.getItem('user'));
          const updatedUser = { ...currentUser, isSeller: true };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        return response.data;
      } catch (error) {
        console.error('Become seller error:', error.response?.data || error);
        throw error.response?.data || { message: 'Une erreur est survenue lors de la demande pour devenir vendeur' };
      }
    }
  },
  
  upload: {
    image: async (formData) => {
      try {
        const token = getAuthToken();
        const response = await axios.post(`${BASE_URL}/upload/image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });
        return response.data;
      } catch (error) {
        console.error('Image upload error:', error.response?.data || error);
        throw error.response?.data || { message: 'Une erreur est survenue lors du téléchargement de l\'image' };
      }
    }
  },
  
  products: {
    getById: async (productId) => {
      try {
        const token = getAuthToken();
        const response = await axios.get(`${BASE_URL}/products/${productId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        return response.data;
      } catch (error) {
        console.error('Get product by id error:', error.response?.data || error);
        throw error.response?.data || { message: 'Une erreur est survenue lors de la récupération du produit' };
      }
    },
    getAll: async (mainCategory, subCategory, searchQuery) => {
      let url = `${BASE_URL}/products`;
      const params = new URLSearchParams();
      
      if (mainCategory) params.append('mainCategory', mainCategory);
      if (subCategory) params.append('subCategory', subCategory);
      if (searchQuery) params.append('search', searchQuery);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      try {
        const token = getAuthToken();
        const response = await axios.get(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        return response.data;
      } catch (error) {
        console.error('Get all products error:', error.response?.data || error);
        throw error.response?.data || { message: 'Une erreur est survenue lors de la récupération des produits' };
      }
    },

    getByUser: async () => {
      try {
        const token = getAuthToken();
        const response = await axios.get(`${BASE_URL}/products/user`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        return response.data;
      } catch (error) {
        console.error('Get products by user error:', error.response?.data || error);
        throw error.response?.data || { message: 'Une erreur est survenue lors de la récupération des produits de l\'utilisateur' };
      }
    },

    create: async (productData) => {
      try {
        const token = getAuthToken();
        const response = await axios.post(`${BASE_URL}/products`, productData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        return response.data;
      } catch (error) {
        console.error('Create product error:', error.response?.data || error);
        throw error.response?.data || { message: 'Une erreur est survenue lors de la création du produit' };
      }
    },

    update: async (productId, productData) => {
      try {
        const token = getAuthToken();
        const response = await axios.put(`${BASE_URL}/products/${productId}`, productData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        return response.data;
      } catch (error) {
        console.error('Update product error:', error.response?.data || error);
        throw error.response?.data || { message: 'Une erreur est survenue lors de la mise à jour du produit' };
      }
    },

    delete: async (productId) => {
      try {
        const token = getAuthToken();
        const response = await axios.delete(`${BASE_URL}/products/${productId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        return response.data;
      } catch (error) {
        console.error('Delete product error:', error.response?.data || error);
        throw error.response?.data || { message: 'Une erreur est survenue lors de la suppression du produit' };
      }
    }
  },
  
  admin: {
    // Statistiques générales
    getStats: async () => {
      try {
        const token = getAuthToken();
        const response = await axios.get(`${BASE_URL}/admin/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        return { data: response.data }; 
      } catch (error) {
        console.error('Get stats error:', error.response?.data || error);
        throw error.response?.data || { message: 'Une erreur est survenue lors de la récupération des statistiques' };
      }
    },

    // Gestion des utilisateurs
    getUsers: async () => {
      try {
        const token = getAuthToken();
        return await axios.get(`${BASE_URL}/admin/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('Get users error:', error.response?.data || error);
        throw error.response?.data || { message: 'Une erreur est survenue lors de la récupération des utilisateurs' };
      }
    },

    blockUser: async (userId) => {
      try {
        const token = getAuthToken();
        return await axios.put(`${BASE_URL}/admin/users/${userId}/block`, null, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('Block user error:', error.response?.data || error);
        throw error.response?.data || { message: 'Une erreur est survenue lors de la mise en attente de l\'utilisateur' };
      }
    },

    deleteUser: async (userId) => {
      try {
        const token = getAuthToken();
        return await axios.delete(`${BASE_URL}/admin/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('Delete user error:', error.response?.data || error);
        throw error.response?.data || { message: 'Une erreur est survenue lors de la suppression de l\'utilisateur' };
      }
    },

    // Gestion des produits
    getProducts: async () => {
      try {
        const token = getAuthToken();
        return await axios.get(`${BASE_URL}/admin/products`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('Get products error:', error.response?.data || error);
        throw error.response?.data || { message: 'Une erreur est survenue lors de la récupération des produits' };
      }
    },

    addProduct: async (formData) => {
      try {
        const token = getAuthToken();
        const response = await axios.post(`${BASE_URL}/products`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });
        return response.data;
      } catch (error) {
        console.error('Add product error:', error.response?.data || error);
        throw error.response?.data || { message: 'Une erreur est survenue lors de l\'ajout du produit' };
      }
    },

    deleteProduct: async (productId) => {
      try {
        const token = getAuthToken();
        return await axios.delete(`${BASE_URL}/admin/products/${productId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('Delete product error:', error.response?.data || error);
        throw error.response?.data || { message: 'Une erreur est survenue lors de la suppression du produit' };
      }
    },

    // Meilleurs vendeurs
    getTopSellers: async () => {
      try {
        const token = getAuthToken();
        return await axios.get(`${BASE_URL}/admin/top-sellers`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('Get top sellers error:', error.response?.data || error);
        throw error.response?.data || { message: 'Une erreur est survenue lors de la récupération des meilleurs vendeurs' };
      }
    },

    // Activités récentes
    getActivities: async () => {
      try {
        const token = getAuthToken();
        return await axios.get(`${BASE_URL}/admin/activities`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('Get activities error:', error.response?.data || error);
        throw error.response?.data || { message: 'Une erreur est survenue lors de la récupération des activités récentes' };
      }
    }
  }
};

export { api };