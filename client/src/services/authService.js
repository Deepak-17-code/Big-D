import apiClient from './apiClient'

export const authService = {
  signup: (payload) => apiClient.post('/auth/signup', payload),
  login: (payload) => apiClient.post('/auth/login', payload),
  me: () => apiClient.get('/users/me'),
  updateMe: (payload) => apiClient.put('/users/me', payload),
  updateMetrics: (payload) => apiClient.put('/users/me/metrics', payload),
  uploadAvatar: (formData) => apiClient.post('/users/me/avatar', formData),
}
