'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

/**
 * Campaign cursor — a lime pixel that rides the pointer with a trailing
 * square frame, in the same hard-cornered language as the cube and the pixel
 * edges. The frame lags on a spring and swells over interactive elements.
 *
 * Anything can name what a click will do with `data-cursor="Open"`: over it
 * the frame gives way to a small label that wipes in left to right, so cards
 * that look alike but act differently (open a page, start a brief, drag the
 * 3D) say so before the click.
 *
 * Renders nothing on touch devices or for reduced-motion users; the native
 * cursor stays (this is an accent, not a replacement). mix-blend-difference
 * keeps the pixel and frame visible on lime panels.
 */
export default function SiteCursor() {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [hoveringLink, setHoveringLink] = useState(false);
  const [label, setLabel] = useState<string | null>(null);

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
      const named = t?.closest<HTMLElement>('[data-cursor]');
      setLabel(named?.dataset.cursor || null);
      setHoveringLink(!named && !!t?.closest('a, button, [role="button"]'));
    };
    const onLeave = () => setLabel(null);
    window.addEventListener('mousemove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
    };
  }, [reduced, x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        aria-hidden
        className="cursor-dot"
        style={{ x, y }}
        animate={{ scale: label ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      />
      <motion.div
        aria-hidden
        className="cursor-ring"
        style={{ x: ringX, y: ringY }}
        animate={{
          scale: label ? 0.4 : hoveringLink ? 1.7 : 1,
          rotate: hoveringLink ? 45 : 0,
          opacity: label ? 0 : hoveringLink ? 0.95 : 0.55,
        }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.div aria-hidden className="cursor-label-anchor" style={{ x: ringX, y: ringY }}>
        {label && (
          <motion.span
            key={label}
            className="cursor-label mono"
            initial={{ clipPath: 'inset(0 100% 0 0)' }}
            animate={{ clipPath: 'inset(0 0% 0 0)' }}
            transition={{ duration: 0.32, ease: [0.65, 0, 0.35, 1] }}
          >
            {label}
          </motion.span>
        )}
      </motion.div>
    </>
  );
}
