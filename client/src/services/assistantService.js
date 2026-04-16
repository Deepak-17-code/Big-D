import apiClient from './apiClient'

export const assistantService = {
  ask: (question, history = []) => apiClient.post('/assistant/ask', { question, history }),
  getHistory: () => apiClient.get('/users/me/assistant-history'),
  saveHistory: (history) => apiClient.post('/users/me/assistant-history', { history }),
  clearHistory: () => apiClient.delete('/users/me/assistant-history'),
  getSavedAnswers: () => apiClient.get('/users/me/saved-assistant-answers'),
  saveAnswer: (payload) => apiClient.post('/users/me/saved-assistant-answers', payload),
  deleteSavedAnswer: (answerId) => apiClient.delete(`/users/me/saved-assistant-answers/${answerId}`),
}