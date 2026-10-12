'use client';

import { useRef, useState } from 'react';
import { useMotionValueEvent, useScroll } from 'framer-motion';
import { useReducedMotionSafe } from '@/components/useReducedMotionSafe';

type Step = { k: string; v: string; day: number };

/**
 * "How it works" as a week: seven day tiles flip over one by one as the
 * section scrolls past, and each step lights when its day turns.
 */
export default function DayTiles({ steps, days = 7 }: { steps: Step[]; days?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotionSafe();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] });
  const [v, setV] = useState(0);
  useMotionValueEvent(scrollYProgress, 'change', setV);
  const turned = reduced ? days : Math.min(days, Math.floor(v * (days + 0.6)));
  const stepAt = new Map(steps.map((s, i) => [s.day, i + 1]));

  return (
    <div ref={ref} className="dt">
      <ol className="dt-days" aria-hidden>
        {Array.from({ length: days }, (_, i) => {
          const day = i + 1;
          const step = stepAt.get(day);
          return (
            <li key={day} className={`${turned >= day ? 'is-turned' : ''}${step ? ' is-step' : ''}`}>
              <span className="dt-tile">
                <span className="dt-front mono">Day {day}</span>
                <span className="dt-back">
                  <span className="mono">Day {day}</span>
                  {step ? <b>{step}</b> : <i />}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
      <ol className="pw-steps dt-steps">
        {steps.map((s, i) => (
          <li key={s.k} className={turned >= s.day ? 'is-on' : ''}>
            <span className="pw-step-n">{i + 1}</span>
            <span>
              <strong>{s.k}</strong> {s.v}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
