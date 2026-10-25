import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, ArrowDown, Check, ShieldCheck, Sparkles,
  Award, TrendingUp, Users, Cpu, FileCheck
} from 'lucide-react';
import StudioNavbar from '../../components/studio/StudioNavbar';
import GrainGradientCanvas from '../../components/studio/GrainGradientCanvas';
import InteractiveCandidateCard from '../../components/studio/InteractiveCandidateCard';
import StudioLiveTicker from '../../components/studio/StudioLiveTicker';
import StudioBentoLabs from '../../components/studio/StudioBentoLabs';
import StudioWorkflow from '../../components/studio/StudioWorkflow';
import StudioComparison from '../../components/studio/StudioComparison';
import StudioFAQ from '../../components/studio/StudioFAQ';
import StudioCTABanner from '../../components/studio/StudioCTABanner';
import StudioFooter from '../../components/studio/StudioFooter';
import StudioCursorGlow from '../../components/studio/StudioCursorGlow';
import MagneticButton from '../../components/studio/MagneticButton';
import StaggeredWords from '../../components/studio/TextReveal';
import ScrollReveal from '../../components/react-bits/ScrollReveal';

const STUDIO_METRICS = [
  { value: '88/100', label: 'Average ATS Score', sub: 'Optimized formatting and keywords to pass screening filters' },
  { value: 'Instant', label: 'Skill Gap Breakdown', sub: 'See exactly what skills you are missing for your target role' },
  { value: '30 Days', label: 'Structured Roadmap', sub: 'Step-by-step weekly plan to become job ready' },
  { value: 'Interactive', label: 'Practice Lab', sub: 'Real quiz assessments and mock interview feedback' },
];

const LandingPage = () => {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white text-navy font-sans selection:bg-sky-200 selection:text-navy">
      {/* Ambient Celestial Cursor Glow Aura */}
      <StudioCursorGlow />

      {/* Studio Header (Matches Visual 2) */}
      <StudioNavbar />

      <main>
        {/* ============================================================
            HERO SECTION (Matches Visual 1, Visual 2, and Visual 3)
            ============================================================ */}
        <section className="relative isolate overflow-hidden border-b border-sky-100 bg-[#f8fbff]/70 pt-8 pb-20 sm:pt-14 sm:pb-28">
          {/* Dopamine Studio-style WebGL Grain Mesh Canvas */}
          <GrainGradientCanvas />

          <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
              {/* Left Column: Headline & Studio Copy (Visual 1 Match) */}
              <div className="lg:col-span-6 xl:col-span-6">
                <div>
                  {/* Floating pill badge */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 rounded-full border border-sky-200/90 bg-white/90 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-primary shadow-xs backdrop-blur-md"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                    </span>
                    <span>Career Preparation Platform</span>
                  </motion.div>

                  {/* Visual 1 Exact Typography and Staggered Word Reveal */}
                  <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-[-0.035em] text-[#090d16] sm:text-6xl lg:text-6xl xl:text-7xl">
                    <StaggeredWords text="Turn Your Skills Into" delay={0.05} />{' '}
                    <br className="hidden sm:inline" />
                    <motion.span
                      initial={{ opacity: 0, filter: 'blur(8px)', y: 20 }}
                      animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                      transition={{ delay: 0.35, duration: 0.6 }}
                      className="inline-block text-[#2563eb]"
                    >
                      Your
                    </motion.span>{' '}
                    <motion.span
                      initial={{ opacity: 0, filter: 'blur(8px)', y: 20 }}
                      animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                      transition={{ delay: 0.45, duration: 0.6 }}
                      className="inline-block bg-gradient-to-r from-primary via-accent to-sky bg-clip-text text-transparent animate-pulse-slow"
                    >
                      Career Reality.
                    </motion.span>
                  </h1>

                  <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55, duration: 0.6 }}
                    className="mt-6 max-w-xl text-base leading-relaxed text-slate sm:text-lg"
                  >
                    SkillForge analyzes your resume, identifies missing skills for your target role, and provides a clear 30-day plan with practice labs to get you hired.
                  </motion.p>

                  {/* CTAs with Magnetic Pull (Visual 2 Pill Button Match) */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65, duration: 0.6 }}
                    className="mt-8 flex flex-wrap items-center gap-4"
                  >
                    <MagneticButton strength={0.3}>
                      <Link
                        to="/register"
                        className="btn-pill-sky !px-8 !py-3.5 text-base shadow-lg shadow-primary/25 flex items-center gap-2"
                      >
                        <span>Get Started</span>
                        <ArrowRight size={17} />
                      </Link>
                    </MagneticButton>

                    <MagneticButton strength={0.2}>
                      <a
                        href="#labs"
                        className="btn-pill-secondary !px-7 !py-3.5 text-sm flex items-center gap-2"
                      >
                        <span>Explore Labs</span>
                        <ArrowDown size={15} />
                      </a>
                    </MagneticButton>
                  </motion.div>

                  {/* Evidence Trust Badges */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.75, duration: 0.6 }}
                    className="mt-10 grid grid-cols-3 gap-3 border-t border-sky-200/60 pt-6 text-xs font-semibold text-slate"
                  >
                    <div className="flex items-center gap-2 text-navy">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span>Resume ATS Check</span>
                    </div>

                    <div className="flex items-center gap-2 text-navy">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span>Skill Gap Analysis</span>
                    </div>

                    <div className="flex items-center gap-2 text-navy">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span>Practice Lab & Plan</span>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Right Column: Visual 3 Interactive Candidate Intelligence Card */}
              <div className="lg:col-span-6 xl:col-span-6">
                <ScrollReveal delay={0.12}>
                  <InteractiveCandidateCard />
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>

        {/* Live Status Marquee */}
        <StudioLiveTicker />

        {/* ============================================================
            STUDIO METRICS ROW
            ============================================================ */}
        <section className="border-b border-sky-100 bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {STUDIO_METRICS.map((metric) => (
                <div
                  key={metric.label}
                  className="group relative rounded-2xl border border-sky-100/90 bg-[#f8fbff] p-6 transition-all duration-200 hover:border-sky-300 hover:bg-white hover:shadow-[0_10px_30px_-10px_rgba(2,132,199,0.15)]"
                >
                  <div className="font-mono text-3xl font-black tracking-tight text-primary sm:text-4xl">
                    {metric.value}
                  </div>
                  <div className="mt-2 text-sm font-bold text-navy">
                    {metric.label}
                  </div>
                  <div className="mt-1 text-xs text-slate leading-relaxed">
                    {metric.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================
            INTERACTIVE BENTO LABS (ATS Lab, Skill Graph, Practice Lab)
            ============================================================ */}
        <StudioBentoLabs />

        {/* ============================================================
            WORKFLOW: 3-STEP CANONICAL PROGRESSION
            ============================================================ */}
        <StudioWorkflow />

        {/* ============================================================
            RIGOR COMPARISON: GENERIC AI VS SKILLFORGE STUDIO
            ============================================================ */}
        <StudioComparison />

        {/* ============================================================
            STUDIO FAQ ACCORDION
            ============================================================ */}
        <StudioFAQ />

        {/* ============================================================
            FINAL CONVERSION CTA BANNER
            ============================================================ */}
        <StudioCTABanner />
      </main>

      {/* Studio Minimalist Architectural Footer */}
      <StudioFooter />
    </div>
  );
};

export default LandingPage;
