import apiClient from './baseAPI';

export const aiDecisionsAPI = {
  // Decision Making
  makeDecision: (decisionType, params) => apiClient.post('/ai-decisions/make', { 
    decision_type: decisionType, 
    parameters: params 
  }),
  
  // Workflows
  getWorkflows: () => apiClient.get('/ai-decisions/workflows'),
  getWorkflow: (id) => apiClient.get(`/ai-decisions/workflows/${id}`),
  createWorkflow: (data) => apiClient.post('/ai-decisions/workflows', data),
  updateWorkflow: (id, data) => apiClient.put(`/ai-decisions/workflows/${id}`, data),
  executeWorkflow: (id, data) => apiClient.post(`/ai-decisions/workflows/${id}/execute`, data),
  
  // Analytics
  getDecisionAnalytics: () => apiClient.get('/ai-decisions/analytics'),
  getDecisionHistory: (params) => apiClient.get('/ai-decisions/history', { params }),
  getDecision: (id) => apiClient.get(`/ai-decisions/${id}`),
  
  // Settings
  getSettings: () => apiClient.get('/ai-decisions/settings'),
  updateSettings: (data) => apiClient.put('/ai-decisions/settings', data),
};

export default aiDecisionsAPI;

