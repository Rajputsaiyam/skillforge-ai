import React from 'react';

const VARIANTS = {
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  primary: 'bg-primary/10 text-primary',
  neutral: 'bg-slate/10 text-slate',
};

const Badge = ({ children, variant = 'neutral', className = '' }) => (
  <span className={`badge ${VARIANTS[variant] || VARIANTS.neutral} ${className}`}>{children}</span>
);

export default Badge;
