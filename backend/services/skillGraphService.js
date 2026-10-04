/**
 * Skill Graph Service
 * --------------------
 * Builds a PERSONALIZED graph (nodes + edges), not a static dump of every seeded
 * taxonomy skill to every user. The graph is assembled from:
 *   1. Skills the user actually has (from resume parsing, assessments, or manual entry)
 *   2. Skills required for their target role
 *   3. A 1-hop expansion along prerequisite/related edges (so the graph still shows
 *      the "next step" context around what the user has/needs)
 *   4. Any skill the ML service auto-discovered for this user specifically
 *      (source: 'ai-detected' on the Skill doc) — these are real, dynamically
 *      grown nodes, not part of the fixed default taxonomy.
 *
 * A lightweight BFS/topological traversal over prerequisite edges powers the
 * "recommend what to learn next" feature — explainable, no black-box model needed.
 */
const Skill = require('../models/Skill');
const UserSkill = require('../models/UserSkill');
const { roleRequirements, extendedSkillVocabulary } = require('../data/skillsTaxonomy');
const mlServiceClient = require('./mlServiceClient');

function classifyState(level, requiredLevel) {
  if (level === 0) return 'Missing';
  if (requiredLevel && level >= requiredLevel) return 'Strong';
  if (requiredLevel && level >= requiredLevel - 15) return 'Current';
  if (level > 0 && level < 40) return 'Needs Improvement';
  return 'Current';
}

// Builds the personalized set of skill NAMES relevant to this user: what they
// have + what their target role needs + a 1-hop neighborhood around those,
// instead of returning the entire Skill collection to every user regardless
// of relevance (the old, static "default skill list" behavior).
function computeRelevantSkillNames(allSkillDocs, ownedNames, requiredNames) {
  const byName = new Map(allSkillDocs.map((s) => [s.name, s]));
  const relevant = new Set([...ownedNames, ...requiredNames]);

  // 1-hop expansion along prerequisite + related edges so the graph shows
  // meaningful context (what unlocks next / what's adjacent) around the core set.
  const seedNames = Array.from(relevant);
  seedNames.forEach((name) => {
    const doc = byName.get(name);
    if (!doc) return;
    (doc.prerequisites || []).forEach((p) => relevant.add(p));
    (doc.relatedSkills || []).forEach((r) => relevant.add(r));
  });

  return relevant;
}

async function buildSkillGraph(userId, targetRole) {
  const [allSkillDocs, userSkills] = await Promise.all([
    Skill.find({}).lean(),
    UserSkill.find({ user: userId }).lean(),
  ]);

  const levelMap = new Map(userSkills.map((us) => [us.skillName, us.level]));
  const ownedNames = userSkills.filter((us) => us.level > 0).map((us) => us.skillName);
  const requirements = (targetRole && roleRequirements[targetRole]) || [];
  const reqMap = new Map(requirements.map((r) => [r.skill, r]));
  const requiredNames = requirements.map((r) => r.skill);

  let relevantNames = computeRelevantSkillNames(allSkillDocs, ownedNames, requiredNames);

  // Brand-new user with no skills yet and no target role: don't show the whole
  // static catalog — show a small, real "trending / high-demand" starter set so
  // the graph still feels alive rather than an empty page.
  if (relevantNames.size === 0) {
    const starter = allSkillDocs
      .filter((s) => s.marketDemand === 'High')
      .slice(0, 8)
      .map((s) => s.name);
    relevantNames = new Set(starter);
  }

  const skills = allSkillDocs.filter((s) => relevantNames.has(s.name));

  const nodes = skills.map((s) => {
    const level = levelMap.get(s.name) || 0;
    const req = reqMap.get(s.name);
    const requiredLevel = req ? req.requiredLevel : null;
    let state = classifyState(level, requiredLevel);
    if (level === 0 && req) state = 'Recommended';
    else if (level === 0 && s.source === 'ai-detected') state = 'Recommended';
    return {
      id: s.name,
      name: s.name,
      category: s.category,
      difficulty: s.difficulty,
      level,
      requiredLevel: requiredLevel || undefined,
      gap: requiredLevel ? Math.max(0, requiredLevel - level) : undefined,
      priority: req ? req.priority : undefined,
      prerequisites: s.prerequisites,
      relatedSkills: s.relatedSkills,
      marketDemand: s.marketDemand,
      source: s.source || 'taxonomy', // 'taxonomy' | 'ai-detected' — surfaced in the UI
      state,
    };
  });

  const nodeNameSet = new Set(nodes.map((n) => n.id));
  const edges = [];
  skills.forEach((s) => {
    (s.prerequisites || []).forEach((prereq) => {
      if (nodeNameSet.has(prereq)) edges.push({ source: prereq, target: s.name, type: 'prerequisite' });
    });
    (s.relatedSkills || []).forEach((rel) => {
      if (nodeNameSet.has(rel)) edges.push({ source: s.name, target: rel, type: 'related' });
    });
  });

  return { nodes, edges };
}

// BFS over the prerequisite graph starting from skills the user already has,
// to find the next unlocked/reachable skills toward the target role.
async function recommendNextSkills(userId, targetRole, limit = 5) {
  const { nodes } = await buildSkillGraph(userId, targetRole);
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const owned = new Set(nodes.filter((n) => n.level > 0).map((n) => n.id));

  const candidates = nodes.filter((n) => {
    if (owned.has(n.id)) return false;
    const prereqsMet = (n.prerequisites || []).every((p) => owned.has(p) || !nodeMap.has(p));
    return prereqsMet;
  });

  const priorityWeight = { Critical: 4, High: 3, Medium: 2, Low: 1, undefined: 0 };
  const demandWeight = { High: 3, Medium: 2, Low: 1 };

  candidates.sort((a, b) => {
    const pa = priorityWeight[a.priority] || 0;
    const pb = priorityWeight[b.priority] || 0;
    if (pb !== pa) return pb - pa;
    const da = demandWeight[a.marketDemand] || 0;
    const db = demandWeight[b.marketDemand] || 0;
    if (db !== da) return db - da;
    return (b.gap || 0) - (a.gap || 0);
  });

  return candidates.slice(0, limit);
}

async function computeSkillGaps(userId, targetRole) {
  const requirements = roleRequirements[targetRole];
  if (!requirements) return [];
  const userSkills = await UserSkill.find({ user: userId }).lean();
  const levelMap = new Map(userSkills.map((us) => [us.skillName, us.level]));

  return requirements
    .map((req) => {
      const yourLevel = levelMap.get(req.skill) || 0;
      return {
        skill: req.skill,
        yourLevel,
        requiredLevel: req.requiredLevel,
        gap: Math.max(0, req.requiredLevel - yourLevel),
        priority: req.priority,
      };
    })
    .sort((a, b) => b.gap - a.gap);
}

async function computeCareerReadiness(userId, targetRole) {
  const gaps = await computeSkillGaps(userId, targetRole);
  if (!gaps.length) return { overall: 0, breakdown: {} };

  const totalRequired = gaps.reduce((sum, g) => sum + g.requiredLevel, 0);
  const totalAchieved = gaps.reduce((sum, g) => sum + Math.min(g.yourLevel, g.requiredLevel), 0);
  const overall = Math.round((totalAchieved / totalRequired) * 100);

  const categories = { 'Technical Skills': [], Tools: [], Projects: [], Experience: [] };
  gaps.forEach((g) => {
    if (['Docker', 'AWS', 'Kubernetes', 'CI/CD', 'Git'].includes(g.skill)) categories.Tools.push(g);
    else categories['Technical Skills'].push(g);
  });

  const breakdown = {};
  Object.entries(categories).forEach(([cat, arr]) => {
    if (!arr.length) return;
    const req = arr.reduce((s, g) => s + g.requiredLevel, 0);
    const ach = arr.reduce((s, g) => s + Math.min(g.yourLevel, g.requiredLevel), 0);
    breakdown[cat] = Math.round((ach / req) * 100);
  });

  return { overall, breakdown, gaps };
}

// NEW — AI-driven dynamic skill discovery + sync. Called after a resume upload
// (or on demand from Settings). Instead of only matching against the fixed
// taxonomy, this asks the ML service to (a) score a much larger vocabulary and
// (b) mine genuinely novel skill-shaped terms straight out of the text, then
// auto-creates real Skill graph nodes for anything new (tagged 'ai-detected')
// and blends the confidence into the user's UserSkill levels. This is what
// makes the Skill Graph feel alive/dynamic instead of the same fixed default
// list for every user.
async function discoverAndSyncUserSkills(userId, resumeText) {
  if (!resumeText) return { discovered: [] };

  const existingUserSkills = await UserSkill.find({ user: userId }).lean();
  const alreadyDetected = existingUserSkills.map((s) => s.skillName);

  const matches = await mlServiceClient.extractDynamicSkills(resumeText, extendedSkillVocabulary, alreadyDetected);
  if (!matches || !matches.length) return { discovered: [] };

  const discovered = [];
  for (const m of matches) {
    // eslint-disable-next-line no-await-in-loop
    let skillDoc = await Skill.findOne({ name: m.skill });
    if (!skillDoc && m.origin === 'novel') {
      // A genuinely new, AI-discovered skill — auto-register it as a real graph node.
      // eslint-disable-next-line no-await-in-loop
      skillDoc = await Skill.create({
        name: m.skill,
        category: 'AI-Detected',
        difficulty: 'Intermediate',
        aliases: [],
        prerequisites: [],
        relatedSkills: [],
        marketDemand: 'Medium',
        source: 'ai-detected',
      });
    }
    if (!skillDoc) continue; // known vocabulary skill not yet seeded — skip silently

    const level = Math.round(m.score * 65); // confidence -> initial proficiency estimate
    // eslint-disable-next-line no-await-in-loop
    await UserSkill.findOneAndUpdate(
      { user: userId, skillName: skillDoc.name },
      {
        $max: { level },
        $push: { history: { level, recordedAt: new Date() } },
        $setOnInsert: { source: 'ai-detected' },
      },
      { upsert: true, new: true }
    );
    discovered.push({ skill: skillDoc.name, score: m.score, origin: m.origin });
  }

  return { discovered };
}

module.exports = {
  buildSkillGraph,
  recommendNextSkills,
  computeSkillGaps,
  computeCareerReadiness,
  discoverAndSyncUserSkills,
};
