import apiClient from './baseAPI';

export const crmAPI = {
  // Accounts
  getAccounts: (params) => apiClient.get('/accounts', { params }),
  getAccount: (id) => apiClient.get(`/accounts/${id}`),
  createAccount: (data) => apiClient.post('/accounts', data),
  updateAccount: (id, data) => apiClient.put(`/accounts/${id}`, data),
  
  // Contacts
  getContacts: (params) => apiClient.get('/contacts', { params }),
  getContact: (id) => apiClient.get(`/contacts/${id}`),
  createContact: (data) => apiClient.post('/contacts', data),
  updateContact: (id, data) => apiClient.put(`/contacts/${id}`, data),
  
  // Leads
  getLeads: (params) => apiClient.get('/leads', { params }),
  getLead: (id) => apiClient.get(`/leads/${id}`),
  createLead: (data) => apiClient.post('/leads', data),
  updateLead: (id, data) => apiClient.put(`/leads/${id}`, data),
  
  // Opportunities
  getOpportunities: (params) => apiClient.get('/opportunities', { params }),
  getOpportunity: (id) => apiClient.get(`/opportunities/${id}`),
  createOpportunity: (data) => apiClient.post('/opportunities', data),
  updateOpportunity: (id, data) => apiClient.put(`/opportunities/${id}`, data),
  
  // Activities
  getActivities: (params) => apiClient.get('/activities', { params }),
  getActivity: (id) => apiClient.get(`/activities/${id}`),
  createActivity: (data) => apiClient.post('/activities', data),
  updateActivity: (id, data) => apiClient.put(`/activities/${id}`, data),
  
  // Tasks
  getTasks: (params) => apiClient.get('/tasks', { params }),
  getTask: (id) => apiClient.get(`/tasks/${id}`),
  createTask: (data) => apiClient.post('/tasks', data),
  updateTask: (id, data) => apiClient.put(`/tasks/${id}`, data),
};

export default crmAPI;
