import axios from 'axios';

const BASE_URL = 'http://localhost:4990/api';

export const auth = {
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  login: async (email, password) => {
    try {
      const response = await axios.post(`${BASE_URL}/users/login`, {
        email,
        password,
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  register: async (email, password) => {
    try {
      const response = await axios.post(`${BASE_URL}/users/register`, {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  checkAdmin: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const response = await axios.get(`${BASE_URL}/users/admin/check`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.isAdmin;
    } catch (error) {
      return false;
    }
  }
};