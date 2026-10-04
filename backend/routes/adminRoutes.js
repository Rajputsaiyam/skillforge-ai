const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getUsers, getUserDetail, suspendUser, activateUser, deleteUser,
  getSkills, createSkill, updateSkill, deleteSkill, getAllJobsAdmin, getActivityLog,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);

router.get('/users', getUsers);
router.get('/users/:id', getUserDetail);
router.patch('/users/:id/suspend', suspendUser);
router.patch('/users/:id/activate', activateUser);
router.delete('/users/:id', deleteUser);

router.get('/skills', getSkills);
router.post('/skills', createSkill);
router.put('/skills/:id', updateSkill);
router.delete('/skills/:id', deleteSkill);

router.get('/jobs', getAllJobsAdmin);
router.get('/activity', getActivityLog);

module.exports = router;
