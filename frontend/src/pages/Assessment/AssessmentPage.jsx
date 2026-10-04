import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardCheck, BookOpen, Sparkles, ArrowRight, CheckCircle2, XCircle,
  Loader2, MessageSquare, Send, Award, RotateCcw, Mic, MicOff,
  Volume2, VolumeX, Lightbulb, ChevronRight, Share2, Route as RouteIcon, Target
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ProgressBar from '../../components/ui/ProgressBar';
import assessmentService from '../../services/assessmentService';
import { useApp } from '../../context/AppContext';

const STAGES = { SELECT: 'select', LESSON: 'lesson', QUIZ: 'quiz', RESULTS: 'results' };

const AssessmentPage = () => {
  const { showToast } = useApp();
  const [mode, setMode] = useState('quiz'); // 'quiz' | 'interview'
  const [stage, setStage] = useState(STAGES.SELECT);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [lessonIndex, setLessonIndex] = useState(0);
  const [assessmentId, setAssessmentId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [textDraft, setTextDraft] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatedBy, setGeneratedBy] = useState('');

  // Voice & Speech features
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const recognitionRef = useRef(null);

  // Interview mode state
  const [interviewId, setInterviewId] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [interviewInput, setInterviewInput] = useState('');
  const [interviewReport, setInterviewReport] = useState(null);
  const [interviewLoading, setInterviewLoading] = useState(false);
  const chatScrollRef = useRef(null);

  useEffect(() => {
    assessmentService.getAvailableSkills().then((r) => setAvailableSkills(r.skills || []));
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [transcript]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  // Web Speech API: Text-to-Speech
  const speakText = (text) => {
    if (!('speechSynthesis' in window)) {
      showToast('Text-to-speech not supported in this browser', 'info');
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // Web Speech API: Speech-to-Text
  const toggleVoiceInput = (targetSetter) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Speech-to-text is not supported in this browser. Try Chrome/Edge/Safari.', 'error');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcriptText = Array.from(event.results)
          .map((r) => r[0].transcript)
          .join('');
        targetSetter((prev) => (prev ? `${prev} ${transcriptText}` : transcriptText));
      };
      recognition.onerror = (err) => {
        console.error('Speech recognition error:', err);
        setIsListening(false);
      };
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]));
  };

  // ---- Quiz flow: Learn -> Quiz -> Results ----
  const beginLearning = async () => {
    if (!selectedSkills.length) return showToast('Pick at least one skill first');
    setLoading(true);
    try {
      const fetched = await Promise.all(selectedSkills.map((s) => assessmentService.getLesson(s)));
      setLessons(fetched.map((l, i) => ({ ...l, skill: selectedSkills[i] })));
      setLessonIndex(0);
      setStage(STAGES.LESSON);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async () => {
    setLoading(true);
    try {
      const res = await assessmentService.startAssessment(selectedSkills);
      setAssessmentId(res.assessmentId);
      setQuestions(res.questions);
      setGeneratedBy(res.generatedBy);
      setQIndex(0);
      setAnswers({});
      setTextDraft('');
      setShowHint(false);
      setStage(STAGES.QUIZ);
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[qIndex];

  const submitCurrentAnswer = (selectedOptionIndex) => {
    if (!currentQuestion) return;
    const answer =
      currentQuestion.questionType === 'mcq'
        ? { questionId: currentQuestion._id, selectedOptionIndex }
        : { questionId: currentQuestion._id, textAnswer: textDraft };
    setAnswers((prev) => ({ ...prev, [currentQuestion._id]: answer }));
    setTextDraft('');
    setShowHint(false);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);

    if (qIndex + 1 < questions.length) {
      setQIndex(qIndex + 1);
    } else {
      finishQuiz({ ...answers, [currentQuestion._id]: answer });
    }
  };

  const finishQuiz = async (finalAnswers) => {
    setLoading(true);
    try {
      const res = await assessmentService.submitAssessment(assessmentId, Object.values(finalAnswers));
      setResults(res);
      setStage(STAGES.RESULTS);
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
    setIsSpeaking(false);
    setStage(STAGES.SELECT);
    setSelectedSkills([]);
    setQuestions([]);
    setResults(null);
    setInterviewId(null);
    setTranscript([]);
    setInterviewReport(null);
    setShowHint(false);
  };

  // ---- AI Interview flow ----
  const startInterview = async () => {
    if (!selectedSkills.length) return showToast('Pick at least one focus skill first');
    setInterviewLoading(true);
    try {
      const res = await assessmentService.startInterview(selectedSkills);
      setInterviewId(res.assessmentId);
      setTranscript([{ role: 'assistant', content: res.message }]);
      setInterviewReport(null);
      // Automatically read out greeting if desired
      speakText(res.message);
    } finally {
      setInterviewLoading(false);
    }
  };

  const sendInterviewReply = async () => {
    const text = interviewInput.trim();
    if (!text || interviewLoading) return;
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
    setTranscript((t) => [...t, { role: 'user', content: text }]);
    setInterviewInput('');
    setInterviewLoading(true);
    try {
      const res = await assessmentService.continueInterview(interviewId, text);
      setTranscript((t) => [...t, { role: 'assistant', content: res.message }]);
      speakText(res.message);
    } finally {
      setInterviewLoading(false);
    }
  };

  const endInterviewNow = async () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setInterviewLoading(true);
    try {
      const res = await assessmentService.endInterview(interviewId);
      setInterviewReport(res.report);
    } finally {
      setInterviewLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-10">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-extrabold text-navy flex items-center gap-2">
          <ClipboardCheck className="text-primary" /> AI Assessment & Mock Interview
        </h1>
        <p className="text-slate mt-1">
          Every question and interview prompt is dynamically generated and scored by AI in real-time, calibrated to your target career role.
        </p>
      </motion.div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setMode('quiz'); resetAll(); }}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${mode === 'quiz' ? 'bg-primary text-white border-primary shadow-sm' : 'border-slate/20 text-slate hover:bg-slate/5'}`}
        >
          Adaptive Learn + Quiz
        </button>
        <button
          onClick={() => { setMode('interview'); resetAll(); }}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${mode === 'interview' ? 'bg-primary text-white border-primary shadow-sm' : 'border-slate/20 text-slate hover:bg-slate/5'}`}
        >
          AI Voice & Text Mock Interview
        </button>
      </div>

      {/* --- SKILL SELECTION --- */}
      {((mode === 'quiz' && stage === STAGES.SELECT) || (mode === 'interview' && !interviewId)) && (
        <Card>
          <h3 className="font-bold text-navy mb-1 text-base">Choose focus skills for this session</h3>
          <p className="text-sm text-slate mb-4">
            {mode === 'quiz'
              ? "We'll teach you a focused refresher, then generate an adaptive AI evaluation."
              : 'The AI interviewer will frame technical and behavioral scenarios around these competencies.'}
          </p>
          <div className="flex flex-wrap gap-2 mb-5 max-h-56 overflow-y-auto p-1 border border-slate/10 rounded-xl bg-slate/5">
            {availableSkills.map((s) => (
              <button
                key={s}
                onClick={() => toggleSkill(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  selectedSkills.includes(s)
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-white border-slate/20 text-slate hover:border-primary/50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          {mode === 'quiz' ? (
            <Button onClick={beginLearning} disabled={loading || selectedSkills.length === 0}>
              {loading ? <Loader2 className="animate-spin" size={17} /> : <BookOpen size={17} />}
              Start Guided Learning
            </Button>
          ) : (
            <Button onClick={startInterview} disabled={interviewLoading || selectedSkills.length === 0}>
              {interviewLoading ? <Loader2 className="animate-spin" size={17} /> : <MessageSquare size={17} />}
              Start AI Mock Interview
            </Button>
          )}
        </Card>
      )}

      {/* --- LESSON STAGE --- */}
      {mode === 'quiz' && stage === STAGES.LESSON && lessons[lessonIndex] && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} /> AI Micro-Lesson · {lessonIndex + 1} of {lessons.length}
            </span>
            <button
              onClick={() => speakText(`${lessons[lessonIndex].title}. ${lessons[lessonIndex].content}`)}
              className="p-1.5 text-slate hover:text-primary rounded-lg transition-colors flex items-center gap-1 text-xs"
              title="Read lesson aloud"
            >
              {isSpeaking ? <VolumeX size={15} className="text-danger" /> : <Volume2 size={15} />}
              <span>{isSpeaking ? 'Stop audio' : 'Listen'}</span>
            </button>
          </div>
          <h3 className="font-bold text-navy text-lg mb-2">{lessons[lessonIndex].title}</h3>
          <div className="p-4 rounded-xl bg-lightSky/40 border border-primary/20 text-sm text-navy leading-relaxed whitespace-pre-wrap font-sans">
            {lessons[lessonIndex].content}
          </div>
          <div className="flex items-center justify-between mt-4">
            <span className="text-[11px] text-slate/70">Generated by: {lessons[lessonIndex].generated_by || 'SkillForge AI'}</span>
            {lessonIndex + 1 < lessons.length ? (
              <Button onClick={() => { if (window.speechSynthesis) window.speechSynthesis.cancel(); setLessonIndex((i) => i + 1); }}>
                Next Lesson <ArrowRight size={16} />
              </Button>
            ) : (
              <Button onClick={startQuiz} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={17} /> : <ClipboardCheck size={17} />}
                I'm Ready — Start Quiz
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* --- QUIZ STAGE --- */}
      {mode === 'quiz' && stage === STAGES.QUIZ && currentQuestion && (
        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wide text-primary">
              {currentQuestion.skill} · {currentQuestion.difficulty}
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => speakText(currentQuestion.questionText)}
                className="text-xs text-slate hover:text-primary flex items-center gap-1"
                title="Read question aloud"
              >
                {isSpeaking ? <VolumeX size={14} className="text-danger" /> : <Volume2 size={14} />}
                <span>{isSpeaking ? 'Stop' : 'Read aloud'}</span>
              </button>
              <span className="text-xs text-slate">Question {qIndex + 1} of {questions.length}</span>
            </div>
          </div>
          <ProgressBar value={Math.round(((qIndex) / questions.length) * 100)} showValue={false} height="h-1.5" />
          
          <h3 className="font-bold text-navy text-base my-4 leading-snug">{currentQuestion.questionText}</h3>

          {/* AI Hint toggler */}
          <div className="mb-4">
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-xs font-semibold text-primary/80 hover:text-primary flex items-center gap-1.5"
            >
              <Lightbulb size={14} />
              {showHint ? 'Hide AI Hint' : 'Need an AI concept hint?'}
            </button>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed"
              >
                <strong>Concept Hint:</strong> Focus on core trade-offs, standard patterns, and edge cases related to {currentQuestion.skill}.
              </motion.div>
            )}
          </div>

          {currentQuestion.questionType === 'mcq' ? (
            <div className="space-y-2.5">
              {currentQuestion.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => submitCurrentAnswer(idx)}
                  className="w-full text-left px-4 py-3 rounded-xl border border-slate/20 hover:border-primary hover:bg-lightSky/50 transition-colors text-sm font-medium text-navy flex items-start gap-2.5"
                >
                  <span className="w-5 h-5 rounded-full border border-slate/30 flex items-center justify-center text-xs text-slate shrink-0 mt-0.5 font-bold">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          ) : (
            <div>
              <div className="relative">
                <textarea
                  value={textDraft}
                  onChange={(e) => setTextDraft(e.target.value)}
                  rows={5}
                  placeholder="Type your explanation in your own words..."
                  className="w-full text-sm p-3 rounded-xl border border-slate/20 focus:outline-none focus:border-primary pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleVoiceInput(setTextDraft)}
                  className={`absolute right-2.5 bottom-3 p-2 rounded-lg transition-colors ${
                    isListening ? 'bg-danger text-white animate-pulse' : 'text-slate hover:text-primary bg-slate/10'
                  }`}
                  title={isListening ? 'Stop listening' : 'Dictate with voice'}
                >
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
              </div>
              <p className="text-[11px] text-slate mt-1 mb-3">Graded by AI using semantic similarity — focus on explaining the core reasoning.</p>
              <Button onClick={() => submitCurrentAnswer(null)} disabled={!textDraft.trim() || loading}>
                {loading ? <Loader2 className="animate-spin" size={17} /> : null}
                {qIndex + 1 < questions.length ? 'Next Question' : 'Finish & Calculate Score'}
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* --- RESULTS STAGE --- */}
      {mode === 'quiz' && stage === STAGES.RESULTS && results && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-navy text-lg flex items-center gap-2">
              <Award className="text-primary" /> Assessment Complete
            </h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-lightSky text-primary">
              Live Evaluation
            </span>
          </div>

          <div className="space-y-3 mb-6 p-4 rounded-xl bg-slate/5 border border-slate/10">
            <h4 className="text-xs font-bold text-slate uppercase tracking-wider">Skill Competency Breakdown</h4>
            {results.resultsBySkill.map((r) => (
              <ProgressBar key={r.skill} label={r.skill} value={r.score} />
            ))}
          </div>

          <div className="space-y-3 mb-6">
            <h4 className="text-xs font-bold text-slate uppercase tracking-wider">Question Explanations</h4>
            {results.questions.map((q) => (
              <div key={q._id} className="p-3.5 rounded-xl border border-slate/10 flex items-start gap-3 bg-white">
                {q.isCorrect ? (
                  <CheckCircle2 className="text-success flex-shrink-0 mt-0.5" size={18} />
                ) : (
                  <XCircle className="text-danger flex-shrink-0 mt-0.5" size={18} />
                )}
                <div className="flex-1">
                  <p className="text-sm text-navy font-semibold">{q.questionText}</p>
                  {q.feedback && <p className="text-xs text-slate mt-1 leading-relaxed">{q.feedback}</p>}
                  {q.semanticScore != null && (
                    <p className="text-xs text-primary mt-1 font-semibold">Semantic match: {q.semanticScore}/100</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Next Action Launchpad */}
          <div className="p-4 rounded-xl bg-lightSky/40 border border-primary/20 mb-5">
            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Recommended Next Actions</p>
            <div className="grid sm:grid-cols-3 gap-2">
              <Link to="/skill-graph" className="p-2.5 rounded-lg bg-white border border-slate/15 hover:border-primary text-xs font-semibold text-navy flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Share2 size={13} className="text-primary" /> Skill Graph</span>
                <ChevronRight size={12} className="text-slate" />
              </Link>
              <Link to="/roadmap" className="p-2.5 rounded-lg bg-white border border-slate/15 hover:border-primary text-xs font-semibold text-navy flex items-center justify-between">
                <span className="flex items-center gap-1.5"><RouteIcon size={13} className="text-primary" /> Learning Plan</span>
                <ChevronRight size={12} className="text-slate" />
              </Link>
              <Link to="/skill-gaps" className="p-2.5 rounded-lg bg-white border border-slate/15 hover:border-primary text-xs font-semibold text-navy flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Target size={13} className="text-primary" /> Skill Gaps</span>
                <ChevronRight size={12} className="text-slate" />
              </Link>
            </div>
          </div>

          <button onClick={resetAll} className="btn-secondary w-full justify-center">
            <RotateCcw size={15} /> Take Another Assessment
          </button>
        </Card>
      )}

      {/* --- AI INTERVIEW STAGE --- */}
      {mode === 'interview' && interviewId && (
        <Card>
          <div className="flex items-center justify-between mb-3 border-b border-slate/10 pb-3">
            <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wide">
              <MessageSquare size={14} /> AI Mock Interviewer
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => speakText(transcript[transcript.length - 1]?.content || '')}
                className="text-xs text-slate hover:text-primary flex items-center gap-1"
                title="Repeat interviewer question"
              >
                {isSpeaking ? <VolumeX size={14} className="text-danger" /> : <Volume2 size={14} />}
                <span>{isSpeaking ? 'Stop voice' : 'Repeat audio'}</span>
              </button>
              <span className="text-xs text-slate font-medium">Turn {Math.floor(transcript.length / 2) + 1}</span>
            </div>
          </div>

          <div ref={chatScrollRef} className="space-y-3 max-h-96 overflow-y-auto mb-4 pr-1 p-2 bg-slate/5 rounded-xl border border-slate/10">
            {transcript.map((t, i) => (
              <div key={i} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    t.role === 'user'
                      ? 'bg-primary text-white rounded-br-sm shadow-sm'
                      : 'bg-white text-navy rounded-bl-sm border border-slate/15 shadow-xs'
                  }`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-70">
                    {t.role === 'user' ? 'You' : 'Interviewer'}
                  </p>
                  {t.content}
                </div>
              </div>
            ))}
            {interviewLoading && (
              <div className="flex justify-start">
                <div className="px-4 py-2.5 rounded-2xl bg-white border border-slate/15 text-xs text-slate flex items-center gap-2">
                  <Loader2 className="animate-spin text-primary" size={14} /> AI interviewer is thinking...
                </div>
              </div>
            )}
          </div>

          {!interviewReport ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  value={interviewInput}
                  onChange={(e) => setInterviewInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendInterviewReply()}
                  placeholder={isListening ? 'Listening to your speech...' : 'Type or speak your answer...'}
                  className={`flex-1 text-sm px-4 py-2.5 rounded-xl border focus:outline-none focus:border-primary transition-all ${
                    isListening ? 'border-danger/60 ring-2 ring-danger/20' : 'border-slate/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => toggleVoiceInput(setInterviewInput)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    isListening ? 'bg-danger text-white animate-pulse' : 'bg-slate/10 text-slate hover:text-primary hover:bg-slate/20'
                  }`}
                  title={isListening ? 'Stop listening' : 'Speak answer (Speech-to-Text)'}
                >
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
                <button
                  onClick={sendInterviewReply}
                  disabled={interviewLoading || !interviewInput.trim()}
                  className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-40"
                  title="Send answer"
                >
                  <Send size={16} />
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-slate pt-1">
                <span>Tip: Click microphone to speak naturally or type your reply.</span>
                <button onClick={endInterviewNow} disabled={interviewLoading} className="text-danger font-semibold hover:underline">
                  End Interview & Generate Scorecard
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-2 p-5 rounded-2xl bg-lightSky/40 border border-primary/20">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-extrabold text-navy text-base">AI Interview Scorecard</h4>
                  <p className="text-xs text-slate">Evaluated against real tech interview standards</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-primary">{interviewReport.overallScore}</span>
                  <span className="text-xs text-slate font-semibold">/100</span>
                </div>
              </div>
              <p className="text-sm text-slate mb-4 leading-relaxed bg-white/70 p-3 rounded-xl border border-slate/10">
                {interviewReport.summary}
              </p>
              <div className="grid sm:grid-cols-2 gap-4 text-xs mb-4">
                <div className="bg-white/80 p-3.5 rounded-xl border border-success/20">
                  <p className="font-bold text-success mb-2 uppercase tracking-wide">Key Strengths</p>
                  <ul className="list-disc list-inside text-slate space-y-1">
                    {interviewReport.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div className="bg-white/80 p-3.5 rounded-xl border border-warning/20">
                  <p className="font-bold text-amber-700 mb-2 uppercase tracking-wide">Areas to Improve</p>
                  <ul className="list-disc list-inside text-slate space-y-1">
                    {interviewReport.improvements?.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              </div>
              <button onClick={resetAll} className="btn-secondary w-full justify-center">
                <RotateCcw size={15} /> Start Another Mock Interview
              </button>
            </div>
          )}
        </Card>
      )}

      {generatedBy && stage !== STAGES.SELECT && (
        <p className="text-[11px] text-slate/60 text-center mt-4">Questions generated dynamically by: {generatedBy}</p>
      )}
    </div>
  );
};

export default AssessmentPage;

