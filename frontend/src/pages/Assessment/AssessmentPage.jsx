import React, { useEffect, useState, useRef } from 'react';
import {
  ClipboardCheck, BookOpen, Sparkles, ArrowRight, CheckCircle2, XCircle,
  Loader2, MessageSquare, Send, Award, RotateCcw, Mic, MicOff,
  Volume2, VolumeX, Lightbulb, ChevronRight, Share2, Route as RouteIcon, Target, Video
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ProgressBar from '../../components/ui/ProgressBar';
import assessmentService from '../../services/assessmentService';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import LiveMockInterview from '../../components/interview/LiveMockInterview';

const STAGES = { SELECT: 'select', LESSON: 'lesson', QUIZ: 'quiz', RESULTS: 'results' };

const AssessmentPage = () => {
  const { user } = useAuth();
  const { showToast } = useApp();
  const [showLiveMock, setShowLiveMock] = useState(false);
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
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-navy">
          <ClipboardCheck className="text-primary" /> AI Assessment & Mock Interview
        </h1>
        <p className="text-slate mt-1">
          Every question and interview prompt is dynamically generated and scored by AI in real-time, calibrated to your target career role.
        </p>
      </div>

      {/* Segmented Mode Selector */}
      <div className="flex p-1.5 rounded-2xl bg-slate-100/90 border border-slate/15 mb-6 shadow-inner">
        <button
          onClick={() => { setMode('quiz'); resetAll(); }}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
            mode === 'quiz'
              ? 'bg-white text-primary shadow-sm border border-slate/15'
              : 'text-slate-600 hover:text-navy hover:bg-white/50'
          }`}
        >
          <BookOpen size={16} /> Adaptive Learn + Quiz
        </button>
        <button
          onClick={() => { setMode('interview'); resetAll(); }}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
            mode === 'interview'
              ? 'bg-primary text-white'
              : 'text-slate-600 hover:text-navy hover:bg-white/50'
          }`}
        >
          <MessageSquare size={16} /> AI Voice & Text Mock Interview
        </button>
      </div>

      {/* Live Video & Voice Mock Interview Hero Banner */}
      {mode === 'interview' && !interviewId && (
        <div className="mb-6 rounded-lg border border-navy bg-navy p-6 text-white">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-sky"><Video size={13} className="mr-1 inline" /> Live camera and audio simulation</p>
              <h3 className="text-xl font-bold tracking-tight text-white">Live mock interview with Nexora</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-lg leading-relaxed">
                Take a live mock interview with open webcam, real-time microphone check, AI face & multi-human proctoring warnings, spoken questions, and comprehensive scoring.
              </p>
            </div>
            <Button
              onClick={() => setShowLiveMock(true)}
              className="!px-6 !py-3.5 text-xs font-bold"
            >
              <Video size={16} /> Launch live interview <ArrowRight size={15} />
            </Button>
          </div>
        </div>
      )}

      {/* --- SKILL SELECTION --- */}
      {((mode === 'quiz' && stage === STAGES.SELECT) || (mode === 'interview' && !interviewId)) && (
        <Card className="border-slate/20">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-extrabold text-navy text-base">Select Target Focus Skills</h3>
            <span className="text-xs font-semibold text-primary">
              {selectedSkills.length} selected
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mb-5 leading-relaxed">
            {mode === 'quiz'
              ? "We'll teach you a focused refresher, then generate an adaptive AI evaluation calibrated to your performance."
              : 'The AI interviewer will simulate real hiring loops and technical trade-offs around these competencies.'}
          </p>

          <div className="flex flex-wrap gap-2 mb-6 max-h-60 overflow-y-auto p-2.5 border border-slate/15 rounded-2xl bg-slate-50/70">
            {availableSkills.map((s) => {
              const isSelected = selectedSkills.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleSkill(s)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-150 flex items-center gap-1.5 ${
                    isSelected
                       ? 'bg-primary text-white border-primary'
                      : 'bg-white border-slate/20 text-slate-700 hover:border-primary/40 hover:text-navy'
                  }`}
                >
                  <span>{s}</span>
                  {isSelected && <CheckCircle2 size={12} className="text-white" />}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between pt-2 border-t border-slate/10 gap-3">
            <span className="text-xs text-slate-500 font-medium">
              Pick 1 to 4 skills for best results
            </span>
            {mode === 'quiz' ? (
              <Button
                onClick={beginLearning}
                disabled={loading || selectedSkills.length === 0}
                className="!py-2.5 !px-5 text-xs font-bold"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <BookOpen size={16} />}
                Start Guided Learning
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowLiveMock(true)}
                  className="!py-2.5 !px-4 text-xs font-bold !bg-emerald-600 hover:!bg-emerald-700 !text-white"
                >
                  <Video size={15} /> Live Video & Voice
                </Button>
                <Button
                  onClick={startInterview}
                  disabled={interviewLoading || selectedSkills.length === 0}
                   className="!px-4 !py-2.5 text-xs font-bold"
                >
                  {interviewLoading ? <Loader2 className="animate-spin" size={15} /> : <MessageSquare size={15} />}
                  Quick Practice
                </Button>
              </div>
            )}
          </div>
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
                 I'm ready to start the quiz
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
               <div
                 className="mt-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed"
              >
                <strong>Concept Hint:</strong> Focus on core trade-offs, standard patterns, and edge cases related to {currentQuestion.skill}.
               </div>
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
               <p className="text-[11px] text-slate mt-1 mb-3">Graded by AI using semantic similarity. Focus on explaining the core reasoning.</p>
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
         <Card className="overflow-hidden border-slate/20 p-0">
          {/* Interviewer Top Bar */}
          <div className="flex items-center justify-between bg-navy px-5 py-3.5 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                <MessageSquare size={16} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">AI Mock Interviewer</h4>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[10px] text-slate-300 font-medium">Turn {Math.floor(transcript.length / 2) + 1} · Voice & Context Grounded</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => speakText(transcript[transcript.length - 1]?.content || '')}
                className="text-xs px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium flex items-center gap-1.5 transition-colors"
                title="Repeat interviewer question"
              >
                {isSpeaking ? <VolumeX size={13} className="text-rose-400" /> : <Volume2 size={13} />}
                <span>{isSpeaking ? 'Stop Voice' : 'Repeat Audio'}</span>
              </button>
            </div>
          </div>

          {/* Conversation Transcript Stream */}
          <div className="p-5">
            <div
              ref={chatScrollRef}
              className="space-y-3.5 max-h-[380px] overflow-y-auto mb-4 pr-1 p-3 bg-slate-50/70 rounded-2xl border border-slate/15 scrollbar-thin"
            >
              {transcript.map((t, i) => (
                <div key={i} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      t.role === 'user'
                        ? 'rounded-lg bg-primary font-medium text-white'
                        : 'bg-white text-navy rounded-tl-xs border border-slate/15 shadow-xs font-normal'
                    }`}
                  >
                    <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${t.role === 'user' ? 'text-white/80' : 'text-primary'}`}>
                      {t.role === 'user' ? 'Candidate' : 'Senior Interviewer'}
                    </p>
                    <p className="whitespace-pre-wrap">{t.content}</p>
                  </div>
                </div>
              ))}
              {interviewLoading && (
                <div className="flex justify-start">
                  <div className="px-4 py-2.5 rounded-2xl bg-white border border-slate/15 text-xs text-slate-600 flex items-center gap-2 shadow-xs">
                    <Loader2 className="animate-spin text-primary" size={14} /> AI Interviewer is formulating follow-up...
                  </div>
                </div>
              )}
            </div>

            {!interviewReport ? (
              <div className="space-y-2.5">
                {/* Active Voice Wave indicator when listening */}
                {isListening && (
                  <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold animate-pulse">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        <span className="w-1 h-3 bg-rose-500 rounded-full animate-bounce [animation-delay:0.1s]" />
                        <span className="w-1 h-4 bg-rose-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1 h-2 bg-rose-500 rounded-full animate-bounce [animation-delay:0.3s]" />
                      </div>
                      <span>Listening... speak your answer naturally</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-rose-500">Live Speech-to-Text</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center bg-slate-50 rounded-2xl border border-slate/20 focus-within:border-primary focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10 transition-all px-4 py-2">
                    <input
                      value={interviewInput}
                      onChange={(e) => setInterviewInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendInterviewReply()}
                      placeholder={isListening ? 'Listening to speech...' : 'Type or speak your answer...'}
                      className="w-full text-xs sm:text-sm bg-transparent text-navy placeholder:text-slate/40 outline-none font-medium"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleVoiceInput(setInterviewInput)}
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shrink-0 ${
                      isListening
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 animate-pulse'
                        : 'bg-slate-100 text-slate-700 hover:text-primary hover:bg-primary/10 border border-slate/15'
                    }`}
                    title={isListening ? 'Stop recording' : 'Speak answer (Speech-to-Text)'}
                  >
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>

                  <button
                    onClick={sendInterviewReply}
                    disabled={interviewLoading || !interviewInput.trim()}
                     className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-white transition-colors disabled:cursor-not-allowed disabled:opacity-30"
                    title="Send answer"
                  >
                    <Send size={16} />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Tip: Speak with STAR formula (Situation, Task, Action, Result).</span>
                  <button
                    onClick={endInterviewNow}
                    disabled={interviewLoading}
                    className="text-rose-600 hover:text-rose-700 font-bold hover:underline transition-colors"
                  >
                    End Interview & View Scorecard →
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-2 border border-slate/20 bg-white p-6">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-primary/10">
                  <div>
                    <h4 className="font-black text-navy text-lg">Mock Interview Assessment Scorecard</h4>
                    <p className="text-xs text-slate-500">Graded against real industry technical interview benchmarks</p>
                  </div>
                  <div className="text-right px-4 py-2 rounded-2xl bg-white border border-primary/20 shadow-xs">
                    <span className="text-3xl font-black text-primary">{interviewReport.overallScore}</span>
                    <span className="text-xs text-slate-500 font-bold">/100</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate/15 text-xs sm:text-sm text-slate-700 mb-4 leading-relaxed shadow-2xs">
                  <p className="font-bold text-navy text-xs uppercase tracking-wider mb-1 text-slate-400">Executive Summary</p>
                  {interviewReport.summary}
                </div>

                <div className="grid sm:grid-cols-2 gap-4 text-xs mb-5">
                  <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200">
                    <p className="font-bold text-emerald-700 mb-2 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <CheckCircle2 size={13} /> Key Strengths
                    </p>
                    <ul className="list-disc list-inside text-emerald-900 space-y-1 font-medium">
                      {interviewReport.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>

                  <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200">
                    <p className="font-bold text-amber-700 mb-2 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <AlertTriangle size={13} /> Recommended Growth Areas
                    </p>
                    <ul className="list-disc list-inside text-amber-900 space-y-1 font-medium">
                      {interviewReport.improvements?.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                </div>

                <button onClick={resetAll} className="btn-primary w-full justify-center !py-3 shadow-lg shadow-primary/25">
                  <RotateCcw size={15} /> Start Another Mock Interview Session
                </button>
              </div>
            )}
          </div>
        </Card>
      )}

      {generatedBy && stage !== STAGES.SELECT && (
        <p className="text-[11px] text-slate/60 text-center mt-4">Questions generated dynamically by: {generatedBy}</p>
      )}

      {/* Live Mock Interview Modal (Webcam + Voice + Proctoring) */}
      {showLiveMock && (
        <LiveMockInterview
          onClose={() => setShowLiveMock(false)}
          defaultRole={user?.targetRole || 'Full Stack Engineer'}
        />
      )}
    </div>
  );
};

export default AssessmentPage;
