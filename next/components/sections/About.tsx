'use client';

import { aboutLede } from '@/lib/data';
import BrandText from '@/components/BrandText';
import { Reveal } from '@/components/Reveal';

export default function About() {
  return (
    <section id="about" className="section-pad">
      <div className="container">
        <Reveal as="header" className="section-head" speed="fast">
          <div>
            <span className="eyebrow">
              <span className="num">08</span>
              About
            </span>
            <h2 style={{ marginTop: 14 }}>A studio built on taste and craft.</h2>
          </div>
        </Reveal>

        <Reveal as="p" className="about-lede" speed="slow" delay={0.15}>
          <BrandText>{aboutLede}</BrandText>
        </Reveal>

        <Reveal className="about-ribbon" speed="cinematic" delay={0.35}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/about-ribbon.png"
            alt="Qbix Studio translucent ribbon mark with lime Q"
            loading="lazy"
            decoding="async"
          />
        </Reveal>
      </div>
    </section>
  );
}
