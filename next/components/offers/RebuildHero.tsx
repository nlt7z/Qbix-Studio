'use client';

import type { ReactNode } from 'react';
import BlockFigure from '@/components/BlockFigure';
import BeforeAfter from './BeforeAfter';

/**
 * Practice hero: the copy beside the site's pieces playing the offer's three
 * steps (the questionnaire, the new homepage, live with its phone). The
 * before-and-after sample of the redesign follows below.
 */
export default function RebuildHero({ children }: { children: ReactNode }) {
  return (
    <section className="pw-hero" data-nav-theme="light">
      <div className="container pw-hero-grid">
        <div className="pw-hero-copy">{children}</div>
        <div className="pw-hero-figure">
          <BlockFigure form="questionnaire,homepage,golive" tone="paper" label="A short questionnaire becomes a calm homepage, then goes live with its phone; the one lime piece is the button, then the address" />
        </div>
      </div>
      <div className="container pw-compare">
        <BeforeAfter />
      </div>
    </section>
  );
}
