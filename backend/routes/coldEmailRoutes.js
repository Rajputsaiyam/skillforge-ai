const express = require('express');
const router = express.Router();
const { sendBatch, getHistory, getStats } = require('../controllers/coldEmailController');
const { protect } = require('../middleware/authMiddleware');

router.post('/send', protect, sendBatch);
router.get('/history', protect, getHistory);
router.get('/stats', protect, getStats);

module.exports = router;
