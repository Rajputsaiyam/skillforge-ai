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

    {/* Hero */}
    <section className="bg-hero-gradient">
      <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <span className="badge bg-lightSky text-primary mb-5">AI-Powered Career Intelligence</span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-navy leading-tight mb-5">
            Turn Your Skills Into Your Career Roadmap.
          </h1>
          <p className="text-slate text-lg mb-8 max-w-lg">
            SkillForge AI analyzes your resume, evaluates your skills, matches you with real opportunities, identifies your skill gaps and creates a personalized path to your target career.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/register" className="btn-primary">Analyze My Resume <ArrowRight size={16} /></Link>
            <Link to="/register" className="btn-secondary">Explore Jobs</Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative"
        >
          <div className="card !p-5 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate uppercase">Career Readiness</span>
              <span className="text-2xl font-extrabold text-primary">78%</span>
            </div>
            <div className="h-2 bg-lightSky rounded-full overflow-hidden mb-5">
              <motion.div className="h-2 bg-blue-gradient rounded-full" initial={{ width: 0 }} animate={{ width: '78%' }} transition={{ duration: 1.2 }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[{ l: 'React', v: 82 }, { l: 'Node.js', v: 74 }].map((s) => (
                <div key={s.l} className="bg-veryLightBlue rounded-xl p-3">
                  <p className="text-xs text-slate">{s.l}</p>
                  <p className="font-bold text-navy">{s.v}%</p>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-lightSky rounded-xl p-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-navy">91% Match — Full Stack Developer</span>
              <CheckCircle2 size={18} className="text-success" />
            </div>
          </div>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-6 -right-6 w-16 h-16 rounded-2xl bg-blue-gradient opacity-90 -z-0"
          />
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-8 -left-6 w-20 h-20 rounded-full bg-sky/20 -z-0"
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
