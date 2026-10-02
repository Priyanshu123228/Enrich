import api from './api';

export const serviceService = {
  /**
   * Fetch services with optional filters, search, and pagination
   * @param {Object} params - { category, search, minPrice, maxPrice, sortBy, page, limit, includeInactive }
   */
  getServices: async (params = {}) => {
    return await api.get('/services', { params });
  },

  /**
   * Fetch all services for dropdowns and administration
   * @param {Object} params
   */
  getAllServices: async (params = {}) => {
    return await api.get('/services', { params: { limit: 100, ...params } });
  },

  /**
   * Fetch single service details by ID or Slug
   * @param {string} id - Mongo ID or slug
   */
  getServiceById: async (id) => {
    return await api.get(`/services/${id}`);
  },

  /**
   * Fetch categories with active service count
   */
  getCategories: async () => {
    return await api.get('/services/categories');
  },

  /**
   * Create a new service (Admin only)
   * @param {Object} serviceData
   */
  createService: async (serviceData) => {
    return await api.post('/services', serviceData);
  },

  /**
   * Update service details (Admin only)
   * @param {string} id
   * @param {Object} serviceData
   */
  updateService: async (id, serviceData) => {
    return await api.put(`/services/${id}`, serviceData);
  },

  /**
   * Delete service (Admin only)
   * @param {string} id
   */
  deleteService: async (id) => {
    return await api.delete(`/services/${id}`);
  },

  /**
   * Seed default catalog (Convenience helper)
   */
  seedDefaultServices: async () => {
    return await api.post('/services/seed');
  }
};
