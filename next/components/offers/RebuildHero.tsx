'use client';

import type { ReactNode } from 'react';
import BlockFigure from '@/components/BlockFigure';
import BeforeAfter from './BeforeAfter';

/**
 * Practice hero: the copy beside the site's blocks, arranged as a calm page
 * with its phone (the one button is the lime). The before-and-after sample
 * of the redesign follows below.
 */
export default function RebuildHero({ children }: { children: ReactNode }) {
  return (
    <section className="pw-hero" data-nav-theme="light">
      <div className="container pw-hero-grid">
        <div className="pw-hero-copy">{children}</div>
        <div className="pw-hero-figure">
          <BlockFigure form="practice" tone="paper" label="A calm practice website and its phone, in blocks; the one button is lime" />
        </div>
      </div>
      <div className="container pw-compare">
        <BeforeAfter />
      </div>
    </section>
  );
}
