import api from './api';

export const customerService = {
  /**
   * Fetch customer's favorited services
   */
  getFavorites: async () => {
    return await api.get('/users/favorites');
  },

  /**
   * Toggle favorite service
   * @param {string} serviceId
   */
  toggleFavorite: async (serviceId) => {
    return await api.post(`/users/favorites/${serviceId}`);
  },

  /**
   * Fetch reviews submitted by the customer
   */
  getMyReviews: async () => {
    return await api.get('/reviews/my');
  },

  /**
   * Fetch completed appointments pending review
   */
  getPendingReviews: async () => {
    return await api.get('/reviews/pending');
  },

  /**
   * Submit a new rating & review for a completed appointment
   * @param {Object} reviewData - { appointmentId, rating, comment }
   */
  createReview: async (reviewData) => {
    return await api.post('/reviews', reviewData);
  }
};

