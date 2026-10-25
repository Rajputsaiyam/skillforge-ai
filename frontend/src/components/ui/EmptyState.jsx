import React from 'react';
import Button from './Button';

const EmptyState = ({ icon: Icon, title, description, ctaLabel, onCta }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-6">
    {Icon && (
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-slate/20 bg-white">
        <Icon size={26} className="text-primary" />
      </div>
    )}
    <h3 className="font-bold text-navy text-lg mb-1">{title}</h3>
    {description && <p className="text-slate text-sm max-w-sm mb-5">{description}</p>}
    {ctaLabel && <Button onClick={onCta}>{ctaLabel}</Button>}
  </div>
);

export default EmptyState;
