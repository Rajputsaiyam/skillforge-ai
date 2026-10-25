import React, { useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';

const FAQS = [
  {
    q: 'How is SkillForge AI different from other resume tools?',
    a: 'Most tools simply reformat text or add buzzwords. SkillForge AI actively compares your resume against real job requirements, shows you missing skills, gives you an ATS score, and builds a 30-day learning roadmap so you know exactly what to learn and practice.',
  },
  {
    q: 'How does the ATS score check work?',
    a: 'The ATS check scans your resume for clear formatting, standard section headings, and relevant job keywords. It helps ensure automated hiring systems can read and match your qualifications.',
  },
  {
    q: 'What kind of interview practice is available?',
    a: 'SkillForge provides multiple-choice quizzes and technical questions tailored to your chosen role (such as Full Stack, Frontend, Backend, or AI/ML) with clear explanations for every answer.',
  },
  {
    q: 'How does the 30-day learning plan work?',
    a: 'SkillForge takes the skills you are missing for your target role and organizes them into 4 weekly milestones. Each week focuses on practical concepts and project ideas to build your experience.',
  },
  {
    q: 'Is my resume and personal information private?',
    a: 'Yes, your resume and data are private and protected. Your information is only used to generate your personalized career insights.',
  },
];

const StudioFAQ = () => {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section id="faq" className="relative py-24 sm:py-32 bg-[#f8fbff]/60 border-t border-sky-100">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary">
            <Sparkles size={14} /> Questions & Answers
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-base text-slate">
            Clear, straightforward answers about how SkillForge AI helps your career.
          </p>
        </div>

        <div className="mt-12 space-y-3.5">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={faq.q}
                className="overflow-hidden rounded-2xl border border-sky-100 bg-white transition-all duration-200 shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                  className="flex w-full items-center justify-between gap-4 p-5 sm:p-6 text-left font-bold text-navy hover:text-primary transition-colors"
                >
                  <span className="text-base sm:text-lg">{faq.q}</span>
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-50 text-primary transition-transform duration-300 ${
                      isOpen ? 'rotate-180 bg-primary text-white' : ''
                    }`}
                  >
                    <ChevronDown size={18} />
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-sky-100/60 px-5 sm:px-6 pb-6 pt-4 text-sm leading-relaxed text-slate">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StudioFAQ;
