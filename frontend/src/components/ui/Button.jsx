import React from 'react';

const Button = ({ children, variant = 'primary', className = '', icon: Icon, ...props }) => {
  const base = variant === 'primary' ? 'btn-primary' : variant === 'secondary' ? 'btn-secondary' : 'btn-primary';
  return (
    <button className={`${base} ${className}`} {...props}>
      {Icon && <Icon size={17} />}
      {children}
    </button>
  );
};

export default Button;
