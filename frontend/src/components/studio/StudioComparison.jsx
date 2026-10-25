import React from 'react';
import { Check, X, Shield, Sparkles } from 'lucide-react';
import StudioTiltCard from './StudioTiltCard';

const COMPARISON_ROWS = [
  {
    feature: 'Resume & ATS Review',
    generic: 'Generic templates and basic keyword counters',
    skillforge: 'Checks actual formatting, role keywords, and highlights missing essentials',
  },
  {
    feature: 'Skill Gap Breakdown',
    generic: 'Long unorganized lists of buzzwords',
    skillforge: 'Clear priority ranking showing high, medium, and low priority gaps',
  },
  {
    feature: 'Bullet Point Advice',
    generic: 'Vague tips or robotic-sounding sentences',
    skillforge: 'Actionable suggestions that show clear metrics and technical accomplishments',
  },
  {
    feature: 'Learning Roadmap',
    generic: 'Random links and endless video playlists',
    skillforge: 'A focused 30-day weekly checklist tailored to your target job',
  },
  {
    feature: 'Interview Practice',
    generic: 'Generic chatbot questions with no guidance',
    skillforge: 'Job-specific technical questions with immediate feedback and answer hints',
  },
];

const StudioComparison = () => {
  return (
    <section id="comparison" className="relative py-24 sm:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary">
            <Shield size={14} /> Clear Comparison
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-navy sm:text-5xl">
            Built for real results, without the fluff.
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-base text-slate sm:text-lg">
            See the difference between generic AI tools and a focused, practical career prep platform.
          </p>
        </div>

        <div className="mt-14 overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-[0_20px_50px_-20px_rgba(2,132,199,0.12)]">
          <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-sky-100">
            {/* Left Header Column */}
            <div className="hidden md:block md:col-span-4 bg-[#f8fbff] p-6 sm:p-8 font-bold text-navy">
              <div className="text-xs uppercase tracking-widest text-slate mb-4">Core Feature</div>
              <div className="text-lg">What You Need</div>
            </div>

            {/* Middle: Generic AI */}
            <div className="md:col-span-4 bg-slate-50/50 p-6 sm:p-8">
              <div className="text-xs font-bold uppercase tracking-widest text-slate mb-2">Other Tools</div>
              <div className="text-lg font-bold text-slate-700">Generic AI Generators</div>
            </div>

            {/* Right: SkillForge AI */}
            <div className="md:col-span-4 bg-gradient-to-b from-sky-50/70 to-white p-6 sm:p-8 border-l-2 border-primary/30">
              <div className="text-xs font-bold uppercase tracking-widest text-primary mb-2">SkillForge AI</div>
              <div className="text-lg font-bold text-navy flex items-center gap-2">
                <span>SkillForge Standard</span>
                <span className="rounded-full bg-primary text-white text-[10px] px-2 py-0.5 font-mono">PRO</span>
              </div>
            </div>
          </div>

          <div className="divide-y divide-sky-100">
            {COMPARISON_ROWS.map((row) => (
              <div
                key={row.feature}
                className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-sky-100 hover:bg-sky-50/30 transition-colors"
              >
                <div className="md:col-span-4 p-5 sm:p-6 bg-[#fbfdff]">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate md:hidden mb-1">Capability</div>
                  <div className="text-sm font-bold text-navy">{row.feature}</div>
                </div>

                <div className="md:col-span-4 p-5 sm:p-6 flex items-start gap-3 bg-white">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 mt-0.5">
                    <X size={12} strokeWidth={3} />
                  </div>
                  <span className="text-xs sm:text-sm text-slate leading-relaxed">{row.generic}</span>
                </div>

                <div className="md:col-span-4 p-5 sm:p-6 flex items-start gap-3 bg-sky-50/20">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mt-0.5 shadow-xs">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-navy leading-relaxed">{row.skillforge}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StudioComparison;
