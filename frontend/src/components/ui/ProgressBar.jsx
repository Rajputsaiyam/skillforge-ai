import React from 'react';
import { motion } from 'framer-motion';

const colorFor = (value) => {
  if (value >= 75) return 'bg-success';
  if (value >= 45) return 'bg-primary';
  if (value >= 20) return 'bg-warning';
  return 'bg-danger';
};

const ProgressBar = ({ value = 0, label, showValue = true, colorClass, height = 'h-2.5' }) => (
  <div className="w-full">
    {(label || showValue) && (
      <div className="flex items-center justify-between mb-1.5 text-sm">
        {label && <span className="text-slate font-medium">{label}</span>}
        {showValue && <span className="text-navy font-semibold">{value}%</span>}
      </div>
    )}
    <div className={`w-full ${height} bg-lightSky rounded-full overflow-hidden`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={`${height} rounded-full ${colorClass || colorFor(value)}`}
      />
    </div>
  </div>
);

export default ProgressBar;
