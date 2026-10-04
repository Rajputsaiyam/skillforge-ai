const asyncHandler = require('express-async-handler');
const ChatSession = require('../models/ChatSession');
const ChatMessage = require('../models/ChatMessage');
const ragService = require('../services/ragService');
const gemini = require('../services/geminiService');
const mlServiceClient = require('../services/mlServiceClient');

function isUsefulCareerReply(reply) {
  const text = String(reply || '').trim();
  if (text.length < 35) return false;
  if (text.split(/\s+/).length < 6) return false;
  // Filter out raw seq2seq data dumps like "Saiyam Rajput: TypeScript (69/100, verified via resume)..."
  if (/^[A-Za-z\s]+:\s+[A-Za-z0-9#+.\s]+\(\d+\/\d+/i.test(text)) return false;
  return !/^[A-Z][A-Z\s'.-]{2,}$/i.test(text);
}

function synthesizeCareerCoachResponse(user, message, citations = [], targetRole = '') {
  const name = (user?.fullName || 'there').split(' ')[0];
  const role = targetRole || user?.targetRole || 'Software Professional';
  const query = String(message || '').trim().toLowerCase();

  // 1. GREETING
  if (/^(hi|hello|hey|hii|greetings|good\s*(morning|afternoon|evening))\b/i.test(query)) {
    return `### 👋 Hello, ${name}!

I am your **SkillForge AI Career Coach**, grounded directly in your verified skill profile, resume data, and career goals for **${role}**.

Here is how I can assist your career progression today:
* **🎯 Skill Gap Analysis:** Identify critical deficiencies against current market hiring standards.
* **📄 ATS Resume Audit:** Get actionable feedback using the Google X-Y-Z bullet format.
* **💼 Mock Interview Preparation:** Practice technical, architectural, and behavioral questions.
* **🗺️ 30-Day Execution Roadmap:** Build a structured weekly learning plan to close high-priority gaps.

What would you like to focus on right now? Feel free to ask a question or click any of the prompt pills below!`;
  }

  // Extract citation data
  const resumeChunks = citations.filter(c => c.category === 'resume' || (c.source && c.source.toLowerCase().includes('resume')));
  const gapChunks = citations.filter(c => c.category === 'gap_analysis' || (c.source && c.source.toLowerCase().includes('gap')));
  const atsChunks = citations.filter(c => c.category === 'ats' || (c.source && c.source.toLowerCase().includes('ats')));
  const skillChunks = citations.filter(c => c.category === 'skill' || (c.source && c.source.toLowerCase().includes('skill')));

  // 2. SKILL GAPS
  if (/gap|missing|weakness|lack|improve|learn|upskill/i.test(query)) {
    let breakdown = '';
    if (gapChunks.length > 0 || skillChunks.length > 0) {
      const topData = [...gapChunks, ...skillChunks].map(c => c.excerpt).filter(Boolean);
      breakdown = topData.slice(0, 3).map((item, idx) => `* **Priority ${idx + 1}:** ${item}`).join('\n');
    } else {
      breakdown = `* **System Architecture & Scalability:** Deep dive into caching (Redis), API gateways, and microservices patterns for **${role}**.\n* **Cloud & Containerization:** Practical hands-on configuration of Docker container builds and CI/CD pipelines.\n* **Production Testing:** Unit and integration testing suites to raise test coverage and reliability.`;
    }

    return `### 🎯 Targeted Skill Gap Breakdown for ${role}

Based on your verified skills and recent benchmark assessments, here are your primary growth areas:

${breakdown}

---

### 🚀 Immediate 3-Step Action Plan
1. **Build a Proof-of-Concept Project:** Apply the weakest skill directly in an isolated mini-service.
2. **Quantify Results:** Add benchmark metrics (e.g. latency reduction, test coverage percentage).
3. **Validate in Practice Lab:** Take the automated assessment in your SkillForge Practice Lab to boost your verified score.

Would you like a tailored study syllabus or sample code architecture for any of these skills?`;
  }

  // 3. ATS & RESUME OPTIMIZATION
  if (/ats|resume|cv|score|bullet|format|optimize/i.test(query)) {
    const atsExcerpt = atsChunks[0]?.excerpt || resumeChunks[0]?.excerpt || '';
    return `### 📄 Resume & ATS Optimization Playbook

Targeting **${role}** roles requires your resume to pass algorithmic ATS parsers while immediately engaging hiring managers.

${atsExcerpt ? `> **Grounded Profile Context:**\n> ${atsExcerpt}\n` : ''}

#### 1. The Google X-Y-Z Impact Formula
Transform passive responsibility statements into high-impact accomplishments:
* ❌ *Weak:* "Responsible for building backend APIs in Node.js and MongoDB."
* ✅ *Strong:* "**Engineered 12 RESTful microservices** using Node.js & MongoDB, reducing API p99 response latency by **38%** for **15,000+ daily active users**."

#### 2. ATS Screening Checklist
* **Clean Single-Column Layout:** Avoid tables, multi-column templates, text boxes, and embedded graphics that corrupt ATS parsers.
* **Exact Keyword Alignment:** Match skills explicitly from target job listings (e.g., \`TypeScript\`, \`Docker\`, \`CI/CD\`).
* **Standard Section Headers:** Use universal titles: *Work Experience*, *Technical Skills*, *Projects*, *Education*.

Would you like me to rewrite any specific bullet point from your current resume?`;
  }

  // 4. MOCK INTERVIEW & QUESTIONS
  if (/interview|mock|question|behavioral|technical|prep/i.test(query)) {
    return `### 💼 Mock Technical & Behavioral Interview: ${role}

Here are 3 core interview questions calibrated to current market expectations for **${role}**:

#### 1. System Architecture & Scalability (Technical)
> *"How would you design a rate limiter for a public-facing API handling 50,000 requests per second? Compare Token Bucket vs. Leaky Bucket algorithms."*
* **What Interviewers Look For:** Understanding of distributed state (Redis), atomic counters, network latency, and fallback policies when the cache is degraded.

#### 2. Practical Debugging & Performance (Domain)
> *"Walk me through how you identify and eliminate a memory leak or CPU bottleneck in a production Node.js/React application."*
* **What Interviewers Look For:** Use of Chrome DevTools, heap snapshots, event listener cleanup, and database query profiling.

#### 3. Behavioral — STAR Method (Culture & Leadership)
> *"Tell me about a time when a critical bug slipped into production. How did you handle the rollback, RCA (Root Cause Analysis), and team communication?"*
* **Structure Your Answer:** **S**ituation $\\rightarrow$ **T**ask $\\rightarrow$ **A**ction $\\rightarrow$ **R**esult.

Type your answer to any of these questions, and I will evaluate it with detailed hiring manager feedback!`;
  }

  // 5. LEARNING ROADMAP / SPRINT
  if (/roadmap|plan|schedule|week|month|timeline|syllabus/i.test(query)) {
    return `### 🗺️ 4-Week High-Impact Roadmap: ${role}

Here is a structured sprint roadmap designed to maximize your hireability:

| Phase | Focus Area | Key Deliverables |
| :--- | :--- | :--- |
| **Week 1** | Core Architecture & Types | Migrate core services to strict TypeScript; implement repository pattern |
| **Week 2** | Containerization & DevOps | Dockerize stack with multi-stage builds; configure GitHub Actions CI/CD |
| **Week 3** | Caching & Performance | Integrate Redis for session and query caching; benchmark with k6 or Autocannon |
| **Week 4** | System Design & Portfolio | Document system architecture diagrams; deploy live demo with monitoring |

Which week would you like to map out in detail today?`;
  }

  // 6. DEFAULT GROUNDED SYNTHESIS
  let evidenceSection = '';
  if (citations && citations.length > 0) {
    evidenceSection = citations.slice(0, 3).map((c, i) => `* **${c.source || 'Profile Data'}:** ${c.excerpt}`).join('\n');
  }

  return `### 💡 Career Coach Insight for ${role}

Regarding: **"${message}"**

${evidenceSection ? `#### Grounded Profile Insights\n${evidenceSection}\n\n---\n` : ''}
#### Strategic Guidance
To address this effectively for your career as a **${role}**:
1. **Focus on Verified Proof:** Back up any skill claim with live GitHub repositories, unit tests, and production metrics.
2. **Prioritize Industry Alignment:** Align your skill development with real-time job market requirements.
3. **Iterative Feedback:** Continually test your knowledge through mock interview assessments and ATS resume checks.

How would you like to proceed? Ask me to elaborate on any specific technical topic, review a resume project, or generate interview questions.`;
}

// @desc Get all conversation sessions for the authenticated user
// @route GET /api/chat/sessions
const getSessions = asyncHandler(async (req, res) => {
  let sessions = await ChatSession.find({ user: req.user._id }).sort({ lastActiveAt: -1 }).lean();

  // If user has no sessions yet, auto-create a default one
  if (!sessions.length) {
    const defaultSession = await ChatSession.create({
      user: req.user._id,
      title: req.user.targetRole ? `${req.user.targetRole} Prep` : 'Career Advisory',
      targetRole: req.user.targetRole || '',
    });
    sessions = [defaultSession];
  }

  res.json({ sessions });
});

// @desc Create a new conversation session
// @route POST /api/chat/sessions
const createSession = asyncHandler(async (req, res) => {
  const { title, targetRole } = req.body;
  const session = await ChatSession.create({
    user: req.user._id,
    title: title || (targetRole ? `${targetRole} Coaching` : 'New Career Discussion'),
    targetRole: targetRole || req.user.targetRole || '',
  });

  res.status(201).json({ session });
});

// @desc Get message history for a specific session
// @route GET /api/chat/sessions/:id/messages
const getSessionMessages = asyncHandler(async (req, res) => {
  const session = await ChatSession.findOne({ _id: req.params.id, user: req.user._id });
  if (!session) {
    res.status(404);
    throw new Error('Chat session not found');
  }

  const messages = await ChatMessage.find({ session: session._id })
    .sort({ createdAt: 1 })
    .lean();

  res.json({ session, messages });
});

// @desc Delete a chat session and all associated messages
// @route DELETE /api/chat/sessions/:id
const deleteSession = asyncHandler(async (req, res) => {
  const session = await ChatSession.findOne({ _id: req.params.id, user: req.user._id });
  if (!session) {
    res.status(404);
    throw new Error('Chat session not found');
  }

  await Promise.all([
    ChatSession.deleteOne({ _id: session._id }),
    ChatMessage.deleteMany({ session: session._id }),
  ]);

  res.json({ success: true, message: 'Session deleted' });
});

// @desc Send a message with RAG retrieval and session persistence
// @route POST /api/chat/message OR POST /api/chat/sessions/:id/messages
const sendMessage = asyncHandler(async (req, res) => {
  const { message, sessionId } = req.body;
  const targetSessionId = req.params.id || sessionId;

  if (!message || !message.trim()) {
    res.status(400);
    throw new Error('Message is required');
  }

  // 1. Resolve or create active session
  let session;
  if (targetSessionId) {
    session = await ChatSession.findOne({ _id: targetSessionId, user: req.user._id });
  }
  if (!session) {
    session = await ChatSession.findOne({ user: req.user._id }).sort({ lastActiveAt: -1 });
  }
  if (!session) {
    session = await ChatSession.create({
      user: req.user._id,
      title: req.user.targetRole ? `${req.user.targetRole} Discussion` : 'Career Consultation',
      targetRole: req.user.targetRole || '',
    });
  }

  // 2. Execute Production RAG Hybrid Retrieval
  const citations = await ragService.hybridSearch(req.user._id, message, { topK: 4, minScore: 0.08 });

  // 3. Fetch past conversation turns for context
  const pastMessages = await ChatMessage.find({ session: session._id })
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();
  const history = pastMessages.reverse().map((m) => ({
    role: m.role,
    content: m.content,
  }));

  // 4. Construct Grounded Prompt
  const { systemInstruction, augmentedPrompt } = ragService.buildGroundedPrompt(
    message,
    citations,
    req.user.targetRole || 'Software Engineer'
  );

  // 5. Generate AI Response via Gemini (or fallback chain)
  let reply = '';
  let generatedBy = '';

  try {
    const geminiResult = await gemini.generate({
      prompt: augmentedPrompt,
      systemInstruction,
      history,
      maxOutputTokens: 2500,
      temperature: 0.45,
    });

    if (geminiResult && geminiResult.text) {
      reply = geminiResult.text.trim();
      generatedBy = `gemini:${geminiResult.model}`;
    }
  } catch (err) {
    // Fall back to ML service
  }

  if (!reply) {
    try {
      const mlContext = citations.map((c) => c.fullText || c.excerpt);
      const mlResult = await mlServiceClient.chatWithAI(message, mlContext, history, systemInstruction);
      if (mlResult && mlResult.reply) {
        reply = mlResult.reply.trim();
        generatedBy = mlResult.generated_by || 'local-ml';
      }
    } catch (err) {
      // Fall through
    }
  }

  // Quality guard check
  if (!isUsefulCareerReply(reply)) {
    reply = synthesizeCareerCoachResponse(req.user, message, citations, req.user.targetRole);
    generatedBy = 'grounded-rag-synthesizer';
  }

  // 6. Persist to MongoDB
  const userMsgDoc = await ChatMessage.create({
    session: session._id,
    user: req.user._id,
    role: 'user',
    content: message.trim(),
  });

  const assistantMsgDoc = await ChatMessage.create({
    session: session._id,
    user: req.user._id,
    role: 'assistant',
    content: reply,
    retrievedContext: citations.map((c) => ({
      chunkId: c.chunkId,
      source: c.source,
      category: c.category,
      excerpt: c.excerpt,
      relevanceScore: c.relevanceScore,
    })),
    generatedBy,
  });

  // 7. Update session metadata (set dynamic title if first turn)
  const isFirstTurn = session.messageCount === 0 || session.title.startsWith('New Career');
  const updateFields = {
    lastActiveAt: new Date(),
    $inc: { messageCount: 2 },
  };
  if (isFirstTurn) {
    updateFields.title = message.length > 35 ? message.slice(0, 32) + '...' : message;
  }
  await ChatSession.findByIdAndUpdate(session._id, updateFields);

  res.json({
    reply,
    citations,
    sessionId: session._id,
    messageId: assistantMsgDoc._id,
    generatedBy,
  });
});

// @desc Submit user feedback (thumbs up / down) on an assistant message
// @route POST /api/chat/messages/:id/feedback
const rateMessage = asyncHandler(async (req, res) => {
  const { feedback } = req.body;
  if (!['positive', 'negative', 'none'].includes(feedback)) {
    res.status(400);
    throw new Error('Invalid feedback value');
  }

  const message = await ChatMessage.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { feedback },
    { new: true }
  );

  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }

  res.json({ success: true, message });
});

// @desc Clear all chat history for current user (legacy endpoint)
// @route POST /api/chat/clear
const clearChat = asyncHandler(async (req, res) => {
  const sessions = await ChatSession.find({ user: req.user._id }).select('_id');
  const sessionIds = sessions.map((s) => s._id);

  await Promise.all([
    ChatMessage.deleteMany({ session: { $in: sessionIds } }),
    ChatSession.deleteMany({ user: req.user._id }),
  ]);

  // Re-create a fresh blank session
  const freshSession = await ChatSession.create({
    user: req.user._id,
    title: req.user.targetRole ? `${req.user.targetRole} Discussion` : 'Career Consultation',
    targetRole: req.user.targetRole || '',
  });

  res.json({ cleared: true, session: freshSession });
});

module.exports = {
  getSessions,
  createSession,
  getSessionMessages,
  deleteSession,
  sendMessage,
  rateMessage,
  clearChat,
};
