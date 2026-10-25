import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';

const StudioFooter = () => {
  return (
    <footer className="border-t border-sky-100 bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Brand Col */}
          <div className="md:col-span-5">
            <Link to="/" className="inline-block">
              <Logo size={42} className="max-w-[136px]" />
            </Link>
            <p className="mt-4 max-w-sm text-sm text-slate leading-relaxed">
              SkillForge AI helps you analyze your resume for ATS screening, identify missing skills, practice technical questions, and follow a clear 30-day learning plan.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono font-semibold text-slate">
                SYSTEM STATUS: OPERATIONAL
              </span>
            </div>
          </div>

          {/* Links 1 */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-navy">Features</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate">
              <li><a href="#labs" className="hover:text-primary transition-colors">Resume ATS Check</a></li>
              <li><a href="#labs" className="hover:text-primary transition-colors">Skill Gap Breakdown</a></li>
              <li><a href="#labs" className="hover:text-primary transition-colors">Practice Questions</a></li>
              <li><a href="#labs" className="hover:text-primary transition-colors">30-Day Learning Plan</a></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-navy">Quick Links</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate">
              <li><Link to="/login" className="hover:text-primary transition-colors">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-primary transition-colors">Create Account</Link></li>
              <li><a href="#workflow" className="hover:text-primary transition-colors">How It Works</a></li>
              <li><a href="#faq" className="hover:text-primary transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Links 3 */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-navy">Privacy & Trust</h4>
            <p className="mt-4 text-xs text-slate leading-relaxed">
              Your resume and personal details are strictly private and secure. Your information is never sold or used for public AI training.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between border-t border-sky-100 pt-8 text-xs text-slate">
          <span>© {new Date().getFullYear()} SkillForge AI. All rights reserved.</span>
          <div className="mt-3 sm:mt-0 flex items-center gap-6">
            <Link to="/login" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/login" className="hover:text-primary transition-colors">Terms of Service</Link>
            <a href="#faq" className="hover:text-primary transition-colors">Help & FAQ</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default StudioFooter;
