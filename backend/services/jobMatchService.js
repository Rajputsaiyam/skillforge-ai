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
  const strong = [];
  const partial = [];
  const missing = [];

  requiredSkills.forEach((skill) => {
    const level = userLevelMap.get(skill) || 0;
    if (level >= 60) strong.push(skill);
    else if (level > 0) partial.push(skill);
    else missing.push(skill);
  });
  preferredSkills.forEach((skill) => {
    const level = userLevelMap.get(skill) || 0;
    if (level >= 60) strong.push(skill);
    else if (level > 0) partial.push(skill);
    else if (!missing.includes(skill)) missing.push(skill);
  });

  // Weighted vector: required skills carry weight 1.0, preferred carry 0.5
  const allTerms = [...new Set([...requiredSkills, ...preferredSkills])];
  const jobVec = {};
  allTerms.forEach((t) => {
    jobVec[t] = requiredSkills.includes(t) ? 1.0 : 0.5;
  });
  const userVec = {};
  allTerms.forEach((t) => {
    userVec[t] = (userLevelMap.get(t) || 0) / 100;
  });

  const skillMatchPct = Math.round(cosineSimilarity(userVec, jobVec) * 100);

  return { strong, partial, missing, skillMatchPct };
}

function estimateExperienceMatch(userExperienceEntries = [], requiredExperienceText = '') {
  const yearsMatch = requiredExperienceText.match(/(\d+)\s*-\s*(\d+)\s*years/i);
  const requiredMin = yearsMatch ? Number(yearsMatch[1]) : 0;
  const userYears = userExperienceEntries.length; // proxy: 1 entry ~ meaningful experience
  if (requiredMin === 0) return 90;
  const ratio = Math.min(1, userYears / Math.max(1, requiredMin));
  return Math.round(50 + ratio * 50);
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
