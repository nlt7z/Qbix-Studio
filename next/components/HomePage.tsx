import Hero from '@/components/sections/Hero';
import WhatWeDo from '@/components/sections/WhatWeDo';
import QbixLabs from '@/components/sections/QbixLabs';
import AboutUs from '@/components/sections/AboutUs';
import Colophon from '@/components/Colophon';
import StackFit from '@/components/StackFit';
import Momentum from '@/components/Momentum';
import { AudienceProvider, type Audience } from '@/components/Audience';
import '@/app/home-motion.css';
import '@/app/momentum.css';

/**
 * The homepage, in one of its two modes: / talks to founders and product
 * teams, /business to local businesses (see components/Audience.tsx).
 */
export default function HomePage({ audience }: { audience: Audience }) {
  return (
    <AudienceProvider initial={audience}>
      {/* Panels stack: each pins and the next slides over it (globals.css). */}
      <main className="stacked">
        <Hero />       {/* 1 — the switch, headline, two CTAs, studio band */}
        <WhatWeDo />   {/* 2 — services for the chosen audience, a line to the other */}
        <QbixLabs />   {/* 3 — Qbix Labs products (founders only) */}
        <AboutUs />    {/* 4 — our story */}
      </main>
      {/* Footer is NOT part of the stack — it flows normally right after About. */}
      <Colophon />
      <StackFit />
      <Momentum />
    </AudienceProvider>
  );
}
