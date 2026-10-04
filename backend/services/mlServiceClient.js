/**
 * ML Service Client — talks to the optional Python microservice (ml-service/)
 * which runs TWO REAL PRETRAINED models:
 *   1. sentence-transformers/all-MiniLM-L6-v2 — semantic resume<->job matching
 *      and semantic skill detection (getSemanticMatch, getSemanticMatchBatch,
 *      rankSkillsSemantic)
 *   2. dslim/bert-base-NER — organization/person name extraction from resume
 *      text (extractEntities)
 *
 * Fully optional and fail-safe: if the ML service isn't running, every function
 * here returns null and the caller falls back to its own explainable logic
 * (skill-vector cosine similarity for matching, regex heuristics for parsing).
 * Nothing crashes either way.
 */
const axios = require('axios');
const gemini = require('./geminiService');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const TIMEOUT_MS = 5000;

let warnedOnce = false;
function warnUnavailable(err) {
  if (!warnedOnce) {
    console.warn(
      `[ML Service] Not reachable at ${ML_SERVICE_URL} (${err.code || err.message}). ` +
        'Falling back to skill-vector-only matching. Start ml-service/ (see ml-service/README.md) to enable semantic matching.'
    );
    warnedOnce = true;
  }
}

// One resume vs one job description (used on Job Details page)
async function getSemanticMatch(resumeText, jobDescription) {
  if (!resumeText || !jobDescription) return null;
  try {
    const { data } = await axios.post(
      `${ML_SERVICE_URL}/semantic-match`,
      { resume_text: resumeText, job_description: jobDescription },
      { timeout: TIMEOUT_MS }
    );
    return data.semantic_similarity; // 0..1
  } catch (err) {
    warnUnavailable(err);
    return null;
  }
}

// One resume vs many job descriptions in a single batched call (used on Jobs search page)
async function getSemanticMatchBatch(resumeText, jobDescriptions) {
  if (!resumeText || !jobDescriptions?.length) return null;
  try {
    const { data } = await axios.post(
      `${ML_SERVICE_URL}/semantic-match-batch`,
      { resume_text: resumeText, job_descriptions: jobDescriptions },
      { timeout: TIMEOUT_MS }
    );
    return data.scores; // array of 0..1, same order as input
  } catch (err) {
    warnUnavailable(err);
    return null;
  }
}

// Semantically ranks taxonomy skill names against a text passage (Sentence-BERT).
// Used by resumeParserService to catch skills phrased differently than the exact
// taxonomy name (e.g. "container orchestration" -> Kubernetes).
async function rankSkillsSemantic(text, candidateSkills) {
  if (!text || !candidateSkills?.length) return null;
  try {
    const { data } = await axios.post(
      `${ML_SERVICE_URL}/rank-skills`,
      { text, candidate_skills: candidateSkills },
      { timeout: TIMEOUT_MS }
    );
    return data.results; // [{ skill, score }], sorted descending
  } catch (err) {
    warnUnavailable(err);
    return null;
  }
}

// MODEL 2: dslim/bert-base-NER — extracts organization/person names from resume text.
// Used by resumeParserService to clean up company/school names beyond regex heuristics.
async function extractEntities(text) {
  if (!text) return null;
  try {
    const { data } = await axios.post(
      `${ML_SERVICE_URL}/extract-entities`,
      { text },
      { timeout: TIMEOUT_MS }
    );
    return data; // { organizations: [...], persons: [...], all_entities: [...] }
  } catch (err) {
    warnUnavailable(err);
    return null;
  }
}

// NEW — open-vocabulary skill discovery: scores a large skill vocabulary AND mines
// genuinely novel skill-shaped terms out of the raw text, so the Skill Graph isn't
// limited to one fixed default taxonomy for every user any more.
async function extractDynamicSkills(text, knownVocabulary, alreadyDetected = []) {
  if (!text || !knownVocabulary?.length) return null;
  try {
    const { data } = await axios.post(
      `${ML_SERVICE_URL}/extract-dynamic-skills`,
      { text, known_vocabulary: knownVocabulary, already_detected: alreadyDetected },
      { timeout: 15000 }
    );
    return data.matches; // [{ skill, score, origin: 'vocabulary' | 'novel' }]
  } catch (err) {
    warnUnavailable(err);
    return null;
  }
}

// NEW — dynamically generates assessment questions (MCQ + open-ended) calibrated
// to the user's current skill level, instead of pulling from a static bank.
async function generateQuestions(skill, level, count = 3, questionType = 'mixed') {
  try {
    const { data } = await axios.post(
      `${ML_SERVICE_URL}/generate-questions`,
      { skill, level, count, question_type: questionType },
      { timeout: 30000 }
    );
    return data; // { questions: [...], generated_by }
  } catch (err) {
    warnUnavailable(err);
    return null;
  }
}

// NEW — semantic grading of a free-text/open-ended answer against a model answer.
async function gradeOpenAnswer(question, modelAnswer, userAnswer) {
  try {
    const { data } = await axios.post(
      `${ML_SERVICE_URL}/grade-open-answer`,
      { question, model_answer: modelAnswer, user_answer: userAnswer },
      { timeout: 15000 }
    );
    return data; // { score, semantic_similarity, keyword_coverage, feedback }
  } catch (err) {
    warnUnavailable(err);
    return null;
  }
}

// NEW — generates a short "teach me this skill" micro-lesson before the quiz.
async function generateLesson(skill, level) {
  try {
    const { data } = await axios.post(
      `${ML_SERVICE_URL}/generate-lesson`,
      { skill, level },
      { timeout: 20000 }
    );
    return data; // { title, content, generated_by }
  } catch (err) {
    warnUnavailable(err);
    return null;
  }
}

// NEW — RAG-lite chatbot / AI-interview conversational turn.
async function chatWithAI(message, contextChunks = [], history = [], systemPrompt = null) {
  // Gemini is the preferred conversational provider. It runs server-side so
  // the key is never bundled into Vite, and the existing Python service stays
  // available as an offline fallback.
  const geminiReply = await gemini.chat(message, contextChunks, history, systemPrompt || '');
  if (geminiReply) return geminiReply;
  try {
    const { data } = await axios.post(
      `${ML_SERVICE_URL}/chat`,
      { message, context_chunks: contextChunks, history, system_prompt: systemPrompt },
      { timeout: 25000 }
    );
    return data; // { reply, used_context, generated_by }
  } catch (err) {
    warnUnavailable(err);
    return null;
  }
}

// NEW — returns dense embeddings for an array of strings (e.g. for vector indexing / RAG)
async function getEmbeddings(texts) {
  if (!texts || !texts.length) return null;
  try {
    const { data } = await axios.post(
      `${ML_SERVICE_URL}/embed`,
      { texts },
      { timeout: TIMEOUT_MS }
    );
    return data.embeddings; // List[List[float]]
  } catch (err) {
    warnUnavailable(err);
    return null;
  }
}

// Dedicated ATS Score Checker Model endpoint
async function checkAtsScore(resumeText, targetRole, jobDescription) {
  if (!resumeText) return null;
  try {
    const { data } = await axios.post(
      `${ML_SERVICE_URL}/ats-score`,
      {
        resume_text: resumeText,
        target_role: targetRole,
        job_description: jobDescription,
      },
      { timeout: 12000 }
    );
    return data;
  } catch (err) {
    warnUnavailable(err);
    return null;
  }
}

module.exports = {
  getSemanticMatch,
  getSemanticMatchBatch,
  getEmbeddings,
  rankSkillsSemantic,
  extractEntities,
  extractDynamicSkills,
  generateQuestions,
  gradeOpenAnswer,
  generateLesson,
  chatWithAI,
  checkAtsScore,
};

