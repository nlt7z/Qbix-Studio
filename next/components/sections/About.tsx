'use client';

import { motion } from 'framer-motion';
import { aboutLede, aboutBody, aboutStatements } from '@/lib/data';
import BrandText from '@/components/BrandText';

const ease = [0.16, 1, 0.3, 1] as const;

export default function About() {
  return (
    <section id="about" className="section-pad">
      <div className="container">
        <header className="section-head">
          <div>
            <span className="eyebrow">
              <span className="num">08</span>
              About
            </span>
            <h2 style={{ marginTop: 14 }}>A studio built on taste and craft.</h2>
          </div>
        </header>

        <motion.p
          className="about-lede"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.32, ease }}
        >
          <BrandText>{aboutLede}</BrandText>
        </motion.p>

        <motion.p
          className="lede muted"
          style={{ maxWidth: 760, marginTop: 24 }}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.32, ease, delay: 0.08 }}
        >
          <BrandText>{aboutBody}</BrandText>
        </motion.p>

        <div className="line-list" style={{ marginTop: 32 }}>
          {aboutStatements.map((s, i) => (
            <motion.article
              key={s.num}
              className="line-row"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.32, ease, delay: i * 0.05 }}
            >
              <span className="line-num">{s.num} / Truth</span>
              <span className="line-body">
                <span className="line-title">{s.text}</span>
              </span>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
