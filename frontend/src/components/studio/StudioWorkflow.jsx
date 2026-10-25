import React from 'react';
import { ArrowRight, CheckCircle2, Upload, Target, Rocket } from 'lucide-react';
import StudioTiltCard from './StudioTiltCard';

const STEPS = [
  {
    step: '01',
    icon: Upload,
    title: 'Upload Your Resume',
    desc: 'Upload your resume in PDF or Word format. The scanner extracts your skills, work history, and projects without losing formatting.',
    tags: ['PDF / DOCX Upload', 'Skill Extraction', 'Format Review'],
  },
  {
    step: '02',
    icon: Target,
    title: 'Discover Missing Skills',
    desc: 'Compare your profile against real expectations for your target role. See which skills you already have and which ones you need to master.',
    tags: ['Target Role Match', 'Missing Skills List', 'ATS Score Check'],
  },
  {
    step: '03',
    icon: Rocket,
    title: 'Follow Your 30-Day Plan',
    desc: 'Work through a clear 4-week learning checklist with focused milestones, technical practice questions, and interview preparation.',
    tags: ['Weekly Goals', 'Practice Questions', 'Job Readiness'],
  },
];

const StudioWorkflow = () => {
  return (
    <section id="workflow" className="relative py-24 sm:py-32 bg-[#f8fbff]/70 border-t border-sky-100">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary">
              How It Works
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-navy sm:text-5xl">
              Three simple steps to career readiness.
            </h2>
          </div>
          <p className="max-w-md text-sm sm:text-base text-slate leading-relaxed">
            A clear and structured path to optimize your resume, learn key skills, and walk into interviews prepared.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <StudioTiltCard
                key={step.step}
                maxTilt={6}
                className="group relative flex flex-col justify-between rounded-3xl border border-sky-100 bg-white p-7 sm:p-8 shadow-[0_15px_40px_-20px_rgba(2,132,199,0.12)] transition-all duration-300 hover:border-sky-300 hover:shadow-[0_20px_50px_-20px_rgba(2,132,199,0.22)]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-extrabold text-primary">
                      PHASE // {step.step}
                    </span>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-primary border border-sky-100 transition-colors group-hover:bg-primary group-hover:text-white">
                      <Icon size={20} />
                    </div>
                  </div>

                  <h3 className="mt-8 text-xl font-bold tracking-tight text-navy">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-sky-100/70">
                  <div className="flex flex-wrap gap-1.5">
                    {step.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-sky-50/80 px-2.5 py-1 text-[11px] font-semibold text-slate border border-sky-200/50"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </StudioTiltCard>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StudioWorkflow;
