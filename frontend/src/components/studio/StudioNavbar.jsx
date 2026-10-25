import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Menu, X, Sparkles, Activity } from 'lucide-react';
import Logo from '../ui/Logo';

import MagneticButton from './MagneticButton';

const NAV_LINKS = [
  { label: 'Features', href: '#labs' },
  { label: 'How It Works', href: '#workflow' },
  { label: 'Comparison', href: '#comparison' },
  { label: 'FAQ', href: '#faq' },
];

const StudioNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-sky-100/80 bg-white/85 py-3 shadow-[0_8px_30px_rgb(2,132,199,0.06)] backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent py-5'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8">
        {/* Logo and Brand */}
        <Link to="/" aria-label="SkillForge AI" className="flex items-center gap-3 group">
          <Logo size={40} className="max-w-[136px] transition-transform duration-200 group-hover:scale-105" />
        </Link>

        {/* Center Desktop Navigation */}
        <nav
          className="hidden items-center gap-7 rounded-full border border-sky-100/90 bg-white/70 px-6 py-2 shadow-sm backdrop-blur-md md:flex"
          aria-label="Studio navigation"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs font-semibold tracking-wide text-slate transition-colors hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Action Cluster (Visual 2 Match) */}
        <div className="hidden items-center gap-4 md:flex">
          {/* Visual 2 "Sign In" text */}
          <Link
            to="/login"
            className="text-sm font-semibold tracking-tight text-[#090d16] transition-colors hover:text-primary"
          >
            Sign In
          </Link>

          {/* Visual 2 "Get Started" glowing sky gradient pill button with Magnetic Pull */}
          <MagneticButton strength={0.25}>
            <Link
              to="/register"
              className="btn-pill-sky group flex items-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </MagneticButton>
        </div>

        {/* Mobile Hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <Link to="/register" className="btn-pill-sky !px-4 !py-2 text-xs">
            Get Started
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-sky-100 bg-white text-navy shadow-sm"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-b border-sky-100 bg-white/95 px-6 py-6 shadow-xl backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-base font-semibold text-navy transition-colors hover:text-primary"
              >
                {link.label}
              </a>
            ))}
            <hr className="my-2 border-sky-100" />
            <div className="flex flex-col gap-3">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="text-center font-semibold text-navy py-2 hover:text-primary"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="btn-pill-sky text-center"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default StudioNavbar;
