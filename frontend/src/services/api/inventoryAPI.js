import apiClient from './baseAPI';

export const inventoryAPI = {
  // Inventory
  getInventory: (params) => apiClient.get('/inventory', { params }),
  getLowStock: () => apiClient.get('/inventory/low-stock'),
  
  // Analytics
  getAnalytics: () => apiClient.get('/analytics/performance'),
};

export default inventoryAPI;
