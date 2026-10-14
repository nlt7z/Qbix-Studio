'use client';

import { motion } from 'framer-motion';
import { useReducedMotionSafe } from '@/components/useReducedMotionSafe';

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/** The round portrait in the offer pages' About us, opened by a circular iris as it scrolls in. */
export default function AboutPhoto() {
  const reduced = useReducedMotionSafe();
  return (
    <motion.img
      className="offer-me-photo"
      src="/assets/sera.jpg"
      alt="Sera"
      width={120}
      height={120}
      loading="lazy"
      initial={reduced ? false : { clipPath: 'circle(0% at 50% 50%)', scale: 1.18 }}
      whileInView={{ clipPath: 'circle(50% at 50% 50%)', scale: 1 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 1.1, ease: EASE_OUT }}
    />
  );
}
