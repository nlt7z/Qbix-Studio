'use client';

import type { CSSProperties } from 'react';
import { Reveal } from '@/components/Reveal';
import { PixelEdge, StripTitle } from '@/components/ScrollMotion';
import DitherField from '@/components/DitherField';

/**
 * A key phrase. A dark bar sweeps across it as the panel rises (see
 * home-motion.css): the bar is a clipped window carrying a lime copy of the
 * words, sliding right while its contents slide left, so the lime text stays
 * put and is uncovered letter by letter. `k` staggers the five sweeps.
 */
function Hi({ k, children }: { k: number; children: string }) {
  return (
    <span className="about-hi" style={{ '--k': k } as CSSProperties}>
      {children}
      <span className="hi-bar" aria-hidden>
        <span className="hi-bar-in">{children}</span>
      </span>
    </span>
  );
}

export default function AboutUs() {
  return (
    <section id="about" className="about section-pad" data-nav-theme="light">
      <PixelEdge />
      <DitherField />
      <div className="container">
        <header className="section-head">
          <div>
            <Reveal as="span" className="eyebrow" speed="fast">
              About Qbix
            </Reveal>
            <StripTitle text="Our story is simple." style={{ marginTop: 14 }} />
          </div>
        </header>

        {/* The story is the whole panel — set large, key phrases weighted. */}
        <Reveal as="p" className="about-body about-body--solo" speed="base" delay={0.2}>
          AI has lowered the technical barrier, but the fact that anyone can
          build does not mean anyone can <Hi k={0}>build well</Hi>.
          We bring <Hi k={1}>unusually sharp instincts</Hi>, more
          than 10 years of training toward the <Hi k={2}>best taste</Hi>{' '}
          in the industry, real curiosity about new things (which means you get
          the <Hi k={3}>newest tech</Hi>), and respect for every
          idea that comes in. We put weight on early exploration and research,
          because <Hi k={4}>no idea deserves to be wasted</Hi>.
        </Reveal>
      </div>
    </section>
  );
}
