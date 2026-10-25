import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, CheckCircle2, Sparkles, TrendingUp, Cpu, Award } from 'lucide-react';
import StudioTiltCard from './StudioTiltCard';
import FloatingSignalPill from './FloatingSignalPill';

const ROLE_PRESETS = {
  'Full Stack Engineer': {
    readiness: 82,
    status: 'Job Ready',
    statusColor: 'text-emerald-600',
    skills: [
      { name: 'React & Ecosystem', score: 91, status: 'Verified', isGap: false },
      { name: 'Node.js & MongoDB', score: 85, status: 'Verified', isGap: false },
      { name: 'System Design', score: 68, status: 'Target Gap', isGap: true },
      { name: 'Docker & CI/CD', score: 60, status: 'Target Gap', isGap: true },
    ],
    atsScore: 88,
    auditText: 'Strong resume format and high keyword match',
  },
  'AI & ML Engineer': {
    readiness: 89,
    status: 'High Fit',
    statusColor: 'text-emerald-600',
    skills: [
      { name: 'Python & PyTorch', score: 94, status: 'Verified', isGap: false },
      { name: 'Transformers & LLMs', score: 90, status: 'Verified', isGap: false },
      { name: 'Vector DBs & RAG', score: 86, status: 'Verified', isGap: false },
      { name: 'MLOps Pipeline', score: 65, status: 'Target Gap', isGap: true },
    ],
    atsScore: 92,
    auditText: 'Core ML tools, Python, and project experience verified',
  },
  'Product Architect': {
    readiness: 94,
    status: 'Exceptional',
    statusColor: 'text-sky-600',
    skills: [
      { name: 'Architecture & Scale', score: 96, status: 'Verified', isGap: false },
      { name: 'Distributed Systems', score: 92, status: 'Verified', isGap: false },
      { name: 'Data Modeling', score: 88, status: 'Verified', isGap: false },
      { name: 'Observability & SLOs', score: 71, status: 'Target Gap', isGap: true },
    ],
    atsScore: 95,
    auditText: 'System architecture and distributed systems verified',
  },
};

/**
 * Animated number counter component for smooth numerical transitions.
 */
const AnimatedCounter = ({ targetValue, duration = 650 }) => {
  const [count, setCount] = useState(targetValue);

  useEffect(() => {
    let start = count;
    const end = targetValue;
    if (start === end) return;

    const startTime = performance.now();
    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.round(start + (end - start) * ease));

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    const anim = requestAnimationFrame(update);
    return () => cancelAnimationFrame(anim);
  }, [targetValue]);

  return <span>{count}</span>;
};

const InteractiveCandidateCard = ({ className = '' }) => {
  const [selectedRole, setSelectedRole] = useState('Full Stack Engineer');
  const roleData = ROLE_PRESETS[selectedRole] || ROLE_PRESETS['Full Stack Engineer'];

  return (
    <div className="relative">
      {/* Floating Micro-Badges orbiting the main card */}
      <FloatingSignalPill
        icon={CheckCircle2}
        label="ATS Check"
        value="Pass"
        className="-top-5 -left-4 hidden sm:flex"
        floatDuration={4.5}
        delay={0.2}
      />

      <FloatingSignalPill
        icon={Award}
        label="Skills Verified"
        value="4 of 6"
        className="-top-6 right-6 hidden sm:flex"
        floatDuration={5.2}
        delay={0.4}
      />

      <FloatingSignalPill
        icon={TrendingUp}
        label="Role Fit"
        value="Job Ready"
        className="-bottom-4 -left-3 hidden sm:flex"
        floatDuration={4.8}
        delay={0.6}
      />

      <StudioTiltCard
        maxTilt={5}
        className={`group relative rounded-3xl border border-sky-100 bg-white p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(2,132,199,0.22)] transition-all duration-300 hover:border-sky-300 ${className}`}
      >
        {/* Dynamic ambient radial top glow */}
        <div
          className="pointer-events-none absolute -top-16 left-1/2 -z-10 h-44 w-80 -translate-x-1/2 rounded-full bg-gradient-to-b from-sky-300/40 via-sky-200/20 to-transparent blur-3xl transition-opacity duration-300 group-hover:opacity-90"
          aria-hidden="true"
        />

        {/* Role Preset Tabs with Smooth Gliding Background Pill */}
        <div className="relative mb-6 flex flex-wrap items-center gap-1.5 rounded-full border border-sky-100 bg-[#f7fbff] p-1.5 text-xs">
          {Object.keys(ROLE_PRESETS).map((role) => {
            const isActive = role === selectedRole;
            return (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`relative rounded-full px-3.5 py-1.5 font-semibold transition-colors duration-200 ${
                  isActive ? 'text-navy' : 'text-slate hover:text-navy'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeRoleTabGlow"
                    className="absolute inset-0 rounded-full bg-white shadow-[0_2px_10px_rgba(2,132,199,0.18)] ring-1 ring-sky-200"
                    transition={{ type: 'spring', damping: 22, stiffness: 240 }}
                  />
                )}
                <span className="relative z-10">{role}</span>
              </button>
            );
          })}
        </div>

        {/* Header section (Exact match to Visual 3) */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary">
              CAREER READINESS
            </p>
            <h2 className="mt-1.5 text-xl font-bold tracking-tight text-[#090d16] sm:text-2xl">
              {selectedRole} Match
            </h2>
          </div>

          <div className="text-right">
            <div className="text-3xl font-extrabold tracking-tight text-[#1d4ed8] sm:text-4xl">
              <AnimatedCounter targetValue={roleData.readiness} />%
            </div>
            <div className={`text-xs font-bold ${roleData.statusColor}`}>
              {roleData.status}
            </div>
          </div>
        </div>

        {/* Visual 3 Glowing Multi-Stop Progress Line with Traveling Spark */}
        <div className="relative mt-5 h-2 w-full overflow-hidden rounded-full bg-[#e0f2fe]/60">
          <motion.div
            className="relative h-full rounded-full"
            initial={false}
            animate={{ width: `${roleData.readiness}%` }}
            transition={{ type: 'spring', damping: 24, stiffness: 120 }}
            style={{
              background: 'linear-gradient(90deg, #1d4ed8 0%, #0284c7 45%, #38bdf8 80%, #00f0ff 100%)',
              boxShadow: '0 0 14px rgba(56, 189, 248, 0.75)',
            }}
          >
            {/* Spark at the tip */}
            <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-white shadow-[0_0_8px_#38bdf8] animate-pulse" />
          </motion.div>
        </div>

        {/* 2x2 Parameter Metric Cards with Staggered Numerical Refresh */}
        <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {roleData.skills.map((skill) => (
            <motion.div
              key={skill.name}
              initial={{ scale: 0.98, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="group/tile relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 transition-all duration-200 hover:border-sky-300 hover:shadow-[0_4px_16px_rgba(2,132,199,0.08)]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold tracking-tight text-[#090d16]">
                  {skill.name}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    skill.isGap
                      ? 'border border-amber-200/80 bg-[#fffbeb] text-[#b45309]'
                      : 'border border-emerald-200/80 bg-[#ecfdf5] text-[#059669]'
                  }`}
                >
                  {skill.status}
                </span>
              </div>

              <div className="mt-3 text-2xl font-extrabold tracking-tight text-[#090d16]">
                <AnimatedCounter targetValue={skill.score} />%
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom ATS Audit Banner (Exact match to Visual 3) */}
        <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-[#d0e7f8] bg-gradient-to-r from-[#f0f7ff] via-[#f7fbff] to-[#f0f7ff] p-4 sm:p-5">
          <div>
            <h3 className="text-sm font-bold tracking-tight text-[#090d16]">
              ATS Audit Score: <AnimatedCounter targetValue={roleData.atsScore} />/100
            </h3>
            <p className="mt-0.5 text-xs text-slate">
              {roleData.auditText}
            </p>
          </div>

          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-20" />
            <Check size={18} strokeWidth={2.8} />
          </div>
        </div>
      </StudioTiltCard>
    </div>
  );
};

export default InteractiveCandidateCard;
