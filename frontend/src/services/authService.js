import api, { API_BASE_URL } from './api';

const authService = {
  register: (payload) => api.post('/auth/register', payload).then((r) => r.data),
  login: (payload) => api.post('/auth/login', payload).then((r) => r.data),
  getMe: () => api.get('/auth/me').then((r) => r.data),
  // Placeholders — real OAuth (passport-google-oauth20 / passport-linkedin-oauth2) is
  // wired on the backend; these redirect to the backend OAuth entrypoints.
  loginWithGoogle: () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  },
  loginWithLinkedIn: () => {
    window.location.href = `${API_BASE_URL}/auth/linkedin`;
  },
};

export default authService;
