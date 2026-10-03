import api from './api';

export const inquiryService = {
  /**
   * Submit a new customer inquiry / contact form (Public)
   * @param {Object} data - { name, email, phone, message }
   */
  submitInquiry: async (data) => {
    return await api.post('/inquiries', data);
  },

  /**
   * Admin: Fetch inquiries with optional filters and pagination
   * @param {Object} params - { status, search, page, limit, sortBy, sortOrder }
   */
  getInquiries: async (params = {}) => {
    return await api.get('/inquiries', { params });
  },

  /**
   * Admin: Get single inquiry by ID
   * @param {string} id
   */
  getInquiryById: async (id) => {
    return await api.get(`/inquiries/${id}`);
  },

  /**
   * Admin: Update inquiry status and optional notes
   * @param {string} id
   * @param {Object} data - { status: 'unread'|'read'|'replied'|'archived', adminNotes }
   */
  updateInquiryStatus: async (id, data) => {
    return await api.patch(`/inquiries/${id}/status`, data);
  },

  /**
   * Admin: Delete an inquiry
   * @param {string} id
   */
  deleteInquiry: async (id) => {
    return await api.delete(`/inquiries/${id}`);
  }
};

export default inquiryService;
