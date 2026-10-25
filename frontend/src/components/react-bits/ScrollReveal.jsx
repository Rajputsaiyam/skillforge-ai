import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Adapted from React Bits Scroll Reveal. The animation stays subtle and respects reduced motion.
const ScrollReveal = ({ children, className = '', delay = 0 }) => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (reduce) {
      element.style.opacity = '1';
      return undefined;
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        element,
        { opacity: 0.15, y: 28, filter: 'blur(8px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.7,
          delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 86%',
            once: true,
          },
        },
      );
    }, element);

    return () => context.revert();
  }, [delay]);

  return <div ref={ref} className={`reactbits-scroll-reveal ${className}`}>{children}</div>;
};

export default ScrollReveal;
