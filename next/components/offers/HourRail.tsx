'use client';

import { useRef, useState } from 'react';
import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useReducedMotionSafe } from '@/components/useReducedMotionSafe';

/**
 * "How it works" on a 48-hour rail. Scrolling through the section fills the
 * rail hour by hour and the clock above it counts up; the last stretch past
 * 48 h is the round of changes. Each step lights as the fill reaches it.
 */
const SPAN = 0.8;   // share of the rail that is the 48 hours; the rest is "then"

export default function HourRail({ steps, hours = 48 }: { steps: [string, string, string]; hours?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotionSafe();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.4'] });
  const [progress, setProgress] = useState(0);
  useMotionValueEvent(scrollYProgress, 'change', setProgress);
  const v = reduced ? 1 : progress;
  const h = Math.round(Math.min(1, v / SPAN) * hours);
  const lit = [v > 0.01, v >= SPAN, v >= 0.985];
  const ticks = Array.from({ length: hours / 6 + 1 }, (_, i) => i * 6);

  return (
    <div ref={ref} className="hr">
      <div className="hr-clock" aria-hidden>
        <span className="hr-num">{String(h).padStart(2, '0')}</span>
        <span className="hr-sep">:00</span>
        <span className="hr-of mono">of {hours} hours</span>
      </div>
      <div className="hr-rail" aria-hidden>
        <span className="hr-then" style={{ left: `${SPAN * 100}%` }} />
        <motion.span className="hr-fill" style={{ scaleX: reduced ? 1 : scrollYProgress }} />
        {ticks.map((t) => (
          <i key={t} className={t % 24 === 0 ? 'is-major' : ''} style={{ left: `${(t / hours) * SPAN * 100}%` }} />
        ))}
        {[0, SPAN, 1].map((x, i) => (
          <b key={i} className={lit[i] ? 'is-on' : ''} style={{ left: `${x * 100}%` }} />
        ))}
      </div>
      <ol className="hr-steps">
        {steps.map((s, i) => (
          <li key={s} className={lit[i] ? 'is-on' : ''}>
            <span className="hr-step-n">{i + 1}</span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
