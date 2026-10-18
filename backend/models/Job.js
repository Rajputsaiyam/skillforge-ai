const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      enum: ['mock', 'linkedin', 'indeed', 'naukri', 'career_page', 'adzuna', 'manual', 'other'],
      default: 'linkedin',
      required: true,
    },
    sourceName: { type: String, default: 'LinkedIn' },
    externalJobId: { type: String, required: true },
    externalUrl: { type: String, required: true },
    applyUrl: { type: String },
    title: { type: String, required: true },
    company: { type: String, required: true },
    companyLogo: { type: String, default: '' },
    location: { type: String, default: '' },
    subLocality: { type: String, default: '' },
    distanceKm: { type: Number },
    workMode: { type: String, enum: ['Remote', 'Hybrid', 'On-site'], default: 'On-site' },
    employmentType: { type: String, default: 'Full-time' },
    experienceRequired: { type: String, default: '0-2 years' },
    salaryRange: { type: String, default: '' },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    salaryText: { type: String, default: '' },
    description: { type: String, default: '' },
    requiredSkills: [{ type: String }],
    preferredSkills: [{ type: String }],
    postedDate: { type: Date, default: Date.now },
    views: { type: Number, default: 0 },
    matchRequests: { type: Number, default: 0 },
    applicationsCount: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'closed'], default: 'active' },
  },
  { timestamps: true }
);

jobSchema.index({ source: 1, externalJobId: 1 }, { unique: true });

module.exports = mongoose.model('Job', jobSchema);
