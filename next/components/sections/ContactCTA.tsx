'use client';

import { CONTACT_EMAIL, BOOKING_URL, CONTACT_NOTE } from '@/lib/data';
import { Reveal } from '@/components/Reveal';

export default function ContactCTA() {
  return (
    <section id="contact" className="contact section-pad">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="contact-decoration"
        src="/qbix-cube.png"
        alt=""
        aria-hidden
        loading="lazy"
      />
      <div className="container">
        <Reveal speed="fast">
          <span className="eyebrow">
            <span className="num">09</span>
            Contact
          </span>
          <h2 className="contact-heading" style={{ marginTop: 14 }}>
            <Reveal as="span" className="line" speed="slow" delay={0.05}>
              Have an idea?
            </Reveal>
            <Reveal as="span" className="line accent" speed="cinematic" delay={0.2}>
              Let’s turn it into something people can use.
            </Reveal>
          </h2>
        </Reveal>

        <Reveal as="p" className="contact-sub" speed="base" delay={0.55}>
          {CONTACT_NOTE}
        </Reveal>

        <Reveal className="contact-ctas" speed="fast" delay={0.75}>
          <a href={`mailto:${CONTACT_EMAIL}`} className="btn btn-primary btn-lg">
            Start a project
            <span className="arrow">→</span>
          </a>
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-lg"
          >
            Book an intro call ↗
          </a>
        </Reveal>

        <div className="contact-meta">
          <span>{CONTACT_EMAIL}</span>
          <span>·</span>
          <span>Seattle</span>
        </div>
      </div>
    </section>
  );
}
