'use client';

import { CONTACT_EMAIL, CONTACT_NOTE } from '@/lib/data';
import { Reveal, Words } from '@/components/Reveal';
import BrandText from '@/components/BrandText';
import { useContactModal } from '@/components/ContactModalProvider';
import SplitText from '@/components/SplitText';

export default function ContactCTA() {
  const { open: openContactModal } = useContactModal();
  return (
    <section id="contact" className="contact section-pad" data-nav-theme="light">
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
            <span className="num">06</span>
            Contact
          </span>
          <h2 className="contact-heading" style={{ marginTop: 14 }}>
            <Words
              as="span"
              className="line"
              text="Have an idea?"
              speed="slow"
              delay={0.05}
              step={0.09}
              style={{ display: 'block' }}
            />
            <Reveal as="span" className="line accent" speed="cinematic" delay={0.2}>
              Let’s turn it into something people can use.
            </Reveal>
          </h2>
        </Reveal>

        <Reveal as="p" className="contact-sub" speed="base" delay={0.55}>
          <BrandText>{CONTACT_NOTE}</BrandText>
        </Reveal>

        <Reveal className="contact-ctas" speed="fast" delay={0.75}>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="btn btn-primary btn-lg split-cta"
            onClick={(e) => {
              e.preventDefault();
              openContactModal();
            }}
          >
            <SplitText text="Start a project" arrow />
          </a>
        </Reveal>

        {/* The sprint offer reads as an open OS window — a title bar and a
            pane of content — not a boxed card sealed off with a background. */}
        <Reveal className="contact-window" speed="base" delay={0.95}>
          <div className="contact-window-bar">
            <span className="contact-window-dots" aria-hidden>
              <i /><i /><i />
            </span>
            <span className="fig">FIG · The 48-hour sprint</span>
            <span className="contact-sprint-status">
              <span className="contact-sprint-dot" aria-hidden />
              Live sprint window
            </span>
          </div>
          <div className="contact-window-pane">
            <div className="contact-sprint-figure">
              <span className="contact-sprint-n">48</span>
              <span className="contact-sprint-unit">hours</span>
            </div>
            <div>
              <p className="contact-sprint-cap">
                From signed SOW to a working prototype in your inbox — senior
                craft, on the clock. Fixed scope, fixed price, one
                calendar block.
              </p>
              <span className="contact-sprint-price">
                From <strong>$500</strong> · Web design, idea → launch
              </span>
            </div>
          </div>
        </Reveal>

        <Reveal className="contact-meta" speed="fast" delay={1.1}>
          <span>{CONTACT_EMAIL}</span>
          <span>·</span>
          <span>Seattle</span>
        </Reveal>
      </div>
    </section>
  );
}
