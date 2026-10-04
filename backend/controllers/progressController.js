const asyncHandler = require('express-async-handler');
const UserSkill = require('../models/UserSkill');
const Assessment = require('../models/Assessment');
const Application = require('../models/Application');
const Roadmap = require('../models/Roadmap');
const { computeCareerReadiness } = require('../services/skillGraphService');
const { getDailyBriefing: fetchDailyBriefing } = require('../services/careerAiService');

// @desc Aggregate progress data for charts (skills over time, readiness trend, etc.)
const getMyProgress = asyncHandler(async (req, res) => {
  const [skills, assessments, applications, roadmap] = await Promise.all([
    UserSkill.find({ user: req.user._id }).lean(),
    Assessment.find({ user: req.user._id, status: 'completed' }).sort({ completedAt: 1 }).lean(),
    Application.find({ user: req.user._id }).lean(),
    Roadmap.findOne({ user: req.user._id }).sort({ createdAt: -1 }).lean(),
  ]);

  const skillProgressOverTime = skills.map((s) => ({
    skill: s.skillName,
    history: s.history.map((h) => ({ level: h.level, date: h.recordedAt })),
  }));

  const readiness = req.user.targetRole
    ? await computeCareerReadiness(req.user._id, req.user.targetRole)
    : { overall: 0 };

  const coursesCompleted = roadmap ? roadmap.items.filter((i) => i.progress >= 100).length : 0;
  const avgAssessmentScore = assessments.length
    ? Math.round(
        assessments.reduce((sum, a) => {
          const avg = a.resultsBySkill.reduce((s, r) => s + r.score, 0) / (a.resultsBySkill.length || 1);
          return sum + avg;
        }, 0) / assessments.length
      )
    : 0;

  res.json({
    skillProgressOverTime,
    careerReadiness: readiness.overall,
    coursesCompleted,
    avgAssessmentScore,
    applicationsCount: applications.length,
    assessmentsCompleted: assessments.length,
  });
});

// @desc Get daily AI career briefing
// @route GET /api/progress/daily-briefing
const getDailyBriefing = asyncHandler(async (req, res) => {
  const briefing = await fetchDailyBriefing(req.user._id);
  res.json({ briefing });
});

module.exports = { getMyProgress, getDailyBriefing };
