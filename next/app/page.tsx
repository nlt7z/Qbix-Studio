import Hero from '@/components/sections/Hero';
import WhatWeDo from '@/components/sections/WhatWeDo';
import QbixLabs from '@/components/sections/QbixLabs';
import AboutUs from '@/components/sections/AboutUs';
import Colophon from '@/components/Colophon';
import StackTint from '@/components/StackTint';

export default function LandingPage() {
  return (
    <>
      <main className="stacked">
        <StackTint />  {/* per-panel scroll-interpolated base colours */}
        <Hero />       {/* 1 — headline + PST clock + two CTAs */}
        <WhatWeDo />   {/* 2 — Who we work with: Design service + Brand upgrade */}
        <QbixLabs />   {/* 3 — Products: the live things we've built */}
        <AboutUs />    {/* 4 — Our story + founders */}
      </main>
      {/* Footer is NOT part of the stack — it flows normally right after About. */}
      <Colophon />
    </>
  );
}
