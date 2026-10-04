const express = require('express');
const router = express.Router();
const {
  createRoadmap,
  getMyRoadmap,
  updateRoadmapItemProgress,
  getStudyGuide,
} = require('../controllers/roadmapController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, createRoadmap);
router.get('/me', protect, getMyRoadmap);
router.patch('/progress', protect, updateRoadmapItemProgress);
router.get('/study-guide/:skill', protect, getStudyGuide);

module.exports = router;
