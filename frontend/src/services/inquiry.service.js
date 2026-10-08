import api from './api';

export const inquiryService = {
  /**
   * Submit a new customer inquiry / contact form (Public)
   */
  createInquiry: async (data) => {
    return await api.post('/inquiries', data);
  },

  /**
   * Alias: Submit inquiry
   */
  submitInquiry: async (data) => {
    return await api.post('/inquiries', data);
  },

  /**
   * Alias: Send inquiry
   */
  sendInquiry: async (data) => {
    return await api.post('/inquiries', data);
  },

  /**
   * Admin: Fetch inquiries with optional filters and pagination
   */
  getInquiries: async (params = {}) => {
    return await api.get('/inquiries', { params });
  },

  /**
   * Admin: Backward compatibility alias
   */
  getAllInquiries: async (params = {}) => {
    return await api.get('/inquiries', { params });
  },

  /**
   * Admin: Get single inquiry by ID
   */
  getInquiryById: async (id) => {
    return await api.get(`/inquiries/${id}`);
  },

  /**
   * Admin: Update inquiry status and optional notes
   */
  updateInquiryStatus: async (id, data) => {
    return await api.patch(`/inquiries/${id}/status`, data);
  },

  /**
   * Admin: Delete an inquiry
   */
  deleteInquiry: async (id) => {
    return await api.delete(`/inquiries/${id}`);
  }
};

export default inquiryService;
