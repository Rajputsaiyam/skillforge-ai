import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', hover = false, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay }}
    whileHover={hover ? { y: -4, boxShadow: '0 12px 28px -8px rgba(37,99,235,0.2)' } : undefined}
    className={`card ${className}`}
  >
    {children}
  </motion.div>
);

export default Card;
