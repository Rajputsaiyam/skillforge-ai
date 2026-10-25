import api, { getApiBaseUrl } from './api';

const authService = {
  register: (payload) => api.post('/auth/register', payload).then((r) => r.data),
  login: (payload) => api.post('/auth/login', payload).then((r) => r.data),
  getMe: () => api.get('/auth/me').then((r) => r.data),
  loginWithGoogle: () => {
    const baseUrl = getApiBaseUrl();
    const returnTo = typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : '';
    window.location.href = `${baseUrl}/auth/google${returnTo ? `?returnTo=${returnTo}` : ''}`;
  },
  loginWithLinkedIn: () => {
    const baseUrl = getApiBaseUrl();
    window.location.href = `${baseUrl}/auth/linkedin`;
  },
};

export default authService;
