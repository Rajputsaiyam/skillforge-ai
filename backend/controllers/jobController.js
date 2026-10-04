const asyncHandler = require('express-async-handler');
const Job = require('../models/Job');
const UserSkill = require('../models/UserSkill');
const Resume = require('../models/Resume');
const jobProviderService = require('../services/jobProviderService');
const { computeJobMatch } = require('../services/jobMatchService');
const mlServiceClient = require('../services/mlServiceClient');
const linkedinService = require('../services/linkedinService');
const { computeSkillGaps } = require('../services/skillGraphService');
const { predictJobInterviewQuestions } = require('../services/careerAiService');
const { detectLocationFromIp } = require('../services/locationService');
const logActivity = require('../utils/activityLogger');

async function getUserLevelMap(userId) {
  const skills = await UserSkill.find({ user: userId }).lean();
  return new Map(skills.map((s) => [s.skillName, s.level]));
}

// @desc Auto-detect client location context from IP
const detectLocation = asyncHandler(async (req, res) => {
  const clientIp = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
  const locationContext = await detectLocationFromIp(clientIp);
  res.json({ locationContext });
});

// @desc Search jobs (mock or live provider) with AI match scores attached
const searchJobs = asyncHandler(async (req, res) => {
  const connected = await jobProviderService.isProviderConnected();
  if (!connected) {
    return res.json({ jobs: [], integrationConnected: false, sources: jobProviderService.getJobSources() });
  }

  const { keyword, location, workMode, workTime, employmentType, skills } = req.query;
  const userTargetRole = req.user.targetRole || 'Full Stack Developer';
  const effectiveKeyword = (keyword && keyword.trim()) ? keyword.trim() : userTargetRole;

  let effectiveLocation = location;
  let detectedContext = null;
  if (!effectiveLocation || !effectiveLocation.trim()) {
    const clientIp = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
    detectedContext = await detectLocationFromIp(clientIp);
    effectiveLocation = detectedContext?.country || 'India';
  }

  const jobs = await jobProviderService.searchJobs({
    keyword: effectiveKeyword,
    targetRole: userTargetRole,
    location: effectiveLocation,
    workMode,
    workTime: workTime || employmentType || '',
    skills,
  });

  const [levelMap, resume] = await Promise.all([
    getUserLevelMap(req.user._id),
    Resume.findOne({ user: req.user._id }).sort({ createdAt: -1 }).lean(),
  ]);
  const experienceEntries = resume?.experience || [];

  let semanticScores = null;
  if (resume?.rawText && jobs.length) {
    semanticScores = await mlServiceClient.getSemanticMatchBatch(
      resume.rawText,
      jobs.map((j) => j.description || '')
    );
  }

  const jobsWithMatch = jobs.map((job, idx) => {
    const semanticSimilarity = semanticScores ? semanticScores[idx] : null;
    const match = computeJobMatch({ userLevelMap: levelMap, userExperienceEntries: experienceEntries, job, semanticSimilarity });
    const isDirectLinkedIn = job.source === 'linkedin' && job.externalUrl && job.externalUrl.includes('linkedin.com');
    const linkedInApplyUrl = isDirectLinkedIn
      ? job.externalUrl
      : linkedinService.buildLinkedInApplyUrl({ title: job.title, company: job.company, location: job.location });
    return { ...job, match, linkedInApplyUrl, isLiveLinkedIn: job.source === 'linkedin' };
  });

  jobsWithMatch.sort((a, b) => b.match.overallMatchPct - a.match.overallMatchPct);

  res.json({
    jobs: jobsWithMatch,
    locationContext: detectedContext || { country: effectiveLocation },
    integrationConnected: true,
    sources: jobProviderService.getJobSources(),
  });
});

// @desc Personalized "jump to LinkedIn" shortcuts built from the user's real
// target role + biggest skill gaps (real LinkedIn search URLs, opened in a new tab)
const getLinkedInSearchLinks = asyncHandler(async (req, res) => {
  const targetRole = req.query.targetRole || req.user.targetRole;
  const location = req.query.location || '';
  const workMode = req.query.workMode || '';

  let topGapSkills = [];
  if (targetRole) {
    const gaps = await computeSkillGaps(req.user._id, targetRole);
    topGapSkills = gaps.filter((g) => g.gap > 0).slice(0, 3).map((g) => g.skill);
  }

  const links = linkedinService.buildPersonalizedSearchLinks({ targetRole, topGapSkills, location, workMode });
  res.json({ links, targetRole });
});

// @desc Get single job details + match breakdown
const getJobDetails = asyncHandler(async (req, res) => {
  const job = await jobProviderService.getJobDetails(req.params.id);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }
  await Job.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

  const [levelMap, resume] = await Promise.all([
    getUserLevelMap(req.user._id),
    Resume.findOne({ user: req.user._id }).sort({ createdAt: -1 }).lean(),
  ]);

  let semanticSimilarity = null;
  if (resume?.rawText && job.description) {
    semanticSimilarity = await mlServiceClient.getSemanticMatch(resume.rawText, job.description);
  }

  const match = computeJobMatch({
    userLevelMap: levelMap,
    userExperienceEntries: resume?.experience || [],
    job,
    semanticSimilarity,
  });

  const linkedInApplyUrl = linkedinService.buildLinkedInApplyUrl({ title: job.title, company: job.company, location: job.location });
  const linkedInCompanyUrl = linkedinService.buildLinkedInCompanyUrl(job.company);

  res.json({ job: { ...job, linkedInApplyUrl, linkedInCompanyUrl }, match });
});

// @desc Predict tailored interview questions for this specific job
const getJobInterviewPrep = asyncHandler(async (req, res) => {
  const job = await jobProviderService.getJobDetails(req.params.id);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }
  const prep = await predictJobInterviewQuestions(job);
  res.json({ prep });
});

const getJobSources = asyncHandler(async (req, res) => {
  res.json({ sources: jobProviderService.getJobSources(), integrationConnected: await jobProviderService.isProviderConnected() });
});

module.exports = {
  searchJobs,
  getJobDetails,
  getJobSources,
  getLinkedInSearchLinks,
  getJobInterviewPrep,
  detectLocation,
};
