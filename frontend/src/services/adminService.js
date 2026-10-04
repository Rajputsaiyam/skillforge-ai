import api from './api';

const adminService = {
  getDashboardStats: () => api.get('/admin/dashboard').then((r) => r.data),
  getUsers: () => api.get('/admin/users').then((r) => r.data),
  getUserDetail: (id) => api.get(`/admin/users/${id}`).then((r) => r.data),
  suspendUser: (id) => api.patch(`/admin/users/${id}/suspend`).then((r) => r.data),
  activateUser: (id) => api.patch(`/admin/users/${id}/activate`).then((r) => r.data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`).then((r) => r.data),
  getSkills: () => api.get('/admin/skills').then((r) => r.data),
  createSkill: (payload) => api.post('/admin/skills', payload).then((r) => r.data),
  updateSkill: (id, payload) => api.put(`/admin/skills/${id}`, payload).then((r) => r.data),
  deleteSkill: (id) => api.delete(`/admin/skills/${id}`).then((r) => r.data),
  getAllJobs: () => api.get('/admin/jobs').then((r) => r.data),
  getActivityLog: () => api.get('/admin/activity').then((r) => r.data),
};

export default adminService;
