'use client';

import { useRef, useState } from 'react';
import { useMotionValueEvent, useScroll } from 'framer-motion';
import { useReducedMotionSafe } from '@/components/useReducedMotionSafe';
import { Words } from '@/components/Reveal';
import StageBox, { STAGE_TAIL } from '@/components/story/StageBox';
import { smoothScrollTo } from '@/lib/smoothScroll';

type Item = { k: string; v: string };

/**
 * A pinned scroll tour: the section pins, the page's object (BlockStage) sits
 * beside the list playing `forms`, one per row, and scrolling walks it from
 * one to the next; the row it shows is lit. Each row is a button that jumps
 * to its stop. With reduced motion it's a plain list.
 */
export default function KitTour({
  items,
  forms,
  label,
  title = 'What you get',
  id,
}: {
  items: Item[];
  /** The forms the object plays, one per row (components/three/blockForms.ts). */
  forms: string;
  label: string;
  title?: string;
  id?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  // Under way once the section's top is past the middle of the screen.
  const { scrollYProgress: approach } = useScroll({ target: ref, offset: ['start 0.5', 'start start'] });
  const [active, setActive] = useState(0);
  // The current stop's lime chip shows once the tour is well on screen, not
  // while its heading is still coming up under the section before (whose
  // own lime is still in view).
  const [started, setStarted] = useState(false);
  const reduced = useReducedMotionSafe();
  const n = items.length;

  // The row whose form the object is nearest (it holds on each form, moving between them, and
  // gets to the last a little before the section scrolls on).
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const run = (ref.current?.offsetHeight ?? 0) - window.innerHeight;
    const p = Math.min(1, (v * run) / Math.max(1, run - window.innerHeight * STAGE_TAIL));
    setActive(Math.min(n - 1, Math.max(0, Math.round(p * (n - 1)))));
  });
  useMotionValueEvent(approach, 'change', (v) => setStarted(v > 0));

  const jump = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const travel = el.offsetHeight - window.innerHeight;
    smoothScrollTo(top + (travel - window.innerHeight * STAGE_TAIL) * (i / Math.max(1, n - 1)));
  };

  if (reduced) {
    return (
      <section id={id} className="offer-section" data-nav-theme="dark">
        <div className="container offer-narrow">
          <h2 className="offer-h2">{title}</h2>
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
    <section ref={ref} id={id} className="lk-tour" data-nav-theme="dark" data-chapter data-forms={forms} data-tone="dark" style={{ ['--stops' as string]: n }}>
      <div className="lk-tour-pin">
        <div className="container lk-tour-grid">
          <div className="lk-tour-copy">
            <Words as="h2" className="offer-h2" text={title} />
            <ol className={`lk-tour-list${started ? ' is-live' : ''}`}>
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
          <StageBox label={label} className="lk-tour-stage" />
        </div>
      </div>
    </section>
  );
}
