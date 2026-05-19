'use client';

import { brandLookbook } from '@/lib/data';
import { Reveal, Stagger, RevealItem } from '@/components/Reveal';

export default function BrandLookbook() {
  return (
    <section id="brand" className="lookbook section-pad">
      <div className="container">
        <Reveal as="header" className="section-head" speed="fast">
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
        </Reveal>

        <Stagger className="lookbook-grid" stagger={0.09} delayChildren={0.1}>
          {brandLookbook.map((item) => (
            <RevealItem
              as="figure"
              key={item.src}
              className="lookbook-card"
              speed="slow"
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
            </RevealItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
