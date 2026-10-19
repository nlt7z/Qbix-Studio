'use client';

import { useRef, useState } from 'react';
import { useMotionValueEvent, useScroll } from 'framer-motion';
import { useReducedMotionSafe } from '@/components/useReducedMotionSafe';
import { Words } from '@/components/Reveal';
import StageBox, { STAGE_TAIL } from '@/components/story/StageBox';
import { smoothScrollTo } from '@/lib/smoothScroll';

type Item = { k: string; v: string };

// The page's object plays one form per item as the scroll goes (components/three/blockForms.ts).
const FORMS = 'pwPages,pwPhone,pwStep,pwGoogle,pwOwn,pwHow,pwFixes';

/**
 * "What you get" for the practice page: the list pins beside the page's
 * object, which shows each item in turn as you scroll (the item it shows is
 * lit). Each row is a button that jumps to its stop.
 */
export default function PracticeTour({ items }: { items: Item[] }) {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const [active, setActive] = useState(0);
  const reduced = useReducedMotionSafe();
  const n = items.length;
  // The row whose form the object is nearest (it holds on each form, moving between them, and
  // gets to the last a little before the section scrolls on).
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const run = (ref.current?.offsetHeight ?? 0) - window.innerHeight;
    const p = Math.min(1, (v * run) / Math.max(1, run - window.innerHeight * STAGE_TAIL));
    setActive(Math.min(n - 1, Math.max(0, Math.round(p * (n - 1)))));
  });

  const jump = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    smoothScrollTo(top + (el.offsetHeight - window.innerHeight * (1 + STAGE_TAIL)) * (i / Math.max(1, n - 1)));
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
    <section ref={ref} className="pw-tour" data-nav-theme="light" data-chapter data-forms={FORMS} data-tone="paper" style={{ ['--stops' as string]: n }}>
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
          <StageBox
            label="The homepage with its other pages; the phone; the booking button; the Google result; the owner's card and a key; the how-to video; thirty days of fixes"
            className="pw-tour-stage"
          />
        </div>
      </div>
    </section>
  );
}
