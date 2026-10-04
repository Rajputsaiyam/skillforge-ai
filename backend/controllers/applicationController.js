const asyncHandler = require('express-async-handler');
const Application = require('../models/Application');
const Job = require('../models/Job');
const logActivity = require('../utils/activityLogger');
const { getStageGuidance } = require('../services/careerAiService');

const { checkLiveLinkedInPosting } = require('../services/linkedinLiveJobService');

// @desc Save a job or apply and track (supports status: 'Saved' or 'Applied')
const saveJob = asyncHandler(async (req, res) => {
  const { jobId, matchScore, status = 'Saved', notes } = req.body;
  const job = await Job.findById(jobId);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  let liveTracking = {
    source: job.source || 'linkedin',
    linkedInJobId: job.externalJobId,
    postingStatus: 'Active & Accepting Applications',
    applicantsCount: 'Recruiter actively reviewing',
    lastSyncedAt: new Date(),
  };

  const existing = await Application.findOne({ user: req.user._id, job: jobId });
  if (existing) {
    if (status && status !== existing.status) {
      existing.status = status;
      existing.statusHistory.push({ status, changedAt: new Date() });
      if (status === 'Applied' && !existing.appliedDate) {
        existing.appliedDate = new Date();
      }
      if (notes) existing.notes = notes;
      await existing.save();
      await logActivity(req.user._id, 'application_status_updated', `Application for ${job.title} updated to ${status}`);
    }
    const populated = await Application.findById(existing._id).populate('job');
    return res.json({ application: populated, message: `Application updated to ${status}` });
  }

  // If it is a live LinkedIn job, perform quick live status check
  if (job.source === 'linkedin' && job.externalJobId) {
    try {
      const liveData = await checkLiveLinkedInPosting(job.externalJobId);
      liveTracking = {
        source: 'linkedin',
        linkedInJobId: job.externalJobId,
        postingStatus: liveData.postingStatus,
        applicantsCount: liveData.applicantsCount,
        seniorityLevel: liveData.seniorityLevel,
        postedAgo: liveData.postedAgo,
        isClosed: liveData.isClosed,
        lastSyncedAt: new Date(),
      };
    } catch (e) {
      // Keep defaults
    }
  }

  const application = await Application.create({
    user: req.user._id,
    job: jobId,
    matchScore: matchScore || 0,
    status: status,
    appliedDate: status === 'Applied' ? new Date() : undefined,
    notes: notes || '',
    liveTracking,
    statusHistory: [{ status: status, changedAt: new Date() }],
  });

  if (status === 'Applied') {
    await Job.findByIdAndUpdate(jobId, { $inc: { applicationsCount: 1 } });
    await logActivity(req.user._id, 'job_applied', `${req.user.fullName} applied to ${job.title} at ${job.company}`);
  } else {
    await logActivity(req.user._id, 'job_saved', `${req.user.fullName} saved job ${job.title}`);
  }

  const populated = await Application.findById(application._id).populate('job');
  res.status(201).json({ application: populated });
});

// @desc List current user's applications (kanban board)
const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ user: req.user._id }).populate('job').sort({ updatedAt: -1 });
  res.json({ applications });
});

// @desc Update application status (drag-and-drop kanban)
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const application = await Application.findOne({ _id: req.params.id, user: req.user._id });
  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }
  application.status = status;
  application.statusHistory.push({ status });
  if (status === 'Applied' && !application.appliedDate) application.appliedDate = new Date();
  await application.save();

  if (status === 'Applied') {
    await Job.findByIdAndUpdate(application.job, { $inc: { applicationsCount: 1 } });
  }

  await logActivity(req.user._id, 'application_status_updated', `Application moved to ${status}`);
  res.json({ application });
});

// @desc Add a manual application (external tracking)
const addManualApplication = asyncHandler(async (req, res) => {
  const { title, company, location, workMode, externalUrl, notes, status, matchScore } = req.body;
  if (!title || !company) {
    res.status(400);
    throw new Error('Title and company are required');
  }

  const manualJob = await Job.create({
    source: 'manual',
    externalJobId: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    externalUrl: externalUrl || '#',
    title: title.trim(),
    company: company.trim(),
    location: location || 'Remote/Open',
    workMode: workMode || 'Remote',
    description: notes || `Manually tracked application for ${title} at ${company}.`,
    requiredSkills: [],
  });

  const application = await Application.create({
    user: req.user._id,
    job: manualJob._id,
    status: status || 'Applied',
    matchScore: matchScore || 75,
    notes: notes || '',
    appliedDate: new Date(),
    statusHistory: [{ status: status || 'Applied', changedAt: new Date() }],
  });

  await logActivity(req.user._id, 'application_manual_added', `Manually logged application for ${title} at ${company}`);
  const populated = await Application.findById(application._id).populate('job');
  res.status(201).json({ application: populated });
});

// @desc Get stage-specific AI guidance
const getApplicationStageGuidance = asyncHandler(async (req, res) => {
  const { stage } = req.params;
  const { jobTitle, company } = req.query;
  const guidance = getStageGuidance(stage, jobTitle || 'Software Engineer', company || 'Target Company');
  res.json({ guidance });
});

const deleteApplication = asyncHandler(async (req, res) => {
  await Application.deleteOne({ _id: req.params.id, user: req.user._id });
  res.json({ success: true });
});

// @desc Sync live LinkedIn status for a single application
const syncLinkedInStatus = asyncHandler(async (req, res) => {
  const application = await Application.findOne({ _id: req.params.id, user: req.user._id }).populate('job');
  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  const job = application.job;
  const linkedInJobId = application.liveTracking?.linkedInJobId || job?.externalJobId;

  if (job?.source === 'linkedin' && linkedInJobId) {
    const liveData = await checkLiveLinkedInPosting(linkedInJobId);
    application.liveTracking = {
      source: 'linkedin',
      linkedInJobId,
      postingStatus: liveData.postingStatus,
      applicantsCount: liveData.applicantsCount,
      seniorityLevel: liveData.seniorityLevel,
      postedAgo: liveData.postedAgo,
      isClosed: liveData.isClosed,
      lastSyncedAt: new Date(),
    };
    await application.save();
  }

  res.json({ application, message: 'Live LinkedIn tracking synchronized' });
});

// @desc Sync live LinkedIn status for all candidate's tracked applications
const syncAllLinkedInApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ user: req.user._id }).populate('job');
  const updatedApps = [];

  for (const app of applications) {
    const job = app.job;
    const linkedInJobId = app.liveTracking?.linkedInJobId || job?.externalJobId;

    if (job?.source === 'linkedin' && linkedInJobId) {
      try {
        const liveData = await checkLiveLinkedInPosting(linkedInJobId);
        app.liveTracking = {
          source: 'linkedin',
          linkedInJobId,
          postingStatus: liveData.postingStatus,
          applicantsCount: liveData.applicantsCount,
          seniorityLevel: liveData.seniorityLevel,
          postedAgo: liveData.postedAgo,
          isClosed: liveData.isClosed,
          lastSyncedAt: new Date(),
        };
        await app.save();
        updatedApps.push(app);
      } catch (e) {
        updatedApps.push(app);
      }
    } else {
      updatedApps.push(app);
    }
  }

  res.json({ applications: updatedApps, syncedCount: updatedApps.length });
});

module.exports = {
  saveJob,
  getMyApplications,
  updateApplicationStatus,
  addManualApplication,
  getApplicationStageGuidance,
  deleteApplication,
  syncLinkedInStatus,
  syncAllLinkedInApplications,
};
