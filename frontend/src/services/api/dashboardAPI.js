import apiClient from './baseAPI';

export const dashboardAPI = {
  // Dashboard KPIs
  getKPIs: () => apiClient.get('/dashboard/kpis'),
  
  // Dashboard Alerts
  getAlerts: () => apiClient.get('/dashboard/alerts'),
  
  // Dashboard Charts
  getCharts: () => apiClient.get('/dashboard/charts'),
  
  // Recent Activity
  getRecentActivity: () => apiClient.get('/dashboard/activity'),
  
  // Orders
  getOrders: (params) => apiClient.get('/orders', { params }),
  
  // Inventory
  getInventory: () => apiClient.get('/inventory'),
  getLowStock: () => apiClient.get('/inventory/low-stock'),
  
  // Products Stats
  getProductStats: () => apiClient.get('/products/stats'),
  
  // Suppliers
  getSuppliers: () => apiClient.get('/procurement/suppliers'),
  
  // Accounts (CRM)
  getAccounts: (params) => apiClient.get('/accounts', { params }),
  
  // Shipments
  getShipments: () => apiClient.get('/delivery/shipments'),
  
  // Agent Status
  getAgentStatus: () => apiClient.get('/agent/status'),
  
  // Agent Logs
  getAgentLogs: (params) => apiClient.get('/logs', { params }),
};

export default dashboardAPI;

