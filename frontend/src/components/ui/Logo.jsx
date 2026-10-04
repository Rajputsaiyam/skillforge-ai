import React from 'react';
import logo from '../../assets/skillforge-logo.png';

/**
 * Shared SkillForge AI brand asset used across application layouts.
 */
const Logo = ({ size = 32, className = '' }) => (
  <img
    src={logo}
    alt="SkillForge AI — Learn, Practise, Grow, Get Hired"
    className={`w-auto object-contain ${className}`}
    style={{ height: size }}
  />
);

export default Logo;
