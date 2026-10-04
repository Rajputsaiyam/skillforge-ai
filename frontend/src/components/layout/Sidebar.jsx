import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Share2, ClipboardCheck, Target, Briefcase,
  ListChecks, Route as RouteIcon, TrendingUp, User, Settings, ChevronLeft, ChevronRight,
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
];

const NavItem = ({ item, collapsed }) => {
  const Icon = item.icon;
  return <NavLink end={item.to === '/dashboard'} to={item.to} title={collapsed ? item.label : undefined} className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}>
    <Icon size={18} strokeWidth={2.1} className="shrink-0" />
    {!collapsed && <span className="truncate">{item.label}</span>}
    {!collapsed && item.to === '/progress' && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
  </NavLink>;
};

const Sidebar = () => {
  const { sidebarCollapsed, setSidebarCollapsed } = useApp();
  const section = (label, items) => <div className="mb-5">
    {!sidebarCollapsed && <p className="nav-section-label">{label}</p>}
    <div className="space-y-1">{items.map((item) => <NavItem key={item.to} item={item} collapsed={sidebarCollapsed} />)}</div>
  </div>;

  return <aside className={`hidden md:flex sidebar-shell ${sidebarCollapsed ? 'w-[76px]' : 'w-[272px]'}`}>
    <div>
      <div className={`flex items-center border-b border-slate/15 ${sidebarCollapsed ? 'h-[76px] justify-center px-3' : 'h-[92px] justify-center px-4'}`}>
        <Logo size={sidebarCollapsed ? 42 : 72} className={sidebarCollapsed ? 'max-w-[46px] rounded-lg' : 'max-w-[150px]'} />
      </div>
      <nav className={`py-6 ${sidebarCollapsed ? 'px-3' : 'px-4'}`} aria-label="Main navigation">
        {section('Workspace', WORKSPACE_ITEMS)}
        {section('Career journey', CAREER_ITEMS)}
      </nav>
    </div>
    <div className={`mt-auto border-t border-slate/15 ${sidebarCollapsed ? 'p-3' : 'p-4'}`}>
      <NavLink to="/profile" title={sidebarCollapsed ? 'Profile' : undefined} className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}><User size={18} className="shrink-0" /> {!sidebarCollapsed && <span>Profile</span>}</NavLink>
      <NavLink to="/settings" title={sidebarCollapsed ? 'Settings' : undefined} className={({ isActive }) => `nav-item mt-1 ${isActive ? 'nav-item-active' : ''}`}><Settings size={18} className="shrink-0" /> {!sidebarCollapsed && <span>Settings</span>}</NavLink>
      <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="sidebar-collapse" aria-label={sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}>{sidebarCollapsed ? <ChevronRight size={17} /> : <><ChevronLeft size={17} /><span>Collapse sidebar</span></>}</button>
    </div>
  </aside>;
};

export default Sidebar;
