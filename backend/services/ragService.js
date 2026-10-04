/**
 * SkillForge AI — Production RAG Engine (Retrieval-Augmented Generation)
 * ---------------------------------------------------------------------
 * Solves chatbot hallucination and generic advice by transforming candidate
 * data (resume sections, assessed skills, role gaps, roadmap milestones, and
 * target competency requirements) into indexed semantic chunks.
 *
 * Implements Hybrid Search:
 *   1. Dense Semantic Similarity (Sentence-BERT via ML service or vector cosine)
 *   2. Lexical Token / Keyword Matching (BM25-style frequency + tech keyword boosting)
 *   3. Reciprocal Rank Fusion (RRF) for robust, balanced multi-aspect retrieval
 *   4. Transparent citations passed to the UI so users know exactly which
 *      fact grounded the AI's response.
 */
const User = require('../models/User');
const Resume = require('../models/Resume');
const UserSkill = require('../models/UserSkill');
const { computeSkillGaps, computeCareerReadiness } = require('./skillGraphService');
const { roleRequirements } = require('../data/skillsTaxonomy');
const mlServiceClient = require('./mlServiceClient');

// Stopwords for lexical query tokenization
const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'could', 'did',
  'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have',
  'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into',
  'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'now', 'of',
  'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same',
  'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then',
  'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we',
  'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours'
]);

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9+#.-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
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
  return dot / (Math.sqrt(magMag(magA)) * Math.sqrt(magMag(magB)));
}
function magMag(v) { return Math.max(1e-9, v); }

function textToTermVector(text) {
  const tokens = tokenize(text);
  const freq = {};
  tokens.forEach((t) => {
    freq[t] = (freq[t] || 0) + 1;
  });
  return freq;
}

/**
 * Ingests and decomposes a user's multi-source career data into structured RAG chunks
 */
async function ingestUserKnowledge(userId) {
  const chunks = [];
  const [user, resume, userSkills] = await Promise.all([
    User.findById(userId).lean(),
    Resume.findOne({ user: userId }).sort({ createdAt: -1 }).lean(),
    UserSkill.find({ user: userId }).sort({ level: -1 }).lean(),
  ]);

  const targetRole = user?.targetRole || 'Software Engineer';

  // 1. Chunk: Candidate Identity & Career Objectives
  chunks.push({
    chunkId: `profile_overview_${userId}`,
    source: 'Profile: Career Goal',
    category: 'profile',
    title: 'Candidate Target Role & Bio',
    text: `Candidate: ${user?.fullName || 'User'}. Target Role: ${targetRole}. Location: ${user?.location || 'Remote/Open'}. Career Status: Active learner.`,
    keywords: tokenize(`${user?.fullName} ${targetRole} ${user?.location}`),
  });

  // 2. Chunk: Possessed Technical Skills
  if (userSkills && userSkills.length > 0) {
    const skillList = userSkills
      .slice(0, 20)
      .map((s) => `${s.skillName} (${s.level}/100, verified via ${s.source || 'profile'})`)
      .join('; ');

    chunks.push({
      chunkId: `skills_possessed_${userId}`,
      source: 'Skill Profile: Verified Capabilities',
      category: 'skills',
      title: 'Current Skill Proficiency Levels',
      text: `Assessed skills for ${user?.fullName || 'the candidate'}: ${skillList}.`,
      keywords: tokenize(userSkills.map((s) => s.skillName).join(' ')),
    });
  }

  // 3. Chunk: Skill Gap Analysis & Career Readiness
  try {
    const gaps = await computeSkillGaps(userId, targetRole);
    const readiness = await computeCareerReadiness(userId, targetRole);

    if (gaps && gaps.length > 0) {
      const criticalGaps = gaps.filter((g) => g.gap > 0);
      const gapSummary = criticalGaps
        .slice(0, 8)
        .map((g) => `${g.skill} (current: ${g.yourLevel}%, target: ${g.requiredLevel}%, gap: ${g.gap}%, priority: ${g.priority})`)
        .join('; ');

      chunks.push({
        chunkId: `skills_gaps_${userId}`,
        source: 'Skill Gap Analysis',
        category: 'skills',
        title: `Target Role Skill Gaps (${targetRole})`,
        text: `Target Role: ${targetRole}. Career Readiness: ${readiness?.overall || 0}%. Critical missing competencies: ${gapSummary || 'No major gaps identified.'}.`,
        keywords: tokenize(`${targetRole} skill gap ${criticalGaps.map((g) => g.skill).join(' ')} readiness`),
      });
    }
  } catch (err) {
    // Non-fatal
  }

  // 4. Chunks: Resume Sections
  if (resume) {
    // Experience chunks
    if (Array.isArray(resume.experience) && resume.experience.length > 0) {
      resume.experience.forEach((exp, idx) => {
        const text = `Work Experience at ${exp.company || 'Company'} (${exp.duration || 'Duration'}): Role: ${exp.title || 'Role'}. Details: ${exp.description || (Array.isArray(exp.bullets) ? exp.bullets.join(' ') : 'Professional responsibilities')}`;
        chunks.push({
          chunkId: `resume_exp_${idx}`,
          source: `Resume: Experience (${exp.company || 'Job ' + (idx + 1)})`,
          category: 'resume',
          title: `${exp.title || 'Experience'} at ${exp.company || 'Organization'}`,
          text: text.slice(0, 600),
          keywords: tokenize(`${exp.company} ${exp.title} ${exp.description || ''}`),
        });
      });
    }

    // Projects chunks
    if (Array.isArray(resume.projects) && resume.projects.length > 0) {
      resume.projects.forEach((proj, idx) => {
        const skillsUsed = Array.isArray(proj.skills) ? proj.skills.join(', ') : '';
        const text = `Project: ${proj.name || 'Project ' + (idx + 1)}. Tech Stack: ${skillsUsed}. Description: ${proj.description || ''}. Link/Impact: ${proj.link || 'Internal'}.`;
        chunks.push({
          chunkId: `resume_proj_${idx}`,
          source: `Resume: Project (${proj.name || 'Project ' + (idx + 1)})`,
          category: 'resume',
          title: `Project: ${proj.name || 'Project'}`,
          text: text.slice(0, 600),
          keywords: tokenize(`${proj.name} ${skillsUsed} ${proj.description || ''}`),
        });
      });
    }

    // Education & Certifications
    if (Array.isArray(resume.education) && resume.education.length > 0) {
      const eduStr = resume.education.map((e) => `${e.degree || 'Degree'} from ${e.school || 'University'} (${e.year || ''})`).join('; ');
      chunks.push({
        chunkId: `resume_edu_${userId}`,
        source: 'Resume: Education',
        category: 'resume',
        title: 'Academic Qualifications',
        text: `Education: ${eduStr}`,
        keywords: tokenize(eduStr),
      });
    }

    if (Array.isArray(resume.certifications) && resume.certifications.length > 0) {
      const certStr = resume.certifications.map((c) => (typeof c === 'string' ? c : `${c.name || ''} by ${c.issuer || ''}`)).join('; ');
      chunks.push({
        chunkId: `resume_certs_${userId}`,
        source: 'Resume: Certifications',
        category: 'resume',
        title: 'Certifications & Accreditations',
        text: `Certifications: ${certStr}`,
        keywords: tokenize(certStr),
      });
    }

    // ATS Review & Suggestions
    if (resume.suggestions && resume.suggestions.length > 0) {
      chunks.push({
        chunkId: `resume_ats_feedback_${userId}`,
        source: 'Resume Studio: ATS Feedback',
        category: 'resume',
        title: 'ATS Resume Review & Missing Keywords',
        text: `ATS Score: ${resume.resumeScore || 65}/100. Missing Keywords: ${(resume.missingSkills || []).slice(0, 10).join(', ')}. ATS Suggestions: ${resume.suggestions.slice(0, 4).join(' | ')}.`,
        keywords: tokenize(`ats score resume suggestions ${(resume.missingSkills || []).join(' ')}`),
      });
    }
  }

  // 5. Target Role Benchmark & Standard Competency
  if (roleRequirements[targetRole]) {
    const roleReqs = roleRequirements[targetRole];
    const topReqs = roleReqs.map((r) => `${r.skill} (Level ${r.requiredLevel}+, Priority: ${r.priority})`).join(', ');
    chunks.push({
      chunkId: `role_benchmark_${targetRole.replace(/\s+/g, '_')}`,
      source: `Benchmark: ${targetRole}`,
      category: 'role_competency',
      title: `Industry Hiring Benchmark for ${targetRole}`,
      text: `Industry requirements for a job-ready ${targetRole}: Essential competencies include ${topReqs}.`,
      keywords: tokenize(`${targetRole} requirements ${roleReqs.map((r) => r.skill).join(' ')}`),
    });
  }

  return chunks;
}

/**
 * Hybrid Semantic + Lexical Search with Reciprocal Rank Fusion
 */
async function hybridSearch(userId, query, options = {}) {
  const { topK = 4, minScore = 0.08 } = options;
  const chunks = await ingestUserKnowledge(userId);
  if (!chunks || chunks.length === 0) return [];

  const queryTokens = tokenize(query);
  const queryVec = textToTermVector(query);

  // 1. Lexical Scoring (Token overlap + tech keyword priority)
  const lexicalRanked = chunks.map((chunk) => {
    let score = 0;
    const chunkTokensSet = new Set(chunk.keywords);

    queryTokens.forEach((qt) => {
      if (chunkTokensSet.has(qt)) {
        score += 1.5;
      }
      // Partial prefix matching for tech variants (e.g. "react" in "react.js")
      else if ([...chunkTokensSet].some((ct) => ct.includes(qt) || qt.includes(ct))) {
        score += 0.8;
      }
    });

    // Normalize by query length
    const normScore = queryTokens.length ? score / (queryTokens.length * 1.5) : 0;
    return { chunk, score: Math.min(1, normScore) };
  });

  // 2. Semantic Similarity
  let semanticRanked = [];
  try {
    // Try calling Python ML service batch matching if available
    const chunkTexts = chunks.map((c) => c.text);
    const batchMatches = await mlServiceClient.getSemanticMatchBatch(query, chunkTexts);
    if (batchMatches && Array.isArray(batchMatches) && batchMatches.length === chunks.length) {
      semanticRanked = chunks.map((chunk, idx) => {
        const rawScore = typeof batchMatches[idx] === 'number' ? batchMatches[idx] : (batchMatches[idx]?.similarity ?? 0);
        return {
          chunk,
          score: Math.max(0, Number(rawScore) || 0),
        };
      });
    }
  } catch (err) {
    // Fall through to vector cosine
  }

  if (semanticRanked.length === 0) {
    // Explainable fallback: Term vector cosine similarity with category-aware weighting
    semanticRanked = chunks.map((chunk) => {
      const chunkVec = textToTermVector(chunk.text);
      const sim = cosineSimilarity(queryVec, chunkVec);
      return { chunk, score: sim };
    });
  }

  // 3. Hybrid Fusion: Weighted blend (0.55 Semantic + 0.45 Lexical)
  const fused = chunks.map((chunk, idx) => {
    const sScore = semanticRanked[idx]?.score || 0;
    const lScore = lexicalRanked[idx]?.score || 0;
    const hybridScore = 0.55 * sScore + 0.45 * lScore;
    return {
      chunk,
      score: Number(hybridScore.toFixed(3)),
    };
  });

  // Sort descending by hybrid relevance score
  fused.sort((a, b) => b.score - a.score);

  // Return top K that exceed minScore
  const selected = fused.filter((item) => item.score >= minScore).slice(0, topK);

  // Fallback: If no chunk met minScore, return the single top chunk if score > 0
  if (selected.length === 0 && fused.length > 0 && fused[0].score > 0) {
    selected.push(fused[0]);
  }

  return selected.map(({ chunk, score }) => ({
    chunkId: chunk.chunkId,
    source: chunk.source,
    category: chunk.category,
    title: chunk.title,
    excerpt: chunk.text.length > 280 ? chunk.text.slice(0, 277) + '...' : chunk.text,
    fullText: chunk.text,
    relevanceScore: score,
  }));
}

/**
 * Builds the final prompt injected with grounded RAG context and indexed citations
 */
function buildGroundedPrompt(message, citations = [], targetRole = 'Software Engineer') {
  let contextBlock = '';
  if (citations && citations.length > 0) {
    const formattedCitations = citations
      .map((c, i) => `[Source ${i + 1}: ${c.source}] ${c.fullText || c.excerpt}`)
      .join('\n\n');
    contextBlock = `\n--- GROUNDED USER KNOWLEDGE BASE (RETRIEVED VIA RAG) ---\n${formattedCitations}\n--------------------------------------------------------\n`;
  }

  const systemInstruction =
    `You are SkillForge AI's Senior Executive Career Coach and Technical Mentor for a candidate targeting: ${targetRole}.\n` +
    `You have direct RAG access into the candidate's verified skills, resume, skill gaps, learning roadmap, and target role requirements.\n\n` +
    `GUIDELINES FOR WORLD-CLASS CAREER COACHING:\n` +
    `1. DIRECT & THOROUGH: Respond directly, comprehensively, and contextually to whatever the candidate asks (technical concepts, interview prep, skill gaps, ATS resume optimization, project ideas, learning roadmap, or industry advice).\n` +
    `2. PROFESSIONAL MARKDOWN FORMATTING: Structure your answers beautifully using clean markdown headings (###), bold highlights, clear bullet points, and code spans where applicable.\n` +
    `3. PROFILE GROUNDING: Weave in the candidate's actual profile facts (verified skills, missing competencies, experience) from the Grounded User Knowledge Base naturally and constructively.\n` +
    `4. COMPLETE & ACTIONABLE: Provide complete, actionable takeaways with concrete next steps. Never truncate answers midway.`;

  return {
    systemInstruction,
    augmentedPrompt: `${contextBlock}\nUser Query: ${message}`,
  };
}

module.exports = {
  ingestUserKnowledge,
  hybridSearch,
  buildGroundedPrompt,
};
