const gemini = require('./geminiService');

const clamp = (number, fallback = 0) => Math.max(0, Math.min(100, Number.isFinite(Number(number)) ? Math.round(Number(number)) : fallback));
const cleanList = (value, limit = 8) => Array.isArray(value) ? value.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim().slice(0, 300)).slice(0, limit) : [];

async function reviewResume({ rawText, parsed, targetRole, jobDescription = '' }) {
  const result = await gemini.generateJson({
    systemInstruction: 'You are an ATS resume reviewer. Be accurate, supportive, and never claim ATS guarantees. Return only valid JSON.',
    prompt: `Review this resume for ${targetRole || 'the candidate target role'}${jobDescription ? ` against this job description: ${jobDescription.slice(0, 7000)}` : ''}. Resume:\n${rawText.slice(0, 16000)}\nDetected facts: ${JSON.stringify({ skills: parsed.detectedSkills.map((s) => s.name), experience: parsed.experience, projects: parsed.projects })}\nReturn {"atsScore":0,"headline":"...","keywordCoverage":["..."],"missingKeywords":["..."],"improvements":["actionable improvement"],"rewrittenBullets":["truth-preserving example bullet"],"summary":"..."}. Score is an estimate, not a guarantee.`,
    maxOutputTokens: 1600,
    temperature: 0.2,
  });
  if (!result?.value) return null;
  const value = result.value;
  return {
    atsScore: clamp(value.atsScore, parsed.resumeScore),
    headline: typeof value.headline === 'string' ? value.headline.slice(0, 140) : '',
    keywordCoverage: cleanList(value.keywordCoverage),
    missingKeywords: cleanList(value.missingKeywords),
    improvements: cleanList(value.improvements),
    rewrittenBullets: cleanList(value.rewrittenBullets, 6),
    summary: typeof value.summary === 'string' ? value.summary.slice(0, 700) : '',
    generatedBy: result.generatedBy,
  };
}

async function generateResumeDraft({ user, parsed, targetRole, jobDescription, details = {} }) {
  const sourceFacts = {
    candidateName: user.fullName,
    email: user.email,
    targetRole,
    extractedSkills: parsed?.detectedSkills?.map((skill) => skill.name) || [],
    experience: parsed?.experience || [], projects: parsed?.projects || [], education: parsed?.education || [], certifications: parsed?.certifications || [],
    providedDetails: details,
  };
  const result = await gemini.generateJson({
    systemInstruction: 'You are an expert resume writer. Use only supplied facts. Do not invent employers, degrees, dates, metrics, certifications, links, or achievements. Return only valid JSON.',
    prompt: `Create an ATS-friendly one-page resume draft for ${targetRole || 'the requested role'}${jobDescription ? ` tailored to this job description: ${jobDescription.slice(0, 7000)}` : ''}. Facts: ${JSON.stringify(sourceFacts)}. Return {"template":"modern-ats","basics":{"name":"","email":"","phone":"","location":"","linkedin":"","portfolio":"","title":""},"summary":"","skills":[""],"experience":[{"company":"","title":"","duration":"","bullets":[""]}],"projects":[{"name":"","description":"","skills":[""]}],"education":[{"school":"","degree":"","year":""}],"certifications":[""],"atsKeywords":[""]}. Keep language concrete and scan-friendly.`,
    maxOutputTokens: 2200,
    temperature: 0.25,
  });
  return result?.value ? { draft: result.value, generatedBy: result.generatedBy } : null;
}

module.exports = { reviewResume, generateResumeDraft };
