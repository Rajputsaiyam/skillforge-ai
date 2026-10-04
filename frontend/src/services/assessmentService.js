import api from './api';

const assessmentService = {
  getAvailableSkills: () => api.get('/assessments/available-skills').then((r) => r.data),
  getLesson: (skill) => api.get(`/assessments/lesson/${encodeURIComponent(skill)}`).then((r) => r.data),
  startAssessment: (skills) => api.post('/assessments/start', { skills }).then((r) => r.data),
  submitAssessment: (assessmentId, answers) =>
    api.post('/assessments/submit', { assessmentId, answers }).then((r) => r.data),

  // AI Interview mode
  startInterview: (skills, targetRole) => api.post('/assessments/interview/start', { skills, targetRole }).then((r) => r.data),
  continueInterview: (assessmentId, message) =>
    api.post('/assessments/interview/continue', { assessmentId, message }).then((r) => r.data),
  endInterview: (assessmentId) => api.post('/assessments/interview/end', { assessmentId }).then((r) => r.data),
};

export default assessmentService;
