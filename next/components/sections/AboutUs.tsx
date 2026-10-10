'use client';

import { Reveal, Wipe } from '@/components/Reveal';
import DitherField from '@/components/DitherField';

export default function AboutUs() {
  return (
    <section id="about" className="about section-pad" data-nav-theme="light">
      <DitherField />
      <div className="container">
        <header className="section-head">
          <div>
            <Reveal as="span" className="eyebrow" speed="fast">
              About Qbix
            </Reveal>
            <Wipe as="h2" style={{ marginTop: 14 }}>
              Our story is simple.
            </Wipe>
          </div>
        </header>

        {/* The story is the whole panel — set large, key phrases weighted. */}
        <Reveal as="p" className="about-body about-body--solo" speed="base" delay={0.2}>
          AI has lowered the technical barrier, but the fact that anyone can
          build does not mean anyone can <span className="about-hi">build well</span>.
          We bring <span className="about-hi">unusually sharp instincts</span>, more
          than 10 years of training toward the <span className="about-hi">best taste</span>{' '}
          in the industry, real curiosity about new things (which means you get
          the <span className="about-hi">newest tech</span>), and respect for every
          idea that comes in. We put weight on early exploration and research,
          because <span className="about-hi">no idea deserves to be wasted</span>.
        </Reveal>
      </div>
    </section>
  );
}
