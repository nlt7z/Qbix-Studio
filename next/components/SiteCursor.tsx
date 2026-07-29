'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

/**
 * Campaign cursor — a lime dot that rides the pointer with a trailing ring.
 * The ring lags on a spring and swells over interactive elements, like a
 * jeweller's loupe hovering the piece. Renders nothing on touch devices or
 * for reduced-motion users; the native cursor stays (this is an accent, not
 * a replacement). mix-blend-difference keeps it visible on lime panels.
 */
export default function SiteCursor() {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [hoveringLink, setHoveringLink] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 260, damping: 26, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 260, damping: 26, mass: 0.6 });

  useEffect(() => {
    if (reduced) return;
    // Fine pointer only — no cursor theatre on touch screens.
    if (!window.matchMedia('(pointer: fine)').matches) return;
    setEnabled(true);

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as HTMLElement | null;
      setHoveringLink(!!t?.closest('a, button, [role="button"]'));
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [reduced, x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        aria-hidden
        className="cursor-dot"
        style={{ x, y }}
      />
      <motion.div
        aria-hidden
        className="cursor-ring"
        style={{ x: ringX, y: ringY }}
        animate={{ scale: hoveringLink ? 1.9 : 1, opacity: hoveringLink ? 0.9 : 0.55 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      />
    </>
  );
}
