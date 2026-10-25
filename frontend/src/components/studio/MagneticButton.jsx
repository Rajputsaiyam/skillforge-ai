import React, { useRef, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

/**
 * Magnetic button that pulls gently toward the cursor on hover with spring physics.
 * Signature micro-interaction found on boutique design studios like Dopamine Studio.
 */
const MagneticButton = ({
  children,
  className = '',
  strength = 0.28,
  onClick,
  ...props
}) => {
  const ref = useRef(null);

  const springConfig = { damping: 15, stiffness: 180, mass: 0.1 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  const [shinePos, setShinePos] = useState({ x: 50, y: 50, opacity: 0 });

  const handlePointerMove = (e) => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const pullX = (e.clientX - centerX) * strength;
    const pullY = (e.clientY - centerY) * strength;

    x.set(pullX);
    y.set(pullY);

    setShinePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      opacity: 0.6,
    });
  };

  const handlePointerLeave = () => {
    x.set(0);
    y.set(0);
    setShinePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={onClick}
      className="inline-block relative will-change-transform"
    >
      <div className={`relative overflow-hidden ${className}`} {...props}>
        {/* Specular pointer reflection */}
        <span
          className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
          style={{
            opacity: shinePos.opacity,
            background: `radial-gradient(circle 80px at ${shinePos.x}% ${shinePos.y}%, rgba(255, 255, 255, 0.45), transparent 75%)`,
          }}
          aria-hidden="true"
        />
        {children}
      </div>
    </motion.div>
  );
};

export default MagneticButton;
