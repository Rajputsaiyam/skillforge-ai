const express = require('express');
const router = express.Router();
const { uploadResume, getMyResume, generateResume, reviewForJob, rewriteBullet, checkAtsScore } = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/upload', protect, upload.single('resume'), uploadResume);
router.get('/me', protect, getMyResume);
router.post('/generate', protect, generateResume);
router.post('/ats-review', protect, reviewForJob);
router.post('/rewrite-bullet', protect, rewriteBullet);
router.post('/ats-check', protect, checkAtsScore);

module.exports = router;

