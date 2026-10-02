import api from './api';

export const reviewService = {
  getPublicReviews: async (params) => {
    return await api.get('/reviews', { params });
  },
  getMyReviews: async () => {
    return await api.get('/reviews/my');
  },
  getPendingReviews: async () => {
    return await api.get('/reviews/pending');
  },
  getAdminReviews: async (params) => {
    return await api.get('/reviews/admin', { params });
  },
  createReview: async (data) => {
    return await api.post('/reviews', data);
  },
  toggleApproval: async (id) => {
    return await api.put(`/reviews/${id}/approval`);
  },
  deleteReview: async (id) => {
    return await api.delete(`/reviews/${id}`);
  }
};

