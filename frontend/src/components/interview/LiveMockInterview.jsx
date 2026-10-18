import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, UploadCloud, FileText, CheckCircle2, AlertTriangle, ShieldCheck,
  Video, VideoOff, Mic, MicOff, Volume2, VolumeX, Sparkles, Send,
  RotateCcw, Award, ArrowRight, Loader2, UserCheck, Users, Eye, HelpCircle
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import ProgressBar from '../ui/ProgressBar';
import assessmentService from '../../services/assessmentService';
import resumeService from '../../services/resumeService';
import { useFaceDetection } from '../../hooks/useFaceDetection';
import { useAuth } from '../../context/AuthContext';

const STEPS = [
  { id: 1, label: 'Setup' },
  { id: 2, label: 'Introduction' },
  { id: 3, label: 'Interview' },
  { id: 4, label: 'Report' },
];

export default function LiveMockInterview({ onClose, defaultRole = 'Full Stack Engineer' }) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);

  // --- Step 1: Setup State ---
  const [resumeFile, setResumeFile] = useState(null);
  const [existingResume, setExistingResume] = useState(null);
  const [useExistingResume, setUseExistingResume] = useState(true);
  const [jobDescription, setJobDescription] = useState('');
  const [interviewType, setInterviewType] = useState('Technical Interview');
  const [questionCount, setQuestionCount] = useState(3);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // --- Step 2 & 3: Device, Media & Proctoring State ---
  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);
  const [mediaStream, setMediaStream] = useState(null);
  const videoPreviewRef = useRef(null);
  const liveVideoRef = useRef(null);
  const audioContextRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Face Detection Hook (runs on whichever video element is currently active)
  const activeVideoElement = currentStep === 2 ? videoPreviewRef : liveVideoRef;
  const { faceCount, warning: faceWarning, proctoringEvents } = useFaceDetection({
    videoRef: activeVideoElement,
    isActive: currentStep === 2 || currentStep === 3,
    checkIntervalMs: 450,
  });

  // --- Step 3: Interview Execution State ---
  const [assessmentId, setAssessmentId] = useState(null);
  const [interviewerName, setInterviewerName] = useState('Nexora');
  const [currentQuestionText, setCurrentQuestionText] = useState('');
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [turnIndex, setTurnIndex] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(3);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isCandidateSpeaking, setIsCandidateSpeaking] = useState(false);
  const [isSubmittingTurn, setIsSubmittingTurn] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [sessionTimer, setSessionTimer] = useState(0);
  const timerIntervalRef = useRef(null);
  const speechRecognitionRef = useRef(null);

  // --- Step 4: Final Scorecard & Advice ---
  const [finalReport, setFinalReport] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Load existing profile resume on mount
  useEffect(() => {
    resumeService.getMyResume()
      .then((res) => {
        if (res?.resume) {
          setExistingResume(res.resume);
          setUseExistingResume(true);
        }
      })
      .catch(() => {});
  }, []);

  // Cleanup media & timers on unmount
  useEffect(() => {
    return () => {
      stopMediaTracks();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (speechRecognitionRef.current) speechRecognitionRef.current.stop();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Handle webcam & microphone initialization for Steps 2 & 3
  useEffect(() => {
    if (currentStep === 2 || currentStep === 3) {
      startMediaDevices();
    } else {
      stopMediaTracks();
    }
  }, [currentStep]);

  // Session elapsed timer during Step 3
  useEffect(() => {
    if (currentStep === 3) {
      timerIntervalRef.current = setInterval(() => {
        setSessionTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [currentStep]);

  const stopMediaTracks = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const startMediaDevices = async () => {
    try {
      if (mediaStream) stopMediaTracks();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: true,
      });

      setMediaStream(stream);

      // Connect video stream to current video element
      if (currentStep === 2 && videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      } else if (currentStep === 3 && liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
      }

      // Initialize real-time Audio Analyser for mic volume check
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateMeter = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const pct = Math.min(100, Math.round((avg / 120) * 100));
          setAudioLevel(pct);
          animationFrameRef.current = requestAnimationFrame(updateMeter);
        };
        updateMeter();
      } catch (audioErr) {
        console.warn('Audio metering notice:', audioErr);
      }
    } catch (err) {
      console.error('Camera/Mic permission error:', err);
    }
  };

  // Toggle Video Track
  const toggleCamera = () => {
    if (!mediaStream) return;
    const videoTrack = mediaStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCameraActive(videoTrack.enabled);
    }
  };

  // Toggle Audio Track
  const toggleMic = () => {
    if (!mediaStream) return;
    const audioTrack = mediaStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicActive(audioTrack.enabled);
    }
  };

  // --- Voice Agent TTS: Nexora Speaks ---
  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsAiSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    // Pick a natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Karen')));
    if (femaleVoice) utterance.voice = femaleVoice;

    utterance.onend = () => setIsAiSpeaking(false);
    utterance.onerror = () => setIsAiSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // --- Voice Agent STT: Candidate Dictates ---
  const toggleSpeechRecognition = () => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) return;

    if (isCandidateSpeaking) {
      if (speechRecognitionRef.current) speechRecognitionRef.current.stop();
      setIsCandidateSpeaking(false);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsCandidateSpeaking(true);
      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setCandidateAnswer((prev) => (prev ? `${prev} ${currentTranscript.trim()}` : currentTranscript.trim()));
      };
      recognition.onerror = () => setIsCandidateSpeaking(false);
      recognition.onend = () => setIsCandidateSpeaking(false);

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsCandidateSpeaking(false);
    }
  };

  // --- File Drop / Selection for Resume ---
  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setResumeFile(file);
      setUseExistingResume(false);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
      setUseExistingResume(false);
    }
  };

  // --- Transition Step 1 -> Step 2 ---
  const proceedToIntroduction = async () => {
    if (resumeFile && !useExistingResume) {
      setIsUploading(true);
      try {
        await resumeService.uploadResume(resumeFile);
      } catch (err) {
        console.error('Resume upload error:', err);
      } finally {
        setIsUploading(false);
      }
    }
    setCurrentStep(2);
  };

  // --- Transition Step 2 -> Step 3: Launch Live Interview ---
  const startLiveInterviewSession = async () => {
    setIsSubmittingTurn(true);
    try {
      const payload = {
        targetRole: user?.targetRole || defaultRole,
        interviewType,
        questionCount,
        jobDescription: jobDescription.trim(),
        skills: user?.skills || [],
      };

      const res = await assessmentService.startInterview(payload);
      setAssessmentId(res.assessmentId);
      setInterviewerName(res.interviewerName || 'Nexora');
      setCurrentQuestionText(res.message);
      setTurnIndex(1);
      setTotalQuestions(res.questionCount || questionCount);
      setConversationHistory([{ role: 'interviewer', text: res.message }]);
      setCurrentStep(3);

      // Nexora speaks Question 1 aloud
      setTimeout(() => {
        speakText(res.message);
      }, 600);
    } catch (err) {
      console.error('Failed to start interview:', err);
    } finally {
      setIsSubmittingTurn(false);
    }
  };

  // --- Handle Next Question / Candidate Turn ---
  const handleNextQuestionTurn = async () => {
    const text = candidateAnswer.trim();
    if (!text || isSubmittingTurn) return;

    if (speechRecognitionRef.current) speechRecognitionRef.current.stop();
    setIsCandidateSpeaking(false);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsAiSpeaking(false);

    setConversationHistory((prev) => [...prev, { role: 'candidate', text }]);
    setCandidateAnswer('');
    setIsSubmittingTurn(true);

    try {
      const res = await assessmentService.continueInterview(assessmentId, text, {
        questionCount: totalQuestions,
        interviewType,
      });

      setConversationHistory((prev) => [...prev, { role: 'interviewer', text: res.message }]);
      setCurrentQuestionText(res.message);

      if (res.isComplete || turnIndex >= totalQuestions) {
        // Automatically wrap up session
        handleCompleteInterview();
      } else {
        setTurnIndex((prev) => prev + 1);
        speakText(res.message);
      }
    } catch (err) {
      console.error('Error continuing interview:', err);
    } finally {
      setIsSubmittingTurn(false);
    }
  };

  // --- Transition Step 3 -> Step 4: Finish & Generate Report ---
  const handleCompleteInterview = async () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (speechRecognitionRef.current) speechRecognitionRef.current.stop();
    setIsAiSpeaking(false);
    setIsCandidateSpeaking(false);
    stopMediaTracks();

    setIsGeneratingReport(true);
    setCurrentStep(4);

    try {
      const proctoringSummary = {
        flagsCount: proctoringEvents.length,
        details: proctoringEvents.length === 0
          ? 'Single candidate verified continuously with consistent face visibility.'
          : `${proctoringEvents.length} proctoring notices logged during interview session.`,
        events: proctoringEvents,
      };

      const res = await assessmentService.endInterview(assessmentId, proctoringSummary);
      setFinalReport(res.report);
    } catch (err) {
      console.error('Error generating scorecard:', err);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-navy/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate/15 overflow-hidden flex flex-col my-auto max-h-[92vh]"
      >
        {/* Top Header Stepper */}
        <div className="px-6 py-4 border-b border-slate/15 bg-slate-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 sm:gap-6">
            {STEPS.map((step) => {
              const isPast = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              return (
                <div key={step.id} className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isPast
                        ? 'bg-emerald-500 text-white'
                        : isCurrent
                        ? 'bg-primary text-white shadow-sm ring-2 ring-primary/20'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isPast ? <CheckCircle2 size={14} /> : step.id}
                  </span>
                  <span
                    className={`text-xs font-bold hidden sm:inline ${
                      isCurrent ? 'text-navy' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                  {step.id !== 4 && (
                    <div className="w-6 sm:w-10 h-0.5 bg-slate-200 hidden sm:block" />
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
            title="Exit Mock Interview"
          >
            <X size={16} />
          </button>
        </div>

        {/* Dynamic Step Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* ========================================================= */}
          {/* STEP 1: SETUP (Resume, Job Description, Type & Length)    */}
          {/* ========================================================= */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Section 01: Resume Upload */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs font-black flex items-center justify-center">
                    01
                  </span>
                  <h3 className="font-bold text-navy text-base">Your resume</h3>
                </div>
                <p className="text-xs text-slate-500 ml-8">
                  Upload a PDF or Word document (8 MB maximum).
                </p>

                {existingResume && useExistingResume ? (
                  <div className="ml-8 p-4 rounded-2xl bg-lightSky/50 border border-primary/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-navy truncate max-w-xs">
                          {existingResume.originalFileName || 'Current Profile Resume.pdf'}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {existingResume.detectedSkills?.length || 12} skills identified from profile
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setUseExistingResume(false)}
                      className="text-xs font-semibold text-primary hover:underline px-3 py-1.5 rounded-lg hover:bg-white/60 transition-colors"
                    >
                      Change resume
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="ml-8 border-2 border-dashed border-primary/30 hover:border-primary/60 bg-slate-50/60 hover:bg-lightSky/30 rounded-3xl p-8 text-center cursor-pointer transition-all duration-200"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-accent text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary/20">
                      <UploadCloud size={24} />
                    </div>
                    <h4 className="font-extrabold text-navy text-sm mb-1">
                      {resumeFile ? resumeFile.name : 'Drop your resume here'}
                    </h4>
                    <p className="text-xs text-slate-500 mb-3">
                      or <span className="text-primary font-bold underline">browse files</span> from your computer
                    </p>
                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-white border border-slate/20">PDF</span>
                      <span className="px-2 py-0.5 rounded bg-white border border-slate/20">DOCX</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 02: Job Description */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs font-black flex items-center justify-center">
                    02
                  </span>
                  <h3 className="font-bold text-navy text-base">Job description</h3>
                </div>
                <p className="text-xs text-slate-500 ml-8">
                  Paste the role description to guide relevant questions.
                </p>

                <div className="ml-8">
                  <textarea
                    rows={4}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here... (e.g. Senior Frontend Engineer with React, TypeScript, GraphQL, state management & performance optimizations)"
                    className="w-full text-xs sm:text-sm p-4 rounded-2xl border border-slate/20 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 bg-slate-50/50 placeholder:text-slate-400 text-navy font-medium resize-none transition-all"
                  />
                </div>
              </div>

              {/* Interview Configuration Row */}
              <div className="ml-8 grid sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">Interview type</label>
                  <select
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value)}
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate/20 bg-white text-navy font-medium focus:outline-none focus:border-primary"
                  >
                    <option value="Technical Interview">Technical Interview</option>
                    <option value="System Design Interview">System Design Interview</option>
                    <option value="Behavioral (STAR) Interview">Behavioral (STAR) Interview</option>
                    <option value="HR & Culture Fit Interview">HR & Culture Fit Interview</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">Interview length</label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate/20 bg-white text-navy font-medium focus:outline-none focus:border-primary"
                  >
                    <option value={3}>3 questions · Initial version</option>
                    <option value={5}>5 questions · Standard hiring loop</option>
                    <option value={8}>8 questions · In-depth evaluation</option>
                  </select>
                </div>
              </div>

              {/* Step 1 Footer */}
              <div className="ml-8 pt-4 border-t border-slate/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
                  <span>Your resume is stored securely with your interview record.</span>
                </div>

                <Button
                  onClick={proceedToIntroduction}
                  disabled={isUploading}
                  className="!py-3 !px-7 text-xs font-bold !bg-emerald-600 hover:!bg-emerald-700 !text-white rounded-xl shadow-lg shadow-emerald-600/20"
                >
                  {isUploading ? <Loader2 className="animate-spin" size={16} /> : null}
                  Start interview →
                </Button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 2: INTRODUCTION & WEBCAM / MIC / FACE PROCTORING CHECK */}
          {/* ========================================================= */}
          {currentStep === 2 && (
            <div className="space-y-5 max-w-2xl mx-auto text-center">
              <div>
                <span className="text-[10px] font-black text-primary uppercase tracking-widest block mb-1">
                  SKILLFORGE · AI INTERVIEWER
                </span>
                <h2 className="text-2xl font-black text-navy tracking-tight mb-1.5">
                  Get ready for your interview
                </h2>
                <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
                  Turn on your webcam and check the preview before you meet Nexora. Your video stays on your device and is never recorded or uploaded.
                </p>
              </div>

              {/* Video Preview Box with Live Face Detection */}
              <div className="relative rounded-3xl overflow-hidden bg-slate-900 border-2 border-slate/20 shadow-xl aspect-video max-h-[360px] mx-auto flex items-center justify-center">
                <video
                  ref={videoPreviewRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${!cameraActive ? 'hidden' : ''}`}
                />

                {!cameraActive && (
                  <div className="flex flex-col items-center justify-center text-slate-400 p-6">
                    <VideoOff size={40} className="mb-2 text-slate-500" />
                    <p className="text-xs font-semibold">Camera is currently disabled</p>
                  </div>
                )}

                {/* Face & Human Count Live Warnings */}
                <AnimatePresence>
                  {faceWarning && cameraActive && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-4 left-4 right-4 p-3 rounded-2xl bg-rose-600/95 backdrop-blur-md text-white text-xs font-bold shadow-lg flex items-center gap-2 justify-center"
                    >
                      <AlertTriangle size={16} className="text-amber-300 shrink-0" />
                      <span>{faceWarning}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Verified 1 Face Badge */}
                {!faceWarning && cameraActive && faceCount === 1 && (
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
                    <UserCheck size={13} /> Candidate verified (1 person detected)
                  </div>
                )}

                {/* Live Mic Volume Level Overlay */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                  <div className="flex items-center gap-2 bg-navy/70 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] font-bold">Camera ready</span>
                  </div>

                  {/* Microphone Volume Visualizer */}
                  <div className="flex items-center gap-2 bg-navy/70 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs">
                    <Mic size={13} className={audioLevel > 15 ? 'text-emerald-400' : 'text-slate-400'} />
                    <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 transition-all duration-75"
                        style={{ width: `${audioLevel}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls & Launch Button */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleCamera}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                      cameraActive
                        ? 'bg-white border-slate/20 text-slate-700 hover:border-slate/40'
                        : 'bg-rose-50 border-rose-200 text-rose-600'
                    }`}
                  >
                    {cameraActive ? <Video size={15} /> : <VideoOff size={15} />}
                    <span>{cameraActive ? 'Camera enabled' : 'Camera disabled'}</span>
                  </button>

                  <button
                    onClick={toggleMic}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                      micActive
                        ? 'bg-white border-slate/20 text-slate-700 hover:border-slate/40'
                        : 'bg-rose-50 border-rose-200 text-rose-600'
                    }`}
                  >
                    {micActive ? <Mic size={15} /> : <MicOff size={15} />}
                    <span>{micActive ? 'Mic active' : 'Mic muted'}</span>
                  </button>
                </div>

                <Button
                  onClick={startLiveInterviewSession}
                  disabled={isSubmittingTurn}
                  className="!py-3 !px-8 text-xs font-bold !bg-emerald-600 hover:!bg-emerald-700 !text-white rounded-xl shadow-lg shadow-emerald-600/25"
                >
                  {isSubmittingTurn ? <Loader2 className="animate-spin" size={16} /> : null}
                  Start interview
                </Button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 3: LIVE INTERVIEW WITH VOICE AGENT & VIDEO           */}
          {/* ========================================================= */}
          {currentStep === 3 && (
            <div className="space-y-4">
              {/* Session Status Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate/10">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-bold text-xs">
                    Question {turnIndex} of {totalQuestions}
                  </span>
                  <span className="text-xs font-bold text-slate-600">{interviewType}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-navy bg-slate-100 px-2.5 py-1 rounded-lg border border-slate/15">
                    ⏱️ {formatTimer(sessionTimer)}
                  </span>

                  {faceWarning ? (
                    <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1 animate-pulse">
                      <AlertTriangle size={12} /> Proctoring Notice
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center gap-1">
                      <ShieldCheck size={12} /> 1 Person Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Dual Video Grid: Interviewer Tile & Candidate Tile */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Nexora (AI Interviewer) Tile */}
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-navy via-[#0d1f3c] to-navy p-6 flex flex-col items-center justify-center min-h-[200px] border border-white/10 shadow-lg text-white text-center">
                  <div className="relative mb-3">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30 ${isAiSpeaking ? 'animate-pulse ring-4 ring-primary/40' : ''}`}>
                      <Sparkles size={28} className="text-white" />
                    </div>
                    {isAiSpeaking && (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 ring-2 ring-navy animate-ping" />
                    )}
                  </div>

                  <h4 className="font-extrabold text-sm text-white mb-0.5">{interviewerName}</h4>
                  <p className="text-[11px] text-slate-300 font-medium mb-3">Senior Technical Interviewer</p>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isAiSpeaking ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'bg-white/10 text-slate-300'}`}>
                      {isAiSpeaking ? 'Speaking question...' : 'Listening to candidate'}
                    </span>
                    <button
                      onClick={() => speakText(currentQuestionText)}
                      className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                      title="Repeat question"
                    >
                      <Volume2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Candidate Live Webcam Tile with Real-Time Face Detection */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate/20 shadow-lg aspect-video flex items-center justify-center">
                  <video
                    ref={liveVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* On-video warning pill if candidate steps away or multiple humans appear */}
                  {faceWarning && (
                    <div className="absolute top-2 left-2 right-2 p-1.5 rounded-xl bg-rose-600/95 text-white text-[10px] font-bold text-center shadow-md animate-pulse">
                      {faceWarning}
                    </div>
                  )}

                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-[10px] font-bold pointer-events-none">
                    <span className="bg-navy/70 backdrop-blur-md px-2 py-0.5 rounded-md">
                      Candidate Feed
                    </span>
                    <div className="flex items-center gap-1.5 bg-navy/70 backdrop-blur-md px-2 py-0.5 rounded-md">
                      <Mic size={10} className={isCandidateSpeaking ? 'text-rose-400 animate-pulse' : 'text-slate-400'} />
                      <span>{isCandidateSpeaking ? 'Transcribing...' : 'Mic Ready'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Question Card */}
              <div className="p-4 rounded-2xl bg-lightSky/40 border border-primary/20 text-navy">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-1">
                  Active Question #{turnIndex}
                </span>
                <p className="text-sm sm:text-base font-extrabold leading-snug">
                  {currentQuestionText}
                </p>
              </div>

              {/* Answer Dictation & Text Area */}
              <div className="space-y-2">
                <div className="relative">
                  <textarea
                    rows={3}
                    value={candidateAnswer}
                    onChange={(e) => setCandidateAnswer(e.target.value)}
                    placeholder="Speak into your microphone or type your response here... (Focus on situation, action taken, technical decisions & results)"
                    className="w-full text-xs sm:text-sm p-4 pr-12 rounded-2xl border border-slate/20 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 bg-slate-50/50 text-navy font-medium resize-none transition-all placeholder:text-slate-400"
                  />

                  <button
                    onClick={toggleSpeechRecognition}
                    className={`absolute right-3 bottom-3.5 p-2 rounded-xl transition-all shadow-xs ${
                      isCandidateSpeaking
                        ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/30'
                        : 'bg-slate-100 hover:bg-primary hover:text-white text-slate-700'
                    }`}
                    title={isCandidateSpeaking ? 'Stop dictating' : 'Speak answer (Speech-to-Text)'}
                  >
                    {isCandidateSpeaking ? <MicOff size={16} /> : <Mic size={16} />}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">
                    {isCandidateSpeaking ? '🎙️ Listening... speak clearly into your mic.' : 'Click mic to speak your answer with real-time Speech-to-Text.'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCompleteInterview}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      End Interview Early
                    </button>

                    <Button
                      onClick={handleNextQuestionTurn}
                      disabled={isSubmittingTurn || !candidateAnswer.trim()}
                      className="!py-2.5 !px-5 text-xs font-bold !bg-emerald-600 hover:!bg-emerald-700 !text-white rounded-xl shadow-md shadow-emerald-600/20"
                    >
                      {isSubmittingTurn ? <Loader2 className="animate-spin" size={15} /> : <Send size={15} />}
                      {turnIndex >= totalQuestions ? 'Submit & Finish' : 'Next Question →'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 4: FINAL SCORECARD, PROCTORING REPORT & ADVICE       */}
          {/* ========================================================= */}
          {currentStep === 4 && (
            <div>
              {isGeneratingReport ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto animate-pulse">
                    <Loader2 size={32} className="animate-spin" />
                  </div>
                  <h3 className="font-extrabold text-navy text-lg">Generating Your Performance Scorecard</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Evaluating technical accuracy, communication structure, problem solving depth, and webcam integrity logs...
                  </p>
                </div>
              ) : finalReport ? (
                <div className="space-y-6">
                  {/* Top Score Banner */}
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-lightSky/50 via-white to-lightSky/30 border border-primary/20 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest block mb-1">
                        PERFORMANCE EVALUATION · {interviewType.toUpperCase()}
                      </span>
                      <h3 className="text-2xl font-black text-navy">{finalReport.rating || 'Strong Candidate'}</h3>
                      <p className="text-xs text-slate-600 mt-1 max-w-md leading-relaxed">
                        {finalReport.summary}
                      </p>
                    </div>

                    <div className="text-center px-6 py-3 rounded-2xl bg-white border border-primary/20 shadow-sm shrink-0">
                      <span className="text-4xl font-black text-primary">{finalReport.overallScore}</span>
                      <span className="text-xs font-bold text-slate-400 block">/ 100</span>
                      <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wide">
                        {finalReport.rating || 'Evaluated'}
                      </span>
                    </div>
                  </div>

                  {/* Competency Breakdown Meters */}
                  <div className="grid sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Technical Depth', val: finalReport.technicalScore || 80 },
                      { label: 'Communication', val: finalReport.communicationScore || 85 },
                      { label: 'Problem Solving', val: finalReport.problemSolvingScore || 78 },
                      { label: 'Confidence', val: finalReport.confidenceScore || 82 },
                    ].map((m) => (
                      <div key={m.label} className="p-3.5 rounded-2xl bg-slate-50 border border-slate/15 text-center">
                        <span className="text-[11px] font-bold text-slate-500 block mb-1">{m.label}</span>
                        <span className="text-xl font-extrabold text-navy">{m.val}%</span>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${m.val}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Proctoring & Webcam Integrity Card */}
                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate/15 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-navy text-xs uppercase tracking-wide">
                          Webcam & Audio Proctoring Audit
                        </h4>
                        <p className="text-xs text-slate-500">
                          {finalReport.proctoring?.details || 'Face verified throughout session; zero multi-human flags.'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                      {finalReport.proctoring?.status || 'Verified Clean'}
                    </span>
                  </div>

                  {/* Strengths & Growth Areas Grid */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                      <h4 className="font-extrabold text-emerald-800 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <CheckCircle2 size={14} /> Key Observed Strengths
                      </h4>
                      <ul className="space-y-1.5 text-xs text-emerald-950 font-medium">
                        {finalReport.strengths?.map((s, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
                      <h4 className="font-extrabold text-amber-800 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <AlertTriangle size={14} /> Actionable Growth Areas
                      </h4>
                      <ul className="space-y-1.5 text-xs text-amber-950 font-medium">
                        {finalReport.improvements?.map((imp, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-amber-600 font-bold">•</span>
                            <span>{imp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Concrete Actionable Advice */}
                  {finalReport.actionableAdvice && finalReport.actionableAdvice.length > 0 && (
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
                      <h4 className="font-extrabold text-primary text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Sparkles size={14} /> Strategic Advice For Your Next Live Interview
                      </h4>
                      <div className="space-y-2 text-xs text-navy font-medium">
                        {finalReport.actionableAdvice.map((adv, i) => (
                          <div key={i} className="p-2.5 rounded-xl bg-white border border-primary/10">
                            {adv}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate/15">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="btn-secondary !py-2.5 !px-5 text-xs font-bold"
                    >
                      <RotateCcw size={14} /> Take Another Mock Interview
                    </button>

                    <Button
                      onClick={onClose}
                      className="!py-2.5 !px-6 text-xs font-bold !bg-primary text-white"
                    >
                      Done & Return to Career Hub
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
