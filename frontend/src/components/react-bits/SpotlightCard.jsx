import React, { useEffect, useRef } from 'react';
import './SpotlightCard.css';

// Adapted from React Bits Spotlight Card for this project's sky-blue light theme.
const SpotlightCard = ({
  children,
  className = '',
  spotlightColor = 'rgba(56, 189, 248, 0.18)',
  theme = 'light',
  ...props
}) => {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const move = (event) => {
      const rect = element.getBoundingClientRect();
      element.style.setProperty('--spotlight-x', `${event.clientX - rect.left}px`);
      element.style.setProperty('--spotlight-y', `${event.clientY - rect.top}px`);
      element.style.setProperty('--spotlight-opacity', '1');
    };
    const leave = () => element.style.setProperty('--spotlight-opacity', '0');

    element.addEventListener('pointermove', move);
    element.addEventListener('pointerleave', leave);
    return () => {
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerleave', leave);
    };
  }, []);

  const palette = theme === 'dark'
    ? { surface: '#0F172A', border: 'rgba(255,255,255,0.12)', shadow: '0 24px 48px -24px rgba(15,23,42,0.6)' }
    : { surface: '#FFFFFF', border: '#D7EAF5', shadow: '0 1px 2px rgba(2,132,199,0.08), 0 18px 40px -28px rgba(2,132,199,0.3)' };

  return (
    <div
      ref={ref}
      className={`reactbits-spotlight-card ${className}`}
      style={{ '--spotlight-color': spotlightColor, '--spotlight-surface': palette.surface, '--spotlight-border': palette.border, '--spotlight-shadow': palette.shadow }}
      {...props}
    >
      <span className="reactbits-spotlight-card__light" aria-hidden="true" />
      <span className="reactbits-spotlight-card__border" aria-hidden="true" />
      {children}
    </div>
  );
};

export default SpotlightCard;
