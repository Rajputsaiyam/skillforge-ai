import React, { useState } from 'react';
import { Search, Bell, LogOut, ChevronDown, Command } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import Logo from '../ui/Logo';

const pageTitle = (pathname) => ({
  '/dashboard': 'Overview', '/resume': 'Resume Studio', '/skill-graph': 'Skill Graph', '/assessment': 'Practice Lab',
  '/skill-gaps': 'Skill Gaps', '/roadmap': 'Learning Plan', '/progress': 'Progress', '/jobs': 'Jobs', '/applications': 'Applications',
}[pathname] || 'SkillForge AI');

const Topbar = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return <header className="topbar-shell">
    <div className="flex items-center min-w-0 gap-3">
      <div className="md:hidden flex items-center"><Logo size={42} className="max-w-[80px]" /></div>
      <div className="hidden md:block"><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate/55">Career workspace</p><p className="text-sm font-bold text-navy">{pageTitle(pathname)}</p></div>
    </div>
    <label className="hidden lg:flex topbar-search" aria-label="Search"><Search size={17} /><input placeholder="Search skills, jobs, or companies" /><kbd><Command size={11} /> K</kbd></label>
    <div className="flex items-center gap-2 sm:gap-3 ml-auto">
      <button className="topbar-icon" aria-label="Notifications"><Bell size={19} /><span /></button>
      <div className="relative">
        <button onClick={() => setMenuOpen((open) => !open)} className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-1 sm:pr-2 hover:bg-veryLightBlue transition-colors" aria-expanded={menuOpen}>
          <div className="w-9 h-9 rounded-xl bg-blue-gradient flex items-center justify-center text-white text-sm font-bold shadow-sm">{user?.fullName?.charAt(0) || 'U'}</div>
          <span className="hidden sm:block max-w-[130px] truncate text-sm font-bold text-navy">{user?.fullName || 'Your profile'}</span><ChevronDown size={15} className="hidden sm:block text-slate" />
        </button>
        {menuOpen && <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-cardHover border border-slate/10 p-1.5 z-50"><button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-danger hover:bg-danger/5"><LogOut size={16} /> Log out</button></div>}
      </div>
    </div>
  </header>;
};

export default Topbar;
