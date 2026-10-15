'use client';

import type { CSSProperties } from 'react';
import { Words } from '@/components/Reveal';
import { PixelEdge } from '@/components/ScrollMotion';
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
            <Words as="h2" text="Our story is simple." style={{ marginTop: 14 }} />
          </div>
        </header>

        {/* The story is the whole panel — set large, key phrases weighted. It
            arrives with the panel itself (no timed reveal), so a fast scroll
            never outruns it; the bar on the key phrase is scroll-scrubbed. */}
        <p className="about-body about-body--solo">
          AI has lowered the technical barrier, but the fact that anyone can
          build does not mean anyone can build well. We bring unusually sharp
          instincts, more than 10 years of training toward the best taste in
          the industry, real curiosity about new things (which means you get the
          newest tech), and respect for every idea that comes in. We put weight
          on early exploration and research, because{' '}
          {/* One highlight: the line the whole story leads to. */}
          <Hi k={0}>no idea deserves to be wasted</Hi>.
        </p>
      </div>
    </section>
  );
}
