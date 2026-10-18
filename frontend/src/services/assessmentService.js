import api from './api';

const assessmentService = {
  getAvailableSkills: () => api.get('/assessments/available-skills').then((r) => r.data),
  getLesson: (skill) => api.get(`/assessments/lesson/${encodeURIComponent(skill)}`).then((r) => r.data),
  startAssessment: (skills) => api.post('/assessments/start', { skills }).then((r) => r.data),
  submitAssessment: (assessmentId, answers) =>
    api.post('/assessments/submit', { assessmentId, answers }).then((r) => r.data),

  // Live AI Mock Interview
  startInterview: (params) => {
    const payload = Array.isArray(params) ? { skills: params } : params;
    return api.post('/assessments/interview/start', payload).then((r) => r.data);
  },
  continueInterview: (assessmentId, message, extras = {}) =>
    api.post('/assessments/interview/continue', { assessmentId, message, ...extras }).then((r) => r.data),
  endInterview: (assessmentId, proctoringSummary = null) =>
    api.post('/assessments/interview/end', { assessmentId, proctoringSummary }).then((r) => r.data),
};

export default assessmentService;
