import apiClient from './baseAPI';

export const llmQueryAPI = {
  // Process natural language query
  processQuery: (query, context = {}) => apiClient.post('/llm_query', {
    query,
    context
  }),
  
  // Get query examples
  getExamples: () => apiClient.get('/query/examples'),
};

export default llmQueryAPI;

