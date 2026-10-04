const mongoose = require('mongoose');

const citationSchema = new mongoose.Schema(
  {
    chunkId: { type: String },
    source: { type: String, required: true },
    category: { type: String, default: 'profile' },
    excerpt: { type: String, required: true },
    relevanceScore: { type: Number, default: 0 },
  },
  { _id: false }
);

const chatMessageSchema = new mongoose.Schema(
  {
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatSession', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    retrievedContext: [citationSchema],
    generatedBy: { type: String, default: 'gemini' },
    feedback: { type: String, enum: ['positive', 'negative', 'none'], default: 'none' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
