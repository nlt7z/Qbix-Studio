'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { CONTACT_EMAIL, offers, services } from '@/lib/data';
import { Reveal } from '@/components/Reveal';
import SplitText from '@/components/SplitText';
import PstClock from '@/components/PstClock';
import { useContactModal } from '@/components/ContactModalProvider';
import FooterMark from '@/components/FooterMark';

const socials = [
  { label: 'Are.na',      href: 'https://www.are.na/q-bix/channels' },
  { label: 'GitHub',      href: 'https://github.com/qbixstudio-bit' },
  { label: 'X / Twitter', href: 'https://x.com/QbixStudio' },
  { label: 'LinkedIn',    href: 'https://www.linkedin.com/company/qbix-studio' },
  { label: 'Instagram',   href: 'https://www.instagram.com/qbix_studio/' },
];

type Item = { label: string; href?: string; external?: boolean };

const COLUMNS: { title: string; items: Item[] }[] = [
  {
    title: 'Services',
    items: [
      ...services.map((s) => ({ label: s.title, href: '/start' })),
      ...offers.map((o) => ({ label: o.title, href: o.href })),
    ],
  },
  {
    title: 'Products',
    items: [
      { label: 'Strata', href: '/products/strata' },
      { label: 'AI Bidding' },
      { label: 'TTS Editor' },
      { label: 'Interview Assistant' },
    ],
  },
  {
    title: 'Studio',
    items: [
      { label: 'About', href: '/#about' },
      { label: 'Careers' },
    ],
  },
  {
    title: 'Elsewhere',
    items: socials.map((s) => ({ label: s.label, href: s.href, external: true })),
  },
];

function FooterLink({ item }: { item: Item }) {
  if (!item.href) {
    return (
      <span className="ft-link is-soon">
        {item.label}
        <span className="ft-soon mono">Soon</span>
      </span>
    );
  }
  if (item.external) {
    return (
      <a className="ft-link" href={item.href} target="_blank" rel="noopener noreferrer">
        {item.label}
      </a>
    );
  }
  return (
    <Link className="ft-link" href={item.href}>
      {item.label}
    </Link>
  );
}

/**
 * "We'll build the thing." — a lime bar pulls across the line, left to right,
 * leaving it in dark ink (the bar is a clipped window holding a dark copy of
 * the words that counter-slides, so the type never moves). Time-based once
 * the line is on screen, so it always finishes, even at the very end of the
 * page where there's no scroll left to drive it.
 */
function MarkedLine({ children }: { children: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        el.classList.add('is-in');
        io.disconnect();
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <span ref={ref} className="ft-mark">
      {children}
      <span className="ft-mark-bar" aria-hidden>
        <span className="ft-mark-in">{children}</span>
      </span>
    </span>
  );
}

export default function Colophon() {
  const { open: openContactModal } = useContactModal();

  return (
    <footer className="footer ft" data-nav-theme="dark" data-cta-zone>
      <div className="container">
        {/* Sign-off line + the one action. */}
        <Reveal className="ft-head" speed="base" margin="0px 0px 0px 0px">
          <div>
            <span className="ft-eyebrow mono">Start a project</span>
            <p className="ft-tagline">
              Bring the idea.{' '}
              <br className="ft-br" />
              <MarkedLine>{'We\u2019ll build the thing.'}</MarkedLine>
            </p>
          </div>
          <div className="ft-head-cta">
            <button type="button" className="btn btn-primary btn-lg split-cta" onClick={openContactModal}>
              <SplitText text="Tell us your idea" arrow />
            </button>
            <a href={`mailto:${CONTACT_EMAIL}`} className="ft-mail">
              {CONTACT_EMAIL}
            </a>
          </div>
        </Reveal>

        {/* Sitemap — every service, every product, the studio, elsewhere. */}
        <Reveal className="ft-grid" speed="base" delay={0.08} margin="0px 0px 0px 0px">
          {COLUMNS.map((col) => (
            <nav key={col.title} className="ft-col" aria-label={col.title}>
              <span className="ft-col-title mono">{col.title}</span>
              <ul>
                {col.items.map((it) => (
                  <li key={it.label}>
                    <FooterLink item={it} />
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </Reveal>

        {/* Instrument line: studio time · availability · back to top. */}
        <Reveal className="ft-status" speed="fast" delay={0.12} margin="0px 0px 0px 0px">
          <span className="ft-status-item">
            <PstClock size={18} />
            Studio time
          </span>
          <span className="ft-status-item">
            <span className="ft-live" aria-hidden />
            Taking new projects
          </span>
          <button
            type="button"
            className="ft-top"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Back to top <span aria-hidden>↑</span>
          </button>
        </Reveal>
      </div>

      {/* Sign-off — the wordmark as a 3D monument rising out of the page edge. */}
      <div className="ft-stage">
        <FooterMark />
        <div className="ft-legal mono">
          <span>© 2026 Qbix</span>
          <span>qbix.space</span>
        </div>
      </div>
    </footer>
  );
}
