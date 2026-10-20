'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useMotionValueEvent, useScroll } from 'framer-motion';
import { useReducedMotionSafe } from '@/components/useReducedMotionSafe';
import { Words } from '@/components/Reveal';
import { smoothScrollTo } from '@/lib/smoothScroll';

/** How long (in screens) a pinned tour holds its last state before the section scrolls on. */
export const TOUR_TAIL = 0.3;

type Item = { k: string; v: string };

/**
 * A pinned scroll tour: the section pins, its scene sits beside the list with
 * one state per row, and scrolling walks it from one to the next; the row it
 * shows is lit. Each row is a button that jumps to its stop. With reduced
 * motion it's a plain list.
 */
export default function KitTour({
  items,
  scene,
  title = 'What you get',
  id,
}: {
  items: Item[];
  /** The scene, one state per row (components/scenes). */
  scene: ReactNode;
  title?: string;
  id?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  // Under way once the section's top is past the middle of the screen.
  const { scrollYProgress: approach } = useScroll({ target: ref, offset: ['start 0.5', 'start start'] });
  const [active, setActive] = useState(0);
  // The current stop's lime chip shows once the tour is well on screen, not
  // while its heading is still coming up under the section before (whose
  // own lime is still in view).
  const [started, setStarted] = useState(false);
  const reduced = useReducedMotionSafe();
  const n = items.length;

  // The row the scene is showing (lib/scene/driver.ts tells the section).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const on = (e: Event) => setActive((e as CustomEvent<number>).detail);
    el.addEventListener('scene:step', on);
    return () => el.removeEventListener('scene:step', on);
  }, []);
  useMotionValueEvent(approach, 'change', (v) => setStarted(v > 0));

  const jump = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const travel = el.offsetHeight - window.innerHeight;
    smoothScrollTo(top + (travel - window.innerHeight * TOUR_TAIL) * (i / Math.max(1, n - 1)));
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
    <section ref={ref} id={id} className="lk-tour" data-nav-theme="dark" data-chapter data-tail={TOUR_TAIL} data-tone="dark" style={{ ['--stops' as string]: n }}>
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
          <div className="lk-tour-stage">{scene}</div>
        </div>
      </div>
    </section>
  );
}
