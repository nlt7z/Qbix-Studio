'use client';

import { brandLookbook } from '@/lib/data';
import { Reveal } from '@/components/Reveal';
import ScrollScrubbedItem from '@/components/ScrollScrubbedItem';
import ColumnStaggerGrid from '@/components/ColumnStaggerGrid';

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

        {/* columns=3 matches the desktop grid; each column to the right starts
            lower and settles into alignment as the wall scrolls in. */}
        <ColumnStaggerGrid className="lookbook-grid" columns={3} stepRem={4}>
          {brandLookbook.map((item, i) => (
            <ScrollScrubbedItem
              as="figure"
              key={item.src}
              index={i}
              amplitude={2}
              yRange={28}
              className="lookbook-card"
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
            </ScrollScrubbedItem>
          ))}
        </ColumnStaggerGrid>
      </div>
    </section>
  );
}
