import api from './api';

const resumeService = {
  uploadResume: (file, onProgress) => {
    const formData = new FormData();
    formData.append('resume', file);
    return api
      .post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (onProgress) onProgress(Math.round((evt.loaded * 100) / evt.total));
        },
      })
      .then((r) => r.data);
  },
  getMyResume: () => api.get('/resume/me').then((r) => r.data),
  reviewForJob: (jobDescription, targetRole) => api.post('/resume/ats-review', { jobDescription, targetRole }).then((r) => r.data),
  generate: ({ targetRole, jobDescription, details }) =>
    api.post('/resume/generate', { targetRole, jobDescription, details }).then((r) => r.data),
  rewriteBullet: (bulletText, targetRole) => api.post('/resume/rewrite-bullet', { bulletText, targetRole }).then((r) => r.data),
  checkAtsScore: ({ resumeText, targetRole, jobDescription }) =>
    api.post('/resume/ats-check', { resumeText, targetRole, jobDescription }).then((r) => r.data),
};

export default resumeService;

