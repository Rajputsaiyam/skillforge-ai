const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skillsAssessed: [String],
    // 'quiz' = MCQ + open-ended dynamic assessment, 'interview' = AI conversational interview
    mode: { type: String, enum: ['quiz', 'interview'], default: 'quiz' },
    questions: [
      {
        skill: String,
        difficulty: String,
        questionType: { type: String, enum: ['mcq', 'open'], default: 'mcq' },
        questionText: String,
        options: [String],
        correctOptionIndex: Number,
        selectedOptionIndex: Number,
        isCorrect: Boolean,
        // open-ended question fields — graded via semantic similarity (ml-service)
        modelAnswer: String,
        userAnswer: String,
        semanticScore: Number, // 0-100
        semanticSimilarity: Number, // 0-1 raw cosine similarity
        feedback: String,
      },
    ],
    // Populated only for mode: 'interview' — full back-and-forth transcript with the AI interviewer
    transcript: [
      {
        role: { type: String, enum: ['assistant', 'user'] },
        content: String,
        at: { type: Date, default: Date.now },
      },
    ],
    interviewReport: {
      overallScore: Number, // 0-100
      strengths: [String],
      improvements: [String],
      summary: String,
    },
    resultsBySkill: [
      {
        skill: String,
        score: Number, // 0-100
      },
    ],
    generatedBy: { type: String, default: 'template-fallback' }, // which ML pipeline produced the content
    completedAt: Date,
    status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assessment', assessmentSchema);
