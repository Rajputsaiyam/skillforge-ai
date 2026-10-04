import api from './api';

const chatService = {
  getSessions: () => api.get('/chat/sessions').then((r) => r.data),
  createSession: (payload = {}) => api.post('/chat/sessions', payload).then((r) => r.data),
  getSessionMessages: (sessionId) => api.get(`/chat/sessions/${sessionId}/messages`).then((r) => r.data),
  sendMessage: (message, sessionId = null) => {
    const endpoint = sessionId ? `/chat/sessions/${sessionId}/messages` : '/chat/message';
    return api.post(endpoint, { message, sessionId }).then((r) => r.data);
  },
  deleteSession: (sessionId) => api.delete(`/chat/sessions/${sessionId}`).then((r) => r.data),
  rateMessage: (messageId, feedback) => api.post(`/chat/messages/${messageId}/feedback`, { feedback }).then((r) => r.data),
  clearChat: () => api.post('/chat/clear').then((r) => r.data),
};

export default chatService;
