import api from './api';

const jobService = {
  searchJobs: (filters) => api.get('/jobs', { params: filters }).then((r) => r.data),
  detectLocation: () => api.get('/jobs/detect-location').then((r) => r.data),
  getJobDetails: (id) => api.get(`/jobs/${id}`).then((r) => r.data),
  getJobSources: () => api.get('/jobs/sources').then((r) => r.data),
  getLinkedInLinks: (params) => api.get('/jobs/linkedin-links', { params }).then((r) => r.data),
  getInterviewPrep: (id) => api.post(`/jobs/${id}/interview-prep`).then((r) => r.data),
};

export default jobService;
