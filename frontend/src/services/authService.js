import api from './api';

const authService = {
  register: (payload) => api.post('/auth/register', payload).then((r) => r.data),
  login: (payload) => api.post('/auth/login', payload).then((r) => r.data),
  getMe: () => api.get('/auth/me').then((r) => r.data),
  // Placeholders — real OAuth (passport-google-oauth20 / passport-linkedin-oauth2) is
  // wired on the backend; these simply redirect to the backend OAuth entrypoints.
  loginWithGoogle: () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/auth/google`;
  },
  loginWithLinkedIn: () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/auth/linkedin`;
  },
};

export default authService;
