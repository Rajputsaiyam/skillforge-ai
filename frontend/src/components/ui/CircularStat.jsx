import React from 'react';

const CircularStat = ({ value = 0, label, size = 96, stroke = 9, colorClass = 'text-primary' }) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} className="stroke-lightSky" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          className={colorClass}
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="-mt-14 text-2xl font-bold text-navy">{Math.round(value)}%</div>
      {label && <div className="mt-4 text-sm text-slate font-medium text-center">{label}</div>}
    </div>
  );
};

export default CircularStat;
