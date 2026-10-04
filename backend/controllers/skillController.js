const asyncHandler = require('express-async-handler');
const UserSkill = require('../models/UserSkill');
const {
  buildSkillGraph,
  recommendNextSkills,
  computeSkillGaps,
  computeCareerReadiness,
} = require('../services/skillGraphService');
const { getGapClosingStrategy } = require('../services/careerAiService');

// @desc Get current user's skill list (for dashboard "Top Skills")
const getMySkills = asyncHandler(async (req, res) => {
  const skills = await UserSkill.find({ user: req.user._id }).sort({ level: -1 });
  res.json({ skills });
});

// @desc Manually set/update a skill level (used by Profile page / assessment blend)
const upsertSkill = asyncHandler(async (req, res) => {
  const { skillName, level } = req.body;
  const skill = await UserSkill.findOneAndUpdate(
    { user: req.user._id, skillName },
    { level, $push: { history: { level, recordedAt: new Date() } } },
    { upsert: true, new: true }
  );
  res.json({ skill });
});

// @desc Get the full interactive Skill Graph (nodes + edges) for React Flow
const getSkillGraph = asyncHandler(async (req, res) => {
  const targetRole = req.query.targetRole || req.user.targetRole;
  const graph = await buildSkillGraph(req.user._id, targetRole);
  res.json(graph);
});

// @desc Get recommended next skills (graph-based recommender)
const getRecommendations = asyncHandler(async (req, res) => {
  const targetRole = req.query.targetRole || req.user.targetRole;
  const recommendations = await recommendNextSkills(req.user._id, targetRole);
  res.json({ recommendations });
});

// @desc Get skill gaps vs a target role
const getSkillGaps = asyncHandler(async (req, res) => {
  const targetRole = req.query.targetRole || req.user.targetRole;
  if (!targetRole) return res.json({ gaps: [], targetRole: null });
  const gaps = await computeSkillGaps(req.user._id, targetRole);
  res.json({ gaps, targetRole });
});

// @desc Get career readiness score + breakdown
const getCareerReadiness = asyncHandler(async (req, res) => {
  const targetRole = req.query.targetRole || req.user.targetRole;
  if (!targetRole) return res.json({ overall: 0, breakdown: {} });
  const readiness = await computeCareerReadiness(req.user._id, targetRole);
  res.json(readiness);
});

// @desc Get 30-day AI-generated gap-closing strategy
const getGapStrategy = asyncHandler(async (req, res) => {
  const targetRole = req.body.targetRole || req.query.targetRole || req.user.targetRole || 'Software Engineer';
  const strategy = await getGapClosingStrategy(req.user._id, targetRole);
  res.json({ strategy });
});

module.exports = {
  getMySkills,
  upsertSkill,
  getSkillGraph,
  getRecommendations,
  getSkillGaps,
  getCareerReadiness,
  getGapStrategy,
};
