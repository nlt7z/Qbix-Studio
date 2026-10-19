'use client';

import type { ReactNode } from 'react';
import StageBox from '@/components/story/StageBox';
import BeforeAfter from './BeforeAfter';

/**
 * Practice hero: the copy beside the site, live with its phone, floating (the
 * page's object, components/story/BlockStage). The before-and-after sample of
 * the redesign follows below.
 */
export default function RebuildHero({ children }: { children: ReactNode }) {
  return (
    <section className="pw-hero" data-nav-theme="light" data-chapter data-forms="pwHero" data-tone="paper">
      <div className="container pw-hero-grid">
        <div className="pw-hero-copy">{children}</div>
        <div className="pw-hero-figure">
          <StageBox label="A calm practice homepage, live on its address, with its phone" />
        </div>
      </div>
      <div className="container pw-compare">
        <BeforeAfter />
      </div>
    </section>
  );
}
