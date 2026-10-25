import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, LogOut, ChevronDown, Command, User, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Logo from '../ui/Logo';

const PAGE_TITLES = {
  '/dashboard': 'Executive Overview',
  '/resume': 'Resume Studio & ATS Audit',
  '/skill-graph': 'Interactive Skill Graph',
  '/assessment': 'Practice Lab & Mock Interview',
  '/skill-gaps': 'Target Role Gap Analysis',
  '/roadmap': '30-Day Learning Plan',
  '/progress': 'Career Readiness Progress',
  '/jobs': 'AI Job Matching',
  '/applications': 'Job Application Tracker',
  '/cold-email': 'Automated Cold Email Studio',
  '/profile': 'Candidate Profile',
  '/settings': 'System Settings',
};

const Topbar = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentTitle = PAGE_TITLES[pathname] || 'SkillForge AI';

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between gap-4 border-b border-slate/20 bg-white px-4 md:px-8">
      {/* Page Title & Breadcrumb */}
      <div className="flex items-center min-w-0 gap-3">
        <div className="md:hidden flex items-center">
          <Logo size={36} className="max-w-[70px]" />
        </div>
          <div className="hidden md:block">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate/70">
            Career workspace
          </div>
          <h1 className="mt-0.5 truncate text-base font-bold tracking-tight text-navy">
            {currentTitle}
          </h1>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
          <div
          className={`relative flex w-full items-center gap-2.5 rounded-lg border px-3.5 py-2 transition-colors duration-150 ${
            searchFocused
              ? 'border-primary bg-white ring-2 ring-primary/10'
              : 'border-slate/20 bg-veryLightBlue hover:border-slate/35'
          }`}
        >
          <Search size={16} className={searchFocused ? 'text-primary' : 'text-slate-400'} />
          <input
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search skills, verified projects, or matched jobs..."
            className="w-full text-xs font-medium text-navy placeholder:text-slate-400 bg-transparent outline-none"
          />
          <kbd className="inline-flex items-center gap-0.5 rounded-md border border-slate/20 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-500 shadow-2xs">
            <Command size={10} /> K
          </kbd>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 ml-auto">
        <button
          className="relative grid h-9 w-9 place-items-center rounded-lg text-slate hover:bg-veryLightBlue hover:text-navy transition-colors"
          aria-label="Notifications"
          title="Activity Notifications"
        >
          <Bell size={18} />
        </button>

        {/* User Profile Flyout */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2.5 rounded-lg border border-transparent py-1.5 pl-1.5 pr-3 transition-colors hover:border-slate/20 hover:bg-veryLightBlue"
            aria-expanded={menuOpen}
          >
            <div className="relative">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-extrabold text-navy leading-tight truncate max-w-[120px]">
                {user?.fullName || 'User'}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold truncate max-w-[120px]">
                {user?.targetRole || 'Pro Member'}
              </span>
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
             <div className="absolute right-0 z-50 mt-2 w-60 rounded-lg border border-slate/20 bg-white p-2 shadow-card">
              <div className="px-3 py-2.5 border-b border-slate/10 mb-1">
                <p className="text-xs font-extrabold text-navy leading-tight">{user?.fullName}</p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{user?.email}</p>
                <p className="mt-2 text-[10px] font-semibold text-primary">{user?.targetRole || 'General Engineering'}</p>
              </div>

              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-navy transition-colors"
              >
                <User size={15} className="text-primary" /> Profile Overview
              </Link>

              <Link
                to="/settings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-navy transition-colors"
              >
                <Settings size={15} className="text-slate-500" /> Account Settings
              </Link>

              <div className="border-t border-slate/10 my-1 pt-1">
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut size={15} /> Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
