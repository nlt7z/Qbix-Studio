'use client';

import { useRef, useState } from 'react';
import { useMotionValueEvent, useScroll } from 'framer-motion';
import { useReducedMotionSafe } from '@/components/useReducedMotionSafe';
import { Words } from '@/components/Reveal';
import SceneStage, { type SceneName } from './SceneStage';

type Item = { k: string; v: string };

/**
 * A pinned scroll tour: the section pins, a 3D scene sits beside the list,
 * and scrolling walks the scene from stop to stop. Each row is a button that
 * jumps to its stop. With reduced motion it's a plain list.
 */
export default function KitTour({
  items,
  scene = 'kit',
  title = 'What you get',
  id,
  labels,
}: {
  items: Item[];
  scene?: SceneName;
  title?: string;
  id?: string;
  /** Blueprint labels pinned to the scene's pieces (a stable, module-level array). */
  labels?: string[];
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

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setActive(Math.min(n - 1, Math.max(0, Math.floor(v * n))));
  });
  useMotionValueEvent(approach, 'change', (v) => setStarted(v > 0));

  const jump = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const travel = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + travel * ((i + 0.55) / n), behavior: 'smooth' });
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
    <section ref={ref} id={id} className="lk-tour" data-nav-theme="dark" style={{ ['--stops' as string]: n }}>
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
          <SceneStage scene={scene} mode="tour" progress={scrollYProgress} labels={labels} className="lk-tour-stage" />
        </div>
      </div>
    </section>
  );
}
