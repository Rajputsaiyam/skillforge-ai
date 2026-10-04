import api from './api';

const profileService = {
  getProfile: () => api.get('/profile').then((r) => r.data),
  updateProfile: (payload) => api.put('/profile', payload).then((r) => r.data),
  generatePitch: (targetRole) => api.post('/profile/generate-pitch', { targetRole }).then((r) => r.data),
};

export default profileService;
