import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('API Interceptor - Token:', token ? 'Token exists' : 'No token found');
  
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
    console.log('API Interceptor - Headers:', {
      ...config.headers,
      Authorization: 'Bearer [REDACTED]'
    });
  } else {
    console.warn('API Interceptor - No token found in localStorage');
  }
  return config;
}, (error) => {
  console.error('API Interceptor - Request Error:', error);
  return Promise.reject(error);
});

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers
    });
    return Promise.reject(error);
  }
);

export default api;
