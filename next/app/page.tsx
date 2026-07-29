import Hero from '@/components/sections/Hero';
import WhatWeDo from '@/components/sections/WhatWeDo';
import QbixLabs from '@/components/sections/QbixLabs';
import AboutUs from '@/components/sections/AboutUs';
import Colophon from '@/components/Colophon';

export default function LandingPage() {
  return (
    <>
      {/* Panels alternate solid black / electric lime — set in globals.css. */}
      <main className="stacked">
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
