import axios from 'axios';

const API_URL = 'http://localhost:3001/api'; // Your backend is using /api prefix

const authService = {
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/users/login`, {
        email,
        password
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to login';
    }
  },

  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/users/register`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to register';
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await axios.post(`${API_URL}/users/forgot-password`, { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error.response || error);
      throw error.response?.data?.message || 'Failed to process forgot password request';
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      const response = await axios.post(`${API_URL}/users/reset-password`, {
        token,
        password: newPassword
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to reset password';
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

// Add axios interceptor to handle token
axios.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default authService; 