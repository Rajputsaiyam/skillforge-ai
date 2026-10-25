import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Share2, ClipboardCheck, Route, TrendingUp } from 'lucide-react';

const ITEMS = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/skill-graph', label: 'Skills', icon: Share2 },
  { to: '/assessment', label: 'Practice', icon: ClipboardCheck },
  { to: '/roadmap', label: 'Plan', icon: Route },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
];

const MobileNav = () => <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate/20 bg-white px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 md:hidden" aria-label="Mobile navigation">
  <div className="mx-auto flex max-w-lg justify-around">
    {ITEMS.map(({ to, label, icon: Icon }) => (
      <NavLink key={to} to={to} end={to === '/dashboard'} className={({ isActive }) => `flex min-w-[54px] flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold transition-colors ${isActive ? 'bg-lightSky text-primary' : 'text-slate'}`}>
        {({ isActive }) => <><Icon size={18} strokeWidth={isActive ? 2.2 : 1.9} /><span>{label}</span></>}
      </NavLink>
    ))}
  </div>
</nav>;

export default MobileNav;
