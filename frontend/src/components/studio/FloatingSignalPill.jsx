import React from 'react';
import { motion } from 'framer-motion';

/**
 * Floating glassmorphic micro-badge that gently hovers and reacts to interaction.
 */
const FloatingSignalPill = ({
  icon: Icon,
  label,
  value,
  className = '',
  floatDuration = 5,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 15 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [-4, 5, -4],
      }}
      transition={{
        opacity: { duration: 0.5, delay },
        scale: { duration: 0.5, delay },
        y: {
          duration: floatDuration,
          repeat: Infinity,
          ease: 'easeInOut',
          delay,
        },
      }}
      whileHover={{ scale: 1.06, y: -2 }}
      className={`absolute z-20 flex items-center gap-2.5 rounded-full border border-sky-200/90 bg-white/95 px-3.5 py-1.5 shadow-[0_12px_28px_-6px_rgba(2,132,199,0.22)] backdrop-blur-xl ${className}`}
    >
      {Icon && (
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-primary">
          <Icon size={12} strokeWidth={2.5} />
        </div>
      )}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-navy">
        <span>{label}</span>
        {value && <strong className="text-primary font-mono">{value}</strong>}
      </div>
    </motion.div>
  );
};

export default FloatingSignalPill;
