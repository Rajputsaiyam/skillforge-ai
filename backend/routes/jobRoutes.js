const express = require('express');
const router = express.Router();
const {
  searchJobs,
  getJobDetails,
  getJobSources,
  getLinkedInSearchLinks,
  getJobInterviewPrep,
  detectLocation,
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, searchJobs);
router.get('/detect-location', protect, detectLocation);
router.get('/sources', protect, getJobSources);
router.get('/linkedin-links', protect, getLinkedInSearchLinks);
router.get('/:id', protect, getJobDetails);
router.post('/:id/interview-prep', protect, getJobInterviewPrep);

module.exports = router;
