'use client';

import Link from 'next/link';
import { labCards } from '@/lib/data';
import BrandText from '@/components/BrandText';
import { Reveal, Stagger, RevealItem } from '@/components/Reveal';

export default function QbixLabs() {
  return (
    <section id="labs" className="labs section-pad">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="labs-decoration"
        src="/qbix-turntable.png"
        alt=""
        aria-hidden
        loading="lazy"
      />
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

        <Stagger className="line-list" stagger={0.08} delayChildren={0.15}>
          {labCards.map((c) => (
            <RevealItem key={c.num} speed="base">
              <Link
                href={`/labs/${c.slug}`}
                className="line-row"
                aria-label={`Open ${c.title}`}
              >
                <span className="line-num">{c.num} / Lab</span>
                <span className="line-body">
                  <span className="line-title"><BrandText>{c.title}</BrandText></span>
                  <span className="line-blurb"><BrandText>{c.body}</BrandText></span>
                </span>
                <span className="line-arrow" aria-hidden>↗</span>
              </Link>
            </RevealItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
