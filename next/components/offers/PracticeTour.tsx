'use client';

import { useRef, useState, type ReactNode } from 'react';
import { useMotionValueEvent, useScroll } from 'framer-motion';
import { useReducedMotionSafe } from '@/components/useReducedMotionSafe';
import { Words } from '@/components/Reveal';

type Item = { k: string; v: string };

/* One small paper vignette per item — drawn in CSS, shown on a face of the prism. */
const FACES: ReactNode[] = [
  <div key="pages" className="pv pv-pages">
    {['Home', 'About', 'Specialties', 'Fees', 'Contact'].map((l, i) => (
      <span key={l} className="pv-sheet" style={{ ['--i' as string]: i - 2 }}>
        <i />
        <b>{l}</b>
      </span>
    ))}
  </div>,
  <div key="phone" className="pv pv-phone">
    <span className="pv-handset">
      <span className="pv-photo" />
      <span className="pv-line pv-line--head" />
      <span className="pv-line" />
      <span className="pv-btn" />
    </span>
    <span className="pv-lock mono">https · secure</span>
  </div>,
  <div key="step" className="pv pv-step">
    <span className="pv-page">
      <span className="pv-line pv-line--head" />
      <span className="pv-line" />
      <span className="pv-cta">Book a free consultation</span>
    </span>
    <svg className="pv-cursor" viewBox="0 0 20 24" aria-hidden>
      <path d="M2 2 L2 19 L7 14.5 L10.5 22 L13.5 20.6 L10 13.4 L16.5 13 Z" />
    </svg>
  </div>,
  <div key="google" className="pv pv-google">
    <span className="pv-search">therapist oakland anxiety</span>
    <span className="pv-result">
      <small>danareyestherapy.com</small>
      <strong>Dana Reyes, LMFT · Therapy in Oakland</strong>
      <span>Anxiety, life changes, couples. Book a free consultation.</span>
    </span>
  </div>,
  <div key="own" className="pv pv-own">
    <span className="pv-deed">
      <small className="mono">Owner</small>
      <strong>Dana Reyes</strong>
      <span>danareyestherapy.com</span>
      <span>Squarespace account in your name</span>
    </span>
  </div>,
  <div key="video" className="pv pv-video">
    <span className="pv-screen">
      <span className="pv-play" />
      <span className="pv-bar"><i /></span>
      <span className="pv-title">Editing your homepage</span>
    </span>
  </div>,
  <div key="fixes" className="pv pv-fixes">
    <span className="pv-cal">
      {Array.from({ length: 30 }, (_, i) => (
        <i key={i} className={[2, 5, 11, 19, 26].includes(i) ? 'is-fix' : ''} />
      ))}
    </span>
    <span className="pv-cal-label mono">30 days after launch</span>
  </div>,
];

/**
 * "What you get" for the practice page: the list pins beside a seven-sided
 * paper prism, and each item turns the prism to its own small picture.
 */
export default function PracticeTour({ items }: { items: Item[] }) {
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
    window.scrollTo({ top: top + (el.offsetHeight - window.innerHeight) * ((i + 0.55) / n), behavior: 'smooth' });
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
    <section ref={ref} className="pw-tour" data-nav-theme="light" style={{ ['--stops' as string]: n }}>
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
          <div className="pw-prism-wrap" aria-hidden>
            <div className="pw-prism" style={{ transform: `translateZ(calc(-1 * var(--r))) rotateY(${(-active * 360) / n}deg)` }}>
              {FACES.slice(0, n).map((f, i) => (
                <div key={i} className={`pw-face${i === active ? ' is-on' : ''}`} style={{ transform: `rotateY(${(i * 360) / n}deg) translateZ(var(--r))` }}>
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
