'use client';

import { aboutLede, teamMembers } from '@/lib/data';
import BrandText from '@/components/BrandText';
import { Reveal, Stagger, RevealItem } from '@/components/Reveal';

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

        <div className="team-strip">
          <Reveal as="header" className="team-strip-head" speed="fast">
            <span className="eyebrow">
              <span className="num">08 / a</span>
              Team
            </span>
            <p className="mono team-strip-legend">
              <span className="team-strip-dot" aria-hidden />
              The two people you actually work with.
            </p>
          </Reveal>

          <Stagger
            as="ul"
            className="team-strip-list"
            stagger={0.12}
            delayChildren={0.2}
          >
            {teamMembers.map((m) => (
              <RevealItem
                as="li"
                key={m.initial}
                className="team-strip-card"
                speed="base"
              >
                <span className="team-strip-sigil" aria-hidden>
                  {m.initial}
                </span>
                <div className="team-strip-body">
                  <div className="team-strip-name-row">
                    <span className="team-strip-name">{m.name}</span>
                    <span className="team-strip-title mono">{m.title}</span>
                  </div>
                  <p className="team-strip-bio">{m.bio}</p>
                </div>
              </RevealItem>
            ))}
          </Stagger>
        </div>

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
