import apiClient from './apiClient'

export const stepsService = {
  getAll: () => apiClient.get('/steps'),
  create: (payload) => apiClient.post('/steps', payload),
  update: (id, payload) => apiClient.put(`/steps/${id}`, payload),
  remove: (id) => apiClient.delete(`/steps/${id}`),
  analytics: () => apiClient.get('/steps/analytics/weekly'),
}
