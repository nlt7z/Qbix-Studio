import Hero from '@/components/sections/Hero';
import WhatWeDo from '@/components/sections/WhatWeDo';
import SelectedWork from '@/components/sections/SelectedWork';
import HowWeWork from '@/components/sections/HowWeWork';
import QbixLabs from '@/components/sections/QbixLabs';
import Sprint from '@/components/sections/Sprint';
import About from '@/components/sections/About';
import ContactCTA from '@/components/sections/ContactCTA';
import Colophon from '@/components/Colophon';

export default function LandingPage() {
  return (
    <main>
      <Hero />           {/* 01 */}
      <WhatWeDo />       {/* 02 */}
      <SelectedWork />   {/* 03 — includes brand objects */}
      <HowWeWork />      {/* 04 */}
      <QbixLabs />       {/* 05 */}
      <Sprint />         {/* 06 */}
      <About />          {/* 07 */}
      <ContactCTA />     {/* 08 */}
      <Colophon />
    </main>
  );
}
