'use client';

import { motion } from 'framer-motion';
import { useReducedMotionSafe } from '@/components/useReducedMotionSafe';

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/**
 * A price that rolls into place like a mechanical counter: each digit is a
 * 0–9 strip inside its own mask, turning to its value when scrolled into view.
 * The strip's digits are CSS-generated (.odo-strip::before), so the page text
 * is just the price: no stray "0123456789" in copy/paste, reader mode or
 * search snippets. Screen readers get the plain value.
 */
export default function Odometer({ value, className = '' }: { value: string; className?: string }) {
  const reduced = useReducedMotionSafe();
  let d = 0;
  return (
    <span className={`odo ${className}`}>
      <span className="sr-only">{value}</span>
      <span aria-hidden className="odo-row">
        {value.split('').map((ch, i) => {
          if (!/\d/.test(ch)) return <span key={i} className="odo-ch">{ch}</span>;
          const n = Number(ch);
          const delay = 0.08 + d++ * 0.07;
          return (
            <span key={i} className="odo-cell">
              <span className="odo-ghost">{ch}</span>
              {reduced ? (
                <span className="odo-strip" style={{ transform: `translateY(${-n * 10}%)` }} />
              ) : (
                <motion.span
                  className="odo-strip"
                  initial={{ y: '0%' }}
                  whileInView={{ y: `${-n * 10}%` }}
                  viewport={{ once: true, margin: '-15% 0px' }}
                  transition={{ duration: 1.25, ease: EASE_OUT, delay }}
                />
              )}
            </span>
          );
        })}
      </span>
    </span>
  );
}
