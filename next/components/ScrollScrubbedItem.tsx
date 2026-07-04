'use client';

import { useRef, type ReactNode, type ElementType, type CSSProperties } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'framer-motion';

/**
 * Scroll-scrubbed reveal — the item's rotation + y + opacity are tied to
 * the user's scroll position relative to the item itself, not a one-shot
 * IntersectionObserver trigger.
 *
 * Behavior (for the default tilt gesture):
 *   progress 0.00 — item is at the bottom of the viewport, tilted in
 *   progress 0.50 — item is centered, flat, fully solid
 *   progress 1.00 — item is leaving the top, tilted the other way
 *
 * Index alternates rotation direction so a grid of items reads as
 * props-on-a-table physics: each rotated slightly its own way, settling
 * to flat as the user "looks at" it.
 */
export default function ScrollScrubbedItem({
  as = 'div',
  index = 0,
  amplitude = 2.4,
  yRange = 36,
  className,
  style,
  children,
}: {
  as?: ElementType;
  index?: number;
  /** Max rotation degrees at the entry/exit ends. */
  amplitude?: number;
  /** Max y offset (px) at the entry/exit ends. */
  yRange?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    // Track from item entering viewport bottom to leaving viewport top.
    offset: ['start end', 'end start'],
  });

  const dir = index % 2 === 0 ? 1 : -1;
  const peak = amplitude * dir;

  const rotate = useTransform(scrollYProgress, [0, 0.5, 1], [peak, 0, -peak]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [yRange, 0, -yRange * 0.6]);
  const opacity = useTransform(scrollYProgress, [0, 0.18, 0.82, 1], [0.35, 1, 1, 0.7]);

  if (reduced) {
    const Tag = as as ElementType;
    return (
      <Tag ref={ref} className={className} style={style}>
        {children}
      </Tag>
    );
  }

  // Match the project pattern in Reveal.tsx: index motion by element name.
  const MotionTag =
    (motion as unknown as Record<string, ElementType>)[as as string] ?? motion.div;
  return (
    <MotionTag
      ref={ref}
      className={className}
      style={{
        ...style,
        rotate,
        y,
        opacity,
        willChange: 'transform, opacity',
      }}
    >
      {children}
    </MotionTag>
  );
}
