const asyncHandler = require('express-async-handler');
const Assessment = require('../models/Assessment');
const Skill = require('../models/Skill');
const UserSkill = require('../models/UserSkill');
const mlServiceClient = require('../services/mlServiceClient');
const gemini = require('../services/geminiService');
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

async function geminiLesson(skill, level) {
  const result = await gemini.generateJson({
    systemInstruction: 'You create compact, technically accurate interview-prep lessons. Return only valid JSON.',
    prompt: `Create a practical micro-lesson for ${skill}, suitable for a learner at level ${level}/100. Return {"title":"...","content":"..."}. Content must include fundamentals, one real example, and one pitfall. Maximum 180 words.`,
    maxOutputTokens: 700,
  });
  return result?.value?.title && result?.value?.content ? { ...result.value, generated_by: result.generatedBy } : null;
}

async function geminiQuestions(skill, level, count) {
  const result = await gemini.generateJson({
    systemInstruction: 'You generate fair, technically correct skill assessments. Return only valid JSON. Never reveal answers in the question text.',
    prompt: `Generate ${count} questions for ${skill} at level ${level}/100. Mix MCQ and open response. Return {"questions":[{"question_type":"mcq"|"open","question_text":"...","options":["..."],"correct_option_index":0,"model_answer":"...","difficulty":"Beginner|Intermediate|Advanced"}]}. MCQs need exactly 4 plausible options and a valid 0-based correct index. Open questions need empty options and a strong model_answer.`,
    maxOutputTokens: 1800,
    temperature: 0.35,
  });
  const questions = result?.value?.questions;
  if (!Array.isArray(questions)) return null;
  const valid = questions.filter((q) => q?.question_text && (q.question_type === 'open' || (Array.isArray(q.options) && q.options.length === 4 && Number.isInteger(q.correct_option_index))));
  return valid.length ? { questions: valid, generated_by: result.generatedBy } : null;
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

  const lesson = await geminiLesson(skill, level) || await mlServiceClient.generateLesson(skill, level);
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
    const result = await geminiQuestions(skillName, level, 3) || await mlServiceClient.generateQuestions(skillName, level, 3, 'mixed');
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
// AI Interview mode — a real conversational mock interview: the AI asks
// adaptive follow-up questions based on the candidate's previous answers and
// the user's actual skill graph/resume context, then produces a scorecard.
// ---------------------------------------------------------------------------

// @desc Start an AI interview for a target role / set of skills
const startInterview = asyncHandler(async (req, res) => {
  const { skills, targetRole } = req.body;
  const role = targetRole || req.user.targetRole || 'Software Engineer';
  const focusSkills = skills && skills.length ? skills : [];

  const contextChunks = await buildUserContextChunks(req.user._id);
  const systemPrompt =
    `You are a senior technical interviewer conducting a mock interview for the role of ${role}` +
    (focusSkills.length ? ` with a focus on: ${focusSkills.join(', ')}.` : '.') +
    ' Ask one question at a time, react briefly to the candidate\'s previous answer, then ask a ' +
    'natural follow-up that gets progressively more specific. Keep each message under 60 words.';

  const opening = await mlServiceClient.chatWithAI(
    'Begin the interview with a short greeting and your first question.',
    contextChunks,
    [],
    systemPrompt
  );

  const firstMessage =
    opening?.reply ||
    `Hi, thanks for joining! Let's start with ${focusSkills[0] || role}: can you walk me through a project where you used it?`;

  const assessment = await Assessment.create({
    user: req.user._id,
    skillsAssessed: focusSkills,
    mode: 'interview',
    status: 'in_progress',
    generatedBy: opening?.generated_by || 'template-fallback',
    transcript: [{ role: 'assistant', content: firstMessage }],
  });

  res.status(201).json({ assessmentId: assessment._id, message: firstMessage, targetRole: role });
});

// @desc Send the candidate's answer, get the interviewer's next question
const continueInterview = asyncHandler(async (req, res) => {
  const { assessmentId, message } = req.body;
  const assessment = await Assessment.findOne({ _id: assessmentId, user: req.user._id, mode: 'interview' });
  if (!assessment) {
    res.status(404);
    throw new Error('Interview session not found');
  }

  assessment.transcript.push({ role: 'user', content: message });

  const contextChunks = await buildUserContextChunks(req.user._id);
  const history = assessment.transcript.map((t) => ({ role: t.role, content: t.content }));
  const role = req.user.targetRole || 'Software Engineer';
  const systemPrompt =
    `You are a senior technical interviewer conducting a mock interview for the role of ${role}` +
    (assessment.skillsAssessed.length ? ` with a focus on: ${assessment.skillsAssessed.join(', ')}.` : '.') +
    ' Continue naturally: briefly react to the candidate\'s last answer, then ask ONE follow-up question. Keep it under 60 words.';

  const result = await mlServiceClient.chatWithAI(message, contextChunks, history, systemPrompt);
  const reply = result?.reply || "That's helpful context — can you go a bit deeper on the trade-offs you considered?";

  assessment.transcript.push({ role: 'assistant', content: reply });
  assessment.generatedBy = result?.generated_by || assessment.generatedBy;
  await assessment.save();

  res.json({ message: reply, turnCount: assessment.transcript.filter((t) => t.role === 'user').length });
});

// @desc End the interview and generate a scorecard (strengths / improvements / score)
const endInterview = asyncHandler(async (req, res) => {
  const { assessmentId } = req.body;
  const assessment = await Assessment.findOne({ _id: assessmentId, user: req.user._id, mode: 'interview' });
  if (!assessment) {
    res.status(404);
    throw new Error('Interview session not found');
  }

  const transcriptText = assessment.transcript.map((t) => `${t.role}: ${t.content}`).join('\n');
  const summaryPrompt =
    `Here is a mock technical interview transcript:\n${transcriptText}\n\n` +
    'Respond ONLY in this exact format:\n' +
    'Score: <0-100>\nStrengths: <comma-separated list>\nImprovements: <comma-separated list>\nSummary: <2 sentence summary>';

  const geminiReport = await gemini.generateJson({
    systemInstruction: 'You are a precise technical interviewer. Grade only evidence in the supplied transcript; do not invent accomplishments. Return only valid JSON.',
    prompt: `${summaryPrompt}\nReturn {"overallScore":0,"strengths":["..."],"improvements":["..."],"summary":"..."}.`,
    maxOutputTokens: 900,
    temperature: 0.2,
  });
  const result = geminiReport ? { reply: JSON.stringify(geminiReport.value) } : await mlServiceClient.chatWithAI(summaryPrompt, [], [], 'You are grading a technical interview transcript.');
  let report = { overallScore: 60, strengths: ['Communicated clearly'], improvements: ['Add more concrete examples'], summary: 'Solid baseline performance — keep practicing specific, example-driven answers.' };

  if (result?.reply) {
    const text = result.reply;
    let structured;
    try { structured = JSON.parse(text); } catch (_) { structured = null; }
    const scoreMatch = text.match(/score\s*:\s*(\d{1,3})/i);
    const strengthsMatch = text.match(/strengths\s*:\s*(.+)/i);
    const improvementsMatch = text.match(/improvements\s*:\s*(.+)/i);
    const summaryMatch = text.match(/summary\s*:\s*(.+)/i);
    report = {
      overallScore: Number.isFinite(structured?.overallScore) ? Math.max(0, Math.min(100, structured.overallScore)) : (scoreMatch ? Math.min(100, parseInt(scoreMatch[1], 10)) : report.overallScore),
      strengths: Array.isArray(structured?.strengths) ? structured.strengths.slice(0, 5) : (strengthsMatch ? strengthsMatch[1].split(',').map((s) => s.trim()).filter(Boolean) : report.strengths),
      improvements: Array.isArray(structured?.improvements) ? structured.improvements.slice(0, 5) : (improvementsMatch ? improvementsMatch[1].split(',').map((s) => s.trim()).filter(Boolean) : report.improvements),
      summary: typeof structured?.summary === 'string' ? structured.summary : (summaryMatch ? summaryMatch[1].trim() : report.summary),
    };
  }

  assessment.interviewReport = report;
  assessment.status = 'completed';
  assessment.completedAt = new Date();
  await assessment.save();

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

  await logActivity(req.user._id, 'assessment_completed', `${req.user.fullName} completed an AI mock interview`, {
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
