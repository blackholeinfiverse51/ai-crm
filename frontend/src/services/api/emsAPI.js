import apiClient from './baseAPI';

export const emsAPI = {
  // Email Triggers
  sendRestockAlert: (data) => apiClient.post('/ems/restock-alert', data),
  sendPurchaseOrder: (data) => apiClient.post('/ems/purchase-order', data),
  sendShipmentNotification: (data) => apiClient.post('/ems/shipment-notification', data),
  sendDeliveryDelay: (data) => apiClient.post('/ems/delivery-delay', data),
  
  // Scheduled Emails
  getScheduledEmails: () => apiClient.get('/ems/scheduled'),
  scheduleEmail: (data) => apiClient.post('/ems/schedule', data),
  cancelScheduledEmail: (id) => apiClient.delete(`/ems/scheduled/${id}`),
  processScheduledEmails: () => apiClient.post('/ems/process-scheduled'),
  
  // Email Activity
  getEmailActivity: (params) => apiClient.get('/ems/activity', { params }),
  getEmailStats: () => apiClient.get('/ems/stats'),
  
  // Email Templates
  getTemplates: () => apiClient.get('/ems/templates'),
  getTemplate: (id) => apiClient.get(`/ems/templates/${id}`),
  createTemplate: (data) => apiClient.post('/ems/templates', data),
  updateTemplate: (id, data) => apiClient.put(`/ems/templates/${id}`, data),
  
  // Settings
  getSettings: () => apiClient.get('/ems/settings'),
  updateSettings: (data) => apiClient.put('/ems/settings', data),
};

export default emsAPI;

