import api from './api';

const roadmapService = {
  generate: (targetRole) => api.post('/roadmap/generate', { targetRole }).then((r) => r.data),
  getMine: () => api.get('/roadmap/me').then((r) => r.data),
  updateProgress: (payload) => api.patch('/roadmap/progress', payload).then((r) => r.data),
  getStudyGuide: (skill) => api.get(`/roadmap/study-guide/${encodeURIComponent(skill)}`).then((r) => r.data),
};

export default roadmapService;
