import Hero from '@/components/sections/Hero';
import WhatWeDo from '@/components/sections/WhatWeDo';
import SelectedWork from '@/components/sections/SelectedWork';
import Testimonial from '@/components/sections/Testimonial';
import HowWeWork from '@/components/sections/HowWeWork';
import QbixLabs from '@/components/sections/QbixLabs';
import ContactCTA from '@/components/sections/ContactCTA';
import Colophon from '@/components/Colophon';

export default function LandingPage() {
  return (
    <main>
      <Hero />          {/* 01 — adds trust line under sub-copy */}
      <WhatWeDo />      {/* 02 — 4 services */}
      <SelectedWork /> {/* 03 — case grid */}
      <Testimonial />  {/* social proof between cases + process */}
      <HowWeWork />    {/* 04 */}
      <QbixLabs />     {/* 05 — labs with brand-object decoration */}
      <ContactCTA />   {/* 06 — Sprint inline + From $2k anchor */}
      <Colophon />
    </main>
  );
}
