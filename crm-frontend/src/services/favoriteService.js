import api from '../api/api';

const favoriteService = {
  getFavorites: async () => {
    try {
      const response = await api.get('/users/favorites');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch favorites';
    }
  },

  addToFavorites: async (propertyId) => {
    try {
      const response = await api.post('/users/favorites', { propertyId });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to add to favorites';
    }
  },

  removeFromFavorites: async (propertyId) => {
    try {
      const response = await api.delete(`/users/favorites/${propertyId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to remove from favorites';
    }
  },

  isFavorite: async (propertyId) => {
    try {
      const response = await api.get(`/users/favorites/${propertyId}`);
      return response.data.isFavorite;
    } catch (error) {
      return false;
    }
  }
};

export default favoriteService; 