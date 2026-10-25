import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

/**
 * Ambient ethereal cursor glow that softly tracks mouse movement across the page.
 * Creates physical atmosphere without impacting performance or touch devices.
 */
const StudioCursorGlow = () => {
  const [visible, setVisible] = useState(false);

  const springConfig = { damping: 28, stiffness: 140, mass: 0.6 };
  const mouseX = useSpring(-500, springConfig);
  const mouseY = useSpring(-500, springConfig);

  useEffect(() => {
    // Only enable for pointer devices that support hover
    if (window.matchMedia('(hover: none)').matches) return;

    const handlePointerMove = (e) => {
      mouseX.set(e.clientX - 225);
      mouseY.set(e.clientY - 225);
      if (!visible) setVisible(true);
    };

    const handlePointerLeave = () => {
      setVisible(false);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', handlePointerLeave);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <motion.div
      style={{ x: mouseX, y: mouseY }}
      className="pointer-events-none fixed top-0 left-0 z-30 h-[450px] w-[450px] rounded-full opacity-60 mix-blend-multiply blur-[90px] will-change-transform"
      aria-hidden="true"
    >
      <div className="h-full w-full rounded-full bg-gradient-to-br from-sky-300/40 via-sky-400/25 to-blue-400/20" />
    </motion.div>
  );
};

export default StudioCursorGlow;
