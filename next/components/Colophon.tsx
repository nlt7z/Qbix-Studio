'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { CONTACT_EMAIL, offers, services } from '@/lib/data';
import { Reveal } from '@/components/Reveal';
import SplitText from '@/components/SplitText';
import { useContactModal } from '@/components/ContactModalProvider';
import FooterMark from '@/components/FooterMark';
import FloorMark from '@/components/FloorMark';
import Marker from '@/components/Marker';
import { smoothScrollTo } from '@/lib/smoothScroll';

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

function FooterLink({ item, floor }: { item: Item; floor?: boolean }) {
  // Shipped, but no public link yet: listed plainly, no "Soon" chip.
  if (!item.href && item.live) return <span className="ft-link is-static">{item.label}</span>;
  if (!item.href) {
    // on the homepage's floor it's said in grey, not boxed
    return (
      <span className="ft-link is-soon">
        {item.label}
        <span className={`ft-soon${floor ? '' : ' mono'}`}>{floor ? 'soon' : 'Soon'}</span>
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

/** `bare` (the homepage): the story's last chapter is the sign-off, so the
 *  footer is the sitemap, the status line and the wordmark as the page's
 *  floor. It waits underneath: the story lifts off it like a curtain (when it
 *  fits on the screen; taller, it scrolls in as usual). */
export default function Colophon({ bare = false }: { bare?: boolean }) {
  const { open: openContactModal } = useContactModal();
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const foot = ref.current;
    const main = document.querySelector<HTMLElement>('main.story');
    if (!bare || !foot || !main) return;
    const fit = () => {
      const h = foot.offsetHeight;
      const curtain = h < window.innerHeight * 0.92;
      foot.classList.toggle('ft--curtain', curtain);
      main.style.marginBottom = curtain ? `${h}px` : '';
    };
    const ro = new ResizeObserver(fit);
    ro.observe(foot);
    window.addEventListener('resize', fit);
    fit();
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', fit);
      main.style.marginBottom = '';
    };
  }, [bare]);

  return (
    <footer ref={ref} className={`footer ft${bare ? ' ft--floor' : ''}`} data-nav-theme="dark" data-cta-zone>
      <div className="container">
        {/* Sign-off line + the one action. */}
        {!bare && (
        <Reveal className="ft-head" speed="base" margin="0px 0px 0px 0px">
          <div>
            <p className="ft-tagline">
              Bring the idea.{' '}
              <br className="ft-br" />
              {/* white: the screen's one lime is the page's own button just above */}
              <Marker className="marker--white">{'We\u2019ll build the thing.'}</Marker>
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
              <span className={`ft-col-title${bare ? '' : ' mono'}`}>{col.title}</span>
              <ul>
                {col.items.map((it) => (
                  <li key={it.label}>
                    <FooterLink item={it} floor={bare} />
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </Reveal>

        {/* Instrument line: availability · back to top. */}
        <Reveal className="ft-status" speed="fast" delay={0.12} margin="0px 0px 0px 0px">
          {/* On phones, where the footer runs past one screen, this is the
              lower screen's lime: a live tag (see ONE LIME PER SCREEN). Not
              on the homepage, where the lime sign-off is right above it. */}
          <span className="ft-status-item ft-taking">
            {!bare && <span className="ft-live" aria-hidden />}
            Taking new projects
          </span>
          {bare && <span className="ft-status-item">© 2026 Qbix</span>}
          <button
            type="button"
            className="ft-top"
            onClick={() => smoothScrollTo(0)}
          >
            Back to top <span aria-hidden>↑</span>
          </button>
        </Reveal>
      </div>

      {/* Sign-off: the wordmark in square pixels, then the legal line; on the
          homepage the wordmark is the page's floor. */}
      <div className="ft-stage">
        {bare ? (
          <div className="ft-floor">
            <FloorMark />
          </div>
        ) : (
          <>
            <FooterMark />
            <div className="ft-legal mono">
              <span>© 2026 Qbix</span>
            </div>
          </>
        )}
      </div>
    </footer>
  );
}
