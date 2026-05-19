'use client';

import { motion } from 'framer-motion';
import { processSteps } from '@/lib/data';

const ease = [0.16, 1, 0.3, 1] as const;

export default function HowWeWork() {
  return (
    <section id="how" className="how section-pad">
      <div className="container">
        <header className="section-head">
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
        </header>

        <div className="journey">
          <div className="journey-pins">
            {processSteps.map((s, i) => (
              <motion.div
                key={`pin-${s.num}`}
                className="journey-pin"
                initial={{ opacity: 0, scale: 0.6 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.32, ease, delay: i * 0.06 }}
                aria-hidden
              >
                <span className="journey-pin-dot" />
              </motion.div>
            ))}
          </div>

          <ol className="journey-bodies">
            {processSteps.map((s, i) => (
              <motion.li
                key={s.num}
                className="journey-stop"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.32, ease, delay: 0.05 + i * 0.05 }}
              >
                <span className="journey-stage">STAGE {s.num}</span>
                <h3 className="journey-title">{s.title}</h3>
                <p className="journey-body">{s.body}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
