import apiClient from './baseAPI';

export const rlAPI = {
  // Analytics
  getAnalytics: () => apiClient.get('/rl/analytics'),
  getAgentRankings: () => apiClient.get('/rl/rankings'),
  
  // Agent Recommendations
  getAgentRecommendations: (agentName) => apiClient.get(`/rl/agents/${agentName}/recommendations`),
  getAgentPerformance: (agentName) => apiClient.get(`/rl/agents/${agentName}/performance`),
  
  // Actions
  recordAction: (data) => apiClient.post('/rl/actions', data),
  recordOutcome: (actionId, data) => apiClient.post(`/rl/actions/${actionId}/outcome`, data),
  getActions: (params) => apiClient.get('/rl/actions', { params }),
  getAction: (id) => apiClient.get(`/rl/actions/${id}`),
  
  // Learning Control
  runRLWorkflow: (data) => apiClient.post('/rl/workflow', data),
  getLearningProgress: () => apiClient.get('/rl/progress'),
  
  // Data Management
  saveLearningData: () => apiClient.post('/rl/save'),
  resetLearningData: () => apiClient.post('/rl/reset'),
  exportLearningData: () => apiClient.get('/rl/export'),
};

export default rlAPI;

