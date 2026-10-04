import api from './api';

const progressService = {
  getMyProgress: () => api.get('/progress/me').then((r) => r.data),
  getDailyBriefing: () => api.get('/progress/daily-briefing').then((r) => r.data),
};

export default progressService;
