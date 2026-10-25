import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, GitBranch, Zap, Route as RouteIcon,
  Briefcase, Mail, ArrowRight, CheckCircle2, ChevronRight,
  Shield, BarChart3, Sparkles
} from 'lucide-react';
import StudioTiltCard from './StudioTiltCard';
import InteractiveResumeAuditDemo from './InteractiveResumeAuditDemo';
import InteractiveSkillGraphDemo from './InteractiveSkillGraphDemo';

const LAB_TABS = [
  { id: 'ats', label: 'Resume ATS Check', icon: FileText },
  { id: 'graph', label: 'Skill Gap Breakdown', icon: GitBranch },
  { id: 'interview', label: 'Practice Questions', icon: Zap },
  { id: 'roadmap', label: '30-Day Plan', icon: RouteIcon },
];

const StudioBentoLabs = () => {
  const [activeTab, setActiveTab] = useState('ats');

  return (
    <section id="labs" className="relative py-24 sm:py-32 overflow-hidden bg-white">
      {/* Background radial glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/4 -z-10 h-96 w-[700px] -translate-x-1/2 rounded-full bg-sky-100/60 blur-3xl"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary">
            <Sparkles size={14} /> Interactive Features
          </div>
          <h2 className="mt-4 max-w-3xl text-3xl font-extrabold tracking-tight text-[#090d16] sm:text-5xl">
            Everything you need to prepare for your target role.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate sm:text-lg">
            Practical tools to review your resume, find missing skills, practice realistic technical questions, and follow a clear step-by-step roadmap.
          </p>

          {/* Tab Selector */}
          <div className="mt-10 flex flex-wrap justify-center gap-2 rounded-full border border-sky-100 bg-[#f7fbff] p-1.5 shadow-sm">
            {LAB_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-colors duration-200 ${
                    isActive ? 'text-white' : 'text-slate hover:text-navy hover:bg-sky-100/40'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeLabTabIndicator"
                      className="absolute inset-0 rounded-full bg-primary shadow-md shadow-primary/30"
                      transition={{ type: 'spring', damping: 22, stiffness: 220 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="mt-12">
          {activeTab === 'ats' && (
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <InteractiveResumeAuditDemo />
              </div>
              <div className="space-y-6 lg:col-span-5">
                <div className="rounded-2xl border border-sky-100 bg-[#f8fbff] p-6">
                  <div className="text-xs font-bold uppercase tracking-wider text-primary">01 / Resume ATS Check</div>
                  <h3 className="mt-2 text-xl font-bold text-navy">
                    Pass hiring filters with a clean, targeted resume.
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate">
                    Our scanner checks your resume against common applicant tracking systems to spot missing keywords, formatting errors, and weak bullet points so you can fix them before applying.
                  </p>
                  <div className="mt-6 flex flex-col gap-2.5 text-xs font-semibold text-navy">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <CheckCircle2 size={16} /> Keyword matching for your target job
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700">
                      <CheckCircle2 size={16} /> Clear formatting and readability checks
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700">
                      <CheckCircle2 size={16} /> Actionable bullet point suggestions
                    </div>
                  </div>
                  <div className="mt-8">
                    <Link to="/register" className="btn-pill-sky !px-5 !py-2.5 text-xs">
                      Run Free Resume Audit <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'graph' && (
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <InteractiveSkillGraphDemo />
              </div>
              <div className="space-y-6 lg:col-span-5">
                <div className="rounded-2xl border border-sky-100 bg-[#f8fbff] p-6">
                  <div className="text-xs font-bold uppercase tracking-wider text-primary">02 / Skill Gap Analysis</div>
                  <h3 className="mt-2 text-xl font-bold text-navy">
                    Know exactly what skills to learn next.
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate">
                    SkillForge compares your current skills with what employers expect for your target role, highlighting high-priority gaps so you don't waste time on irrelevant topics.
                  </p>
                  <div className="mt-6 flex flex-col gap-2.5 text-xs font-semibold text-navy">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <CheckCircle2 size={16} /> Visual skill breakdown by category
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700">
                      <CheckCircle2 size={16} /> High-priority missing skills highlighted
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700">
                      <CheckCircle2 size={16} /> Directly connected to your learning plan
                    </div>
                  </div>
                  <div className="mt-8">
                    <Link to="/register" className="btn-pill-sky !px-5 !py-2.5 text-xs">
                      Explore Your Skill Gaps <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'interview' && (
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <StudioTiltCard
                  maxTilt={5}
                  className="rounded-3xl border border-sky-100 bg-white p-6 sm:p-8 shadow-[0_20px_50px_-20px_rgba(2,132,199,0.18)]"
                >
                  <div className="flex items-center justify-between border-b border-sky-100 pb-5">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">Practice Lab</span>
                      <h3 className="mt-1 text-xl font-bold text-navy">Realistic Technical Questions</h3>
                    </div>
                    <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" /> INTERVIEW READY
                    </span>
                  </div>

                  {/* Audio waveform visualizer */}
                  <div className="mt-6 rounded-2xl border border-sky-100 bg-[#f8fbff] p-6 text-center">
                    <div className="flex items-center justify-center gap-1.5 h-16">
                      {[40, 65, 80, 45, 90, 70, 30, 85, 95, 60, 75, 50, 88, 65, 40].map((h, i) => (
                        <div
                          key={i}
                          style={{ height: `${h}%` }}
                          className="w-1.5 rounded-full bg-primary/70 animate-pulse"
                        />
                      ))}
                    </div>
                    <p className="mt-4 text-xs font-medium text-slate">
                      "Explain how you would optimize database queries and caching in a high-traffic web application."
                    </p>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-3">
                    <div className="rounded-xl border border-sky-100 bg-white p-3 text-center">
                      <div className="text-[10px] font-bold uppercase text-slate">Clarity</div>
                      <div className="text-lg font-black text-primary font-mono mt-1">94%</div>
                    </div>
                    <div className="rounded-xl border border-sky-100 bg-white p-3 text-center">
                      <div className="text-[10px] font-bold uppercase text-slate">Accuracy</div>
                      <div className="text-lg font-black text-primary font-mono mt-1">88%</div>
                    </div>
                    <div className="rounded-xl border border-sky-100 bg-white p-3 text-center">
                      <div className="text-[10px] font-bold uppercase text-slate">Confidence</div>
                      <div className="text-lg font-black text-emerald-600 font-mono mt-1">High</div>
                    </div>
                  </div>
                </StudioTiltCard>
              </div>

              <div className="space-y-6 lg:col-span-5">
                <div className="rounded-2xl border border-sky-100 bg-[#f8fbff] p-6">
                  <div className="text-xs font-bold uppercase tracking-wider text-primary">03 / Practice Lab</div>
                  <h3 className="mt-2 text-xl font-bold text-navy">
                    Practice technical interview questions.
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate">
                    Test your skills with realistic multiple choice quizzes and interview prompts tailored to your target role, with clear explanations for every question.
                  </p>
                  <div className="mt-6 flex flex-col gap-2.5 text-xs font-semibold text-navy">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <CheckCircle2 size={16} /> Role-specific technical questions
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700">
                      <CheckCircle2 size={16} /> Instant feedback and explanations
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700">
                      <CheckCircle2 size={16} /> Builds real interview confidence
                    </div>
                  </div>
                  <div className="mt-8">
                    <Link to="/register" className="btn-pill-sky !px-5 !py-2.5 text-xs">
                      Try Practice Lab <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'roadmap' && (
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <StudioTiltCard
                  maxTilt={5}
                  className="rounded-3xl border border-sky-100 bg-white p-6 sm:p-8 shadow-[0_20px_50px_-20px_rgba(2,132,199,0.18)]"
                >
                  <div className="flex items-center justify-between border-b border-sky-100 pb-5">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">30-Day Plan</span>
                      <h3 className="mt-1 text-xl font-bold text-navy">Weekly Learning Milestones</h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-primary bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                      WEEK 2 OF 4
                    </span>
                  </div>

                  <div className="mt-6 space-y-3">
                    {[
                      { week: 'Week 1', title: 'System Design: Caching & Architecture Basics', done: true, time: 'Completed' },
                      { week: 'Week 2', title: 'Docker & Container Deployment Pipelines', done: true, time: 'In Progress' },
                      { week: 'Week 3', title: 'Security: Authentication & API Best Practices', done: false, time: 'Upcoming' },
                      { week: 'Week 4', title: 'Portfolio Project & Final Interview Prep', done: false, time: 'Upcoming' },
                    ].map((step, idx) => (
                      <div
                        key={step.week}
                        className={`flex items-center justify-between rounded-xl border p-4 transition-all ${
                          step.done
                            ? 'border-emerald-200 bg-emerald-50/40 text-navy'
                            : 'border-slate-100 bg-[#fbfdff] text-slate'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                              step.done ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {step.done ? <CheckCircle2 size={14} /> : idx + 1}
                          </div>
                          <div>
                            <span className="text-xs font-mono font-bold uppercase text-primary">{step.week}: </span>
                            <span className="text-xs font-bold text-navy">{step.title}</span>
                          </div>
                        </div>

                        <span className="text-[11px] font-mono font-semibold text-slate">
                          {step.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </StudioTiltCard>
              </div>

              <div className="space-y-6 lg:col-span-5">
                <div className="rounded-2xl border border-sky-100 bg-[#f8fbff] p-6">
                  <div className="text-xs font-bold uppercase tracking-wider text-primary">04 / 30-Day Plan</div>
                  <h3 className="mt-2 text-xl font-bold text-navy">
                    A clear weekly plan tailored to your goals.
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate">
                    Follow a realistic 4-week checklist of core concepts and projects. Each completed milestone moves you closer to job readiness.
                  </p>
                  <div className="mt-6 flex flex-col gap-2.5 text-xs font-semibold text-navy">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <CheckCircle2 size={16} /> Step-by-step weekly checklist
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700">
                      <CheckCircle2 size={16} /> Practical projects to build and show
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700">
                      <CheckCircle2 size={16} /> Tracks your progress toward applying
                    </div>
                  </div>
                  <div className="mt-8">
                    <Link to="/register" className="btn-pill-sky !px-5 !py-2.5 text-xs">
                      Generate Your Plan <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default StudioBentoLabs;
