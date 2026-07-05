'use client';

import {
  Children,
  cloneElement,
  isValidElement,
  useRef,
  type ReactNode,
} from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';

/**
 * ColumnStaggerGrid — the "helmet wall" settle from landonorris.com.
 *
 * Children are laid out in a CSS grid of `columns` columns. Each column is
 * lifted by a progressively larger vertical offset (`column-rank * stepRem`)
 * and scrubs down to alignment as the grid scrolls into view. The first
 * column never moves; each column to its right starts lower and catches up,
 * so the grid "assembles" into its baseline. Pure structural motion — no
 * fade, no blur.
 *
 * Port of the reference's VF() grid routine: it bucketed items by
 * `index % 4`, offset each bucket by `bucket * 5rem`, and scrubbed to 0.
 */
export default function ColumnStaggerGrid({
  columns,
  stepRem = 5,
  children,
  className,
  style,
}: {
  columns: number;
  /** Vertical offset per column rank, in rem. */
  stepRem?: number;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    // From the grid entering the bottom of the viewport to it being centred.
    offset: ['start end', 'center center'],
  });
  const p = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.4,
  });

  const items = Children.toArray(children);

  if (reduced) {
    return (
      <div ref={ref} className={className} style={style}>
        {items}
      </div>
    );
  }

  return (
    <div ref={ref} className={className} style={style}>
      {items.map((child, i) => {
        const col = i % columns;
        const key = (isValidElement(child) && child.key != null) ? child.key : i;
        return (
          <StaggerCell key={key} col={col} stepRem={stepRem} progress={p}>
            {child}
          </StaggerCell>
        );
      })}
    </div>
  );
}

function StaggerCell({
  col,
  stepRem,
  progress,
  children,
}: {
  col: number;
  stepRem: number;
  progress: ReturnType<typeof useSpring>;
  children: ReactNode;
}) {
  // Column 0 stays put; each column to the right starts `col * stepRem` lower
  // and rises to 0 across the scrub.
  const y = useTransform(progress, [0, 1], [`${col * stepRem}rem`, '0rem']);

  // Keep the grid child a real grid item — wrap in a display:contents-free
  // motion.div so it still occupies its cell.
  return (
    <motion.div style={{ y, willChange: 'transform' }}>
      {isValidElement(children)
        ? cloneElement(children)
        : children}
    </motion.div>
  );
}
