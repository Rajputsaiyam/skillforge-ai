const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Skill = require('../models/Skill');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Assessment = require('../models/Assessment');
const Resume = require('../models/Resume');
const ActivityLog = require('../models/ActivityLog');
const UserSkill = require('../models/UserSkill');

// @desc Admin dashboard KPIs + chart series
const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, activeUsers, resumesParsed, assessmentsCompleted, applications, allJobs] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'user', status: 'active' }),
    Resume.countDocuments(),
    Assessment.countDocuments({ status: 'completed' }),
    Application.countDocuments(),
    Job.find({}).select('views applicationsCount').lean(),
  ]);
  const jobsViewed = allJobs.reduce((sum, j) => sum + (j.views || 0), 0);

  // User growth over the last 14 days (bucketed by createdAt)
  const since = new Date();
  since.setDate(since.getDate() - 14);
  const recentUsers = await User.find({ createdAt: { $gte: since } }).select('createdAt').lean();
  const growthMap = {};
  recentUsers.forEach((u) => {
    const day = u.createdAt.toISOString().slice(0, 10);
    growthMap[day] = (growthMap[day] || 0) + 1;
  });
  const userGrowth = Object.entries(growthMap).map(([date, count]) => ({ date, count }));

  res.json({
    totalUsers,
    activeUsers,
    resumesParsed,
    assessmentsCompleted,
    jobsViewed,
    applicationsTracked: applications,
    userGrowth,
  });
});

// @desc List users with journey summary
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 }).lean();
  const userIds = users.map((u) => u._id);
  const [resumes, applications, skills] = await Promise.all([
    Resume.find({ user: { $in: userIds } }).select('user resumeScore').lean(),
    Application.find({ user: { $in: userIds } }).select('user').lean(),
    UserSkill.find({ user: { $in: userIds } }).select('user').lean(),
  ]);

  const resumeMap = new Map();
  resumes.forEach((r) => resumeMap.set(String(r.user), r));
  const appCountMap = new Map();
  applications.forEach((a) => appCountMap.set(String(a.user), (appCountMap.get(String(a.user)) || 0) + 1));
  const skillCountMap = new Map();
  skills.forEach((s) => skillCountMap.set(String(s.user), (skillCountMap.get(String(s.user)) || 0) + 1));

  const enriched = users.map((u) => ({
    ...u,
    resumeStatus: resumeMap.has(String(u._id)) ? 'Uploaded' : 'Not uploaded',
    applicationsCount: appCountMap.get(String(u._id)) || 0,
    skillsCount: skillCountMap.get(String(u._id)) || 0,
  }));

  res.json({ users: enriched });
});

// @desc Full journey for a single user (admin drill-down)
const getUserDetail = asyncHandler(async (req, res) => {
  const [user, resume, skills, assessments, applications] = await Promise.all([
    User.findById(req.params.id).select('-password'),
    Resume.findOne({ user: req.params.id }).sort({ createdAt: -1 }),
    UserSkill.find({ user: req.params.id }).sort({ level: -1 }),
    Assessment.find({ user: req.params.id }).sort({ createdAt: -1 }),
    Application.find({ user: req.params.id }).populate('job'),
  ]);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ user, resume, skills, assessments, applications });
});

const suspendUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { status: 'suspended' }, { new: true }).select('-password');
  res.json({ user });
});

const activateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true }).select('-password');
  res.json({ user });
});

const deleteUser = asyncHandler(async (req, res) => {
  await User.deleteOne({ _id: req.params.id });
  res.json({ success: true });
});

// ---- Skills management ----
const getSkills = asyncHandler(async (req, res) => {
  const skills = await Skill.find({}).sort({ category: 1, name: 1 });
  res.json({ skills });
});

const createSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.create(req.body);
  res.status(201).json({ skill });
});

const updateSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ skill });
});

const deleteSkill = asyncHandler(async (req, res) => {
  await Skill.deleteOne({ _id: req.params.id });
  res.json({ success: true });
});

// ---- Job monitoring ----
const getAllJobsAdmin = asyncHandler(async (req, res) => {
  const jobs = await Job.find({}).sort({ postedDate: -1 });
  res.json({ jobs });
});

// ---- Activity log ----
const getActivityLog = asyncHandler(async (req, res) => {
  const logs = await ActivityLog.find({}).populate('user', 'fullName email').sort({ createdAt: -1 }).limit(200);
  res.json({ logs });
});

module.exports = {
  getDashboardStats,
  getUsers,
  getUserDetail,
  suspendUser,
  activateUser,
  deleteUser,
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  getAllJobsAdmin,
  getActivityLog,
};
