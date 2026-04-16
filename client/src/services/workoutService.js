import apiClient from './apiClient'

export const workoutService = {
  getAll: () => apiClient.get('/workouts'),
  getById: (id) => apiClient.get(`/workouts/${id}`),
  create: (payload) => apiClient.post('/workouts', payload),
  update: (id, payload) => apiClient.put(`/workouts/${id}`, payload),
  remove: (id) => apiClient.delete(`/workouts/${id}`),
}
