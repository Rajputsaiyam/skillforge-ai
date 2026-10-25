import React from 'react';
import { ShieldCheck, Zap, Award, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';

const TICKER_ITEMS = [
  { icon: ShieldCheck, text: 'Instant Resume ATS Check' },
  { icon: Zap, text: 'Skill Gap Breakdown for Your Target Role' },
  { icon: Award, text: 'Step-by-Step 30-Day Learning Plan' },
  { icon: CheckCircle2, text: 'Role-Specific Mock Interview Practice' },
  { icon: TrendingUp, text: 'Clear Career Readiness Score' },
  { icon: Sparkles, text: 'Smart Job Matching & Outreach' },
];

const StudioLiveTicker = () => {
  return (
    <div className="relative w-full overflow-hidden border-y border-sky-100 bg-[#f8fbff]/80 py-3.5 backdrop-blur-sm">
      {/* Edge gradient masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" />

      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-slate"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-primary">
                <Icon size={12} />
              </div>
              <span>{item.text}</span>
              <span className="mx-2 text-sky-300">/</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudioLiveTicker;
