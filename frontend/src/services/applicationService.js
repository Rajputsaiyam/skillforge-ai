import api from './api';

const applicationService = {
  getMyApplications: () => api.get('/applications').then((r) => r.data),
  saveJob: (jobId, matchScore, status = 'Saved') => api.post('/applications', { jobId, matchScore, status }).then((r) => r.data),
  applyAndTrackJob: (jobId, matchScore, notes) => api.post('/applications', { jobId, matchScore, status: 'Applied', notes }).then((r) => r.data),
  syncLinkedInStatus: (id) => api.post(`/applications/${id}/sync-linkedin`).then((r) => r.data),
  syncAllLinkedIn: () => api.post('/applications/sync-all-linkedin').then((r) => r.data),
  addManualApplication: (payload) => api.post('/applications/manual', payload).then((r) => r.data),
  getStageGuidance: (stage, params) => api.get(`/applications/stage-guidance/${encodeURIComponent(stage)}`, { params }).then((r) => r.data),
  updateStatus: (id, status) => api.patch(`/applications/${id}/status`, { status }).then((r) => r.data),
  deleteApplication: (id) => api.delete(`/applications/${id}`).then((r) => r.data),
};

export default applicationService;
