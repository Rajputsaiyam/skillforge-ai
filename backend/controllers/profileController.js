const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const UserSkill = require('../models/UserSkill');
const logActivity = require('../utils/activityLogger');
const { generateProfilePitch } = require('../services/careerAiService');

const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : user;
  delete obj.password;
  return obj;
};

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ user: sanitizeUser(user) });
});

const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    'fullName', 'location', 'targetRole', 'avatarUrl',
    'education', 'experience', 'projects', 'certifications', 'socialLinks',
  ];
  const user = await User.findById(req.user._id);
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) user[field] = req.body[field];
  });
  await user.save();
  await logActivity(user._id, 'profile_updated', `${user.fullName} updated their profile`);
  res.json({ user: sanitizeUser(user) });
});

// @desc Generate AI professional elevator pitch and LinkedIn bio
const generatePitch = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).lean();
  const skills = await UserSkill.find({ user: req.user._id }).sort({ level: -1 }).lean();
  const targetRole = req.body.targetRole || user?.targetRole || 'Software Engineer';
  const pitch = await generateProfilePitch({ ...user, skills }, targetRole);
  res.json({ pitch });
});

module.exports = { getProfile, updateProfile, generatePitch };
