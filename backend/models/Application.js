const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    matchScore: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Saved', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected'],
      default: 'Saved',
    },
    appliedDate: { type: Date },
    notes: { type: String, default: '' },
    liveTracking: {
      source: { type: String, default: 'linkedin' },
      linkedInJobId: { type: String },
      postingStatus: { type: String, default: 'Active & Accepting Applications' },
      applicantsCount: { type: String, default: '' },
      seniorityLevel: { type: String, default: '' },
      postedAgo: { type: String, default: '' },
      isClosed: { type: Boolean, default: false },
      lastSyncedAt: { type: Date, default: Date.now },
    },
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

applicationSchema.index({ user: 1, job: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
