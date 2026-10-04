const express = require('express');
const router = express.Router();
const {
  getMySkills,
  upsertSkill,
  getSkillGraph,
  getRecommendations,
  getSkillGaps,
  getCareerReadiness,
  getGapStrategy,
} = require('../controllers/skillController');
const { protect } = require('../middleware/authMiddleware');

router.get('/me', protect, getMySkills);
router.post('/me', protect, upsertSkill);
router.get('/graph', protect, getSkillGraph);
router.get('/recommendations', protect, getRecommendations);
router.get('/gaps', protect, getSkillGaps);
router.get('/readiness', protect, getCareerReadiness);
router.post('/gap-strategy', protect, getGapStrategy);

module.exports = router;
