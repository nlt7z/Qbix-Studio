'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { processSteps, type ProcessStep } from '@/lib/data';
import { Reveal, Stagger, RevealItem } from '@/components/Reveal';

const EASE_BACK = [0.22, 1.2, 0.36, 1] as const;

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
  return (
    <section id="how" className="how section-pad">
      <div className="container">
        <Reveal as="header" className="section-head" speed="fast">
          <div>
            <span className="eyebrow">
              <span className="num">04</span>
              How we work
            </span>
            <h2 style={{ marginTop: 14 }}>
              A six-stage journey from unclear idea to shipped product.
            </h2>
          </div>
          <p className="mono journey-legend">
            <span className="journey-legend-dot" />
            Loops back as the product gets sharper.
          </p>
        </Reveal>

        <div className="journey">
          <Stagger className="journey-pins" stagger={0.07} delayChildren={0.15}>
            {processSteps.map((s) => (
              <motion.div
                key={`pin-${s.num}`}
                className="journey-pin"
                variants={
                  reduced
                    ? undefined
                    : {
                        hidden: { opacity: 0, scale: 0.4, filter: 'blur(6px)' },
                        show: {
                          opacity: 1,
                          scale: 1,
                          filter: 'blur(0px)',
                          transition: { duration: 0.55, ease: EASE_BACK },
                        },
                      }
                }
                aria-hidden
              >
                <span className="journey-pin-dot" />
              </motion.div>
            ))}
          </Stagger>

          <Stagger as="ol" className="journey-bodies" stagger={0.09} delayChildren={0.25}>
            {processSteps.map((s) => (
              <RevealItem
                as="li"
                key={s.num}
                className="journey-stop"
                speed="slow"
              >
                <span className="journey-icon" aria-hidden>
                  <StageIcon name={s.icon} />
                </span>
                <span className="journey-stage">STAGE {s.num}</span>
                <h3 className="journey-title">{s.title}</h3>
                <p className="journey-body">{s.body}</p>
              </RevealItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
