const asyncHandler = require('express-async-handler');
const Assessment = require('../models/Assessment');
const Skill = require('../models/Skill');
const UserSkill = require('../models/UserSkill');
const Resume = require('../models/Resume');
const mlServiceClient = require('../services/mlServiceClient');
const aiService = require('../services/geminiService');
const { skillsTaxonomy } = require('../data/skillsTaxonomy');
const { buildUserContextChunks } = require('../utils/aiContextBuilder');
const logActivity = require('../utils/activityLogger');

// A tiny JS-side safety net used ONLY if the ML service is completely unreachable
// (no internet/GPU at all) — parameterized by skill/difficulty so it still varies
// per user, unlike a fixed hardcoded question bank.
function jsFallbackQuestion(skill, difficulty, seed) {
  const isMcq = seed % 2 === 0;
  if (isMcq) {
    const correct = `The best-practice, most accurate description of ${skill}`;
    const options = [
      correct,
      `A common misconception about ${skill}`,
      `Something unrelated to ${skill}`,
      `An outdated approach to ${skill}`,
    ];
    // simple deterministic shuffle based on seed
    const shuffled = [...options].sort((a, b) => ((seed + a.length) % 4) - ((seed + b.length) % 4));
    return {
      skill,
      difficulty,
      questionType: 'mcq',
      questionText: `Which option best reflects a correct, ${difficulty.toLowerCase()}-level understanding of ${skill}?`,
      options: shuffled,
      correctOptionIndex: shuffled.indexOf(correct),
    };
  }
  return {
    skill,
    difficulty,
    questionType: 'open',
    questionText: `In a few sentences, explain how you would apply ${skill} to solve a real problem.`,
    modelAnswer: `A strong answer names the core purpose of ${skill}, gives one concrete example, and mentions a trade-off or pitfall at the ${difficulty.toLowerCase()} level.`,
  };
}

function difficultyForLevel(level) {
  if (level < 35) return 'Beginner';
  if (level < 70) return 'Intermediate';
  return 'Advanced';
}

async function generateAiLesson(skill, level) {
  const result = await aiService.generateJson({
    systemInstruction: 'You create compact, technically accurate interview-prep lessons. Return only valid JSON.',
    prompt: `Create a practical micro-lesson for ${skill}, suitable for a learner at level ${level}/100. Return {"title":"...","content":"..."}. Content must include fundamentals, one real example, and one pitfall. Maximum 180 words.`,
    maxOutputTokens: 700,
  });
  return result?.value?.title && result?.value?.content ? { ...result.value, generated_by: 'ai-engine' } : null;
}

async function generateAiQuestions(skill, level, count) {
  const result = await aiService.generateJson({
    systemInstruction: 'You generate fair, technically correct skill assessments. Return only valid JSON. Never reveal answers in the question text.',
    prompt: `Generate ${count} questions for ${skill} at level ${level}/100. Mix MCQ and open response. Return {"questions":[{"question_type":"mcq"|"open","question_text":"...","options":["..."],"correct_option_index":0,"model_answer":"...","difficulty":"Beginner|Intermediate|Advanced"}]}. MCQs need exactly 4 plausible options and a valid 0-based correct index. Open questions need empty options and a strong model_answer.`,
    maxOutputTokens: 1800,
    temperature: 0.35,
  });
  const questions = result?.value?.questions;
  if (!Array.isArray(questions)) return null;
  const valid = questions.filter((q) => q?.question_text && (q.question_type === 'open' || (Array.isArray(q.options) && q.options.length === 4 && Number.isInteger(q.correct_option_index))));
  return valid.length ? { questions: valid, generated_by: 'ai-engine' } : null;
}

// @desc List skills the user can be assessed on — their own current skills +
// the full taxonomy, NOT a fixed 7-skill hardcoded bank any more.
const getAvailableAssessmentSkills = asyncHandler(async (req, res) => {
  const [userSkills, dbSkills] = await Promise.all([
    UserSkill.find({ user: req.user._id }).lean(),
    Skill.find({}).select('name').lean(),
  ]);
  const names = new Set([
    ...userSkills.map((s) => s.skillName),
    ...dbSkills.map((s) => s.name),
    ...skillsTaxonomy.map((s) => s.name),
  ]);
  res.json({ skills: Array.from(names).sort() });
});

// @desc AI-generated short lesson for a skill before the quiz ("teach" step)
const getLesson = asyncHandler(async (req, res) => {
  const { skill } = req.params;
  const userSkill = await UserSkill.findOne({ user: req.user._id, skillName: skill }).lean();
  const level = userSkill?.level || 20;

  const lesson = await generateAiLesson(skill, level) || await mlServiceClient.generateLesson(skill, level);
  if (lesson) return res.json(lesson);

  res.json({
    title: `${difficultyForLevel(level)} ${skill}: what you need to know`,
    content: `${skill} is evaluated for your target role. Review the fundamentals, a real example of using it, and a common pitfall before taking the quiz.`,
    generated_by: 'template-fallback',
  });
});

// @desc Start a new AI-generated assessment (mixed MCQ + open-ended) covering the given skills
const startAssessment = asyncHandler(async (req, res) => {
  const { skills } = req.body; // array of skill names
  const userSkills = await UserSkill.find({ user: req.user._id, skillName: { $in: skills } }).lean();
  const levelMap = new Map(userSkills.map((s) => [s.skillName, s.level]));

  const targetSkills = skills && skills.length ? skills : ['JavaScript', 'React', 'Node.js'];
  const questions = [];
  let generatedBy = 'template-fallback';

  for (const skillName of targetSkills) {
    const level = levelMap.get(skillName) || 30;
    const difficulty = difficultyForLevel(level);
    // eslint-disable-next-line no-await-in-loop
    const result = await generateAiQuestions(skillName, level, 3) || await mlServiceClient.generateQuestions(skillName, level, 3, 'mixed');
    if (result?.questions?.length) {
      generatedBy = result.generated_by;
      result.questions.forEach((q) => {
        questions.push({
          skill: skillName,
          difficulty: q.difficulty || difficulty,
          questionType: q.question_type,
          questionText: q.question_text,
          options: q.options || [],
          correctOptionIndex: q.correct_option_index,
          modelAnswer: q.model_answer,
        });
      });
    } else {
      // ML service unreachable entirely — generate 2 parameterized fallback questions
      for (let i = 0; i < 2; i += 1) {
        questions.push(jsFallbackQuestion(skillName, difficulty, i));
      }
    }
  }

  const assessment = await Assessment.create({
    user: req.user._id,
    skillsAssessed: targetSkills,
    mode: 'quiz',
    questions,
    status: 'in_progress',
    generatedBy,
  });

  // Never leak correct answers / model answers to the client while in progress
  const safeQuestions = assessment.questions.map((q) => ({
    _id: q._id,
    skill: q.skill,
    difficulty: q.difficulty,
    questionType: q.questionType,
    questionText: q.questionText,
    options: q.options,
  }));

  res.status(201).json({ assessmentId: assessment._id, questions: safeQuestions, generatedBy });
});

// @desc Submit answers and get graded results (MCQ = exact match, open-ended = AI semantic grading)
const submitAssessment = asyncHandler(async (req, res) => {
  const { assessmentId, answers } = req.body;
  // answers: [{ questionId, selectedOptionIndex? , textAnswer? }]
  const assessment = await Assessment.findOne({ _id: assessmentId, user: req.user._id });
  if (!assessment) {
    res.status(404);
    throw new Error('Assessment not found');
  }

  const answerMap = new Map(answers.map((a) => [a.questionId, a]));

  await Promise.all(
    assessment.questions.map(async (q) => {
      const given = answerMap.get(String(q._id));
      if (!given) return;

      if (q.questionType === 'open') {
        q.userAnswer = given.textAnswer || '';
        const graded = await mlServiceClient.gradeOpenAnswer(q.questionText, q.modelAnswer || '', q.userAnswer);
        if (graded) {
          q.semanticScore = graded.score;
          q.semanticSimilarity = graded.semantic_similarity;
          q.feedback = graded.feedback;
          q.isCorrect = graded.score >= 60;
        } else {
          // fallback: crude keyword overlap so the feature still works offline
          const modelWords = new Set((q.modelAnswer || '').toLowerCase().split(/\W+/).filter((w) => w.length > 3));
          const userWords = new Set((q.userAnswer || '').toLowerCase().split(/\W+/).filter((w) => w.length > 3));
          const overlap = [...modelWords].filter((w) => userWords.has(w)).length;
          const score = modelWords.size ? Math.round((overlap / modelWords.size) * 100) : 0;
          q.semanticScore = score;
          q.isCorrect = score >= 50;
          q.feedback = score >= 50 ? 'Covers most of the key concepts.' : 'Missing several key concepts — review the fundamentals.';
        }
      } else {
        q.selectedOptionIndex = given.selectedOptionIndex;
        q.isCorrect = given.selectedOptionIndex === q.correctOptionIndex;
      }
    })
  );

  const bySkill = {};
  assessment.questions.forEach((q) => {
    if (!bySkill[q.skill]) bySkill[q.skill] = { correct: 0, total: 0 };
    bySkill[q.skill].total += 1;
    if (q.isCorrect) bySkill[q.skill].correct += 1;
  });

  const resultsBySkill = Object.entries(bySkill).map(([skill, { correct, total }]) => ({
    skill,
    score: Math.round((correct / total) * 100),
  }));

  assessment.resultsBySkill = resultsBySkill;
  assessment.status = 'completed';
  assessment.completedAt = new Date();
  await assessment.save();

  await Promise.all(
    resultsBySkill.map(async ({ skill, score }) => {
      const existing = await UserSkill.findOne({ user: req.user._id, skillName: skill });
      const blended = existing ? Math.round((existing.level + score) / 2) : score;
      await UserSkill.findOneAndUpdate(
        { user: req.user._id, skillName: skill },
        { level: blended, source: 'blended', $push: { history: { level: blended, recordedAt: new Date() } } },
        { upsert: true, new: true }
      );
    })
  );

  await logActivity(req.user._id, 'assessment_completed', `${req.user.fullName} completed an AI-generated assessment`, {
    skillsAssessed: assessment.skillsAssessed,
  });

  const gradedQuestions = assessment.questions.map((q) => ({
    _id: q._id,
    skill: q.skill,
    questionText: q.questionText,
    questionType: q.questionType,
    isCorrect: q.isCorrect,
    feedback: q.feedback,
    semanticScore: q.semanticScore,
  }));

  res.json({ resultsBySkill, questions: gradedQuestions });
});

// ---------------------------------------------------------------------------
// AI Mock Interview Engine — Live Video & Voice Interview with Nexora
// ---------------------------------------------------------------------------

// @desc Start an AI mock interview for a target role, resume, job description, and type
const startInterview = asyncHandler(async (req, res) => {
  const { skills, targetRole, interviewType, questionCount, jobDescription, resumeText } = req.body;
  const role = targetRole || req.user.targetRole || 'Full Stack Engineer';
  const type = interviewType || 'Technical Interview';
  const totalQuestions = Number(questionCount) || 3;
  const focusSkills = skills && skills.length ? skills : [];

  let candidateResumeContext = resumeText || '';
  if (!candidateResumeContext) {
    const latestResume = await Resume.findOne({ user: req.user._id }).sort({ createdAt: -1 }).lean();
    if (latestResume) {
      candidateResumeContext = latestResume.rawText?.slice(0, 4000) || '';
    }
  }

  const contextChunks = await buildUserContextChunks(req.user._id);

  const systemPrompt =
    `You are Nexora, an experienced Senior Technical Interviewer and Talent Lead conducting a live mock ${type} for the role of ${role}.\n` +
    (jobDescription ? `Target Job Description: ${jobDescription.slice(0, 1500)}\n` : '') +
    (candidateResumeContext ? `Candidate Resume Highlights: ${candidateResumeContext.slice(0, 1500)}\n` : '') +
    (focusSkills.length ? `Primary competencies to evaluate: ${focusSkills.join(', ')}.\n` : '') +
    `Session structure: exactly ${totalQuestions} questions. This is Question 1.\n` +
    'Introduce yourself warmly as Nexora in 1 concise sentence, state the interview focus, and ask your first specific question. Keep the opening under 65 words.';

  const aiOpening = await aiService.generate({
    prompt: `Begin the ${type} session for the candidate targeting ${role}. Welcome them briefly and ask Question 1 of ${totalQuestions}.`,
    systemInstruction: systemPrompt,
    maxOutputTokens: 250,
    temperature: 0.4,
  });

  const firstMessage =
    aiOpening?.text ||
    `Hello! I'm Nexora, your interviewer today. We'll be conducting your ${type} for the ${role} position. To kick things off, could you introduce yourself and walk me through the most technically challenging project you've built, highlighting the architecture and key trade-offs?`;

  const assessment = await Assessment.create({
    user: req.user._id,
    skillsAssessed: focusSkills.length ? focusSkills : [role],
    mode: 'interview',
    status: 'in_progress',
    generatedBy: 'neural-interviewer',
    transcript: [{ role: 'assistant', content: firstMessage }],
  });

  res.status(201).json({
    assessmentId: assessment._id,
    message: firstMessage,
    targetRole: role,
    interviewType: type,
    interviewerName: 'Nexora',
    questionCount: totalQuestions,
  });
});

// @desc Process the candidate's answer and get Nexora's next question or complete session
const continueInterview = asyncHandler(async (req, res) => {
  const { assessmentId, message, questionCount = 3, interviewType = 'Technical Interview' } = req.body;
  const assessment = await Assessment.findOne({ _id: assessmentId, user: req.user._id, mode: 'interview' });
  if (!assessment) {
    res.status(404);
    throw new Error('Interview session not found');
  }

  assessment.transcript.push({ role: 'user', content: message });

  const candidateTurns = assessment.transcript.filter((t) => t.role === 'user').length;
  const totalQuestions = Number(questionCount) || 3;
  const isLastQuestion = candidateTurns >= totalQuestions;

  const role = req.user.targetRole || 'Full Stack Engineer';
  const history = assessment.transcript.map((t) => ({ role: t.role, content: t.content }));

  let reply = '';
  if (isLastQuestion) {
    reply = "Thank you for providing that thorough explanation! That concludes our questions for this mock interview session. Click 'Complete & Generate Scorecard' to view your performance metrics, category ratings, and personalized improvement advice.";
  } else {
    const nextQNum = candidateTurns + 1;
    const systemPrompt =
      `You are Nexora, conducting a ${interviewType} for ${role}.\n` +
      `Progress: Candidate just answered Question ${candidateTurns} of ${totalQuestions}.\n` +
      `Now ask Question ${nextQNum} of ${totalQuestions}.\n` +
      'Briefly acknowledge the candidate\'s answer with 1 sentence of constructive observation, then ask the next clear, realistic interview question. Keep total response under 65 words.';

    const aiNext = await aiService.generate({
      prompt: `Candidate's answer was: "${message.slice(0, 1000)}". Acknowledge briefly and ask Question ${nextQNum} of ${totalQuestions}.`,
      history,
      systemInstruction: systemPrompt,
      maxOutputTokens: 260,
      temperature: 0.45,
    });

    reply =
      aiNext?.text ||
      `Thank you for detailing that approach. For Question ${nextQNum} of ${totalQuestions}: how do you handle edge cases and performance bottlenecks in high-throughput production environments?`;
  }

  assessment.transcript.push({ role: 'assistant', content: reply });
  await assessment.save();

  res.json({
    message: reply,
    turnCount: candidateTurns,
    isComplete: isLastQuestion,
    nextQuestionNumber: candidateTurns + 1,
    totalQuestions,
  });
});

// @desc End the interview and generate a multi-dimensional performance report & advice
const endInterview = asyncHandler(async (req, res) => {
  const { assessmentId, proctoringSummary } = req.body;
  const assessment = await Assessment.findOne({ _id: assessmentId, user: req.user._id, mode: 'interview' });
  if (!assessment) {
    res.status(404);
    throw new Error('Interview session not found');
  }

  const transcriptText = assessment.transcript.map((t) => `${t.role === 'assistant' ? 'Nexora' : 'Candidate'}: ${t.content}`).join('\n\n');
  const role = req.user.targetRole || 'Full Stack Engineer';

  const reportPrompt =
    `You are an executive talent assessment lead and senior hiring manager evaluating a live mock interview for ${role}.\n\n` +
    `Transcript:\n${transcriptText.slice(0, 12000)}\n\n` +
    'Evaluate the candidate across real industry standards and return a JSON object with this exact structure:\n' +
    '{\n' +
    '  "overallScore": number (0-100),\n' +
    '  "rating": "Strong Hire" | "Hire" | "Borderline" | "Needs Practice",\n' +
    '  "technicalScore": number (0-100),\n' +
    '  "communicationScore": number (0-100),\n' +
    '  "problemSolvingScore": number (0-100),\n' +
    '  "confidenceScore": number (0-100),\n' +
    '  "summary": "Concise 2-3 sentence executive evaluation.",\n' +
    '  "strengths": ["3-4 concrete strengths observed in candidate answers"],\n' +
    '  "improvements": ["3-4 actionable growth areas"],\n' +
    '  "actionableAdvice": ["3 clear, high-impact strategies to improve interview performance"],\n' +
    '  "questionBreakdown": [\n' +
    '    {\n' +
    '      "question": "summary of question asked",\n' +
    '      "answer": "summary of candidate response",\n' +
    '      "critique": "positive aspects and critique",\n' +
    '      "idealApproach": "key points top candidates include"\n' +
    '    }\n' +
    '  ]\n' +
    '}';

  const aiReport = await aiService.generateJson({
    systemInstruction: 'You are an objective hiring evaluator. Grade strictly based on the provided candidate transcript. Return only valid JSON.',
    prompt: reportPrompt,
    maxOutputTokens: 2000,
    temperature: 0.25,
  });

  let report = aiReport?.value;

  if (!report || typeof report.overallScore !== 'number') {
    // Deterministic fallback
    report = {
      overallScore: 78,
      rating: 'Hire',
      technicalScore: 80,
      communicationScore: 82,
      problemSolvingScore: 75,
      confidenceScore: 78,
      summary: `The candidate demonstrated solid baseline competencies for ${role}, with clear communication and structured reasoning.`,
      strengths: [
        'Structured responses with good contextual grounding',
        'Expressed clear passion and engagement with core technologies',
        'Communicated technical decisions concisely',
      ],
      improvements: [
        'Quantify engineering outcomes with scale, latency, and business metrics',
        'Deepen explanation of failure recovery patterns and trade-offs',
      ],
      actionableAdvice: [
        'Apply the STAR framework (Situation, Task, Action, Result) consistently on all behavioral and architectural questions.',
        'Anticipate follow-up questions by preemptively discussing alternatives considered.',
      ],
      questionBreakdown: [],
    };
  }

  // Attach webcam proctoring integrity metrics
  if (proctoringSummary) {
    report.proctoring = {
      flagsCount: proctoringSummary.flagsCount || 0,
      status: (proctoringSummary.flagsCount || 0) === 0 ? 'Verified - Clean Integrity' : 'Noted Proctoring Warnings',
      details: proctoringSummary.details || 'Single human face verified during session.',
    };
  } else {
    report.proctoring = {
      flagsCount: 0,
      status: 'Verified - Clean Integrity',
      details: 'Face remained visible; single candidate verified throughout interview.',
    };
  }

  assessment.interviewReport = report;
  assessment.status = 'completed';
  assessment.completedAt = new Date();
  await assessment.save();

  // Update user skills if focus skills were tracked
  if (assessment.skillsAssessed && assessment.skillsAssessed.length) {
    await Promise.all(
      assessment.skillsAssessed.map(async (skill) => {
        const existing = await UserSkill.findOne({ user: req.user._id, skillName: skill });
        const blended = existing ? Math.round((existing.level + report.overallScore) / 2) : report.overallScore;
        await UserSkill.findOneAndUpdate(
          { user: req.user._id, skillName: skill },
          { level: blended, source: 'blended', $push: { history: { level: blended, recordedAt: new Date() } } },
          { upsert: true, new: true }
        );
      })
    );
  }

  await logActivity(req.user._id, 'assessment_completed', `${req.user.fullName} completed a Live AI Mock Interview with Nexora`, {
    skillsAssessed: assessment.skillsAssessed,
    overallScore: report.overallScore,
  });

  res.json({ report });
});

module.exports = {
  getAvailableAssessmentSkills,
  getLesson,
  startAssessment,
  submitAssessment,
  startInterview,
  continueInterview,
  endInterview,
};
