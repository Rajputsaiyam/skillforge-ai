import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, variant = 'primary', className = '', icon: Icon, ...props }) => {
  const base = variant === 'primary' ? 'btn-primary' : variant === 'secondary' ? 'btn-secondary' : 'btn-primary';
  return (
    <motion.button whileTap={{ scale: 0.97 }} className={`${base} ${className}`} {...props}>
      {Icon && <Icon size={17} />}
      {children}
    </motion.button>
  );
};

export default Button;
