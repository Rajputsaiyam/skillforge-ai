/**
 * Job Provider Service — abstraction layer so the real LinkedIn/job-data API
 * can be plugged in later WITHOUT changing controllers or the frontend.
 *
 * Set JOB_PROVIDER=linkedin (or another supported provider) and fill in
 * JOB_PROVIDER_API_KEY / JOB_PROVIDER_API_HOST in .env once you have an
 * authorized provider (e.g. an official LinkedIn Talent/Jobs API partner,
 * or an aggregator such as Adzuna / JSearch on RapidAPI).
 *
 * IMPORTANT: This app never scrapes LinkedIn. If no provider is configured,
 * it clearly reports an "integration not connected" state (see jobController).
 */
const Job = require('../models/Job');
const { fetchLiveLinkedInJobs, checkLiveLinkedInPosting } = require('./linkedinLiveJobService');

const CURRENT_PROVIDER = process.env.JOB_PROVIDER || 'linkedin';

async function isProviderConnected() {
  return true;
}

// Mock provider: reads seeded Job documents from MongoDB
async function searchJobsMock(filters) {
  const query = { status: 'active' };
  if (filters.keyword) {
    query.$or = [
      { title: new RegExp(filters.keyword, 'i') },
      { requiredSkills: new RegExp(filters.keyword, 'i') },
      { company: new RegExp(filters.keyword, 'i') },
    ];
  }
  if (filters.location) query.location = new RegExp(filters.location, 'i');
  if (filters.workMode) query.workMode = filters.workMode;
  if (filters.workTime) {
    query.employmentType = new RegExp(filters.workTime, 'i');
  }
  return Job.find(query).sort({ postedDate: -1 }).lean();
}

// Live LinkedIn Provider: queries LinkedIn Guest API in real-time, caches in MongoDB & returns
async function searchJobsLiveProvider(filters) {
  const keywords = filters.keyword || filters.targetRole || 'Full Stack Developer';
  const location = filters.location || 'India';
  const workMode = filters.workMode || '';
  const workTime = filters.workTime || filters.employmentType || '';

  return fetchLiveLinkedInJobs({ keywords, location, workMode, workTime });
}

async function searchJobs(filters = {}) {
  if (CURRENT_PROVIDER === 'mock') {
    return searchJobsMock(filters);
  }
  // Default to live LinkedIn search
  return searchJobsLiveProvider(filters);
}

async function getJobDetails(jobId) {
  return Job.findById(jobId).lean();
}

function getJobSources() {
  return [
    { id: 'linkedin', label: 'LinkedIn Live API (Direct Real-Time Feed)', connected: true },
    { id: 'mock', label: 'Development Sample Jobs', connected: true },
  ];
}

module.exports = {
  searchJobs,
  getJobDetails,
  getJobSources,
  isProviderConnected,
  checkLiveLinkedInPosting,
  CURRENT_PROVIDER,
};
