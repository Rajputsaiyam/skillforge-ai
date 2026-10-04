const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: 'Career Discussion', trim: true },
    targetRole: { type: String, default: '' },
    pinned: { type: Boolean, default: false },
    messageCount: { type: Number, default: 0 },
    lastActiveAt: { type: Date, default: Date.now, index: true },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChatSession', chatSessionSchema);
