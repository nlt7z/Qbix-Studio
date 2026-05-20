'use client';

import Link from 'next/link';
import { Reveal, Stagger, RevealItem } from '@/components/Reveal';

const pillars = [
  { k: 'Speed',      v: '48-hour cap, no exceptions' },
  { k: 'Craft',      v: 'Studio-grade output, not a hack' },
  { k: 'Commitment', v: 'Fixed scope, fixed price, one calendar block' },
];

export default function Sprint() {
  return (
    <section id="sprint" className="sprint section-pad">
      <div className="container">
        <Reveal as="header" className="section-head" speed="fast">
          <div>
            <span className="eyebrow">
              <span className="num">06</span>
              Sprint
            </span>
            <h2 style={{ marginTop: 14 }}>
              Initial solution in <span className="sprint-headline-accent">48 hours.</span>
            </h2>
          </div>
          <p className="mono" style={{ maxWidth: 320 }}>
            Fastest speed. Best quality. No tradeoff.
          </p>
        </Reveal>

        <Reveal className="sprint-brief" speed="cinematic" delay={0.15}>
          <header className="sprint-brief-head">
            <span className="fig">FIG 6.0 — The promise</span>
            <span className="sprint-brief-status">
              <span className="sprint-brief-dot" aria-hidden />
              Live sprint window
            </span>
          </header>

          <div className="sprint-brief-body">
            <div className="sprint-brief-left">
              <div className="sprint-brief-figure">
                <span className="sprint-bignum-n">48</span>
                <span className="sprint-bignum-unit">hours</span>
              </div>

              <div className="sprint-brief-ruler" aria-hidden>
                <div className="sprint-brief-ticks">
                  {Array.from({ length: 49 }).map((_, i) => (
                    <span
                      key={i}
                      className={`sprint-brief-tick${
                        i % 12 === 0 ? ' is-major' : ''
                      }${i % 6 === 0 && i % 12 !== 0 ? ' is-half' : ''}`}
                    />
                  ))}
                </div>
                <div className="sprint-brief-axis">
                  <span>T+0h</span>
                  <span>+12</span>
                  <span>+24</span>
                  <span>+36</span>
                  <span>+48</span>
                </div>
              </div>

              <p className="sprint-brief-cap">
                From signed SOW to a working prototype in your inbox — a senior
                designer-engineer pair, on the clock. We promise the speed; we
                keep the craft.
              </p>

              <div className="sprint-bignum-cta sprint-brief-cta">
                <Link href="#contact" className="btn btn-primary">
                  Book a sprint
                  <span className="arrow">→</span>
                </Link>
                <span className="kbd">S</span>
              </div>
            </div>

            <Stagger
              as="dl"
              className="sprint-brief-pillars"
              stagger={0.1}
              delayChildren={0.25}
            >
              {pillars.map((p, i) => (
                <RevealItem
                  key={p.k}
                  className="sprint-brief-pillar"
                  speed="fast"
                >
                  <dt className="sprint-brief-pillar-k">
                    <span className="sprint-brief-pillar-num">
                      0{i + 1}
                    </span>
                    {p.k}
                  </dt>
                  <dd className="sprint-brief-pillar-v">{p.v}</dd>
                </RevealItem>
              ))}
            </Stagger>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
