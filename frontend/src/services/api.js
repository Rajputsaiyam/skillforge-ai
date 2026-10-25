import axios from 'axios';

/**
 * Resolves API Base URL:
 * - If VITE_API_BASE_URL is set in environment, uses it.
 * - If on localhost / 127.0.0.1, routes to local backend: http://localhost:5000/api
 * - If accessed from any deployed / non-localhost domain, routes to deployed backend: https://skillforge-ai-7.onrender.com/api
 */
export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  if (envUrl) {
    const custom = envUrl.replace(/\/+$/, '');
    return custom.endsWith('/api') ? custom : `${custom}/api`;
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocalhost =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host.endsWith('.local');

    if (isLocalhost) {
      return 'http://localhost:5000/api';
    }
  }

  return 'https://skillforge-ai-7.onrender.com/api';
};

export const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sg_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sg_token');
      localStorage.removeItem('sg_user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
