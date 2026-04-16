import apiClient from './apiClient'

export const calorieService = {
  getAll: () => apiClient.get('/calories'),
  create: (payload) => apiClient.post('/calories', payload),
  update: (id, payload) => apiClient.put(`/calories/${id}`, payload),
  remove: (id) => apiClient.delete(`/calories/${id}`),
}
