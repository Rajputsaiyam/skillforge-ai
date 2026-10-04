/**
 * Roadmap Service — turns computed skill gaps into a week-by-week learning plan.
 * Ordering uses the same priority/demand weighting as the graph recommender so the
 * roadmap and the Skill Graph "Recommended" nodes stay consistent with each other.
 */
const { computeSkillGaps } = require('./skillGraphService');
const gemini = require('./geminiService');

const RESOURCE_LIBRARY = {
  Docker: [{ title: 'Docker for Developers', type: 'Course', url: 'https://docs.docker.com/get-started/' }],
  AWS: [{ title: 'AWS Cloud Practitioner Essentials', type: 'Course', url: 'https://aws.amazon.com/training/' }],
  'React': [{ title: 'Advanced React Patterns', type: 'Course', url: 'https://react.dev/learn' }],
  'Node.js': [{ title: 'Node.js Design Patterns', type: 'Docs', url: 'https://nodejs.org/en/docs' }],
  MongoDB: [{ title: 'MongoDB University: M001', type: 'Course', url: 'https://university.mongodb.com/' }],
};

function estimateHours(gap) {
  if (gap >= 50) return 30;
  if (gap >= 30) return 20;
  if (gap >= 15) return 12;
  return 6;
}

async function generateRoadmap(userId, targetRole) {
  const gaps = await computeSkillGaps(userId, targetRole);
  const priorityWeight = { Critical: 4, High: 3, Medium: 2, Low: 1 };
  const sorted = [...gaps].sort((a, b) => (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0) || b.gap - a.gap);

  const fallbackItems = sorted
    .filter((g) => g.gap > 0)
    .map((g, idx) => ({
      week: idx + 1,
      skill: g.skill,
      reason: `Required for ${targetRole} (priority: ${g.priority}). Currently ${g.gap}% below target.`,
      currentLevel: g.yourLevel,
      targetLevel: g.requiredLevel,
      estimatedHours: estimateHours(g.gap),
      resources: RESOURCE_LIBRARY[g.skill] || [{ title: `${g.skill} Fundamentals`, type: 'Course', url: '#' }],
      progress: 0,
    }));

  const gapsForAI = sorted.filter((g) => g.gap > 0).slice(0, 10).map((g) => ({ skill: g.skill, gap: g.gap, currentLevel: g.yourLevel, requiredLevel: g.requiredLevel, priority: g.priority }));
  if (!gapsForAI.length) return fallbackItems;

  const result = await gemini.generateJson({
    systemInstruction: 'You are a career curriculum designer. Make progressive, realistic learning plans and return only valid JSON. Never make up links.',
    prompt: `Create a personalized weekly learning roadmap for a ${targetRole}. Skill gaps: ${JSON.stringify(gapsForAI)}. Return {"items":[{"week":1,"skill":"exact skill from input","reason":"specific reason","estimatedHours":12,"milestone":"observable outcome"}]}. Use each input skill at most once, order prerequisites before advanced topics, 4-10 items.`,
    maxOutputTokens: 1600,
    temperature: 0.35,
  });
  const aiItems = result?.value?.items;
  if (!Array.isArray(aiItems)) return fallbackItems;

  const allowed = new Map(gapsForAI.map((g) => [g.skill.toLowerCase(), g]));
  const normalized = aiItems
    .filter((item) => item?.skill && allowed.has(String(item.skill).toLowerCase()))
    .slice(0, 10)
    .map((item, idx) => {
      const gap = allowed.get(String(item.skill).toLowerCase());
      return {
        week: idx + 1,
        skill: gap.skill,
        reason: String(item.reason || `Required for ${targetRole} (priority: ${gap.priority}).`).slice(0, 360),
        currentLevel: gap.currentLevel,
        targetLevel: gap.requiredLevel,
        estimatedHours: Math.max(2, Math.min(40, Number(item.estimatedHours) || estimateHours(gap.gap))),
        resources: RESOURCE_LIBRARY[gap.skill] || [{ title: `${gap.skill} official learning resources`, type: 'Study', url: '#' }],
        progress: 0,
      };
    });
  return normalized.length ? normalized : fallbackItems;
}

module.exports = { generateRoadmap };
