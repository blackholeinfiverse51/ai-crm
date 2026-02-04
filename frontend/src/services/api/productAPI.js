import apiClient from './baseAPI';

export const productAPI = {
  // Products
  getProducts: (params = {}) => {
    const { skip = 0, limit = 100, category, supplier_id, is_active, search } = params;
    return apiClient.get('/products', {
      params: {
        skip,
        limit,
        ...(category && { category }),
        ...(supplier_id && { supplier_id }),
        ...(is_active !== undefined && { is_active }),
        ...(search && { search }),
      }
    });
  },
  getProduct: (id) => apiClient.get(`/products/${id}`),
  createProduct: (data) => apiClient.post('/products', data),
  updateProduct: (id, data) => apiClient.put(`/products/${id}`, data),
  deleteProduct: (id) => apiClient.delete(`/products/${id}`),
  
  // Product Images
  uploadPrimaryImage: (productId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/products/${productId}/images/primary`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadGalleryImage: (productId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/products/${productId}/images/gallery`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteImage: (productId, imageType, imageUrl = null) => {
    const params = imageUrl ? { image_url: imageUrl } : {};
    return apiClient.delete(`/products/${productId}/images/${imageType}`, { params });
  },
  getProductImages: (productId) => apiClient.get(`/products/${productId}/images`),
  
  // Product Categories
  getCategories: () => apiClient.get('/products/categories'),
  
  // Product Stats
  getStats: () => apiClient.get('/products/stats'),
};

export default productAPI;

