'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotionSafe } from '@/components/useReducedMotionSafe';
import { Words } from '@/components/Reveal';
import { PracticeTourScene } from '@/components/scenes/Practice';
import { TOUR_TAIL } from './KitTour';
import { smoothScrollTo } from '@/lib/smoothScroll';

type Item = { k: string; v: string };

/**
 * "What you get" for the practice page: the list pins beside its scene, which
 * shows each item in turn as you scroll (the item it shows is lit). Each row
 * is a button that jumps to its stop.
 */
export default function PracticeTour({ items }: { items: Item[] }) {
  const ref = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState(0);
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

  const jump = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    smoothScrollTo(top + (el.offsetHeight - window.innerHeight * (1 + TOUR_TAIL)) * (i / Math.max(1, n - 1)));
  };

  if (reduced) {
    return (
      <section className="pw-section" data-nav-theme="light">
        <div className="container pw-narrow">
          <h2 className="pw-h2">What you get</h2>
          <ul className="pw-list">
            {items.map((g) => (
              <li key={g.k}>
                <strong>{g.k}</strong> {g.v}
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="pw-tour" data-nav-theme="light" data-chapter data-tail={TOUR_TAIL} data-tone="paper" style={{ ['--stops' as string]: n }}>
      <div className="pw-tour-pin">
        <div className="container pw-tour-grid">
          <div className="pw-tour-copy">
            <Words as="h2" className="pw-h2" text="What you get" />
            <ol className="pw-tour-list">
              {items.map((g, i) => (
                <li key={g.k} className={i === active ? 'is-on' : ''}>
                  <button type="button" onClick={() => jump(i)} aria-current={i === active ? 'step' : undefined}>
                    <strong>{g.k}</strong> <span>{g.v}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
          <div className="pw-tour-stage">
            <PracticeTourScene />
          </div>
        </div>
      </div>
    </section>
  );
}
