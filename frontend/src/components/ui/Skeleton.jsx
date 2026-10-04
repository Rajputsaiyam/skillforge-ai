import React from 'react';

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-lightSky rounded-lg ${className}`} />
);

export default Skeleton;
