const mongoose = require('mongoose');

// Master skill taxonomy node (used to build the Skill Graph)
const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    category: { type: String, default: 'General' }, // e.g. Frontend, Backend, DevOps, Data
    difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
    aliases: [String], // alternate names used in fuzzy matching, e.g. "JS" -> "JavaScript"
    prerequisites: [{ type: String }], // skill names required before this one
    relatedSkills: [{ type: String }],
    requiredForRoles: [
      {
        role: String,
        requiredLevel: { type: Number, default: 70 }, // 0-100 target proficiency
        priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
      },
    ],
    marketDemand: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    // 'taxonomy' = seeded master list, 'ai-detected' = auto-created by the ML
    // service's open-vocabulary skill discovery when it found a real skill-shaped
    // term that isn't in the master taxonomy yet (keeps the graph dynamic/growing).
    source: { type: String, enum: ['taxonomy', 'ai-detected'], default: 'taxonomy' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Skill', skillSchema);
