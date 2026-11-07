import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Share2, ClipboardCheck, Target, Briefcase,
  ListChecks, Route as RouteIcon, TrendingUp, User, Settings, ChevronLeft, ChevronRight,
  Mail, Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Logo from '../ui/Logo';

const WORKSPACE_ITEMS = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/resume', label: 'Resume Studio', icon: FileText },
  { to: '/skill-graph', label: 'Skill Graph', icon: Share2 },
  { to: '/assessment', label: 'Practice Lab', icon: ClipboardCheck },
];

const CAREER_ITEMS = [
  { to: '/skill-gaps', label: 'Skill Gaps', icon: Target },
  { to: '/roadmap', label: 'Learning Plan', icon: RouteIcon },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/jobs', label: 'Jobs', icon: Briefcase },
  { to: '/applications', label: 'Applications', icon: ListChecks },
  { to: '/cold-email', label: 'Cold Email', icon: Mail, locked: true },
];

const NavItem = ({ item, collapsed, isLocked }) => {
  const Icon = item.icon;
  const locked = Boolean(isLocked ?? item.locked);
  const { showToast } = useApp() || {};

  if (locked) {
    return (
      <button
        type="button"
        onClick={() => {
          if (showToast) {
            showToast(`${item.label} is locked by administrator.`, 'warning');
          }
        }}
        title={collapsed ? `${item.label} (Locked)` : undefined}
        className="w-full relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 text-slate-400 hover:bg-slate-50/80 border border-transparent cursor-not-allowed text-left group"
      >
        <div className="relative flex w-5 shrink-0 items-center justify-center text-slate-400">
          <Icon size={17} strokeWidth={1.9} />
          {collapsed && (
            <span className="absolute -top-1 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-100 text-amber-700 border border-amber-300">
              <Lock size={8} strokeWidth={2.5} />
            </span>
          )}
        </div>
        {!collapsed && (
          <span className="truncate flex-1">{item.label}</span>
        )}
        {!collapsed && (
          <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full shadow-2xs">
            <Lock size={9} strokeWidth={2.5} />
            <span>Locked</span>
          </span>
        )}
      </button>
    );
  }

  return (
    <NavLink
      end={item.to === '/dashboard'}
      to={item.to}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        `relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group ${
          isActive
            ? 'bg-sky-50/90 text-primary font-bold shadow-xs border border-sky-200/80'
            : 'text-slate hover:bg-[#f0f7ff]/80 hover:text-navy border border-transparent'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div
            className={`flex w-5 shrink-0 items-center justify-center transition-colors ${
              isActive ? 'text-primary' : 'text-slate'
            }`}
          >
            <Icon size={17} strokeWidth={isActive ? 2.4 : 1.9} />
          </div>
          {!collapsed && (
            <span className="truncate flex-1">{item.label}</span>
          )}
          {isActive && !collapsed && (
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          )}
        </>
      )}
    </NavLink>
  );
};

const Sidebar = () => {
  const { sidebarCollapsed, setSidebarCollapsed, coldEmailLocked } = useApp();

  const section = (label, items) => (
    <div className="mb-5">
      {!sidebarCollapsed && (
        <p className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate/40 flex items-center justify-between">
          <span>{label}</span>
        </p>
      )}
      <div className="space-y-1">
        {items.map((item) => (
          <NavItem
            key={item.to}
            item={item}
            collapsed={sidebarCollapsed}
            isLocked={item.to === '/cold-email' ? (coldEmailLocked ?? true) : item.locked}
          />
        ))}
      </div>
    </div>
  );

  return (
    <aside
      className={`hidden md:flex flex-col shrink-0 sticky top-0 h-screen bg-white border-r border-slate/20 transition-[width] duration-150 z-20 ${
        sidebarCollapsed ? 'w-[76px]' : 'w-[264px]'
      }`}
    >
      <div>
        <div
            className={`flex items-center border-b border-slate/20 ${
            sidebarCollapsed ? 'h-[76px] justify-center px-3' : 'h-[84px] justify-between px-5'
          }`}
        >
          <Logo
            size={sidebarCollapsed ? 38 : 64}
            className={sidebarCollapsed ? 'max-w-[42px] rounded-lg' : 'max-w-[140px]'}
          />
        </div>
        <nav className={`py-5 ${sidebarCollapsed ? 'px-2.5' : 'px-3.5'}`} aria-label="Main navigation">
          {section('Workspace', WORKSPACE_ITEMS)}
          {section('Career Journey', CAREER_ITEMS)}
        </nav>
      </div>

      <div className={`mt-auto border-t border-slate/20 ${sidebarCollapsed ? 'p-2.5' : 'p-3.5'} space-y-1`}>
        <NavLink
          to="/profile"
          title={sidebarCollapsed ? 'Profile' : undefined}
          className={({ isActive }) =>
            `relative flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              isActive ? 'bg-lightSky text-primary font-semibold' : 'text-slate hover:bg-veryLightBlue hover:text-navy'
            }`
          }
        >
          <User size={16} className="shrink-0" />
          {!sidebarCollapsed && <span className="text-[13px]">Profile</span>}
        </NavLink>

        <NavLink
          to="/settings"
          title={sidebarCollapsed ? 'Settings' : undefined}
          className={({ isActive }) =>
            `relative flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              isActive ? 'bg-lightSky text-primary font-semibold' : 'text-slate hover:bg-veryLightBlue hover:text-navy'
            }`
          }
        >
          <Settings size={16} className="shrink-0" />
          {!sidebarCollapsed && <span className="text-[13px]">Settings</span>}
        </NavLink>

        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-navy transition-colors"
          aria-label={sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          {sidebarCollapsed ? (
            <ChevronRight size={16} />
          ) : (
            <>
              <ChevronLeft size={16} />
              <span className="text-[11px] font-bold">Collapse sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
