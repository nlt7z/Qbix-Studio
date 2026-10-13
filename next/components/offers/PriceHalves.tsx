'use client';

import { motion } from 'framer-motion';
import { useReducedMotionSafe } from '@/components/useReducedMotionSafe';

const EASE = [0.65, 0, 0.35, 1] as const;   // in-out, no overshoot — this page stays calm

/** The two payment halves (to start, at launch) sliding together into one price. */
export default function PriceHalves({ amount }: { amount: string }) {
  const reduced = useReducedMotionSafe();
  const half = (side: -1 | 1, label: string) => (
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
      {half(-1, 'to start')}
      {half(1, 'when the site goes live')}
    </div>
  );
}
