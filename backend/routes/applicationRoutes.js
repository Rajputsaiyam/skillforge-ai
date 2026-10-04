const express = require('express');
const router = express.Router();
const {
  saveJob,
  getMyApplications,
  updateApplicationStatus,
  addManualApplication,
  getApplicationStageGuidance,
  deleteApplication,
  syncLinkedInStatus,
  syncAllLinkedInApplications,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getMyApplications);
router.post('/', protect, saveJob);
router.post('/manual', protect, addManualApplication);
router.post('/sync-all-linkedin', protect, syncAllLinkedInApplications);
router.post('/:id/sync-linkedin', protect, syncLinkedInStatus);
router.get('/stage-guidance/:stage', protect, getApplicationStageGuidance);
router.patch('/:id/status', protect, updateApplicationStatus);
router.delete('/:id', protect, deleteApplication);

module.exports = router;
