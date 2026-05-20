'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

/**
 * 3D tilt wrapper: rotates its child along X/Y axes based on cursor position
 * relative to the card's center. The card becomes "alive" — its surface
 * tracks the cursor like a small piece of solid material under your finger.
 *
 * - max° controls the maximum tilt angle (default 6°)
 * - perspective controls the depth illusion (default 800px)
 * - spring keeps the rotation from snapping
 *
 * Pointer events pass through naturally — children still receive hover/click.
 */
export default function TiltCard({
  children,
  max = 6,
  perspective = 800,
  className,
  style,
}: {
  children: ReactNode;
  max?: number;
  perspective?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 180, damping: 22, mass: 0.5 });
  const sry = useSpring(ry, { stiffness: 180, damping: 22, mass: 0.5 });

  if (reduced) {
    return (
      <div ref={ref} className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        position: 'relative',
        perspective,
        transformStyle: 'preserve-3d',
        ...style,
      }}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;   // [-0.5, 0.5]
        const ny = (e.clientY - r.top) / r.height - 0.5;
        ry.set(nx * 2 * max);   // horizontal cursor → rotate around Y
        rx.set(-ny * 2 * max);  // vertical cursor → rotate around X (inverted)
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
    >
      <motion.div
        style={{
          rotateX: srx,
          rotateY: sry,
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
