import api from './api';

export const adminService = {
  /**
   * Fetch executive dashboard analytics & revenue charts
   */
  getDashboardAnalytics: async () => {
    return await api.get('/analytics/dashboard');
  },

  /**
   * Fetch all registered customers / users
   * @param {Object} params - { role, search, page, limit }
   */
  getAllUsers: async (params = {}) => {
    return await api.get('/users', { params });
  },

  /**
   * Toggle user account active status
   * @param {string} id
   */
  toggleUserStatus: async (id) => {
    return await api.put(`/users/${id}/status`);
  },

  /**
   * Delete user account
   * @param {string} id
   */
  deleteUser: async (id) => {
    return await api.delete(`/users/${id}`);
  }
};
