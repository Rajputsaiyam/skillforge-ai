/**
 * Job Match Service
 * -------------------
 * Two techniques, blended:
 *
 *   1. EXPLAINABLE (always available, no dependencies): represent the user's skill
 *      set and the job's required/preferred skills as weighted term vectors
 *      (TF-IDF-style weighting: preferred skills weighted lower than required) and
 *      compute cosine similarity -> "Skill Match %". Produces a human-readable
 *      breakdown (strong / partial / missing) for the "Why this match?" panel.
 *
 *   2. SEMANTIC (optional, pretrained model): if ml-service/ is running, a
 *      Sentence-BERT model (all-MiniLM-L6-v2) compares the resume's full text
 *      against the job description's full text and returns a meaning-based
 *      similarity score — catches matches that share no exact keywords
 *      (e.g. "built REST APIs" ~ "developed backend services").
 *
 * When the ML service is unavailable, semanticMatchPct is simply omitted and the
 * overall score falls back to skill-vector + experience only — nothing breaks.
 */

function buildVector(skillLevels, terms) {
  // skillLevels: Map(skillName -> 0-100). terms: array of skill names for this document.
  const vec = {};
  terms.forEach((t) => {
    vec[t] = (skillLevels.get(t) || 0) / 100 || 0.01; // small epsilon so presence counts
  });
  return vec;
}

function cosineSimilarity(vecA, vecB) {
  const keys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  let dot = 0, magA = 0, magB = 0;
  keys.forEach((k) => {
    const a = vecA[k] || 0;
    const b = vecB[k] || 0;
    dot += a * b;
    magA += a * a;
    magB += b * b;
  });
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function computeSkillMatch(userLevelMap, requiredSkills = [], preferredSkills = []) {
  // Lazy-load taxonomy to check related skills
  let taxMap;
  try {
    const { skillsTaxonomy } = require('../data/skillsTaxonomy');
    taxMap = new Map(skillsTaxonomy.map(s => [s.name, s]));
  } catch {
    taxMap = new Map();
  }

  const strong = [];
  const partial = [];
  const missing = [];

  const classifySkill = (skill, isRequired) => {
    const level = userLevelMap.get(skill) || 0;
    if (level >= 60) {
      strong.push(skill);
    } else if (level > 0) {
      partial.push(skill);
    } else {
      // Check if the user knows a related or prerequisite skill
      const taxEntry = taxMap.get(skill);
      if (taxEntry) {
        const relatedSkills = [
          ...(taxEntry.prerequisites || []),
          ...(taxEntry.relatedSkills || []),
        ];
        const hasRelated = relatedSkills.some(r => (userLevelMap.get(r) || 0) >= 40);
        if (hasRelated) {
          partial.push(skill); // Partial credit for related skill knowledge
        } else {
          missing.push(skill);
        }
      } else {
        missing.push(skill);
      }
    }
  };

  requiredSkills.forEach(skill => classifySkill(skill, true));
  preferredSkills.forEach(skill => {
    // Avoid double-counting skills already classified from required list
    if (!strong.includes(skill) && !partial.includes(skill) && !missing.includes(skill)) {
      classifySkill(skill, false);
    }
  });

  // Weighted vector: required skills carry weight 1.0, preferred carry 0.5
  const allTerms = [...new Set([...requiredSkills, ...preferredSkills])];
  const jobVec = {};
  allTerms.forEach((t) => {
    jobVec[t] = requiredSkills.includes(t) ? 1.0 : 0.5;
  });
  const userVec = {};
  allTerms.forEach((t) => {
    let effectiveLevel = (userLevelMap.get(t) || 0) / 100;
    // If the user doesn't have this exact skill but has a related one, give 30% credit
    if (effectiveLevel === 0) {
      const taxEntry = taxMap.get(t);
      if (taxEntry) {
        const relatedSkills = [...(taxEntry.prerequisites || []), ...(taxEntry.relatedSkills || [])];
        const bestRelated = Math.max(0, ...relatedSkills.map(r => userLevelMap.get(r) || 0));
        if (bestRelated >= 40) {
          effectiveLevel = (bestRelated * 0.3) / 100; // 30% transfer credit
        }
      }
    }
    userVec[t] = effectiveLevel;
  });

  const skillMatchPct = Math.round(cosineSimilarity(userVec, jobVec) * 100);

  return { strong, partial, missing, skillMatchPct };
}

function estimateExperienceMatch(userExperienceEntries = [], requiredExperienceText = '') {
  const yearsMatch = requiredExperienceText.match(/(\d+)\s*[-–]?\s*(\d+)?\s*\+?\s*years/i);
  const requiredMin = yearsMatch ? Number(yearsMatch[1]) : 0;

  // Actually compute total years from duration fields instead of just counting entries
  let totalYears = 0;
  userExperienceEntries.forEach(entry => {
    // Try parsing from startYear/endYear fields first (set by improved resume parser)
    if (entry.startYear) {
      const startYr = parseInt(entry.startYear);
      let endYr;
      if (entry.endYear && /\d{4}/.test(entry.endYear)) {
        endYr = parseInt(entry.endYear);
      } else {
        // "Present", "Current", "Now", or missing → current year
        endYr = new Date().getFullYear();
      }
      totalYears += Math.max(0, endYr - startYr);
      return;
    }
    // Fallback: try to parse duration string
    const durationMatch = entry.duration?.match(
      /((?:19|20)\d{2})\s*[-–—to]+\s*((?:(?:19|20)\d{2})|[Pp]resent|[Cc]urrent|[Nn]ow)/i
    );
    if (durationMatch) {
      const startYear = parseInt(durationMatch[1]);
      const endYearStr = durationMatch[2];
      const endYear = /\d{4}/.test(endYearStr) ? parseInt(endYearStr) : new Date().getFullYear();
      totalYears += Math.max(0, endYear - startYear);
    } else {
      totalYears += 1; // conservative fallback: assume 1 year per entry
    }
  });

  if (requiredMin === 0) return 95;
  const ratio = Math.min(1.5, totalYears / Math.max(1, requiredMin));
  return Math.min(100, Math.round(40 + ratio * 40));
}

function computeJobMatch({ userLevelMap, userExperienceEntries, job, semanticSimilarity = null }) {
  const { strong, partial, missing, skillMatchPct } = computeSkillMatch(
    userLevelMap,
    job.requiredSkills,
    job.preferredSkills
  );
  const experienceMatchPct = estimateExperienceMatch(userExperienceEntries, job.experienceRequired);

  // semanticSimilarity is 0..1 from the pretrained Sentence-BERT model (ml-service/), or
  // null if that optional service isn't running.
  const semanticMatchPct = semanticSimilarity !== null ? Math.round(semanticSimilarity * 100) : null;

  const overallMatchPct =
    semanticMatchPct !== null
      ? Math.round(skillMatchPct * 0.5 + experienceMatchPct * 0.2 + semanticMatchPct * 0.3)
      : Math.round(skillMatchPct * 0.7 + experienceMatchPct * 0.3);

  return {
    jobId: job._id,
    overallMatchPct,
    skillMatchPct,
    experienceMatchPct,
    semanticMatchPct, // null when ml-service isn't running
    strongSkills: strong,
    partialSkills: partial,
    missingSkills: missing,
  };
}

module.exports = { computeJobMatch, computeSkillMatch, cosineSimilarity };
