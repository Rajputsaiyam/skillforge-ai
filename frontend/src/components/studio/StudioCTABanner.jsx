import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import StudioTiltCard from './StudioTiltCard';

import MagneticButton from './MagneticButton';

const StudioCTABanner = () => {
  return (
    <section className="relative py-20 sm:py-28 bg-white overflow-hidden">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <StudioTiltCard
          maxTilt={4}
          className="relative overflow-hidden rounded-3xl border border-sky-200/90 bg-gradient-to-br from-[#f0f7ff] via-white to-[#e8f4fd] p-8 sm:p-14 shadow-[0_25px_60px_-15px_rgba(2,132,199,0.22)]"
        >
          {/* Ambient Glow Orbs */}
          <div
            className="pointer-events-none absolute -right-20 -top-20 -z-10 h-72 w-72 rounded-full bg-sky-300/40 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-20 -z-10 h-72 w-72 rounded-full bg-blue-300/30 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3.5 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary shadow-2xs">
                <Sparkles size={13} /> Ready to Begin?
              </div>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#090d16] sm:text-5xl leading-tight">
                Prepare your resume and land your next role.
              </h2>
              <p className="mt-4 max-w-xl text-base text-slate sm:text-lg leading-relaxed">
                Check your resume against real job requirements, fill your skill gaps, and follow a clear 30-day plan to get interview-ready.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate">
                <span className="flex items-center gap-1.5 text-navy font-bold">
                  <ShieldCheck size={16} className="text-emerald-600" /> Free Resume Check
                </span>
                <span className="text-slate/40">·</span>
                <span className="flex items-center gap-1.5 text-navy font-bold">
                  <ShieldCheck size={16} className="text-emerald-600" /> No credit card required
                </span>
                <span className="text-slate/40">·</span>
                <span className="flex items-center gap-1.5 text-navy font-bold">
                  <ShieldCheck size={16} className="text-emerald-600" /> 100% Private & Secure
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col lg:items-end justify-center gap-4 lg:col-span-4">
              <MagneticButton strength={0.3}>
                <Link
                  to="/register"
                  className="btn-pill-sky !px-8 !py-3.5 text-base shadow-lg shadow-primary/30 text-center flex items-center justify-center gap-2"
                >
                  <span>Get Started Free</span>
                  <ArrowRight size={17} />
                </Link>
              </MagneticButton>

              <MagneticButton strength={0.2}>
                <Link
                  to="/login"
                  className="btn-pill-secondary !px-8 !py-3 text-sm text-center block"
                >
                  Sign In to Existing Account
                </Link>
              </MagneticButton>
            </div>
          </div>
        </StudioTiltCard>
      </div>
    </section>
  );
};

export default StudioCTABanner;
