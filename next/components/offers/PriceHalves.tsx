'use client';

import { motion } from 'framer-motion';
import { useReducedMotionSafe } from '@/components/useReducedMotionSafe';

const EASE = [0.65, 0, 0.35, 1] as const;   // in-out, no overshoot — this page stays calm

/** Two $400 halves that slide together into the one $800 price. */
export default function PriceHalves() {
  const reduced = useReducedMotionSafe();
  const half = (side: -1 | 1, amount: string, label: string) => (
    <motion.span
      className="ph-half"
      initial={reduced ? false : { x: `${side * 34}%`, rotateY: side * -18 }}
      whileInView={{ x: '0%', rotateY: 0 }}
      viewport={{ once: true, margin: '-20% 0px' }}
      transition={{ duration: 1.4, ease: EASE, delay: 0.15 }}
    >
      <b>{amount}</b>
      <span>{label}</span>
    </motion.span>
  );
  return (
    <div className="ph" aria-hidden>
      {half(-1, '$400', 'to start')}
      {half(1, '$400', 'when the site goes live')}
    </div>
  );
}
