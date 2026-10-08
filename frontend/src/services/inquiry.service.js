import api from './api';

export const inquiryService = {
  /**
   * Submit a new customer inquiry / contact form (Public)
   */
  createInquiry: async (data) => {
    const res = await api.post('/inquiries', data);
    return res?.data || res;
  },

  /**
   * Alias: Submit inquiry
   */
  submitInquiry: async (data) => {
    const res = await api.post('/inquiries', data);
    return res?.data || res;
  },

  /**
   * Alias: Send inquiry
   */
  sendInquiry: async (data) => {
    const res = await api.post('/inquiries', data);
    return res?.data || res;
  },

  /**
   * Admin: Fetch inquiries with optional filters and pagination
   */
  getInquiries: async (params = {}) => {
    const res = await api.get('/inquiries', { params });
    return res?.data || res;
  },

  /**
   * Admin: Backward compatibility alias
   */
  getAllInquiries: async (params = {}) => {
    const res = await api.get('/inquiries', { params });
    return res?.data || res;
  },

  /**
   * Admin: Get single inquiry by ID
   */
  getInquiryById: async (id) => {
    const res = await api.get(`/inquiries/${id}`);
    return res?.data || res;
  },

  /**
   * Admin: Update inquiry status and optional notes
   */
  updateInquiryStatus: async (id, data) => {
    const res = await api.patch(`/inquiries/${id}/status`, data);
    return res?.data || res;
  },

  /**
   * Admin: Delete an inquiry
   */
  deleteInquiry: async (id) => {
    const res = await api.delete(`/inquiries/${id}`);
    return res?.data || res;
  }
};

export default inquiryService;
