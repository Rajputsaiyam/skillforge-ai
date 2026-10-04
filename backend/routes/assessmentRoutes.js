const express = require('express');
const router = express.Router();
const {
  getAvailableAssessmentSkills,
  getLesson,
  startAssessment,
  submitAssessment,
  startInterview,
  continueInterview,
  endInterview,
} = require('../controllers/assessmentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/available-skills', protect, getAvailableAssessmentSkills);
router.get('/lesson/:skill', protect, getLesson);
router.post('/start', protect, startAssessment);
router.post('/submit', protect, submitAssessment);

// AI Interview mode
router.post('/interview/start', protect, startInterview);
router.post('/interview/continue', protect, continueInterview);
router.post('/interview/end', protect, endInterview);

module.exports = router;
