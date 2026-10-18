const mongoose = require('mongoose');

const recipientItemSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    org: { type: String, default: 'Tech Team' },
    status: {
      type: String,
      enum: ['Queued', 'Delivered', 'Simulated', 'Failed'],
      default: 'Delivered',
    },
    messageId: { type: String },
    sentAt: { type: Date, default: Date.now },
    error: { type: String },
  },
  { _id: false }
);

const coldEmailBatchSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderEmail: { type: String, required: true, trim: true, default: 'saiyamrajput71@gmail.com' },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    recipients: [recipientItemSchema],
    totalCount: { type: Number, required: true, default: 0 },
    deliveredCount: { type: Number, required: true, default: 0 },
    mode: {
      type: String,
      enum: ['live_smtp', 'simulated'],
      default: 'live_smtp',
    },
    hasAttachment: { type: Boolean, default: false },
  },
  { timestamps: true }
);

coldEmailBatchSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('ColdEmailBatch', coldEmailBatchSchema);
