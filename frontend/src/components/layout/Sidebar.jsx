import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Share2, ClipboardCheck, Target, Briefcase,
  ListChecks, Route as RouteIcon, TrendingUp, User, Settings, ChevronLeft, ChevronRight,
  Sparkles, Mail,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Logo from '../ui/Logo';

const WORKSPACE_ITEMS = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/resume', label: 'Resume Studio', icon: FileText, badge: 'ATS' },
  { to: '/skill-graph', label: 'Skill Graph', icon: Share2 },
  { to: '/assessment', label: 'Practice Lab', icon: ClipboardCheck, badge: 'AI' },
];

const CAREER_ITEMS = [
  { to: '/skill-gaps', label: 'Skill Gaps', icon: Target },
  { to: '/roadmap', label: 'Learning Plan', icon: RouteIcon },
  { to: '/progress', label: 'Progress', icon: TrendingUp, hasDot: true },
  { to: '/jobs', label: 'Jobs', icon: Briefcase },
  { to: '/applications', label: 'Applications', icon: ListChecks },
  { to: '/cold-email', label: 'Cold Email', icon: Mail, badge: '10 Max' },
];

const NavItem = ({ item, collapsed }) => {
  const Icon = item.icon;
  return (
    <NavLink
      end={item.to === '/dashboard'}
      to={item.to}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        `relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200 group ${
          isActive
            ? 'bg-gradient-to-r from-primary/10 via-primary/5 to-transparent text-primary font-bold shadow-xs'
            : 'text-slate-600 hover:bg-veryLightBlue hover:text-navy'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-primary shadow-glow" />
          )}
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
              isActive ? 'bg-primary text-white shadow-xs shadow-primary/30' : 'text-slate group-hover:text-primary'
            }`}
          >
            <Icon size={16} strokeWidth={isActive ? 2.3 : 2} />
          </div>
          {!collapsed && (
            <span className="truncate flex-1 tracking-tight text-[13px]">{item.label}</span>
          )}
          {!collapsed && item.badge && (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-primary/10 text-primary border border-primary/20 shrink-0">
              {item.badge}
            </span>
          )}
          {!collapsed && item.hasDot && (
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0 ml-auto" />
          )}
        </>
      )}
    </NavLink>
  );
};

const Sidebar = () => {
  const { sidebarCollapsed, setSidebarCollapsed } = useApp();

  const section = (label, items) => (
    <div className="mb-5">
      {!sidebarCollapsed && (
        <p className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate/40 flex items-center justify-between">
          <span>{label}</span>
        </p>
      )}
      <div className="space-y-1">
        {items.map((item) => (
          <NavItem key={item.to} item={item} collapsed={sidebarCollapsed} />
        ))}
      </div>
    </div>
  );

  return (
    <aside
      className={`hidden md:flex flex-col shrink-0 sticky top-0 h-screen bg-white/95 backdrop-blur-xl border-r border-slate/15 transition-[width] duration-300 ease-out z-20 ${
        sidebarCollapsed ? 'w-[76px]' : 'w-[264px]'
      }`}
    >
      <div>
        <div
          className={`flex items-center border-b border-slate/10 ${
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

      <div className={`mt-auto border-t border-slate/10 ${sidebarCollapsed ? 'p-2.5' : 'p-3.5'} space-y-1`}>
        <NavLink
          to="/profile"
          title={sidebarCollapsed ? 'Profile' : undefined}
          className={({ isActive }) =>
            `relative flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              isActive ? 'bg-primary/10 text-primary font-bold' : 'text-slate-600 hover:bg-veryLightBlue hover:text-navy'
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
              isActive ? 'bg-primary/10 text-primary font-bold' : 'text-slate-600 hover:bg-veryLightBlue hover:text-navy'
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
