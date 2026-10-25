import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2, ArrowRight, RefreshCw, Zap } from 'lucide-react';
import StudioTiltCard from './StudioTiltCard';

const SAMPLE_BULLETS = [
  {
    role: 'Backend Developer',
    text: 'Built scalable REST APIs using Node.js and PostgreSQL, reducing query response times by 35% and supporting over 100K daily active users.',
    score: 95,
    tags: [
      { label: 'Node.js & PostgreSQL', type: 'tech' },
      { label: '100K daily users', type: 'metric' },
      { label: '35% faster queries', type: 'quantified' },
      { label: 'REST API Design', type: 'impact' },
    ],
    feedback: 'Clear technologies, measurable performance improvement, and strong user scale.',
  },
  {
    role: 'Frontend Developer',
    text: 'Developed high-performance responsive web pages in React and Tailwind CSS, improving page load speed by 40% for 500K monthly visitors.',
    score: 92,
    tags: [
      { label: 'React & Tailwind CSS', type: 'tech' },
      { label: '40% faster load', type: 'metric' },
      { label: '500K visitors', type: 'quantified' },
      { label: 'Component Design', type: 'impact' },
    ],
    feedback: 'Direct modern frontend stack with clear user-facing performance results.',
  },
  {
    role: 'Full Stack Engineer',
    text: 'Implemented user authentication and real-time notifications with JWT and WebSockets, cutting onboarding friction and increasing retention by 20%.',
    score: 94,
    tags: [
      { label: 'JWT & WebSockets', type: 'tech' },
      { label: 'Real-time Alerts', type: 'tech' },
      { label: '+20% Retention', type: 'quantified' },
      { label: 'Secure Auth', type: 'impact' },
    ],
    feedback: 'Specific architectural features with clear product improvements.',
  },
];

const InteractiveResumeAuditDemo = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  const activeSample = SAMPLE_BULLETS[activeIdx];

  const handleSelectSample = (idx) => {
    if (idx === activeIdx && !isScanning) return;
    setIsScanning(true);
    setActiveIdx(idx);
    setTimeout(() => {
      setIsScanning(false);
    }, 600);
  };

  return (
    <StudioTiltCard
      maxTilt={4}
      className="group relative rounded-3xl border border-sky-100 bg-white p-6 sm:p-8 shadow-[0_20px_50px_-20px_rgba(2,132,199,0.18)]"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-sky-100 pb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary border border-sky-200">
            <Sparkles size={13} /> Resume Audit Preview
          </span>
          <h3 className="mt-2 text-xl font-bold tracking-tight text-navy">
            Live Bullet Point Checker
          </h3>
          <p className="text-xs text-slate mt-0.5">
            See how strong bullet points clearly demonstrate skills and results
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-1.5 rounded-full border border-sky-100 bg-[#f7fbff] p-1 text-xs">
          {SAMPLE_BULLETS.map((item, i) => (
            <button
              key={item.role}
              onClick={() => handleSelectSample(i)}
              className={`relative rounded-full px-3 py-1 font-semibold transition-all duration-200 ${
                i === activeIdx
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate hover:text-navy hover:bg-sky-100/50'
              }`}
            >
              Preset {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Scan Display */}
      <div className="relative mt-6 rounded-2xl border border-sky-200/80 bg-[#f8fbff] p-5 sm:p-6 overflow-hidden">
        {/* Animated Scanner Laser Sweep */}
        <AnimatePresence>
          {isScanning && (
            <motion.div
              initial={{ top: '-10%', opacity: 0.9 }}
              animate={{ top: '110%', opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="pointer-events-none absolute inset-x-0 h-3 bg-gradient-to-b from-sky-400 via-cyan-300 to-transparent shadow-[0_0_20px_#38bdf8] z-20"
            />
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between text-xs font-semibold text-slate mb-3">
          <span className="flex items-center gap-1.5 text-navy font-bold">
            Target Role: <span className="text-primary">{activeSample.role}</span>
          </span>
          <span className="font-mono text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            CHECK COMPLETE · PASS
          </span>
        </div>

        {/* Bullet text display */}
        <p className="relative z-10 text-sm font-medium leading-relaxed text-navy sm:text-base">
          "{activeSample.text}"
        </p>

        {/* Identified Keywords / Tags with Staggered Pop-in */}
        <div className="mt-5 flex flex-wrap gap-2 pt-4 border-t border-sky-100">
          {activeSample.tags.map((tag, idx) => (
            <motion.span
              key={tag.label}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.08, type: 'spring', damping: 15 }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-white px-2.5 py-1 text-xs font-semibold text-navy shadow-xs hover:border-primary transition-colors"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {tag.label}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Feedback & Score Summary */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-sky-100 bg-white p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 size={16} />
          </div>
          <div>
            <div className="text-xs font-bold text-navy">Bullet Review: Strong Result</div>
            <div className="text-xs text-slate mt-0.5 leading-snug">
              {activeSample.feedback}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:border-l sm:border-sky-100 sm:pl-5">
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate">ATS Score</div>
            <div className="text-2xl font-black text-primary font-mono">{activeSample.score}/100</div>
          </div>
        </div>
      </div>
    </StudioTiltCard>
  );
};

export default InteractiveResumeAuditDemo;
