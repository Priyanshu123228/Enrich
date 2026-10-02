import api from './api';

export const mediaService = {
  /**
   * Get public gallery media items with filtering
   * @param {Object} params - { type, category, featured, page, limit }
   */
  getGalleryMedia: async (params = {}) => {
    return await api.get('/media', { params });
  },

  /**
   * Get featured photos, videos & transformations for Homepage
   */
  getFeaturedMedia: async () => {
    return await api.get('/media/featured');
  },

  /**
   * Get media categories with count of items
   */
  getCategories: async () => {
    return await api.get('/media/categories');
  },

  /**
   * Get media item details by ID
   * @param {string} id
   */
  getMediaById: async (id) => {
    return await api.get(`/media/${id}`);
  },

  /**
   * Admin: Get all media assets with filters
   * @param {Object} params - { type, category, status, search, page, limit }
   */
  adminGetAllMedia: async (params = {}) => {
    return await api.get('/media/admin/all', { params });
  },

  /**
   * Admin: Upload single image or video file directly
   * @param {File} file
   */
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return await api.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  /**
   * Admin: Create / upload new media item
   * @param {FormData|Object} data
   */
  createMedia: async (data) => {
    const isFormData = data instanceof FormData;
    return await api.post('/media', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
  },

  /**
   * Admin: Update media information
   * @param {string} id
   * @param {FormData|Object} data
   */
  updateMedia: async (id, data) => {
    const isFormData = data instanceof FormData;
    return await api.put(`/media/${id}`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
  },

  /**
   * Admin: Toggle active status
   * @param {string} id
   */
  toggleMediaStatus: async (id) => {
    return await api.put(`/media/${id}/status`);
  },

  /**
   * Admin: Delete media asset
   * @param {string} id
   */
  deleteMedia: async (id) => {
    return await api.delete(`/media/${id}`);
  },

  /**
   * Admin: Seed default curated HD media gallery
   */
  seedDefaultMedia: async () => {
    return await api.post('/media/seed');
  }
};
