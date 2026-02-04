import apiClient from './baseAPI';

export const userAPI = {
  // Users
  getUsers: (params) => apiClient.get('/auth/users', { params }),
  getUser: (id) => apiClient.get(`/auth/users/${id}`),
  getCurrentUser: () => apiClient.get('/auth/me'),
  createUser: (data) => apiClient.post('/auth/register', data),
  updateUser: (id, data) => apiClient.put(`/auth/users/${id}`, data),
  deleteUser: (id) => apiClient.delete(`/auth/users/${id}`),
  
  // User Roles & Permissions
  updateUserRole: (id, role) => apiClient.patch(`/auth/users/${id}/role`, { role }),
  updateUserPermissions: (id, permissions) => apiClient.patch(`/auth/users/${id}/permissions`, { permissions }),
};

export default userAPI;

