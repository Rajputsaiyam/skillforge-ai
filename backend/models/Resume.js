const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    originalFileName: String,
    fileType: String, // pdf | docx
    rawText: String,
    resumeScore: { type: Number, default: 0 },
    detectedSkills: [
      {
        name: String,
        confidence: Number, // 0-1 from matching algorithm
        source: { type: String, enum: ['exact', 'fuzzy', 'semantic', 'context'], default: 'exact' },
      },
    ],
    education: [{ school: String, degree: String, field: String, year: String }],
    experience: [{ company: String, title: String, duration: String }],
    projects: [{ name: String, description: String, skills: [String] }],
    certifications: [{ name: String, issuer: String }],
    missingSkills: [String],
    suggestions: [String],
    aiAnalysis: {
      atsScore: Number,
      headline: String,
      keywordCoverage: [String],
      missingKeywords: [String],
      improvements: [String],
      rewrittenBullets: [String],
      summary: String,
      generatedBy: String,
    },
    atsReport: { type: mongoose.Schema.Types.Mixed },
    stats: {
      skillsDetected: { type: Number, default: 0 },
      projectsFound: { type: Number, default: 0 },
      experienceEntries: { type: Number, default: 0 },
      certificationsFound: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);


module.exports = mongoose.model('Resume', resumeSchema);
