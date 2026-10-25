import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../components/ui/Logo';
import GrainGradientCanvas from '../../components/studio/GrainGradientCanvas';

const AuthLayout = ({ title, subtitle, children }) => (
  <div className="relative flex min-h-screen items-center justify-center bg-[#f8fbff] px-4 py-12 overflow-hidden">
    {/* Ambient studio canvas */}
    <div className="absolute inset-0 pointer-events-none opacity-40">
      <GrainGradientCanvas />
    </div>

    <div className="relative z-10 w-full max-w-md">
      <Link to="/" className="flex items-center justify-center mb-8 transition-transform hover:scale-105">
        <Logo size={48} className="max-w-[150px]" />
      </Link>
      <div className="studio-card p-8 sm:p-9 border border-sky-200/80 shadow-[0_20px_50px_-20px_rgba(2,132,199,0.2)] bg-white/95 backdrop-blur-md">
        <h1 className="text-center text-2xl font-extrabold tracking-tight text-[#090d16]">{title}</h1>
        {subtitle && <p className="mb-6 mt-1 text-center text-sm text-slate">{subtitle}</p>}
        {children}
      </div>
    </div>
  </div>
);

export default AuthLayout;
