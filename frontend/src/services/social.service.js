import api from './api';

export const socialService = {
  // Public: Get all active, admin-configured platforms
  getActiveSocialLinks: async () => {
    return await api.get('/social-links');
  },

  // Admin: Get all platforms (active and inactive)
  getAllSocialLinks: async () => {
    return await api.get('/social-links/admin');
  },

  // Admin: Add new social platform configuration
  createSocialLink: async (data) => {
    return await api.post('/social-links', data);
  },

  // Admin: Update existing platform configuration
  updateSocialLink: async (id, data) => {
    return await api.put(`/social-links/${id}`, data);
  },

  // Admin: Quick toggle enable/disable
  toggleSocialLinkStatus: async (id) => {
    return await api.patch(`/social-links/${id}/toggle`);
  },

  // Admin: Reorder platforms in batch
  reorderSocialLinks: async (items) => {
    return await api.patch('/social-links/reorder', { items });
  },

  // Admin: Delete platform
  deleteSocialLink: async (id) => {
    return await api.delete(`/social-links/${id}`);
  }
};

export default socialService;
