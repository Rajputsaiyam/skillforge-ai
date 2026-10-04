import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Route as RouteIcon, Sparkles, BookOpen, CheckCircle2, Clock,
  ExternalLink, RotateCcw, X, Loader2, Zap, Check, AlertCircle, Copy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import roadmapService from '../../services/roadmapService';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import ProgressBar from '../../components/ui/ProgressBar';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { useApp } from '../../context/AppContext';

const RoadmapPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeGuide, setActiveGuide] = useState(null);
  const [guideLoading, setGuideLoading] = useState(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState(null);
  const { showToast } = useApp();

  useEffect(() => {
    roadmapService.getMine().then((r) => setRoadmap(r.roadmap)).finally(() => setLoading(false));
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { roadmap } = await roadmapService.generate(user?.targetRole);
      setRoadmap(roadmap);
      showToast('Roadmap generated based on your critical skill gaps!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to generate roadmap', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateItemProgress = async (itemIndex, newProgress) => {
    if (!roadmap?._id) return;
    try {
      const res = await roadmapService.updateProgress({
        roadmapId: roadmap._id,
        itemIndex,
        progress: newProgress,
      });
      setRoadmap(res.roadmap);
      showToast(`Week ${itemIndex + 1} progress updated to ${newProgress}%`);
    } catch (err) {
      showToast('Failed to update progress', 'error');
    }
  };

  const handleOpenStudyGuide = async (skill) => {
    setGuideLoading(true);
    setActiveGuide({ skill, loading: true });
    try {
      const res = await roadmapService.getStudyGuide(skill);
      setActiveGuide(res.guide);
    } catch (err) {
      setActiveGuide({
        skill,
        summary: `Essential reference and interview cheat-sheet for ${skill}.`,
        coreConcepts: [
          { name: 'Core Mechanics', explanation: `Fundamental architecture and runtime design of ${skill}.` },
          { name: 'Best Practices', explanation: `Clean, idiomatic patterns commonly tested in interviews.` },
        ],
        codeSnippets: [
          { title: `${skill} Standard Setup`, code: `// Typical production implementation pattern for ${skill}\nexport default function configure() {\n  return { active: true };\n}` },
        ],
        commonPitfalls: ['Ignoring error handling', 'Memory/resource leak edge cases'],
        interviewQuestions: [
          { question: `What are the primary performance trade-offs of ${skill}?`, keyPoints: 'Discuss latency, resource footprint, and scalability.' },
        ],
      });
    } finally {
      setGuideLoading(false);
    }
  };

  const copyCode = (code, idx) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIndex(idx);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  if (loading) return <div className="py-20 text-center text-slate">Loading your career roadmap…</div>;

  if (!roadmap || roadmap.items.length === 0) {
    return (
      <EmptyState
        icon={RouteIcon}
        title="No roadmap generated yet"
        description="Generate a personalized week-by-week learning roadmap built specifically from your skill gaps."
        ctaLabel={generating ? 'Generating...' : 'Generate My Roadmap'}
        onCta={handleGenerate}
      />
    );
  }

  const completedCount = roadmap.items.filter((i) => i.progress >= 100).length;
  const overallRoadmapProgress = Math.round((completedCount / roadmap.items.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Learning Roadmap</h1>
          <p className="text-slate mt-1 text-sm">
            Target Role: <strong className="text-navy">{roadmap.targetRole}</strong> · Completed: <strong className="text-primary">{completedCount} of {roadmap.items.length}</strong> milestones ({overallRoadmapProgress}%)
          </p>
        </div>
        <Button onClick={handleGenerate} disabled={generating} className="btn-secondary !py-2 text-xs">
          {generating ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
          {generating ? 'Regenerating...' : 'Regenerate Roadmap'}
        </Button>
      </motion.div>

      {/* Progress Bar Banner */}
      <Card className="p-4 bg-gradient-to-r from-veryLightBlue to-lightSky/40 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 w-full sm:max-w-md">
          <div className="flex justify-between text-xs font-bold text-navy">
            <span>Overall Roadmap Completion</span>
            <span>{overallRoadmapProgress}%</span>
          </div>
          <ProgressBar value={overallRoadmapProgress} showValue={false} height="h-2" />
        </div>
        <span className="text-xs text-slate font-medium">
          Check off weekly milestones to track and build verifiable career readiness.
        </span>
      </Card>

      {/* Roadmap Items List */}
      <div className="space-y-4">
        {roadmap.items.map((item, i) => (
          <Card key={i} delay={i * 0.05} className="hover:border-primary/30 transition-all p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                  item.progress >= 100 ? 'bg-green/10 text-green border border-green/30' : 'bg-primary/10 text-primary'
                }`}>
                  {item.progress >= 100 ? <Check size={16} /> : `W${item.week}`}
                </div>
                <div>
                  <h3 className="font-bold text-navy text-base leading-tight">
                    Week {item.week}: {item.skill}
                  </h3>
                  <span className="text-[11px] text-slate flex items-center gap-1 mt-0.5">
                    <Clock size={12} /> {item.estimatedHours} hours estimated study
                  </span>
                </div>
              </div>

              {/* Interactive Milestone Check-in (0% / 50% / 100%) */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto bg-veryLightBlue p-1 rounded-xl border border-slate/15 text-xs">
                <button
                  onClick={() => handleUpdateItemProgress(i, 0)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    item.progress === 0 ? 'bg-white shadow-sm font-bold text-navy' : 'text-slate hover:text-navy'
                  }`}
                >
                  Not Started
                </button>
                <button
                  onClick={() => handleUpdateItemProgress(i, 50)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    item.progress > 0 && item.progress < 100 ? 'bg-amber-100 font-bold text-amber-800' : 'text-slate hover:text-navy'
                  }`}
                >
                  In Progress
                </button>
                <button
                  onClick={() => handleUpdateItemProgress(i, 100)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    item.progress >= 100 ? 'bg-green font-bold text-white shadow-sm' : 'text-slate hover:text-navy'
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>

            <p className="text-xs text-slate mb-3 leading-relaxed">{item.reason}</p>
            <ProgressBar value={item.progress} label="Milestone Progress" height="h-1.5" />

            {/* Action buttons & Resources */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate/10">
              <div className="flex flex-wrap gap-2">
                {item.resources?.map((res, ri) => (
                  <a
                    key={ri}
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] bg-veryLightBlue hover:bg-lightSky text-primary px-2.5 py-1 rounded-lg font-medium transition-colors"
                  >
                    <span>{res.type}:</span> {res.title} <ExternalLink size={10} />
                  </a>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenStudyGuide(item.skill)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline px-2 py-1"
                >
                  <BookOpen size={13} /> AI Study Guide
                </button>
                <button
                  onClick={() => navigate('/assessment')}
                  className="inline-flex items-center gap-1 text-xs font-bold bg-primary text-white hover:bg-darkBlue px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Zap size={13} /> Test Milestone
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* AI Study Guide Modal */}
      <AnimatePresence>
        {activeGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate/10"
            >
              <div className="p-5 bg-gradient-to-r from-navy to-darkBlue text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/30 flex items-center justify-center">
                    <BookOpen size={18} className="text-sky" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base leading-tight">AI Technical Study Cheat-Sheet</h3>
                    <p className="text-[11px] text-white/70">Mastery reference for {activeGuide.skill}</p>
                  </div>
                </div>
                <button onClick={() => setActiveGuide(null)} className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-5">
                {guideLoading ? (
                  <div className="py-16 text-center space-y-3">
                    <Loader2 size={32} className="animate-spin text-primary mx-auto" />
                    <p className="text-sm font-semibold text-navy">Synthesizing {activeGuide.skill} study guide...</p>
                    <p className="text-xs text-slate">Extracting core patterns, code snippets, and interview questions</p>
                  </div>
                ) : (
                  <>
                    <div className="p-3.5 rounded-xl bg-lightSky/50 border border-primary/20 text-xs text-slate leading-relaxed">
                      {activeGuide.summary}
                    </div>

                    {/* Core Concepts */}
                    {activeGuide.coreConcepts?.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-bold text-navy text-xs uppercase tracking-wider">Core Architectural Concepts</h4>
                        <div className="space-y-2">
                          {activeGuide.coreConcepts.map((c, idx) => (
                            <div key={idx} className="p-3 rounded-xl border border-slate/15 space-y-1">
                              <p className="font-bold text-xs text-navy">{c.name}</p>
                              <p className="text-xs text-slate leading-relaxed">{c.explanation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Code Snippets */}
                    {activeGuide.codeSnippets?.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-bold text-navy text-xs uppercase tracking-wider">Idiomatic Code Snippet</h4>
                        {activeGuide.codeSnippets.map((cs, idx) => (
                          <div key={idx} className="rounded-xl overflow-hidden border border-slate/20 bg-navy text-white text-xs">
                            <div className="px-3 py-1.5 bg-darkBlue flex items-center justify-between text-[11px] text-slate">
                              <span>{cs.title}</span>
                              <button onClick={() => copyCode(cs.code, idx)} className="hover:text-white flex items-center gap-1">
                                {copiedCodeIndex === idx ? <Check size={12} className="text-green" /> : <Copy size={12} />}
                                {copiedCodeIndex === idx ? 'Copied' : 'Copy'}
                              </button>
                            </div>
                            <pre className="p-3 overflow-x-auto font-mono text-[11px] leading-relaxed text-sky">
                              {cs.code}
                            </pre>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Interview Questions */}
                    {activeGuide.interviewQuestions?.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-bold text-navy text-xs uppercase tracking-wider">Likely Interview Questions</h4>
                        <div className="space-y-2">
                          {activeGuide.interviewQuestions.map((iq, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate/15 space-y-1 text-xs">
                              <p className="font-bold text-navy">Q: {iq.question}</p>
                              <p className="text-primary font-medium text-[11px]">Key Talking Points: {iq.keyPoints}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="p-4 border-t border-slate/10 bg-slate-50 flex items-center justify-between">
                <Button onClick={() => navigate('/assessment')} className="!py-2 text-xs">
                  <Zap size={14} /> Practice This Skill
                </Button>
                <Button variant="secondary" onClick={() => setActiveGuide(null)} className="!py-2 text-xs">
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoadmapPage;
