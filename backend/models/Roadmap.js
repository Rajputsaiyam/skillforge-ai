const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetRole: { type: String, required: true },
    items: [
      {
        week: Number,
        skill: String,
        reason: String,
        currentLevel: Number,
        targetLevel: Number,
        estimatedHours: Number,
        resources: [
          {
            title: String,
            type: { type: String, enum: ['Course', 'Docs', 'Project', 'Video'], default: 'Course' },
            url: String,
          },
        ],
        progress: { type: Number, default: 0 },
      },
    ],
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Roadmap', roadmapSchema);
