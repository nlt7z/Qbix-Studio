'use client';

import { labCards, brandLookbook } from '@/lib/data';
import BrandText from '@/components/BrandText';
import { Reveal, Stagger, RevealItem, Wipe } from '@/components/Reveal';

export default function QbixLabs() {
  return (
    <section id="product" className="labs section-pad" data-nav-theme="dark">
      <div className="container">
        <header
          className="section-head"
          style={{ alignItems: 'flex-start', flexDirection: 'column', gap: 18, marginBottom: 32, position: 'relative', zIndex: 1 }}
        >
          <Reveal as="span" className="eyebrow" speed="fast">
            <span className="num">05</span>
            <span>Product</span>
          </Reveal>
          <Wipe as="h2" style={{ maxWidth: 920 }} delay={0.1}>
            The products we design, build, and ship in-house.
          </Wipe>
          <Reveal as="p" className="labs-lede" speed="base" delay={0.35}>
            Proprietary AI tools, interface experiments, and playful systems — the
            products we build for ourselves and put in people’s hands.
          </Reveal>
        </header>

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
                    <span className="lab-card-num">{c.num} / Product</span>
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
