const asyncHandler = require('express-async-handler');
const fs = require('fs');
const Resume = require('../models/Resume');
const UserSkill = require('../models/UserSkill');
const { parseResume } = require('../services/resumeParserService');
const { roleRequirements } = require('../data/skillsTaxonomy');
const { discoverAndSyncUserSkills } = require('../services/skillGraphService');
const logActivity = require('../utils/activityLogger');
const { reviewResume, generateResumeDraft } = require('../services/resumeAiService');
const { rewriteBulletPoint } = require('../services/careerAiService');

// @desc Upload + parse resume
const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }
  const parsed = await parseResume(req.file.path, req.file.mimetype);
  const { scoreResumeAts } = require('../services/atsScorerService');
  const atsReport = await scoreResumeAts({
    resumeText: parsed.rawText,
    targetRole: req.user.targetRole || 'Full Stack Developer',
  });
  const aiAnalysis = await reviewResume({ rawText: parsed.rawText, parsed, targetRole: req.user.targetRole });

  let missingSkills = [];
  if (req.user.targetRole && roleRequirements[req.user.targetRole]) {
    const detectedNames = new Set(parsed.detectedSkills.map((s) => s.name));
    missingSkills = roleRequirements[req.user.targetRole]
      .map((r) => r.skill)
      .filter((s) => !detectedNames.has(s));
  }

  const finalScore = atsReport?.overallScore || aiAnalysis?.atsScore || parsed.resumeScore;

  const resume = await Resume.create({
    user: req.user._id,
    originalFileName: req.file.originalname,
    fileType: req.file.mimetype.includes('pdf') ? 'pdf' : 'docx',
    rawText: parsed.rawText,
    detectedSkills: parsed.detectedSkills,
    education: parsed.education,
    experience: parsed.experience,
    projects: parsed.projects,
    certifications: parsed.certifications,
    missingSkills,
    suggestions: atsReport?.criticalFixes?.length ? atsReport.criticalFixes : parsed.suggestions,
    resumeScore: finalScore,
    atsReport,
    aiAnalysis,
    stats: parsed.stats,
  });

  await Promise.all(
    parsed.detectedSkills.map(async (s) => {
      const level = Math.round(s.confidence * 70);
      await UserSkill.findOneAndUpdate(
        { user: req.user._id, skillName: s.name },
        {
          $max: { level },
          $push: { history: { level, recordedAt: new Date() } },
          $setOnInsert: { source: 'resume' },
        },
        { upsert: true, new: true }
      );
    })
  );

  fs.unlink(req.file.path, () => {});
  await logActivity(req.user._id, 'resume_uploaded', `${req.user.fullName} uploaded a resume`, {
    skillsDetected: parsed.stats.skillsDetected,
  });

  const { discovered } = await discoverAndSyncUserSkills(req.user._id, parsed.rawText);
  if (discovered.length) {
    await logActivity(req.user._id, 'ai_skills_discovered', `AI discovered ${discovered.length} additional skill(s) from ${req.user.fullName}'s resume`, {
      discovered,
    });
  }

  res.status(201).json({ resume, aiDiscoveredSkills: discovered });
});

// @desc Get latest resume analysis for current user
const getMyResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ user: req.user._id }).sort({ createdAt: -1 });
  if (resume) {
    // If the resume has legacy hardcoded 74 or missing atsReport, auto-recalculate with the real model!
    if (!resume.atsReport || resume.resumeScore === 74) {
      const { scoreResumeAts } = require('../services/atsScorerService');
      const atsReport = await scoreResumeAts({
        resumeText: resume.rawText,
        targetRole: req.user.targetRole || 'Full Stack Developer',
      });
      resume.atsReport = atsReport;
      resume.resumeScore = atsReport.overallScore;
      if (atsReport.criticalFixes?.length) {
        resume.suggestions = atsReport.criticalFixes;
      }
      await resume.save();
    }
  }
  res.json({ resume });
});


// @desc Generate a fact-grounded, ATS-friendly resume draft using Gemini.
const generateResume = asyncHandler(async (req, res) => {
  const latest = await Resume.findOne({ user: req.user._id }).sort({ createdAt: -1 }).lean();
  const { targetRole = req.user.targetRole, jobDescription = '', details = {} } = req.body;
  if (!targetRole) {
    res.status(400);
    throw new Error('Set a target role before generating a resume.');
  }
  const generated = await generateResumeDraft({ user: req.user, parsed: latest, targetRole, jobDescription, details });
  if (!generated) {
    res.status(503);
    throw new Error('Gemini is not configured or is temporarily unavailable. Add GEMINI_API_KEY and try again.');
  }
  res.json(generated);
});

// @desc Re-score an uploaded resume against a pasted job description.
const reviewForJob = asyncHandler(async (req, res) => {
  const latest = await Resume.findOne({ user: req.user._id }).sort({ createdAt: -1 });
  if (!latest) {
    res.status(404);
    throw new Error('Upload a resume before requesting an ATS review.');
  }
  const analysis = await reviewResume({ rawText: latest.rawText, parsed: latest, targetRole: req.body.targetRole || req.user.targetRole, jobDescription: req.body.jobDescription || '' });
  if (!analysis) {
    res.status(503);
    throw new Error('Gemini is not configured or is temporarily unavailable.');
  }
  latest.aiAnalysis = analysis;
  latest.resumeScore = analysis.atsScore;
  await latest.save();
  res.json({ analysis });
});

// @desc AI Power-rewrite a resume bullet point into metric-driven variations
const rewriteBullet = asyncHandler(async (req, res) => {
  const { bulletText, targetRole } = req.body;
  if (!bulletText || !bulletText.trim()) {
    res.status(400);
    throw new Error('Bullet text is required');
  }
  const result = await rewriteBulletPoint(bulletText, targetRole || req.user.targetRole || 'Software Engineer');
  res.json(result);
});

// @desc Run dedicated enterprise ATS Score Checker Model on resume or custom text
const checkAtsScore = asyncHandler(async (req, res) => {
  const { resumeText, targetRole, jobDescription } = req.body;
  const { scoreResumeAts } = require('../services/atsScorerService');

  let textToScore = resumeText;
  let isCheckingUploaded = false;

  if (!textToScore || !textToScore.trim()) {
    const latest = await Resume.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    if (!latest || !latest.rawText) {
      res.status(400);
      throw new Error('Please upload a resume or provide resume text to check ATS score.');
    }
    textToScore = latest.rawText;
    isCheckingUploaded = true;
  }

  const roleToTarget = targetRole || req.user.targetRole || 'Full Stack Developer';
  const atsReport = await scoreResumeAts({
    resumeText: textToScore,
    targetRole: roleToTarget,
    jobDescription: jobDescription || '',
  });

  if (isCheckingUploaded) {
    const latest = await Resume.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    if (latest) {
      latest.resumeScore = atsReport.overallScore;
      await latest.save();
    }
  }

  res.json({ atsReport });
});

module.exports = { uploadResume, getMyResume, generateResume, reviewForJob, rewriteBullet, checkAtsScore };

