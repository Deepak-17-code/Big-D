import apiClient from './apiClient'

export const feedService = {
  getAll: () => apiClient.get('/posts'),
  create: (payload) => apiClient.post('/posts', payload),
  update: (id, payload) => apiClient.put(`/posts/${id}`, payload),
  remove: (id) => apiClient.delete(`/posts/${id}`),
}
