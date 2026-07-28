'use client';

import { CONTACT_EMAIL } from '@/lib/data';
import { Reveal } from '@/components/Reveal';
import SplitText from '@/components/SplitText';
import { useContactModal } from '@/components/ContactModalProvider';

const socials = [
  { label: 'Are.na',      href: 'https://www.are.na/q-bix/channels' },
  { label: 'GitHub',      href: 'https://github.com/qbixstudio-bit' },
  { label: 'X / Twitter', href: 'https://x.com/QbixStudio' },
  { label: 'LinkedIn',    href: 'https://www.linkedin.com/company/qbix-studio' },
  { label: 'Instagram',   href: 'https://www.instagram.com/qbix_studio/' },
];

export default function Colophon() {
  const { open: openContactModal } = useContactModal();

  return (
    <footer className="footer" data-nav-theme="dark">
      <div className="container">
        <Reveal className="footer-cta" speed="base" margin="0px 0px 0px 0px">
          <p className="footer-tagline">
            The <span className="hi">coolest</span> people, on the{' '}
            <span className="hi">coolest</span> ideas.
          </p>
          <button
            type="button"
            className="btn btn-primary btn-lg split-cta"
            onClick={openContactModal}
          >
            <SplitText text="Tell us your idea" arrow />
          </button>
        </Reveal>

        <Reveal className="footer-contact" speed="fast" delay={0.1} margin="0px 0px 0px 0px">
          <a href={`mailto:${CONTACT_EMAIL}`} className="footer-contact-link">
            {CONTACT_EMAIL}
          </a>
        </Reveal>

        <Reveal className="footer-social" speed="fast" delay={0.2} margin="0px 0px 0px 0px">
          {socials.map((s) => (
            <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer">
              {s.label}
            </a>
          ))}
        </Reveal>

        <Reveal className="footer-line" speed="fast" delay={0.3} margin="0px 0px 0px 0px">
          <span>© 2026 Qbix</span>
        </Reveal>
      </div>
    </footer>
  );
}
