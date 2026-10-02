import api from './api';

export const slotService = {
  /**
   * Calculate live available time slots
   * @param {Object} params - { serviceId, staffId, date }
   */
  getAvailableSlots: async (params) => {
    return await api.get('/slots/available', { params });
  }
};
