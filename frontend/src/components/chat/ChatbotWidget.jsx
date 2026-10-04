import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Send, Sparkles, Maximize2, Minimize2, Plus,
  FileText, ShieldCheck, ChevronDown, ChevronUp, Copy, Check,
  ThumbsUp, ThumbsDown, Trash2, Bot, User, BookmarkCheck,
  History, Clock, MessageSquare, Compass, ArrowRight, CornerDownLeft
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import chatService from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: `### Welcome to your SkillForge AI Career Copilot! 🚀

I am your **Executive AI Career Coach**, grounded directly in your **uploaded resume, verified skills, target role benchmarks, and learning roadmap**.

Here are some high-impact ways we can accelerate your career today:
* **Analyze My Skill Gaps:** Pinpoint the exact competencies holding you back from your target role.
* **ATS Resume Audit:** Get targeted bullet-point rewrites using Google's X-Y-Z formula.
* **Mock Technical & Behavioral Interview:** Simulate real interview questions with instant feedback.
* **Weekly Roadmap Execution:** Break down complex topics into actionable study milestones.

What career goal or technical challenge would you like to tackle right now?`,
  retrievedContext: [
    {
      source: 'SkillForge RAG Engine',
      category: 'profile',
      excerpt: 'Directly linked to your active profile, resume chunks, skill graph taxonomy, and job match metrics.',
      relevanceScore: 1.0,
    },
  ],
  generatedBy: 'SkillForge Grounded RAG',
};

const SUGGESTED_PROMPTS = [
  { icon: '🎯', label: 'What are my biggest skill gaps?', prompt: 'What are my biggest skill gaps for my target role, and what should I prioritize first?' },
  { icon: '📄', label: 'Optimize resume for ATS', prompt: 'Analyze my resume and provide concrete bullet-point improvements using Google X-Y-Z formula.' },
  { icon: '🚀', label: 'Weekly study roadmap', prompt: 'Create an intensive 7-day study plan to close my highest-priority technical gap.' },
  { icon: '💼', label: '3 Mock interview questions', prompt: 'Give me 3 realistic technical interview questions tailored for my target role, with evaluation criteria.' },
];

const ChatbotWidget = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [expandedCitations, setExpandedCitations] = useState({});
  const [showSessionsDrawer, setShowSessionsDrawer] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Load sessions when widget opens
  useEffect(() => {
    if (open && user) {
      loadSessions();
    }
  }, [open, user]);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, loading]);

  const loadSessions = async () => {
    try {
      const data = await chatService.getSessions();
      if (data?.sessions?.length) {
        setSessions(data.sessions);
        const active = data.sessions[0];
        setCurrentSessionId(active._id);
        loadSessionMessages(active._id);
      }
    } catch (err) {
      // Standalone mode
    }
  };

  const loadSessionMessages = async (sessionId) => {
    try {
      const data = await chatService.getSessionMessages(sessionId);
      if (data?.messages?.length) {
        setMessages(data.messages);
      } else {
        setMessages([WELCOME_MESSAGE]);
      }
    } catch (err) {
      // Non-fatal
    }
  };

  const startNewSession = async () => {
    try {
      const title = user?.targetRole ? `${user.targetRole} Strategy` : 'Career Consultation';
      const data = await chatService.createSession({ title });
      if (data?.session) {
        setSessions((prev) => [data.session, ...prev]);
        setCurrentSessionId(data.session._id);
        setMessages([WELCOME_MESSAGE]);
        setShowSessionsDrawer(false);
      }
    } catch (err) {
      setMessages([WELCOME_MESSAGE]);
    }
  };

  const switchSession = (sessionId) => {
    setCurrentSessionId(sessionId);
    loadSessionMessages(sessionId);
    setShowSessionsDrawer(false);
  };

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this conversation?')) return;
    try {
      await chatService.deleteSession(sessionId);
      const remaining = sessions.filter((s) => s._id !== sessionId);
      setSessions(remaining);
      if (currentSessionId === sessionId) {
        if (remaining.length) {
          switchSession(remaining[0]._id);
        } else {
          startNewSession();
        }
      }
    } catch (err) {
      // Non-fatal
    }
  };

  const send = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMessage = { role: 'user', content: query, createdAt: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatService.sendMessage(query, currentSessionId);
      const assistantMessage = {
        _id: response.messageId,
        role: 'assistant',
        content: response.reply,
        retrievedContext: response.citations || [],
        generatedBy: response.generatedBy,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      if (response.sessionId && response.sessionId !== currentSessionId) {
        setCurrentSessionId(response.sessionId);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I ran into a temporary connection interruption while searching your profile. Please try sending your query again.",
          generatedBy: 'error',
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleCitationExpand = (msgIndex) => {
    setExpandedCitations((prev) => ({
      ...prev,
      [msgIndex]: !prev[msgIndex],
    }));
  };

  const handleFeedback = async (messageId, rating, index) => {
    if (!messageId) return;
    try {
      await chatService.rateMessage(messageId, rating);
      setMessages((prev) =>
        prev.map((m, i) => (i === index ? { ...m, feedback: rating } : m))
      );
    } catch (err) {
      // Non-fatal
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-navy via-darkBlue to-primary text-white shadow-2xl hover:shadow-primary/30 transition-all border border-white/20 group"
        aria-label="Toggle SkillForge AI Career Coach"
      >
        <div className="relative">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-xs">
            <Sparkles size={15} className="animate-pulse" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-navy animate-pulse"></span>
        </div>
        <div className="flex flex-col text-left">
          <span className="font-extrabold text-xs tracking-tight text-white leading-tight">AI Career Coach</span>
          <span className="text-[10px] text-lightSky font-semibold flex items-center gap-1">
            <ShieldCheck size={10} className="text-emerald-400" /> Grounded RAG
          </span>
        </div>
      </motion.button>

      {/* Main Chat Dialog */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className={`fixed z-50 bg-white/95 backdrop-blur-2xl border border-slate/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-navy transition-all duration-300 ${
              isExpanded
                ? 'bottom-4 right-4 left-4 top-4 sm:left-auto sm:top-8 sm:bottom-6 sm:right-6 sm:w-[860px] sm:h-[88vh]'
                : 'bottom-20 right-4 sm:right-6 w-[94vw] sm:w-[480px] h-[78vh] max-h-[700px]'
            }`}
          >
            {/* Header */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-navy via-[#0d1f3c] to-navy text-white flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md shadow-primary/30">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-white leading-tight">SkillForge AI Copilot</h3>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                      <ShieldCheck size={11} /> RAG Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate/90 leading-tight truncate max-w-[210px] sm:max-w-xs mt-0.5 font-medium">
                    {user?.targetRole ? `Target: ${user.targetRole}` : 'Personalized to your resume & skills'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 text-slate-300">
                <button
                  onClick={() => setShowSessionsDrawer((v) => !v)}
                  className={`px-2.5 py-1 text-xs rounded-xl font-semibold transition-all border ${
                    showSessionsDrawer
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-white/10 border-white/10 text-white hover:bg-white/15'
                  } hidden sm:flex items-center gap-1`}
                  title="View saved conversation threads"
                >
                  <History size={13} /> History ({sessions.length})
                </button>

                <button
                  onClick={startNewSession}
                  className="p-1.5 rounded-xl hover:bg-white/10 transition-colors text-white"
                  title="Start fresh conversation"
                >
                  <Plus size={18} />
                </button>

                <button
                  onClick={() => setIsExpanded((v) => !v)}
                  className="p-1.5 rounded-xl hover:bg-white/10 transition-colors text-white hidden sm:block"
                  title={isExpanded ? 'Collapse' : 'Expand full size'}
                >
                  {isExpanded ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
                </button>

                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-white/10 transition-colors text-white hover:text-rose-300"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Collapsible Sessions Drawer (Slide-Over) */}
            <AnimatePresence>
              {showSessionsDrawer && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-slate-50 border-b border-slate/20 px-4 py-3 space-y-2 overflow-hidden text-xs shrink-0"
                >
                  <div className="flex justify-between items-center text-slate font-bold text-[11px] uppercase tracking-wider">
                    <span>Saved Career Conversations</span>
                    <button
                      onClick={startNewSession}
                      className="text-primary hover:underline font-semibold flex items-center gap-1 lowercase first-letter:uppercase"
                    >
                      <Plus size={13} /> New Chat
                    </button>
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                    {sessions.map((s) => (
                      <div
                        key={s._id}
                        onClick={() => switchSession(s._id)}
                        className={`p-2.5 rounded-xl cursor-pointer flex items-center justify-between border transition-all ${
                          s._id === currentSessionId
                            ? 'bg-primary/10 border-primary text-primary font-bold shadow-2xs'
                            : 'bg-white border-slate/15 text-slate-700 hover:bg-slate-100 hover:text-navy'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <MessageSquare size={13} className="shrink-0 text-primary" />
                          <span className="truncate">{s.title}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-slate/70">
                            {new Date(s.lastActiveAt).toLocaleDateString()}
                          </span>
                          <button
                            onClick={(e) => handleDeleteSession(s._id, e)}
                            className="text-slate/40 hover:text-rose-600 p-1 transition-colors"
                            title="Delete thread"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-gradient-to-b from-slate-50/70 via-white to-slate-50/50">
              {messages.map((m, idx) => {
                const isUser = m.role === 'user';
                const hasCitations = m.retrievedContext && m.retrievedContext.length > 0;
                const isCitationsOpen = expandedCitations[idx];

                return (
                  <motion.div
                    key={m._id || idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}
                  >
                    <div className={`flex gap-3 max-w-[92%] sm:max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* Avatar */}
                      <div
                        className={`w-8 h-8 rounded-2xl flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-xs ${
                          isUser
                            ? 'bg-primary text-white'
                            : 'bg-gradient-to-br from-navy to-darkBlue text-white border border-slate/20'
                        }`}
                      >
                        {isUser ? <User size={15} /> : <Bot size={15} />}
                      </div>

                      {/* Bubble */}
                      <div className="space-y-2 min-w-0">
                        <div
                          className={`p-4 rounded-3xl text-sm leading-relaxed ${
                            isUser
                              ? 'bg-gradient-to-r from-primary to-accent text-white rounded-tr-xs shadow-md shadow-primary/20 font-medium'
                              : 'bg-white border border-slate/15 text-slate-800 rounded-tl-xs shadow-xs prose prose-sm max-w-none'
                          }`}
                        >
                          {isUser ? (
                            <p className="whitespace-pre-wrap">{m.content}</p>
                          ) : (
                            <ReactMarkdown
                              components={{
                                h1: ({ node, ...props }) => <h3 className="font-extrabold text-navy text-base mt-2 mb-1.5" {...props} />,
                                h2: ({ node, ...props }) => <h4 className="font-bold text-navy text-sm mt-2 mb-1" {...props} />,
                                h3: ({ node, ...props }) => <h5 className="font-bold text-navy text-sm mt-2 mb-1" {...props} />,
                                p: ({ node, ...props }) => <p className="mb-2 last:mb-0 leading-relaxed text-slate-800" {...props} />,
                                ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2 space-y-1 text-slate-700" {...props} />,
                                ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2 space-y-1 text-slate-700" {...props} />,
                                li: ({ node, ...props }) => <li className="leading-snug" {...props} />,
                                strong: ({ node, ...props }) => <strong className="font-bold text-navy" {...props} />,
                                hr: ({ node, ...props }) => <hr className="my-3 border-slate/20" {...props} />,
                                blockquote: ({ node, ...props }) => (
                                  <blockquote className="border-l-4 border-primary/60 bg-primary/5 pl-3 py-1.5 my-2 rounded-r-xl text-slate-700 italic text-xs" {...props} />
                                ),
                                table: ({ node, ...props }) => (
                                  <div className="overflow-x-auto my-3 rounded-xl border border-slate/20 shadow-2xs">
                                    <table className="min-w-full text-xs text-left divide-y divide-slate/20" {...props} />
                                  </div>
                                ),
                                thead: ({ node, ...props }) => <thead className="bg-slate-100/80 text-navy font-bold" {...props} />,
                                tbody: ({ node, ...props }) => <tbody className="divide-y divide-slate/10 bg-white" {...props} />,
                                tr: ({ node, ...props }) => <tr className="hover:bg-slate-50/60 transition-colors" {...props} />,
                                th: ({ node, ...props }) => <th className="px-3 py-2 text-navy font-bold text-[11px] uppercase tracking-wider" {...props} />,
                                td: ({ node, ...props }) => <td className="px-3 py-2 text-slate-700" {...props} />,
                                code: ({ node, inline, ...props }) =>
                                  inline ? (
                                    <code className="bg-slate-100 text-primary font-mono text-xs px-1.5 py-0.5 rounded border border-slate/20" {...props} />
                                  ) : (
                                    <pre className="bg-navy text-slate-100 p-3 rounded-xl overflow-x-auto text-xs my-2 font-mono" {...props} />
                                  ),
                              }}
                            >
                              {m.content}
                            </ReactMarkdown>
                          )}

                          {/* Action Footer for Assistant Responses */}
                          {!isUser && (
                            <div className="mt-3 pt-2.5 border-t border-slate/10 flex items-center justify-between text-[11px] text-slate">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-semibold text-slate/70 bg-slate-100 px-2 py-0.5 rounded-md border border-slate/20">
                                  {m.generatedBy?.startsWith('gemini') ? 'Gemini 3.5' : m.generatedBy || 'RAG Intelligence'}
                                </span>
                              </div>

                              <div className="flex items-center gap-2.5">
                                <button
                                  onClick={() => copyToClipboard(m.content, idx)}
                                  className="text-slate/60 hover:text-navy transition-colors flex items-center gap-1 font-medium"
                                  title="Copy response"
                                >
                                  {copiedIndex === idx ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                                  <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                                </button>
                                {m._id && (
                                  <>
                                    <button
                                      onClick={() => handleFeedback(m._id, 'positive', idx)}
                                      className={`p-1 rounded-md hover:bg-slate-100 transition-colors ${m.feedback === 'positive' ? 'text-emerald-600' : 'text-slate/60'}`}
                                      title="Helpful"
                                    >
                                      <ThumbsUp size={12} />
                                    </button>
                                    <button
                                      onClick={() => handleFeedback(m._id, 'negative', idx)}
                                      className={`p-1 rounded-md hover:bg-slate-100 transition-colors ${m.feedback === 'negative' ? 'text-rose-600' : 'text-slate/60'}`}
                                      title="Not helpful"
                                    >
                                      <ThumbsDown size={12} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Grounded RAG Citations Accordion */}
                        {!isUser && hasCitations && (
                          <div className="bg-lightSky/40 border border-primary/20 rounded-2xl overflow-hidden text-xs">
                            <button
                              onClick={() => toggleCitationExpand(idx)}
                              className="w-full px-3.5 py-2 flex items-center justify-between text-navy hover:text-primary transition-colors text-[11px] font-semibold"
                            >
                              <span className="flex items-center gap-1.5 text-primary">
                                <BookmarkCheck size={13} className="text-primary" />
                                Grounded in {m.retrievedContext.length} profile source{m.retrievedContext.length > 1 ? 's' : ''}
                              </span>
                              {isCitationsOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            </button>

                            <AnimatePresence>
                              {isCitationsOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="px-3.5 pb-3 pt-1 space-y-2 border-t border-primary/10"
                                >
                                  {m.retrievedContext.map((c, cIdx) => (
                                    <div
                                      key={cIdx}
                                      className="p-2.5 rounded-xl bg-white border border-slate/15 space-y-1 shadow-2xs"
                                    >
                                      <div className="flex items-center justify-between text-[11px] font-bold text-navy">
                                        <span className="flex items-center gap-1 text-primary">
                                          <FileText size={12} /> {c.source}
                                        </span>
                                        {c.relevanceScore > 0 && (
                                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-mono text-[10px]">
                                            {Math.round(c.relevanceScore * 100)}% match
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[11px] text-slate-600 leading-normal line-clamp-3">
                                        "{c.excerpt}"
                                      </p>
                                    </div>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Thinking Indicator */}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-3 bg-white border border-slate/20 px-4 py-3 rounded-3xl rounded-tl-xs shadow-xs">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-accent animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]"></div>
                    <span className="text-xs font-semibold text-slate-600 ml-1">
                      Synthesizing verified advice from your profile...
                    </span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick Suggested Career Prompts */}
            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate/15 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
              <span className="text-[11px] font-bold text-slate uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
                <Compass size={12} className="text-primary" /> Suggestions:
              </span>
              {SUGGESTED_PROMPTS.map((item, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => send(item.prompt)}
                  disabled={loading}
                  className="shrink-0 text-xs bg-white hover:bg-primary/5 hover:border-primary/40 border border-slate/20 px-3 py-1.5 rounded-xl text-slate-700 hover:text-primary transition-all font-medium shadow-2xs flex items-center gap-1.5"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3.5 bg-white border-t border-slate/15 flex items-center gap-2.5 shrink-0">
              <div className="flex-1 flex items-center bg-slate-50 rounded-2xl border border-slate/20 focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10 transition-all px-4 py-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about skill gaps, resume bullet rewrites, or interview prep..."
                  disabled={loading}
                  className="w-full text-xs sm:text-sm bg-transparent text-navy placeholder:text-slate/60 outline-none font-medium"
                />
              </div>

              <button
                onClick={() => send()}
                disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-2xl bg-gradient-to-r from-primary to-accent hover:opacity-95 disabled:opacity-30 disabled:hover:opacity-30 text-white flex items-center justify-center transition-all shadow-md shadow-primary/20 shrink-0"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatbotWidget;
