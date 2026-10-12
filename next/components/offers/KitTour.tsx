'use client';

import { useRef, useState } from 'react';
import { useMotionValueEvent, useScroll } from 'framer-motion';
import { useReducedMotionSafe } from '@/components/useReducedMotionSafe';
import { Words } from '@/components/Reveal';
import KitStage from './KitStage';

type Item = { k: string; v: string };

/**
 * "What you get" as a guided tour: the section pins, the 3D kit sits beside
 * the list, and scrolling walks the camera from piece to piece. Each row is
 * a button that jumps to its stop. With reduced motion it's a plain list.
 */
export default function KitTour({ items }: { items: Item[] }) {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const [active, setActive] = useState(0);
  const reduced = useReducedMotionSafe();
  const n = items.length;

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setActive(Math.min(n - 1, Math.max(0, Math.floor(v * n))));
  });

  const jump = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const travel = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + travel * ((i + 0.55) / n), behavior: 'smooth' });
  };

  if (reduced) {
    return (
      <section className="offer-section" data-nav-theme="dark">
        <div className="container offer-narrow">
          <h2 className="offer-h2">What you get</h2>
          <ol className="offer-list">
            {items.map((g, i) => (
              <li key={g.k}>
                <span className="offer-num mono">{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <strong>{g.k}.</strong>
                  {g.v && <> {g.v}</>}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="lk-tour" data-nav-theme="dark" style={{ ['--stops' as string]: n }}>
      <div className="lk-tour-pin">
        <div className="container lk-tour-grid">
          <div className="lk-tour-copy">
            <Words as="h2" className="offer-h2" text="What you get" />
            <ol className="lk-tour-list">
              {items.map((g, i) => (
                <li key={g.k} className={i === active ? 'is-on' : i < active ? 'is-past' : ''}>
                  <button type="button" onClick={() => jump(i)} aria-current={i === active ? 'step' : undefined}>
                    <span className="lk-tour-num mono">{String(i + 1).padStart(2, '0')}</span>
                    <span className="lk-tour-k">{g.k}</span>
                  </button>
                  {g.v && (
                    <div className="lk-tour-v">
                      <p>{g.v}</p>
                    </div>
                  )}
                </li>
              ))}
            </ol>
            <div className="lk-tour-meter" aria-hidden>
              <span style={{ transform: `scaleX(${(active + 1) / n})` }} />
            </div>
          </div>
          <KitStage mode="tour" progress={scrollYProgress} className="lk-tour-stage" />
        </div>
      </div>
    </section>
  );
}
