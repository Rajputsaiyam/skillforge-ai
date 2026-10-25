import React, { useEffect, useRef, useState } from 'react';
import {
  X, Send, Maximize2, Minimize2, Plus,
  FileText, ChevronDown, ChevronUp, Copy, Check,
  ThumbsUp, ThumbsDown, Trash2, Bot, User, BookmarkCheck,
  History, Clock, MessageSquare, Compass, ArrowRight, CornerDownLeft
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import chatService from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: `### Welcome to your SkillForge AI Career Copilot

I am your **Executive AI Career Coach**, grounded directly in your **uploaded resume, verified skills, target role benchmarks, and learning roadmap**.

Here are some high-impact ways we can accelerate your career today:
* **Analyze My Skill Gaps:** Pinpoint the exact competencies holding you back from your target role.
* **ATS Resume Audit:** Get targeted bullet-point rewrites using Google's X-Y-Z formula.
* **Mock Technical & Behavioral Interview:** Simulate real interview questions with instant feedback.
* **Weekly Roadmap Execution:** Break down complex topics into actionable study milestones.

What career goal or technical challenge would you like to tackle right now?`,
  retrievedContext: [
    {
      source: 'SkillForge Knowledge Engine',
      category: 'profile',
      excerpt: 'Directly linked to your active profile, resume chunks, skill graph taxonomy, and job match metrics.',
      relevanceScore: 1.0,
    },
  ],
  generatedBy: 'SkillForge AI Engine',
};

const SUGGESTED_PROMPTS = [
  { label: 'Review my biggest skill gaps', prompt: 'What are my biggest skill gaps for my target role, and what should I prioritize first?' },
  { label: 'Optimize my resume for ATS', prompt: 'Analyze my resume and provide concrete bullet-point improvements using Google X-Y-Z formula.' },
  { label: 'Build a weekly study plan', prompt: 'Create an intensive 7-day study plan to close my highest-priority technical gap.' },
  { label: 'Give me mock interview questions', prompt: 'Give me 3 realistic technical interview questions tailored for my target role, with evaluation criteria.' },
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
      {/* Career coach utility tab */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed right-0 top-1/2 z-50 flex -translate-y-1/2 items-center gap-2 rounded-l-md border border-r-0 border-navy bg-navy px-3.5 py-2.5 text-white shadow-card transition-colors hover:bg-darkBlue"
        aria-label="Toggle SkillForge AI Career Coach"
      >
        <Bot size={15} />
        <span className="text-xs font-semibold">Career coach</span>
      </button>

      {/* Main Chat Dialog */}
      {open && (
          <div
            className={`fixed z-50 flex flex-col overflow-hidden rounded-lg border border-slate/20 bg-white text-navy shadow-card ${
              isExpanded
                ? 'bottom-4 right-4 left-4 top-4 sm:left-auto sm:top-8 sm:bottom-6 sm:right-6 sm:w-[860px] sm:h-[88vh]'
                : 'bottom-20 right-4 sm:right-6 w-[94vw] sm:w-[480px] h-[78vh] max-h-[700px]'
            }`}
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-navy px-5 py-3.5 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold leading-tight text-white">SkillForge AI Copilot</h3>
                  </div>
                  <p className="mt-0.5 max-w-[210px] truncate text-[11px] font-medium leading-tight text-white/70 sm:max-w-xs">
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
               {showSessionsDrawer && (
                 <div
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
                 </div>
               )}

            {/* Message Stream */}
             <div className="flex-1 space-y-5 overflow-y-auto bg-[#f7fbff] p-4 sm:p-5">
              {messages.map((m, idx) => {
                const isUser = m.role === 'user';
                const hasCitations = m.retrievedContext && m.retrievedContext.length > 0;
                const isCitationsOpen = expandedCitations[idx];

                return (
                  <div
                    key={m._id || idx}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}
                  >
                    <div className={`flex gap-3 max-w-[92%] sm:max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* Avatar */}
                      <div
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                          isUser
                            ? 'bg-primary text-white'
                            : 'border border-slate/20 bg-navy text-white'
                        }`}
                      >
                        {isUser ? <User size={15} /> : <Bot size={15} />}
                      </div>

                      {/* Bubble */}
                      <div className="space-y-2 min-w-0">
                        <div
                          className={`rounded-lg p-4 text-sm leading-relaxed ${
                            isUser
                            ? 'rounded-lg bg-primary font-medium text-white'
                            : 'max-w-none rounded-lg border border-slate/20 bg-white text-slate-800 prose prose-sm'
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
                                  <blockquote className="my-2 rounded-r-lg border-l-4 border-primary/60 bg-primary/5 py-1.5 pl-3 text-xs text-slate-700" {...props} />
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
                                   <span className="rounded-md border border-slate/20 bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate/70">
                                  {m.generatedBy?.startsWith('gemini') ? 'AI Career Engine' : m.generatedBy || 'Neural Intelligence'}
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

                        {/* Verified Profile Citations Accordion */}
                        {!isUser && hasCitations && (
                           <div className="overflow-hidden rounded-lg border border-slate/20 bg-white text-xs">
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

                              {isCitationsOpen && (
                                <div
                                  className="px-3.5 pb-3 pt-1 space-y-2 border-t border-primary/10"
                                >
                                  {m.retrievedContext.map((c, cIdx) => (
                                    <div
                                      key={cIdx}
                                       className="space-y-1 border-t border-slate/15 p-2.5"
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
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Thinking Indicator */}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-3 rounded-lg border border-slate/20 bg-white px-4 py-3 shadow-xs">
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
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white transition-colors hover:bg-darkBlue disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        )}
    </>
  );
};

export default ChatbotWidget;
