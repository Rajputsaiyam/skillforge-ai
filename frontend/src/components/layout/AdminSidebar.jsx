import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Sparkles, ClipboardList, Briefcase,
  BarChart3, Activity, Settings,
} from 'lucide-react';
import Logo from '../ui/Logo';

const ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/skills', label: 'Skills', icon: Sparkles },
  { to: '/admin/jobs', label: 'Jobs', icon: Briefcase },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/activity', label: 'Activity Logs', icon: Activity },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

const AdminSidebar = () => (
  <aside className="hidden md:flex flex-col w-64 border-r border-slate/10 bg-navy text-white h-screen sticky top-0">
    <div className="h-20 flex items-center justify-center px-4 border-b border-white/10 bg-white">
      <Logo size={64} className="max-w-[138px]" />
    </div>
    <nav className="p-3 space-y-1 flex-1">
      {ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isActive ? 'bg-white/10 text-sky' : 'text-white/70 hover:bg-white/5 hover:text-white'
            }`
          }
        >
          <Icon size={19} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  </aside>
);

export default AdminSidebar;
