import api from './api';

export const offerService = {
  getActiveOffers: async (params) => {
    return await api.get('/offers', { params });
  },
  getAllOffers: async (params) => {
    return await api.get('/offers/admin', { params });
  },
  createOffer: async (data) => {
    return await api.post('/offers', data);
  },
  updateOffer: async (id, data) => {
    return await api.put(`/offers/${id}`, data);
  },
  toggleStatus: async (id) => {
    return await api.patch(`/offers/${id}/toggle-status`);
  },
  deleteOffer: async (id) => {
    return await api.delete(`/offers/${id}`);
  },
  validateOffer: async (code, bookingAmount, serviceId) => {
    return await api.post('/offers/validate', { code, bookingAmount, serviceId });
  }
};

