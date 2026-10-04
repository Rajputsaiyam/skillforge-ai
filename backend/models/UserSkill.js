const mongoose = require('mongoose');

// A user's current proficiency in a given skill (built from resume + assessment)
const userSkillSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skillName: { type: String, required: true },
    level: { type: Number, default: 0, min: 0, max: 100 },
    source: { type: String, enum: ['resume', 'assessment', 'manual', 'blended', 'ai-detected'], default: 'blended' },
    history: [
      {
        level: Number,
        recordedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

userSkillSchema.index({ user: 1, skillName: 1 }, { unique: true });

module.exports = mongoose.model('UserSkill', userSkillSchema);
