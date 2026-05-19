'use client';

import { motion } from 'framer-motion';
import { brandLookbook } from '@/lib/data';

const ease = [0.16, 1, 0.3, 1] as const;

export default function BrandLookbook() {
  return (
    <section id="brand" className="lookbook section-pad">
      <div className="container">
        <header className="section-head">
          <div>
            <span className="eyebrow">
              <span className="num">07</span>
              Brand objects
            </span>
            <h2 style={{ marginTop: 14 }}>
              The studio, rendered as objects you can hold.
            </h2>
          </div>
          <p className="mono" style={{ maxWidth: 360 }}>
            Identity stills, brand props, and lookbook frames from the <span className="brand-q">Q</span>bix visual system.
          </p>
        </header>

        <div className="lookbook-grid">
          {brandLookbook.map((item, i) => (
            <motion.figure
              key={item.src}
              className="lookbook-card"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.32, ease, delay: i * 0.06 }}
              style={{ aspectRatio: item.aspect }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="lookbook-img"
                src={item.src}
                alt={item.alt}
                loading="lazy"
              />
              <figcaption className="lookbook-caption">
                <span className="lookbook-num">{item.num}</span>
                <span className="lookbook-label">{item.label}</span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
