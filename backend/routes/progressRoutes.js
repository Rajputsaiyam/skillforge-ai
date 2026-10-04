const express = require('express');
const router = express.Router();
const { getMyProgress, getDailyBriefing } = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

router.get('/me', protect, getMyProgress);
router.get('/daily-briefing', protect, getDailyBriefing);

module.exports = router;
