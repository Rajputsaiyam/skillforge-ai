import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../components/ui/Logo';

const AuthLayout = ({ title, subtitle, children }) => (
  <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-4 py-10">
    <div className="w-full max-w-md">
      <Link to="/" className="flex items-center justify-center mb-8">
        <Logo size={100} className="max-w-[190px]" />
      </Link>
      <div className="card">
        <h1 className="text-2xl font-extrabold text-navy mb-1 text-center">{title}</h1>
        {subtitle && <p className="text-slate text-sm text-center mb-6">{subtitle}</p>}
        {children}
      </div>
    </div>
  </div>
);

export default AuthLayout;
