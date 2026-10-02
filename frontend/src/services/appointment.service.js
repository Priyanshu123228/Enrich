import api from './api';

export const appointmentService = {
  /**
   * Create a new appointment booking
   * @param {Object} bookingData - { serviceId, staffId, date, startTime, notes }
   */
  createAppointment: async (bookingData) => {
    return await api.post('/appointments', bookingData);
  },

  /**
   * Get logged in customer's appointments
   * @param {Object} params - { status }
   */
  getMyAppointments: async (params = {}) => {
    return await api.get('/appointments/my', { params });
  },

  /**
   * Cancel an appointment
   * @param {string} id
   * @param {string} reason
   */
  cancelAppointment: async (id, reason) => {
    return await api.put(`/appointments/${id}/cancel`, { reason });
  },

  /**
   * Reschedule appointment
   * @param {string} id
   * @param {Object} data - { newDate, newStartTime }
   */
  rescheduleAppointment: async (id, data) => {
    return await api.put(`/appointments/${id}/reschedule`, data);
  },

  /**
   * Admin: Get all appointments
   * @param {Object} params - { status, date, staffId, page, limit }
   */
  getAllAppointments: async (params = {}) => {
    return await api.get('/appointments/admin/all', { params });
  },

  /**
   * Admin: Update status (confirm, complete, cancel)
   * @param {string} id
   * @param {string} status
   */
  updateAppointmentStatus: async (id, status) => {
    return await api.put(`/appointments/${id}/status`, { status });
  },

  /**
   * Staff/Admin: Get staff schedule
   * @param {Object} params - { staffId, date }
   */
  getStaffSchedule: async (params = {}) => {
    return await api.get('/appointments/staff/schedule', { params });
  }
};
