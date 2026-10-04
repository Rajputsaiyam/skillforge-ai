import api from './api';

const skillService = {
  getMySkills: () => api.get('/skills/me').then((r) => r.data),
  upsertSkill: (payload) => api.post('/skills/me', payload).then((r) => r.data),
  getSkillGraph: (targetRole) => api.get('/skills/graph', { params: { targetRole } }).then((r) => r.data),
  getRecommendations: (targetRole) => api.get('/skills/recommendations', { params: { targetRole } }).then((r) => r.data),
  getSkillGaps: (targetRole) => api.get('/skills/gaps', { params: { targetRole } }).then((r) => r.data),
  getCareerReadiness: (targetRole) => api.get('/skills/readiness', { params: { targetRole } }).then((r) => r.data),
  getGapStrategy: (targetRole) => api.post('/skills/gap-strategy', { targetRole }).then((r) => r.data),
};

export default skillService;
