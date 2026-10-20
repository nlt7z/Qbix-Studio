'use client';

import type { ReactNode } from 'react';
import BeforeAfter from './BeforeAfter';
import { PracticeHero } from '@/components/scenes/Practice';

/**
 * Practice hero: the copy beside the site, live with its phone (its scene,
 * components/scenes/Practice.tsx). The before-and-after sample of the
 * redesign follows below.
 */
export default function RebuildHero({ children }: { children: ReactNode }) {
  return (
    <section className="pw-hero" data-nav-theme="light" data-chapter data-tone="paper">
      <div className="container pw-hero-grid">
        <div className="pw-hero-copy">{children}</div>
        <div className="pw-hero-figure">
          <div className="block-figure">
            <PracticeHero />
          </div>
        </div>
      </div>
      <div className="container pw-compare">
        <BeforeAfter />
      </div>
    </section>
  );
}
