'use client';

import Link from 'next/link';
import { CONTACT_EMAIL, offers, services } from '@/lib/data';
import { Reveal } from '@/components/Reveal';
import SplitText from '@/components/SplitText';
import { useContactModal } from '@/components/ContactModalProvider';
import FooterMark from '@/components/FooterMark';
import Marker from '@/components/Marker';

const socials = [
  { label: 'Are.na',      href: 'https://www.are.na/q-bix/channels' },
  { label: 'GitHub',      href: 'https://github.com/qbixstudio-bit' },
  { label: 'X / Twitter', href: 'https://x.com/QbixStudio' },
  { label: 'LinkedIn',    href: 'https://www.linkedin.com/company/qbix-studio' },
  { label: 'Instagram',   href: 'https://www.instagram.com/qbix_studio/' },
];

type Item = { label: string; href?: string; external?: boolean; live?: boolean };

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
      { label: 'AI Bidding', live: true },
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
  // Shipped, but no public link yet: listed plainly, no "Soon" chip.
  if (!item.href && item.live) return <span className="ft-link is-static">{item.label}</span>;
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

/** `bare` (the homepage): the story's last chapter is the sign-off and its
 *  wordmark, so the footer is the sitemap, the status line and the legal line. */
export default function Colophon({ bare = false }: { bare?: boolean }) {
  const { open: openContactModal } = useContactModal();

  return (
    <footer className="footer ft" data-nav-theme="dark" data-cta-zone>
      <div className="container">
        {/* Sign-off line + the one action. */}
        {!bare && (
        <Reveal className="ft-head" speed="base" margin="0px 0px 0px 0px">
          <div>
            <p className="ft-tagline">
              Bring the idea.{' '}
              <br className="ft-br" />
              <Marker>{'We\u2019ll build the thing.'}</Marker>
            </p>
          </div>
          <div className="ft-head-cta">
            {/* White, not lime: the marked line is this screen's one lime. */}
            <button type="button" className="btn btn-white btn-lg split-cta" onClick={openContactModal}>
              <SplitText text="Tell us your idea" arrow />
            </button>
            <a href={`mailto:${CONTACT_EMAIL}`} className="ft-mail">
              {CONTACT_EMAIL}
            </a>
          </div>
        </Reveal>
        )}

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

        {/* Instrument line: availability · back to top. */}
        <Reveal className="ft-status" speed="fast" delay={0.12} margin="0px 0px 0px 0px">
          {/* On phones, where the footer runs past one screen, this is the
              lower screen's lime: a live tag (see ONE LIME PER SCREEN). */}
          <span className="ft-status-item ft-taking">
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

      {/* Sign-off — the wordmark in square pixels, then the legal line. */}
      <div className="ft-stage">
        {!bare && <FooterMark />}
        <div className="ft-legal mono">
          <span>© 2026 Qbix</span>
        </div>
      </div>
    </footer>
  );
}
