/**
 * ATS Scorer Service (Node.js layer)
 * ----------------------------------
 * Direct bridge to the dedicated ATS Scoring Engine in ml-service/ (Sentence-BERT + Structural Heuristics).
 * Includes an internal, zero-dependency Node.js fallback scorer so the ATS checker works even if ml-service is offline.
 */
const mlServiceClient = require('./mlServiceClient');

const STRONG_VERBS = new Set([
  'accelerated', 'achieved', 'architected', 'automated', 'built', 'centralized',
  'coached', 'collaborated', 'condensed', 'consolidated', 'converted', 'created',
  'customized', 'debugged', 'decreased', 'delivered', 'deployed', 'designed',
  'developed', 'devised', 'directed', 'doubled', 'drafted', 'drove', 'eliminated',
  'engineered', 'established', 'evaluated', 'exceeded', 'executed', 'expanded',
  'expedited', 'formulated', 'generated', 'guided', 'implemented', 'improved',
  'increased', 'initiated', 'innovated', 'installed', 'integrated', 'introduced',
  'invented', 'launched', 'led', 'managed', 'maximized', 'mentored', 'migrated',
  'minimized', 'modernized', 'negotiated', 'optimized', 'orchestrated', 'overhauled',
  'oversaw', 'partnered', 'pioneered', 'planned', 'produced', 'programmed',
  'rearchitected', 'rebuilt', 'reduced', 'refactored', 'resolved', 'restructured',
  'revamped', 'scaled', 'secured', 'simplified', 'solved', 'spearheaded',
  'standardized', 'streamlined', 'strengthened', 'transformed', 'upgraded', 'validated'
]);

const WEAK_PHRASES = [
  /\bresponsible for\b/i,
  /\btasked with\b/i,
  /\bworked on\b/i,
  /\bhelped with\b/i,
  /\bassisted in\b/i,
  /\bduties included\b/i,
  /\bhandled\b/i,
];

const BUZZWORDS = [
  /\bsynergy\b/i,
  /\bgo-getter\b/i,
  /\bhard worker\b/i,
  /\bteam player\b/i,
  /\bthink outside the box\b/i,
  /\bresults-oriented\b/i,
  /\bthought leader\b/i,
  /\bself-starter\b/i,
];

const ROLE_KEYWORDS = {
  frontend: ['React', 'TypeScript', 'JavaScript', 'Next.js', 'Redux', 'Tailwind CSS', 'HTML5', 'CSS3', 'REST APIs', 'GraphQL', 'Jest', 'Responsive Design'],
  backend: ['Node.js', 'Python', 'Go', 'Express', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'Microservices', 'REST APIs', 'AWS', 'CI/CD'],
  'full stack': ['React', 'Node.js', 'TypeScript', 'Next.js', 'PostgreSQL', 'MongoDB', 'REST APIs', 'GraphQL', 'Docker', 'AWS', 'Git', 'CI/CD'],
  'data science': ['Python', 'SQL', 'Pandas', 'NumPy', 'Scikit-Learn', 'PyTorch', 'TensorFlow', 'Machine Learning', 'Data Visualization', 'A/B Testing'],
  devops: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'GitHub Actions', 'Linux', 'Bash', 'Prometheus', 'Grafana'],
};

function runNodeFallbackAtsScore(resumeText, targetRole = 'Full Stack Developer', jobDescription = '') {
  const text = resumeText || '';
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // 1. Parseability
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text);
  const hasLinkedin = /linkedin\.com\/in\/[a-zA-Z0-9_-]+/i.test(text);
  const hasGithub = /github\.com\/[a-zA-Z0-9_-]+/i.test(text);

  const sections = {
    summary: /\b(summary|profile|about me|objective)\b/i.test(text),
    experience: /\b(experience|employment|work history)\b/i.test(text),
    education: /\b(education|academic background|degree)\b/i.test(text),
    skills: /\b(skills|technologies|proficiencies)\b/i.test(text),
    projects: /\b(projects|technical projects)\b/i.test(text),
  };
  const secCount = Object.values(sections).filter(Boolean).length;
  let parseScore = (hasEmail ? 20 : 0) + (hasPhone ? 15 : 0) + (hasLinkedin || hasGithub ? 15 : 0) + (secCount * 8);
  if (wordCount >= 400 && wordCount <= 1100) parseScore += 10;
  parseScore = Math.min(100, Math.max(25, parseScore));

  // 2. Metrics & Google X-Y-Z
  const metricRegex = /(\b\d+(\.\d+)?%|\$\s?\d+([,\.]\d+)?\s?[kKmMbB]?|\b\d+\s?(k|K|M|B|x|X)\b|\b\d{2,}\+?\s?(users|clients|requests|ms|seconds|teams|engineers|endpoints)\b)/gi;
  const metricsFound = Array.from(new Set(text.match(metricRegex) || [])).slice(0, 10);
  const metricsCount = metricsFound.length;
  let impactScore = 25;
  if (metricsCount >= 5) impactScore = 95;
  else if (metricsCount >= 3) impactScore = 78;
  else if (metricsCount >= 1) impactScore = 55;

  // 3. Action Verbs
  const lowerWords = words.map((w) => w.toLowerCase().replace(/[^a-z]/g, ''));
  const strongVerbsFound = Array.from(new Set(lowerWords.filter((w) => STRONG_VERBS.has(w))));
  let weakPhrasesCount = 0;
  WEAK_PHRASES.forEach((wp) => {
    const m = text.match(wp);
    if (m) weakPhrasesCount += m.length;
  });
  let actionScore = 40;
  if (strongVerbsFound.length >= 7) actionScore = 92;
  else if (strongVerbsFound.length >= 4) actionScore = 80;
  else if (strongVerbsFound.length >= 2) actionScore = 60;
  actionScore = Math.max(20, Math.min(100, actionScore - (weakPhrasesCount * 8)));

  // 4. Role Keywords
  let roleKey = 'full stack';
  const rLower = (targetRole || '').toLowerCase();
  if (rLower.includes('front')) roleKey = 'frontend';
  else if (rLower.includes('back')) roleKey = 'backend';
  else if (rLower.includes('data') || rLower.includes('ml')) roleKey = 'data science';
  else if (rLower.includes('devops') || rLower.includes('cloud')) roleKey = 'devops';

  const expected = ROLE_KEYWORDS[roleKey] || ROLE_KEYWORDS['full stack'];
  const matchedKeywords = expected.filter((kw) => new RegExp(`\\b${kw}\\b`, 'i').test(text));
  const missingKeywords = expected.filter((kw) => !new RegExp(`\\b${kw}\\b`, 'i').test(text));
  const relevanceScore = Math.min(100, Math.max(30, Math.round((matchedKeywords.length / expected.length) * 100)));

  // 5. Clarity & Red Flags
  const firstPersonMatches = text.match(/\b(i|me|my|mine|myself)\b/gi) || [];
  let buzzwordMatches = 0;
  BUZZWORDS.forEach((bw) => {
    const m = text.match(bw);
    if (m) buzzwordMatches += m.length;
  });
  let clarityScore = 100 - (firstPersonMatches.length * 7) - (buzzwordMatches * 10);
  if (wordCount < 250) clarityScore -= 20;
  clarityScore = Math.max(20, Math.min(100, clarityScore));

  // Overall Weighted
  const weighted = Math.round(
    (parseScore * 0.20) +
    (impactScore * 0.25) +
    (actionScore * 0.20) +
    (relevanceScore * 0.25) +
    (clarityScore * 0.10)
  );
  const overallScore = Math.max(0, Math.min(100, weighted));

  let grade = 'Needs Work';
  let status = 'At Risk — Substantial ATS Gaps Detected';
  if (overallScore >= 90) { grade = 'A+'; status = 'ATS Leader — High Interview Probability'; }
  else if (overallScore >= 80) { grade = 'A'; status = 'Strong Match — Passes Most Filters'; }
  else if (overallScore >= 70) { grade = 'B'; status = 'Competitive — Minor Optimizations Needed'; }
  else if (overallScore >= 55) { grade = 'C'; status = 'Borderline — Risk of Automated Filtering'; }

  const criticalFixes = [];
  const positiveSignals = [];

  if (!hasEmail) criticalFixes.push('Missing or unparseable email address in contact header.');
  if (!hasPhone) criticalFixes.push('Missing phone number for recruiter outreach.');
  if (secCount < 3) criticalFixes.push(`Only ${secCount}/5 standard section headers detected. Use standard titles (Experience, Education, Skills, Projects).`);
  if (metricsCount < 3) criticalFixes.push(`Only ${metricsCount} quantified metrics found. Modern ATS algorithms heavily prioritize numbers, %, and quantifiable outcomes.`);
  if (weakPhrasesCount > 0) criticalFixes.push(`Found ${weakPhrasesCount} passive phrases (e.g. 'responsible for'). Replace with assertive executive verbs.`);
  if (firstPersonMatches.length > 2) criticalFixes.push(`Found ${firstPersonMatches.length} first-person pronouns ('I', 'me', 'my'). Technical resumes should use concise 3rd-person phrasing.`);

  if (hasLinkedin) positiveSignals.push('LinkedIn profile link properly detected.');
  if (metricsCount >= 4) positiveSignals.push(`Excellent quantifiable impact: ${metricsCount} data metrics detected.`);
  if (strongVerbsFound.length >= 5) positiveSignals.push(`High-impact vocabulary: ${strongVerbsFound.length} strong action verbs used.`);
  if (matchedKeywords.length >= 5) positiveSignals.push(`Strong keyword alignment: ${matchedKeywords.length} core domain competencies matched.`);

  return {
    overallScore,
    grade,
    status,
    wordCount,
    dimensions: {
      parseability: { score: parseScore, weight: '20%', label: 'Formatting & Parseability' },
      quantifiedImpact: { score: impactScore, weight: '25%', label: 'Google X-Y-Z Quantified Impact' },
      actionVerbs: { score: actionScore, weight: '20%', label: 'Action Verb Strength' },
      roleRelevance: { score: relevanceScore, weight: '25%', label: 'Skill & Keyword Relevance' },
      clarityAudit: { score: clarityScore, weight: '10%', label: 'Clarity & Red Flag Audit' },
    },
    criticalFixes: criticalFixes.slice(0, 5),
    positiveSignals: positiveSignals.slice(0, 5),
    metricsDetected: metricsFound,
    actionVerbsUsed: strongVerbsFound.slice(0, 8),
    missingKeywords: missingKeywords.slice(0, 8),
    matchedKeywords: matchedKeywords.slice(0, 10),
    engine: 'SkillForge ATS Engine v2.0 (Structural Fallback)',
  };
}

async function scoreResumeAts({ resumeText, targetRole, jobDescription }) {
  // 1. Try dedicated ML microservice
  try {
    const mlResult = await mlServiceClient.checkAtsScore(resumeText, targetRole, jobDescription);
    if (mlResult && mlResult.overallScore != null) {
      return mlResult;
    }
  } catch (err) {
    // Continue to fallback
  }

  // 2. Offline fallback
  return runNodeFallbackAtsScore(resumeText, targetRole, jobDescription);
}

module.exports = { scoreResumeAts };
