import api from './api';

export const staffService = {
  /**
   * Fetch staff list with optional query filters
   * @param {Object} params - { specialization, serviceId, status, search, includeInactive }
   */
  getStaff: async (params = {}) => {
    return await api.get('/staff', { params });
  },

  /**
   * Fetch single staff member profile with populated services and schedule
   * @param {string} id - Mongo ID
   */
  getStaffById: async (id) => {
    return await api.get(`/staff/${id}`);
  },

  /**
   * Onboard new staff member (Admin only)
   * @param {Object} staffData
   */
  createStaff: async (staffData) => {
    return await api.post('/staff', staffData);
  },

  /**
   * Update staff details, assigned services, or shift schedules (Admin only)
   * @param {string} id
   * @param {Object} staffData
   */
  updateStaff: async (id, staffData) => {
    return await api.put(`/staff/${id}`, staffData);
  },

  /**
   * Delete staff member (Admin only)
   * @param {string} id
   */
  deleteStaff: async (id) => {
    return await api.delete(`/staff/${id}`);
  },

  /**
   * Seed default master beauticians (Convenience helper)
   */
  seedDefaultStaff: async () => {
    return await api.post('/staff/seed');
  }
};
