import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const CircularStat = ({ value = 0, label, size = 96, stroke = 9, colorClass = 'text-primary' }) => {
  const [display, setDisplay] = useState(0);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  useEffect(() => {
    let frame;
    let start = null;
    const duration = 900;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min(1, (ts - start) / duration);
      setDisplay(Math.round(progress * value));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} className="stroke-lightSky" fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          className={colorClass}
          stroke="currentColor"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      </svg>
      <div className="-mt-14 text-2xl font-bold text-navy">{display}%</div>
      {label && <div className="mt-4 text-sm text-slate font-medium text-center">{label}</div>}
    </div>
  );
};

export default CircularStat;
