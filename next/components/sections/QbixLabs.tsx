'use client';

import { labCards, brandLookbook } from '@/lib/data';
import BrandText from '@/components/BrandText';
import { Reveal, Stagger, RevealItem } from '@/components/Reveal';

export default function QbixLabs() {
  return (
    <section id="labs" className="labs section-pad">
      <div className="container">
        <Reveal
          as="header"
          className="section-head"
          style={{ alignItems: 'flex-start', flexDirection: 'column', gap: 18, marginBottom: 32, position: 'relative', zIndex: 1 }}
          speed="slow"
        >
          <span className="eyebrow">
            <span className="num">05</span>
            <span><span className="brand-q">Q</span>bix Labs</span>
          </span>
          <h2 style={{ maxWidth: 920 }}>
            Internal AI products, interface experiments, and playful systems.
          </h2>
          <p className="labs-lede">
            Our playground for proprietary AI tools, product experiments, and new interaction
            models. The work that makes us not-just-a-studio.
          </p>
        </Reveal>

        <Stagger className="lab-cards" stagger={0.08} delayChildren={0.15}>
          {labCards.map((c, i) => {
            const brand = brandLookbook[i];
            return (
              <RevealItem key={c.num} speed="base">
                {/* Lab detail pages are disabled for now — render as a static
                    card (no link/arrow) until the secondary pages ship. */}
                <div className="lab-card">
                  {brand && (
                    <div className="lab-card-deco" aria-hidden>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={brand.src}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  )}
                  <div className="lab-card-body">
                    <span className="lab-card-num">{c.num} / Lab</span>
                    <h3 className="lab-card-title">
                      <BrandText>{c.title}</BrandText>
                    </h3>
                    <p className="lab-card-blurb">
                      <BrandText>{c.body}</BrandText>
                    </p>
                  </div>
                </div>
              </RevealItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
