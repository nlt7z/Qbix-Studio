import Link from 'next/link';
import { CONTACT_EMAIL, BOOKING_URL } from '@/lib/data';
import { Reveal, Stagger, RevealItem } from '@/components/Reveal';

const cols = [
  {
    label: 'Qbix',
    links: [
      { label: 'Work',     href: '#work' },
      { label: 'Services', href: '#services' },
      { label: 'How we work', href: '#how' },
      { label: 'Product',  href: '#product' },
      { label: 'About',    href: '#about' },
    ],
  },
  {
    label: 'Reach',
    links: [
      { label: CONTACT_EMAIL,        href: `mailto:${CONTACT_EMAIL}` },
      { label: 'Book an intro call', href: BOOKING_URL },
      { label: 'Press kit',          href: '/press' },
    ],
  },
  {
    label: 'Channels',
    links: [
      { label: 'Are.na',      href: 'https://www.are.na/q-bix/channels' },
      { label: 'GitHub',      href: 'https://github.com/qbixstudio-bit' },
      { label: 'X / Twitter', href: 'https://x.com/QbixStudio' },
      { label: 'LinkedIn',    href: 'https://www.linkedin.com/company/qbix-studio' },
      { label: 'Instagram',   href: 'https://www.instagram.com/qbix_studio/' },
    ],
  },
];

export default function Colophon() {
  return (
    <footer className="footer" data-nav-theme="dark">
      <div className="container">
        <Stagger className="footer-grid" stagger={0.1} delayChildren={0.05}>
          <RevealItem speed="fast">
            <div className="footer-brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="footer-logo" src="/qbix-keyboard.png" alt="Qbix" />
            </div>
            <p className="footer-tagline">
              An AI-native product design and software studio. We design and build{' '}
              <Link href="/services/app-ai" className="text-link">AI products</Link>{' '}
              from strategy to interface to launch.
            </p>
          </RevealItem>

          {cols.map((col) => (
            <RevealItem key={col.label} className="footer-col" speed="fast">
              <span className="footer-col-label">{col.label}</span>
              <ul>
                {col.links.map((l) => {
                  const isInternal = l.href.startsWith('#') || l.href.startsWith('/');
                  return (
                    <li key={l.href}>
                      {isInternal ? (
                        <Link href={l.href}>{l.label}</Link>
                      ) : (
                        <a href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </RevealItem>
          ))}
        </Stagger>

        <Reveal className="footer-line" speed="fast" delay={0.4}>
          <span>© 2026 <span className="brand-q">Q</span>bix</span>
        </Reveal>
      </div>
    </footer>
  );
}
