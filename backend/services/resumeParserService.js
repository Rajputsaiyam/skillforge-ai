/**
 * Resume Parser Service
 * ----------------------
 * Pipeline (in order):
 *   1. Extract raw text from PDF (pdf-parse) or DOCX (mammoth).
 *   2. Tokenize + normalize text (natural).
 *   3. Match tokens/phrases against the skill taxonomy using:
 *        - exact alias matching
 *        - fuzzy string similarity (string-similarity / Dice's Coefficient)
 *        - OPTIONAL: semantic matching via a pretrained Sentence-BERT model
 *          (ml-service/) for skills phrased differently than the taxonomy name
 *   4. Heuristically segment Education / Experience / Projects / Certifications
 *      using section-header detection + regex/date heuristics, then OPTIONALLY
 *      clean up company/school names using a pretrained NER model (ml-service/).
 *   5. Compute a resume completeness score.
 *
 * Steps marked OPTIONAL only run if ml-service/ is reachable; otherwise the
 * regex/fuzzy-only result is returned exactly as before. Nothing breaks either way.
 */
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const natural = require('natural');
const stringSimilarity = require('string-similarity');
const { skillsTaxonomy } = require('../data/skillsTaxonomy');
const mlServiceClient = require('./mlServiceClient');

const tokenizer = new natural.WordTokenizer();
const SEMANTIC_SKILL_THRESHOLD = 0.5; // cosine similarity cutoff for "this skill is present"

const SECTION_HEADERS = {
  education: /^\s*(education|academic background|academics?|qualifications?)\s*$/i,
  experience: /^\s*(experience|work experience|professional experience|employment|work history|career history)\s*$/i,
  projects: /^\s*(projects|personal projects|academic projects|selected projects)\s*$/i,
  certifications: /^\s*(certifications?|licenses?|courses?|awards?)\s*$/i,
  skills: /^\s*(skills|technical skills|core competencies|technical proficiencies|technologies)\s*$/i,
};

function normalizeResumeText(text) {
  return String(text || '')
    .replace(/\u0000/g, '')
    .replace(/([a-z])\s*-\s*\n\s*([a-z])/gi, '$1$2')
    .replace(/[\u2022\u25cf\u25aa]/g, '•')
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

async function extractTextFromFile(filePath, mimeType) {
  if (mimeType === 'application/pdf' || filePath.endsWith('.pdf')) {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  }
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    filePath.endsWith('.docx')
  ) {
    const { value } = await mammoth.extractRawText({ path: filePath });
    return value;
  }
  // Fallback: treat as plain text
  return fs.readFileSync(filePath, 'utf-8');
}

function buildSkillLookup() {
  // Map every alias/name (lowercased) -> canonical skill name, plus a flat list for fuzzy matching
  const lookup = new Map();
  const flatNames = [];
  skillsTaxonomy.forEach((s) => {
    lookup.set(s.name.toLowerCase(), s.name);
    flatNames.push(s.name.toLowerCase());
    (s.aliases || []).forEach((a) => {
      lookup.set(a.toLowerCase(), s.name);
      flatNames.push(a.toLowerCase());
    });
  });
  return { lookup, flatNames };
}

function extractSkillsFromText(text) {
  const { lookup, flatNames } = buildSkillLookup();
  const lowerText = text.toLowerCase();
  const found = new Map(); // canonicalName -> { confidence, source }

  // 1. Exact / alias phrase matching (handles multi-word skills like "Node.js", "React Query")
  lookup.forEach((canonical, alias) => {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(^|[^a-z0-9+])${escaped}([^a-z0-9+]|$)`, 'i');
    if (pattern.test(lowerText)) {
      const existing = found.get(canonical);
      if (!existing || existing.confidence < 0.98) {
        found.set(canonical, { confidence: 0.98, source: 'exact' });
      }
    }
  });

  // 2. Fuzzy matching on individual tokens for near-misses (e.g. typos, OCR artifacts)
  const tokens = tokenizer.tokenize(lowerText) || [];
  const uniqueTokens = [...new Set(tokens.filter((t) => t.length > 2))];
  uniqueTokens.forEach((token) => {
    if (found.size > 60) return; // safety cap
    const { bestMatch } = stringSimilarity.findBestMatch(token, flatNames);
    if (bestMatch.rating >= 0.88) {
      const canonical = lookup.get(bestMatch.target);
      if (canonical && !found.has(canonical)) {
        found.set(canonical, { confidence: Number(bestMatch.rating.toFixed(2)), source: 'fuzzy' });
      }
    }
  });

  return Array.from(found.entries()).map(([name, meta]) => ({ name, ...meta }));
}

// OPTIONAL — MODEL 1 (Sentence-BERT via ml-service/): catches skills phrased
// differently than the exact taxonomy name/alias (e.g. "container orchestration"
// semantically implies Kubernetes even without the word "Kubernetes" appearing).
// Only runs against skills the exact/fuzzy pass above didn't already find.
async function extractSkillsSemantic(text, alreadyFound) {
  const remainingSkillNames = skillsTaxonomy.map((s) => s.name).filter((n) => !alreadyFound.has(n));
  if (!remainingSkillNames.length) return [];

  const results = await mlServiceClient.rankSkillsSemantic(text, remainingSkillNames);
  if (!results) return []; // ml-service not running — silently skip, exact/fuzzy result stands

  return results
    .filter((r) => r.score >= SEMANTIC_SKILL_THRESHOLD)
    .map((r) => ({ name: r.skill, confidence: r.score, source: 'semantic' }));
}

function splitIntoSections(text) {
  const lines = text.split(/\r?\n/);
  const sections = { education: [], experience: [], projects: [], certifications: [], skills: [] };
  let current = null;
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const matchedHeader = Object.entries(SECTION_HEADERS).find(([, re]) => re.test(trimmed));
    if (matchedHeader) {
      current = matchedHeader[0];
      return;
    }
    if (current) sections[current].push(trimmed);
  });
  return sections;
}

function parseEducation(lines) {
  return lines.slice(0, 6).map((line) => {
    const yearMatch = line.match(/(19|20)\d{2}/g);
    return {
      school: line.split(/[-–|,]/)[0]?.trim() || line,
      degree: '',
      field: '',
      year: yearMatch ? yearMatch[yearMatch.length - 1] : '',
      _rawLine: line, // used only by refineOrganizationsWithNER below, stripped before saving
    };
  });
}

function parseExperience(lines) {
  const entries = [];
  let buffer = [];
  lines.forEach((line) => {
    const isDateLine = /\b(19|20)\d{2}\b/.test(line);
    buffer.push(line);
    if (isDateLine && buffer.length) {
      entries.push(buffer.join(' '));
      buffer = [];
    }
  });
  if (buffer.length) entries.push(buffer.join(' '));
  return entries.slice(0, 6).map((line) => {
    const dateMatch = line.match(/(19|20)\d{2}\s*[-–to]+\s*((19|20)\d{2}|present)/i);
    return {
      company: line.split(/[-–|,]/)[0]?.trim().slice(0, 60) || 'Unknown',
      title: '',
      duration: dateMatch ? dateMatch[0] : '',
      _rawLine: line, // used only by refineOrganizationsWithNER below, stripped before saving
    };
  });
}

function parseProjects(lines, allSkills) {
  const skillNames = allSkills.map((s) => s.name);
  const grouped = [];
  let current = null;
  lines.forEach((line) => {
    if (line.length < 90 && /^[A-Z0-9]/.test(line) && !current) {
      current = { name: line.slice(0, 80), description: '', skills: [] };
      grouped.push(current);
    } else if (current) {
      current.description += (current.description ? ' ' : '') + line;
    }
  });
  grouped.forEach((proj) => {
    proj.skills = skillNames.filter((s) => proj.description.toLowerCase().includes(s.toLowerCase()));
  });
  return grouped.slice(0, 8);
}

function parseCertifications(lines) {
  return lines.slice(0, 8).map((line) => ({
    name: line.split(/[-–|,]/)[0]?.trim() || line,
    issuer: line.split(/[-–|,]/)[1]?.trim() || '',
  }));
}

// OPTIONAL — MODEL 2 (dslim/bert-base-NER via ml-service/): improves the naive
// "split line on first dash/comma" heuristic above by cross-referencing each
// entry against real organization names the NER model found in the resume.
// If an NER-detected org name appears inside a given line, we use that clean
// name instead of the heuristic guess. Falls back to the heuristic untouched
// if ml-service isn't running.
async function refineOrganizationsWithNER(rawText, education, experience) {
  const nerResult = await mlServiceClient.extractEntities(rawText);

  const stripInternal = (entry) => {
    const { _rawLine, ...clean } = entry;
    return clean;
  };

  if (!nerResult || !nerResult.organizations.length) {
    return { education: education.map(stripInternal), experience: experience.map(stripInternal) };
  }

  const findOrgIn = (originalLine = '') =>
    nerResult.organizations.find((org) => originalLine.toLowerCase().includes(org.toLowerCase()));

  const refinedEducation = education.map((entry) => {
    const match = findOrgIn(entry._rawLine);
    return stripInternal(match ? { ...entry, school: match } : entry);
  });
  const refinedExperience = experience.map((entry) => {
    const match = findOrgIn(entry._rawLine);
    return stripInternal(match ? { ...entry, company: match } : entry);
  });

  return { education: refinedEducation, experience: refinedExperience };
}

function computeResumeScore({ detectedSkills, education, experience, projects, certifications, rawText }) {
  let score = 0;
  score += Math.min(detectedSkills.length * 3, 40); // up to 40 pts for breadth of skills
  score += Math.min(experience.length * 8, 24); // up to 24 pts for experience entries
  score += Math.min(projects.length * 6, 18); // up to 18 pts for projects
  score += Math.min(certifications.length * 4, 8); // up to 8 pts for certifications
  score += Math.min(education.length * 5, 10); // up to 10 pts for education
  if (rawText && rawText.length > 1500) score += 0; // length isn't rewarded beyond content
  return Math.max(0, Math.min(100, Math.round(score)));
}

function suggestImprovements({ detectedSkills, experience, projects, certifications }) {
  const suggestions = [];
  if (detectedSkills.length < 8) suggestions.push('Add more specific technical skills (tools, frameworks, languages) rather than generic terms.');
  if (experience.length === 0) suggestions.push('Include a Work Experience section with clear company names, titles and durations.');
  if (projects.length < 2) suggestions.push('Showcase at least 2-3 projects with the specific technologies used in each.');
  if (certifications.length === 0) suggestions.push('Consider adding relevant certifications to strengthen credibility for your target role.');
  suggestions.push('Quantify achievements with metrics (e.g. "reduced load time by 30%") wherever possible.');
  return suggestions;
}

async function parseResume(filePath, mimeType) {
  const rawText = normalizeResumeText(await extractTextFromFile(filePath, mimeType));
  if (rawText.length < 40) throw new Error('We could not extract enough text from this file. Please upload a text-based PDF or DOCX.');

  // 1. Exact + fuzzy skill matching (always runs, no external dependency)
  const exactFuzzySkills = extractSkillsFromText(rawText);
  const alreadyFoundNames = new Set(exactFuzzySkills.map((s) => s.name));

  // 2. OPTIONAL semantic skill matching (Sentence-BERT via ml-service/) — adds
  // skills phrased differently than the taxonomy name, if ml-service is running
  const semanticSkills = await extractSkillsSemantic(rawText, alreadyFoundNames);
  const detectedSkills = [...exactFuzzySkills, ...semanticSkills];

  const sections = splitIntoSections(rawText);
  let education = parseEducation(sections.education);
  let experience = parseExperience(sections.experience);
  const projects = parseProjects(sections.projects, detectedSkills);
  const certifications = parseCertifications(sections.certifications);

  // 3. OPTIONAL NER-based cleanup of company/school names (dslim/bert-base-NER
  // via ml-service/) — falls back to the heuristic guesses if ml-service is down
  ({ education, experience } = await refineOrganizationsWithNER(rawText, education, experience));

  const { scoreResumeAts } = require('./atsScorerService');
  const atsReport = await scoreResumeAts({ resumeText: rawText });
  const resumeScore = atsReport.overallScore;
  const suggestions = atsReport.criticalFixes?.length
    ? atsReport.criticalFixes
    : suggestImprovements({ detectedSkills, experience, projects, certifications });

  return {
    rawText: rawText.slice(0, 20000),
    detectedSkills,
    education,
    experience,
    projects,
    certifications,
    resumeScore,
    atsReport,
    suggestions,
    stats: {
      skillsDetected: detectedSkills.length,
      projectsFound: projects.length,
      experienceEntries: experience.length,
      certificationsFound: certifications.length,
    },
  };
}

module.exports = { parseResume, extractSkillsFromText, normalizeResumeText };

