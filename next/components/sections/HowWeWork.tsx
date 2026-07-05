'use client';

import { useEffect, useRef, useState } from 'react';
import { useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion';
import { processSteps, type ProcessStep } from '@/lib/data';
import { Reveal, Words } from '@/components/Reveal';

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.25,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function StageIcon({ name }: { name: ProcessStep['icon'] }) {
  switch (name) {
    case 'target':
      return (
        <svg viewBox="0 0 24 24" {...stroke} aria-hidden>
          <circle cx="12" cy="12" r="7.5" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3" />
        </svg>
      );
    case 'search':
      return (
        <svg viewBox="0 0 24 24" {...stroke} aria-hidden>
          <circle cx="10.5" cy="10.5" r="6" />
          <path d="M15 15l6 6" />
          <path d="M7.5 9.5h6M7.5 12h4" />
        </svg>
      );
    case 'frame':
      return (
        <svg viewBox="0 0 24 24" {...stroke} aria-hidden>
          <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
          <path d="M3.5 9h17" />
          <path d="M7 13h6M7 16h4" />
        </svg>
      );
    case 'layers':
      return (
        <svg viewBox="0 0 24 24" {...stroke} aria-hidden>
          <rect x="3" y="3" width="12" height="12" rx="1.5" />
          <rect x="9" y="9" width="12" height="12" rx="1.5" />
        </svg>
      );
    case 'code':
      return (
        <svg viewBox="0 0 24 24" {...stroke} aria-hidden>
          <path d="M8 7.5L3 12l5 4.5" />
          <path d="M16 7.5L21 12l-5 4.5" />
          <path d="M14 5l-4 14" />
        </svg>
      );
    case 'arrow':
      return (
        <svg viewBox="0 0 24 24" {...stroke} aria-hidden>
          <path d="M5 19L19 5" />
          <path d="M9 5h10v10" />
        </svg>
      );
  }
}

export default function HowWeWork() {
  const reduced = useReducedMotion();
  const pinsRef = useRef<HTMLDivElement | null>(null);
  const [activePins, setActivePins] = useState(0);

  // Rail + pins tied to the user's scroll position over the pins row.
  // start (rail empty)  → pins row reaches 80% of viewport
  // end   (rail full)   → pins row reaches 30% of viewport
  // Longer runway so the six stops light one by one while scrolling,
  // instead of all snapping on in a single viewport step.
  const { scrollYProgress } = useScroll({
    target: pinsRef,
    offset: ['start 85%', 'start 15%'],
  });

  // Push progress to a CSS custom property so the rail's ::before
  // clip-path can read it without a React re-render every frame.
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const el = pinsRef.current;
    if (!el) return;
    if (reduced) {
      el.style.setProperty('--rail-progress', '1');
      return;
    }
    el.style.setProperty('--rail-progress', String(p));
    // 6 pins, lit sequentially. progress / (1/6) rounded down, clamped.
    const next = Math.max(0, Math.min(6, Math.floor(p * 6 + 0.15)));
    setActivePins((prev) => (prev === next ? prev : next));
  });

  // Honor reduced-motion immediately on mount.
  useEffect(() => {
    if (!reduced) return;
    if (pinsRef.current) {
      pinsRef.current.style.setProperty('--rail-progress', '1');
    }
    setActivePins(6);
  }, [reduced]);

  return (
    <section id="how" className="how section-pad">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="how-decoration"
        src="/qbix-turntable.png"
        alt=""
        aria-hidden
        loading="lazy"
      />
      <div className="container">
        <header className="section-head">
          <div>
            <Reveal as="span" className="eyebrow" speed="fast">
              <span className="num">04</span>
              How we work
            </Reveal>
            <Words
              as="h2"
              text="A six-stage journey from unclear idea to shipped product."
              style={{ marginTop: 14 }}
              speed="fast"
              delay={0.1}
              step={0.04}
            />
            <Reveal as="p" className="sub-plain" speed="base" delay={0.35}>
              Our team members have experience at FAANG — shipping products used
              by millions of people.
            </Reveal>
          </div>
          <Reveal as="p" className="mono journey-legend" speed="base" delay={0.5}>
            <span className="journey-legend-dot" />
            Loops back as the product gets sharper.
          </Reveal>
        </header>

        <div className="journey">
          <div ref={pinsRef} className="journey-pins is-scrubbed">
            {processSteps.map((s, i) => (
              <div
                key={`pin-${s.num}`}
                className="journey-pin"
                data-active={i < activePins ? 'true' : 'false'}
                aria-hidden
              >
                <span className="journey-pin-dot" />
              </div>
            ))}
          </div>

          {/* Each stop wakes only when the rail reaches its pin — the journey
              is read at the pace of the scroll, never spoiled in one go. */}
          <ol className="journey-bodies">
            {processSteps.map((s, i) => (
              <li
                key={s.num}
                className={`journey-stop${i < activePins ? ' is-live' : ''}`}
              >
                <span className="journey-icon" aria-hidden>
                  <StageIcon name={s.icon} />
                </span>
                <span className="journey-stage">STAGE {s.num}</span>
                <h3 className="journey-title">{s.title}</h3>
                <p className="journey-body">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
