'use client';

import { Words } from '@/components/Reveal';
import { PixelEdge } from '@/components/ScrollMotion';
import DitherField from '@/components/DitherField';
import Marker from '@/components/Marker';

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

        {/* The story is the whole panel, set large. It arrives with the panel
            itself (no timed reveal), so a fast scroll never outruns it. */}
        <p className="about-body about-body--solo">
          AI has lowered the technical barrier, but the fact that anyone can
          build does not mean anyone can build well. We bring unusually sharp
          instincts, more than 10 years of training toward the best taste in
          the industry, real curiosity about new things (which means you get the
          newest tech), and respect for every idea that comes in. We put weight
          on early exploration and research, because{' '}
          {/* One highlight, this screen's one lime: the line the whole story
              leads to. A lime bar slides across it once it's on screen. */}
          <Marker className="about-hi">no idea deserves to be wasted</Marker>.
        </p>
      </div>
    </section>
  );
}
