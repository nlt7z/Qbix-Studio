'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const ease = [0.16, 1, 0.3, 1] as const;

const pillars = [
  { k: 'Speed',      v: '48-hour cap, no exceptions' },
  { k: 'Craft',      v: 'Studio-grade output, not a hack' },
  { k: 'Commitment', v: 'Fixed scope, fixed price, one calendar block' },
];

export default function Sprint() {
  return (
    <section id="sprint" className="sprint section-pad">
      <div className="container">
        <header className="section-head">
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
        </header>

        <motion.div
          className="sprint-bignum sprint-bignum--solo"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.32, ease }}
        >
          <span className="fig">FIG 6.0 — The promise</span>
          <div className="sprint-bignum-figure">
            <span className="sprint-bignum-n">48</span>
            <span className="sprint-bignum-unit">hours</span>
          </div>
          <p className="sprint-bignum-cap">
            From signed SOW to a working prototype in your inbox — a senior
            designer-engineer pair, on the clock. We promise the speed; we
            keep the craft.
          </p>
          <div className="sprint-bignum-cta">
            <Link href="#contact" className="btn btn-primary">
              Book a sprint
              <span className="arrow">→</span>
            </Link>
            <span className="kbd">S</span>
          </div>
        </motion.div>

        <dl className="sprint-pillars">
          {pillars.map((p, i) => (
            <motion.div
              key={p.k}
              className="sprint-pillar"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.32, ease, delay: i * 0.06 }}
            >
              <dt className="sprint-pillar-k">{p.k}</dt>
              <dd className="sprint-pillar-v">{p.v}</dd>
            </motion.div>
          ))}
        </dl>
      </div>
    </section>
  );
}
