const asyncHandler = require('express-async-handler');
const Roadmap = require('../models/Roadmap');
const { generateRoadmap } = require('../services/roadmapService');
const { getStudyGuide: generateStudyGuide } = require('../services/careerAiService');
const logActivity = require('../utils/activityLogger');

// @desc Generate (or regenerate) a roadmap for the user's target role
const createRoadmap = asyncHandler(async (req, res) => {
  const targetRole = req.body.targetRole || req.user.targetRole;
  if (!targetRole) {
    res.status(400);
    throw new Error('Please set a target role first');
  }
  const items = await generateRoadmap(req.user._id, targetRole);
  const roadmap = await Roadmap.create({ user: req.user._id, targetRole, items });
  await logActivity(req.user._id, 'roadmap_generated', `Roadmap generated for ${targetRole}`);
  res.status(201).json({ roadmap });
});

// @desc Get latest roadmap
const getMyRoadmap = asyncHandler(async (req, res) => {
  const roadmap = await Roadmap.findOne({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ roadmap });
});

// @desc Update progress on a specific roadmap item
const updateRoadmapItemProgress = asyncHandler(async (req, res) => {
  const { roadmapId, itemIndex, progress } = req.body;
  const roadmap = await Roadmap.findOne({ _id: roadmapId, user: req.user._id });
  if (!roadmap || !roadmap.items[itemIndex]) {
    res.status(404);
    throw new Error('Roadmap item not found');
  }
  roadmap.items[itemIndex].progress = progress;
  await roadmap.save();
  res.json({ roadmap });
});

// @desc Get AI study guide & cheat sheet for a skill
const getStudyGuide = asyncHandler(async (req, res) => {
  const { skill } = req.params;
  const guide = await generateStudyGuide(skill);
  res.json({ guide });
});

module.exports = { createRoadmap, getMyRoadmap, updateRoadmapItemProgress, getStudyGuide };
