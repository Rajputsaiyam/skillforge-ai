const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, generatePitch } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);
router.post('/generate-pitch', protect, generatePitch);

module.exports = router;
