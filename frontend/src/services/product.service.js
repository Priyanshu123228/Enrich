import api from './api';

export const productService = {
  /**
   * Get all cosmetic products with filters, sorting, and pagination (Public)
   * @param {Object} params - { category, brand, skinType, minPrice, maxPrice, search, isFeatured, inStock, sort, page, limit }
   */
  getProducts: async (params = {}) => {
    const res = await api.get('/products', { params });
    return res?.data || res;
  },

  /**
   * Get single cosmetic product by ID or Slug (Public)
   * @param {string} idOrSlug
   */
  getProduct: async (idOrSlug) => {
    const res = await api.get(`/products/${idOrSlug}`);
    return res?.data || res;
  },

  /**
   * Get featured cosmetic products (Public)
   */
  getFeaturedProducts: async () => {
    const res = await api.get('/products/featured');
    return res?.data || res;
  },

  /**
   * Admin: Upload product image file directly
   * @param {File} file
   */
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.post('/products/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res?.data || res;
  },

  /**
   * Create a new cosmetic product (Admin)
   * @param {Object} data
   */
  createProduct: async (data) => {
    const res = await api.post('/products', data);
    return res?.data || res;
  },

  /**
   * Update a cosmetic product (Admin)
   * @param {string} id
   * @param {Object} data
   */
  updateProduct: async (id, data) => {
    const res = await api.patch(`/products/${id}`, data);
    return res?.data || res;
  },

  /**
   * Delete a cosmetic product (Admin)
   * @param {string} id
   */
  deleteProduct: async (id) => {
    const res = await api.delete(`/products/${id}`);
    return res?.data || res;
  },

  /**
   * Reset & seed sample cosmetics products (Admin)
   */
  seedProducts: async () => {
    const res = await api.post('/products/seed');
    return res?.data || res;
  }
};

export default productService;
