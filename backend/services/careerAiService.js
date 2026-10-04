/**
 * Career AI Service
 * -----------------
 * Powers intelligent, personalized decision-support across SkillForge AI:
 *   1. Daily Career Briefings
 *   2. AI 30-Day Gap-Closing Strategies
 *   3. AI Study Guides & Cheat-Sheets per Skill/Milestone
 *   4. Job-Specific Interview Question Predictions
 *   5. AI Metric-Driven Resume Bullet Rewriter (Google X-Y-Z formula)
 *   6. AI Professional Bio & Elevator Pitch Generator
 *   7. Application Pipeline Stage Guidance
 */
const gemini = require('./geminiService');
const User = require('../models/User');
const Resume = require('../models/Resume');
const UserSkill = require('../models/UserSkill');
const Roadmap = require('../models/Roadmap');
const { computeSkillGaps, computeCareerReadiness } = require('./skillGraphService');

// 1. Daily AI Career Briefing
async function getDailyBriefing(userId) {
  const [user, userSkills, resume] = await Promise.all([
    User.findById(userId).lean(),
    UserSkill.find({ user: userId }).lean(),
    Resume.findOne({ user: userId }).sort({ createdAt: -1 }).lean(),
  ]);

  const targetRole = user?.targetRole || 'Software Engineer';
  const gaps = await computeSkillGaps(userId, targetRole).catch(() => []);
  const readiness = await computeCareerReadiness(userId, targetRole).catch(() => ({ overall: 0 }));

  const criticalGaps = gaps.filter((g) => g.gap > 0);
  const topGap = criticalGaps[0] || null;

  const fallback = {
    headline: topGap
      ? `Focus on ${topGap.skill} to boost your ${targetRole} readiness.`
      : `Continue your ${targetRole} preparation momentum today.`,
    topPrioritySkill: topGap ? topGap.skill : 'General Practice',
    expectedReadinessGain: topGap ? Math.min(18, Math.max(5, Math.round(topGap.gap * 0.2))) : 5,
    advice: topGap
      ? `${topGap.skill} is required at level ${topGap.requiredLevel}% for ${targetRole} (currently at ${topGap.yourLevel}%). A quick practice session or lesson today will build high-impact job readiness.`
      : `Your skills are well aligned with ${targetRole}. Keep practicing mock interviews to refine your technical communication.`,
    recommendedAction: topGap ? `Take a 5-minute ${topGap.skill} assessment` : 'Start an AI mock interview',
    actionType: topGap ? 'quiz' : 'interview',
    actionTarget: topGap ? topGap.skill : targetRole,
  };

  const prompt = `Based on candidate targeting ${targetRole} with overall readiness ${readiness.overall || 0}%, current skills: ${userSkills.slice(0, 8).map((s) => `${s.skillName} (${s.level}%)`).join(', ')}, and top skill gaps: ${criticalGaps.slice(0, 3).map((g) => `${g.skill} (gap: ${g.gap}%, priority: ${g.priority})`).join(', ')}. Generate a concise, encouraging daily career briefing. Return JSON format: {"headline":"string (max 80 chars)","topPrioritySkill":"string","expectedReadinessGain":number (5-20),"advice":"string (2-3 sentences)","recommendedAction":"string (actionable button label)","actionType":"quiz"|"interview"|"roadmap","actionTarget":"string"}.`;

  const result = await gemini.generateJson({
    prompt,
    systemInstruction: 'You are an elite career development strategist. Return only valid JSON without markdown formatting.',
    maxOutputTokens: 600,
    temperature: 0.3,
  });

  return result?.value?.headline ? { ...result.value, generatedBy: result.generatedBy } : fallback;
}

// 2. AI 30-Day Gap-Closing Strategy
async function getGapClosingStrategy(userId, targetRole) {
  const gaps = await computeSkillGaps(userId, targetRole).catch(() => []);
  const criticalGaps = gaps.filter((g) => g.gap > 0).slice(0, 4);

  const fallbackPlan = {
    title: `30-Day Accelerated Action Plan for ${targetRole}`,
    overview: `A focused 4-week roadmap engineered to bridge your top competency gaps: ${criticalGaps.map((g) => g.skill).join(', ') || 'Core Technologies'}.`,
    weeks: [
      {
        week: 1,
        focusSkill: criticalGaps[0]?.skill || 'Foundational Architecture',
        targetOutcome: `Close ${criticalGaps[0]?.skill || 'Core'} gap from ${criticalGaps[0]?.yourLevel || 0}% to ${Math.min(100, (criticalGaps[0]?.yourLevel || 0) + 30)}%`,
        milestones: [
          'Review core design patterns and architecture documentation',
          'Complete 2 hands-on mini projects demonstrating clean patterns',
          'Pass the AI skill assessment with score >= 75%',
        ],
      },
      {
        week: 2,
        focusSkill: criticalGaps[1]?.skill || 'Integration & Testing',
        targetOutcome: `Demonstrate mastery in ${criticalGaps[1]?.skill || 'Secondary Tech Stack'}`,
        milestones: [
          'Implement end-to-end workflow integrating your primary and secondary skills',
          'Optimize execution latency and error handling',
          'Complete an adaptive technical quiz',
        ],
      },
      {
        week: 3,
        focusSkill: criticalGaps[2]?.skill || 'Production Engineering',
        targetOutcome: 'Build a production-grade portfolio project',
        milestones: [
          'Deploy full project to cloud with automated CI/CD checks',
          'Document trade-offs, architecture decisions, and metrics',
          'Update resume project bullets with quantifiable metrics',
        ],
      },
      {
        week: 4,
        focusSkill: 'Interview Simulation & Polish',
        targetOutcome: 'Achieve interview readiness score >= 85%',
        milestones: [
          'Complete 3 full-length AI mock technical interviews',
          'Refine responses using the STAR method for behavioral turns',
          'Review ATS resume alignment against target job descriptions',
        ],
      },
    ],
  };

  if (!criticalGaps.length) return fallbackPlan;

  const prompt = `Create a realistic 4-week 30-day accelerated strategy for a candidate targeting "${targetRole}" with critical skill gaps: ${JSON.stringify(criticalGaps.map((g) => ({ skill: g.skill, currentLevel: g.yourLevel, targetLevel: g.requiredLevel, priority: g.priority })))}. Return JSON format: {"title":"string","overview":"string","weeks":[{"week":number,"focusSkill":"string","targetOutcome":"string","milestones":["string","string","string"]}]}.`;

  const result = await gemini.generateJson({
    prompt,
    systemInstruction: 'You are an executive engineering hiring mentor. Create realistic, rigorous, project-backed weekly plans. Return only valid JSON.',
    maxOutputTokens: 1400,
    temperature: 0.35,
  });

  return result?.value?.weeks?.length ? { ...result.value, generatedBy: result.generatedBy } : fallbackPlan;
}

// 3. AI Study Guide & Cheat Sheet per Skill
async function getStudyGuide(skill, level = 30) {
  const fallbackGuide = {
    skill,
    level,
    summary: `${skill} is an essential competency. Mastering its core mechanics, runtime trade-offs, and common failure modes is key to clearing technical assessments.`,
    coreConcepts: [
      { name: 'Architecture & Fundamentals', explanation: `How ${skill} executes, manages state, and interacts with adjacent systems.` },
      { name: 'Common Best Practices', explanation: `Idiomatic patterns, modular organization, and defensive error handling in ${skill}.` },
      { name: 'Performance & Optimization', explanation: `Techniques to reduce overhead, prevent memory leaks, and profile execution.` },
    ],
    codeSnippets: [
      {
        title: `Idiomatic ${skill} Pattern`,
        code: `// Best-practice configuration and implementation\nfunction configure${skill.replace(/[^a-zA-Z0-9]/g, '')}() {\n  const config = { strict: true, timeout: 5000 };\n  return init(config);\n}`,
      },
    ],
    commonPitfalls: [
      'Neglecting proper resource cleanup and error boundaries',
      'Ignoring concurrency or asynchronous execution edge cases',
      'Over-complicating architecture when standard primitives suffice',
    ],
    interviewQuestions: [
      { question: `How does ${skill} handle state or resource management under heavy load?`, keyPoints: 'Explain caching, concurrency primitives, and graceful degradation.' },
      { question: `What trade-offs led you to choose ${skill} over common alternatives?`, keyPoints: 'Compare developer velocity, ecosystem maturity, and benchmark latency.' },
    ],
  };

  const prompt = `Generate a high-density, technical study cheat-sheet for "${skill}" calibrated for proficiency level ${level}/100. Return JSON: {"skill":"${skill}","level":${level},"summary":"string (2 sentences)","coreConcepts":[{"name":"string","explanation":"string"}],"codeSnippets":[{"title":"string","code":"string"}],"commonPitfalls":["string","string","string"],"interviewQuestions":[{"question":"string","keyPoints":"string"}]}.`;

  const result = await gemini.generateJson({
    prompt,
    systemInstruction: 'You create expert technical study cheat-sheets. Provide realistic code snippets and sharp interview talking points. Return only valid JSON.',
    maxOutputTokens: 1500,
    temperature: 0.3,
  });

  return result?.value?.coreConcepts?.length ? { ...result.value, generatedBy: result.generatedBy } : fallbackGuide;
}

// 4. Job-Specific Interview Question Predictions
async function predictJobInterviewQuestions(job) {
  const fallback = {
    jobTitle: job.title,
    company: job.company,
    questions: [
      {
        type: 'Technical',
        question: `How would you architect a production feature using ${job.requiredSkills?.[0] || 'core technologies'} at ${job.company}?`,
        intent: 'Tests practical system design, component boundaries, and trade-off justification.',
        sampleAnswerApproach: 'Clarify requirements, present high-level architecture, dive into data flow, and discuss error handling.',
      },
      {
        type: 'Technical',
        question: `What performance bottlenecks have you encountered when scaling with ${job.requiredSkills?.[1] || 'modern tech stack'}, and how did you resolve them?`,
        intent: 'Evaluates real hands-on debugging, profiling depth, and optimization methodology.',
        sampleAnswerApproach: 'Cite a specific metric, profiling tool used, root cause, and the measurable impact of your fix.',
      },
      {
        type: 'Behavioral',
        question: `Tell me about a time you had to deliver a critical milestone at ${job.company} with ambiguous requirements.`,
        intent: 'Gauges stakeholder communication, proactive ambiguity resolution, and ownership.',
        sampleAnswerApproach: 'Use STAR method: explain the ambiguity, proactive steps taken to align stakeholders, and the outcome.',
      },
      {
        type: 'Culture & Role',
        question: `Why ${job.company}, and how does your background in ${job.workMode || 'this work environment'} fit this role?`,
        intent: 'Assesses company research, alignment with product mission, and collaboration fit.',
        sampleAnswerApproach: 'Mention specific company products or engineering challenges that genuinely excite you.',
      },
    ],
  };

  const prompt = `Based on job posting: Title: "${job.title}", Company: "${job.company}", Required Skills: ${(job.requiredSkills || []).join(', ')}, Description: "${(job.description || '').slice(0, 1500)}". Predict 4 realistic, high-probability interview questions. Return JSON: {"jobTitle":"${job.title}","company":"${job.company}","questions":[{"type":"Technical"|"Behavioral"|"Culture","question":"string","intent":"string","sampleAnswerApproach":"string"}]}.`;

  const result = await gemini.generateJson({
    prompt,
    systemInstruction: 'You are a senior technical interviewer for top tech companies. Predict realistic interview questions. Return only valid JSON.',
    maxOutputTokens: 1200,
    temperature: 0.35,
  });

  return result?.value?.questions?.length ? { ...result.value, generatedBy: result.generatedBy } : fallback;
}

// 5. Metric-Driven Resume Bullet Rewriter (Google X-Y-Z formula)
async function rewriteBulletPoint(bulletText, targetRole = 'Software Engineer') {
  const fallback = {
    original: bulletText,
    suggestions: [
      `Architected and deployed responsive ${targetRole} modules, reducing page load latency by 35% across 50K+ monthly active users.`,
      `Engineered robust API services with comprehensive automated testing, increasing release velocity by 40% while maintaining 99.9% uptime.`,
      `Spearheaded the redesign of core user workflows using modern best practices, lifting user task completion rates by 28%.`,
    ],
  };

  if (!bulletText || !bulletText.trim()) return fallback;

  const prompt = `Rewrite this resume bullet point into 3 strong, metric-driven, ATS-friendly alternatives using Google's X-Y-Z formula ("Accomplished [X] as measured by [Y], by doing [Z]") tailored for a ${targetRole}:\nOriginal: "${bulletText}"\n\nReturn JSON: {"original":"${bulletText}","suggestions":["bullet 1","bullet 2","bullet 3"]}.`;

  const result = await gemini.generateJson({
    prompt,
    systemInstruction: 'You are a premier executive resume editor. Transform passive statements into impactful, quantified achievements with action verbs. Return only valid JSON.',
    maxOutputTokens: 800,
    temperature: 0.4,
  });

  return result?.value?.suggestions?.length ? { ...result.value, generatedBy: result.generatedBy } : fallback;
}

// 6. AI Professional Bio & Elevator Pitch Generator
async function generateProfilePitch(user, targetRole = 'Software Engineer') {
  const skills = (user.skills || []).slice(0, 10).map((s) => s.skillName || s).join(', ');
  const fallback = {
    targetRole,
    linkedinSummary: `Results-driven ${targetRole} with a strong foundation in ${skills || 'full-stack engineering'}. Passionate about building scalable, user-centric web applications and continuously modernizing tech stacks. Demonstrated track record in delivering maintainable code, solving complex technical challenges, and collaborating across agile teams.`,
    elevatorPitch: `Hi, I'm ${user.fullName || 'a developer'}, a ${targetRole} specializing in ${skills || 'modern development'}. I love building high-performance systems from the ground up and optimizing user experiences. Most recently, I've been focusing on scalable architectures and production readiness, and I'm eager to bring that problem-solving drive to high-impact engineering teams.`,
    resumeHeadline: `${targetRole} | Specialized in ${skills || 'Scalable Web Architecture & Cloud Technologies'}`,
  };

  const prompt = `Generate 3 professional pitch variations for candidate ${user.fullName || 'Candidate'} targeting the role "${targetRole}" with skills: ${skills || 'modern software development'}.\nReturn JSON: {"targetRole":"${targetRole}","linkedinSummary":"string (2-3 compelling paragraphs)","elevatorPitch":"string (30-second spoken intro)","resumeHeadline":"string (punchy single-line ATS headline)"}.`;

  const result = await gemini.generateJson({
    prompt,
    systemInstruction: 'You are a top career branding strategist. Write authentic, confident, technically grounded professional summaries. Return only valid JSON.',
    maxOutputTokens: 1100,
    temperature: 0.45,
  });

  return result?.value?.linkedinSummary ? { ...result.value, generatedBy: result.generatedBy } : fallback;
}

// 7. Job Application Stage Guidance
function getStageGuidance(stage, jobTitle = 'Software Engineer', company = 'Target Company') {
  const guides = {
    Saved: {
      stage: 'Saved',
      headline: `Preparing to apply for ${jobTitle} at ${company}`,
      tips: [
        'Review the required skills and run an ATS Resume Review against this job description.',
        'Find 2-3 engineers or alumni working at the company on LinkedIn for warm referral outreach.',
        'Align your top 2 portfolio project descriptions with the core technologies mentioned in the posting.',
      ],
      suggestedAction: 'Tailor Resume in Resume Studio',
      actionLink: '/resume',
    },
    Applied: {
      stage: 'Applied',
      headline: `Application submitted — post-application follow-up strategy`,
      tips: [
        'Send a polite LinkedIn message to the recruiter or hiring manager within 48-72 hours expressing genuine interest.',
        'Review your resume submission so you can speak to any project metrics you listed.',
        'Start practicing technical questions for the primary required stack.',
      ],
      suggestedAction: 'Take Assessment Quiz',
      actionLink: '/assessment',
    },
    Assessment: {
      stage: 'Assessment',
      headline: `Coding challenge or online assessment preparation`,
      tips: [
        'Practice timed coding challenges focusing on clean complexity analysis (Big-O time and space).',
        'Brush up on fundamental data structures (hash maps, trees, dynamic arrays) and unit testing.',
        'Get a solid night of rest before starting timed tests.',
      ],
      suggestedAction: 'Start Practice Lab',
      actionLink: '/assessment',
    },
    Interview: {
      stage: 'Interview',
      headline: `Technical and behavioral interview execution`,
      tips: [
        'Practice explaining your thought process out loud before writing any code or architecture blocks.',
        'Prepare 3 STAR stories (Situation, Task, Action, Result) for behavioral and leadership questions.',
        'Prepare 3 thoughtful questions to ask the interviewers about their engineering culture and technical roadmap.',
      ],
      suggestedAction: 'Launch Voice Mock Interview',
      actionLink: '/assessment',
    },
    Offer: {
      stage: 'Offer',
      headline: `Offer evaluation and compensation negotiation`,
      tips: [
        'Carefully evaluate base salary, equity vesting schedules, performance bonuses, and health benefits.',
        'Never accept on the initial phone call; express gratitude and request the written offer details with a reasonable decision window.',
        'Benchmark against industry compensation data (Levels.fyi, Glassdoor) for your experience bracket.',
      ],
      suggestedAction: 'Consult Career Coach Chatbot',
      actionLink: '/dashboard',
    },
    Rejected: {
      stage: 'Rejected',
      headline: `Resilience and constructive retro strategy`,
      tips: [
        'Send a brief, gracious thank-you note to the recruiter asking to keep in touch for future openings.',
        'Do a quick retrospective: what technical questions or behavioral moments could be polished?',
        'Use SkillForge AI to diagnose any skill gaps and update your learning roadmap.',
      ],
      suggestedAction: 'Update Roadmap',
      actionLink: '/roadmap',
    },
  };

  return guides[stage] || guides.Saved;
}

module.exports = {
  getDailyBriefing,
  getGapClosingStrategy,
  getStudyGuide,
  predictJobInterviewQuestions,
  rewriteBulletPoint,
  generateProfilePitch,
  getStageGuidance,
};
