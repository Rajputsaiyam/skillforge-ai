import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, FileText, Share2, Target, Briefcase, Route as RouteIcon,
  ArrowRight, CheckCircle2,
} from 'lucide-react';

const NAV = ['Features', 'How It Works', 'Job Search', 'Skill Graph', 'Pricing', 'About'];

const STEPS = [
  { n: '01', title: 'Upload Resume', desc: 'Drop in your PDF or DOCX and let AI take over.' },
  { n: '02', title: 'AI Understands Your Skills', desc: 'NLP extracts and scores your real skill set.' },
  { n: '03', title: 'Discover Your Skill Gaps', desc: 'See exactly what stands between you and your goal.' },
  { n: '04', title: 'Find Matching Jobs', desc: 'Real listings ranked by an explainable match score.' },
  { n: '05', title: 'Follow Your Personalized Roadmap', desc: 'A week-by-week plan built around your gaps.' },
];

const FEATURES = [
  { icon: FileText, title: 'AI Resume Parser', desc: 'Upload PDF/DOCX and extract skills, education, experience, projects and certifications automatically.' },
  { icon: Share2, title: 'Skill Graph', desc: 'An interactive visualization of your current skills, prerequisites, related skills and gaps.' },
  { icon: Target, title: 'AI Skill Gap Analysis', desc: 'Current level vs required level, with clear priority ranking for what to learn next.' },
  { icon: Briefcase, title: 'Real Job Search', desc: 'Search jobs through a pluggable provider architecture — ready for LinkedIn and other sources.' },
  { icon: Sparkles, title: 'AI Job Match', desc: 'A transparent, explainable match score built from your actual skill vector — not a black box.' },
  { icon: RouteIcon, title: 'Personalized Roadmap', desc: 'A generated learning path based on your current skills, target role and real job requirements.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08 } }),
};

import Logo from '../../components/ui/Logo';

const LandingPage = () => (
  <div className="bg-white">
    {/* Header */}
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-2">
        <div className="flex items-center">
          <Logo size={68} className="max-w-[145px]" />
        </div>
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate">
          {NAV.map((n) => <a key={n} href="#" className="hover:text-primary transition-colors">{n}</a>)}
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-semibold text-navy hover:text-primary transition-colors">Sign In</Link>
          <Link to="/register" className="btn-primary !py-2 !px-4 text-sm">Get Started</Link>
        </div>
      </div>
    </header>

    {/* Hero Section with Ambient Glow */}
    <section className="relative overflow-hidden bg-radial-glow pt-12 pb-24 border-b border-slate/10">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-primary/10 rounded-full blur-3xl pointer-events-none -z-0"></div>

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary mb-6 shadow-2xs">
            <Sparkles size={13} className="text-primary animate-pulse" />
            <span>Next-Generation Career Intelligence & AI</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-navy leading-[1.12] tracking-tight mb-6">
            Turn Your Skills Into Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-sky to-accent">Career Reality.</span>
          </h1>

          <p className="text-slate-600 text-base sm:text-lg mb-8 max-w-lg leading-relaxed font-normal">
            SkillForge AI audits your resume for ATS algorithms, benchmarks your skills with Sentence-BERT, maps interactive skill graphs, and guides your mock interview loops with live voice.
          </p>

          <div className="flex flex-wrap items-center gap-3.5">
            <Link to="/register" className="btn-primary !px-6 !py-3 text-sm shadow-lg shadow-primary/25">
              Launch Career Lab <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="btn-secondary !px-6 !py-3 text-sm">
              Explore Live Demo
            </Link>
          </div>

          <div className="mt-8 flex items-center gap-6 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-500" /> Profile-Grounded AI Coach
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-500" /> Workday/Taleo ATS Audit
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-500" /> Real-time Voice Mock
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative"
        >
          <div className="glass-card !p-6 sm:!p-8 relative z-10 border border-white/80 shadow-2xl rounded-3xl bg-white/90">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate/10">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Candidate Intelligence</span>
                <span className="text-sm font-bold text-navy">Full Stack Engineer Benchmark</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-primary">82%</span>
                <span className="text-[11px] font-bold text-emerald-600 block">Job Ready</span>
              </div>
            </div>

            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-5 p-0.5">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '82%' }}
                transition={{ duration: 1.2 }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { l: 'React & Ecosystem', v: '91%', tag: 'Verified' },
                { l: 'Node.js & MongoDB', v: '85%', tag: 'Verified' },
                { l: 'System Design', v: '68%', tag: 'Target Gap' },
                { l: 'Docker & CI/CD', v: '60%', tag: 'Target Gap' },
              ].map((s) => (
                <div key={s.l} className="bg-slate-50/80 border border-slate/15 rounded-2xl p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-semibold text-slate-600 truncate">{s.l}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${s.tag === 'Verified' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{s.tag}</span>
                  </div>
                  <p className="font-extrabold text-navy text-sm">{s.v}</p>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-transparent border border-primary/20 rounded-2xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-navy block">ATS Audit Score: 88/100</span>
                <span className="text-[11px] text-slate-500">Google X-Y-Z Quantified Impact Verified</span>
              </div>
              <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
            </div>
          </div>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-6 -right-6 w-20 h-20 rounded-3xl bg-blue-gradient opacity-80 blur-xl -z-0"
          />
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-8 -left-6 w-24 h-24 rounded-full bg-accent/25 blur-2xl -z-0"
          />
        </motion.div>
      </div>
    </section>

    {/* How it works */}
    <section className="max-w-7xl mx-auto px-6 py-20">
      <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-3xl font-extrabold text-navy text-center mb-2">
        How It Works
      </motion.h2>
      <p className="text-slate text-center mb-12">Know where you are. Know where you need to go. Let AI build the path.</p>
      <div className="grid md:grid-cols-5 gap-5">
        {STEPS.map((s, i) => (
          <motion.div key={s.n} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="card !p-5 text-center">
            <div className="text-3xl font-extrabold text-lightSky mb-2">{s.n}</div>
            <h3 className="font-bold text-navy text-sm mb-1.5">{s.title}</h3>
            <p className="text-xs text-slate">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>

    {/* Features */}
    <section className="bg-veryLightBlue/60 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-3xl font-extrabold text-navy text-center mb-12">
          Everything You Need to Own Your Career
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div key={title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="card !p-6" whileHover={{ y: -4 }}>
              <div className="w-11 h-11 rounded-xl bg-blue-gradient flex items-center justify-center mb-4">
                <Icon size={20} className="text-white" />
              </div>
              <h3 className="font-bold text-navy mb-2">{title}</h3>
              <p className="text-sm text-slate">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="max-w-5xl mx-auto px-6 py-20 text-center">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="rounded-3xl bg-blue-gradient p-12 text-white">
        <h2 className="text-3xl font-extrabold mb-3">Your career, mapped by intelligence.</h2>
        <p className="text-white/85 mb-7 max-w-xl mx-auto">Understand your skills. Discover your gaps. Find your opportunities. Build your future.</p>
        <Link to="/register" className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-6 py-3 rounded-xl hover:-translate-y-0.5 transition-transform">
          Get Started Free <ArrowRight size={16} />
        </Link>
      </motion.div>
    </section>

    <footer className="border-t border-slate/10 py-8 text-center text-sm text-slate">
      <Logo size={72} className="max-w-[150px] mx-auto mb-1" />
      © {new Date().getFullYear()} SkillForge AI. All rights reserved.
    </footer>
  </div>
);

export default LandingPage;
