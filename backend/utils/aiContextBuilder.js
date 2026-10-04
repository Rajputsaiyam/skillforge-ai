/**
 * AI Context Builder
 * -------------------
 * Turns a user's live data (skill graph state, resume, target role) into a small
 * list of short text "chunks" that the ML service's /chat endpoint can retrieve
 * from (RAG-lite: it re-ranks these chunks by embedding similarity to the
 * question before answering) — used by both the general chatbot and the AI
 * Interview feature so answers/questions are grounded in the real user, not
 * generic text.
 */
const User = require('../models/User');
const Resume = require('../models/Resume');
const UserSkill = require('../models/UserSkill');
const { computeCareerReadiness } = require('../services/skillGraphService');

async function buildUserContextChunks(userId) {
  const chunks = [];
  const [user, resume, userSkills] = await Promise.all([
    User.findById(userId).lean(),
    Resume.findOne({ user: userId }).sort({ createdAt: -1 }).lean(),
    UserSkill.find({ user: userId }).sort({ level: -1 }).lean(),
  ]);

  if (user?.targetRole) {
    chunks.push(`The user's target role is ${user.targetRole}.`);
  }

  if (userSkills?.length) {
    const top = userSkills.slice(0, 12).map((s) => `${s.skillName} (${s.level}/100)`).join(', ');
    chunks.push(`The user's current skills and proficiency levels: ${top}.`);
  }

  if (user?.targetRole) {
    try {
      const readiness = await computeCareerReadiness(userId, user.targetRole);
      if (readiness?.gaps?.length) {
        const topGaps = readiness.gaps
          .filter((g) => g.gap > 0)
          .slice(0, 5)
          .map((g) => `${g.skill} (needs +${g.gap} points, priority ${g.priority})`)
          .join(', ');
        if (topGaps) chunks.push(`The user's biggest skill gaps for ${user.targetRole}: ${topGaps}.`);
        chunks.push(`The user's overall career readiness score for ${user.targetRole} is ${readiness.overall}%.`);
      }
    } catch (e) {
      // non-fatal — chatbot/interview still works without this chunk
    }
  }

  if (resume?.rawText) {
    chunks.push(`Resume excerpt: ${resume.rawText.slice(0, 600)}`);
  }
  if (resume?.projects?.length) {
    const proj = resume.projects.slice(0, 3).map((p) => `${p.name}: ${(p.skills || []).join(', ')}`).join(' | ');
    chunks.push(`The user's resume projects: ${proj}.`);
  }

  return chunks;
}

module.exports = { buildUserContextChunks };
