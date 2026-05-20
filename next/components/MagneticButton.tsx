'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

/**
 * Magnetic wrapper: pulls its child toward the cursor when the cursor enters
 * an expanded "hot zone" around the child. The hot zone is sized via `radius`
 * (default 80px). The pull is bounded by `strength` (default 8px). Both
 * motion values are sprung so the child settles rather than snapping.
 *
 * Use as a wrapper around the actual button/link element — the child
 * receives the pointer events normally; this wrapper just listens and
 * translates.
 */
export default function MagneticButton({
  children,
  radius = 80,
  strength = 8,
  className,
}: {
  children: ReactNode;
  radius?: number;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 200, damping: 18, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 200, damping: 18, mass: 0.6 });

  if (reduced) {
    return <span className={className}>{children}</span>;
  }

  return (
    <span
      ref={ref}
      className={className}
      style={{
        position: 'relative',
        display: 'inline-flex',
        padding: radius,
        margin: -radius,
        pointerEvents: 'auto',
      }}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        // Use the *button's* center, not the padded zone's, to compute pull.
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const d = Math.hypot(dx, dy);
        if (d > radius * 1.5) {
          mx.set(0);
          my.set(0);
          return;
        }
        // Falloff: closer = stronger pull, plateaus at strength.
        const norm = Math.min(d / (radius * 1.2), 1);
        const pull = strength * (1 - norm * 0.4);
        mx.set((dx / d) * pull);
        my.set((dy / d) * pull);
      }}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      <motion.span
        style={{
          x: sx,
          y: sy,
          display: 'inline-flex',
        }}
      >
        {children}
      </motion.span>
    </span>
  );
}
