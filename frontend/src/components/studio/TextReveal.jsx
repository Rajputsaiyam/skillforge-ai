import React from 'react';
import { motion } from 'framer-motion';

/**
 * High-fidelity staggered word reveal with blur-to-sharp animation.
 * Emulates the signature typography animation of Awwwards-featured design agencies.
 */
export const StaggeredWords = ({
  text,
  className = '',
  wordClassName = '',
  delay = 0,
}) => {
  const words = text.split(' ');

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: delay },
    }),
  };

  const child = {
    hidden: {
      opacity: 0,
      y: 28,
      filter: 'blur(10px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        type: 'spring',
        damping: 18,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.span
      variants={container}
      initial="hidden"
      animate="visible"
      className={`inline-block ${className}`}
    >
      {words.map((word, index) => (
        <motion.span
          variants={child}
          key={index}
          className={`inline-block mr-[0.28em] will-change-transform ${wordClassName}`}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
};

export default StaggeredWords;
