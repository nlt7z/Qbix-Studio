import Link from 'next/link';
import { CONTACT_EMAIL } from '@/lib/data';

const cols = [
  {
    label: 'Studio',
    links: [
      { label: 'Work',     href: '#work' },
      { label: 'Services', href: '#services' },
      { label: 'How we work', href: '#how' },
      { label: 'Labs',     href: '#labs' },
      { label: 'About',    href: '#about' },
    ],
  },
  {
    label: 'Reach',
    links: [
      { label: CONTACT_EMAIL,        href: `mailto:${CONTACT_EMAIL}` },
      { label: 'Book an intro call', href: 'https://cal.com/qbix' },
      { label: 'Press kit',          href: '/press' },
    ],
  },
  {
    label: 'Channels',
    links: [
      { label: 'Are.na',      href: 'https://www.are.na/qbix-studio' },
      { label: 'GitHub',      href: 'https://github.com/qbix-studio' },
      { label: 'X / Twitter', href: 'https://x.com/qbixstudio' },
      { label: 'LinkedIn',    href: 'https://www.linkedin.com/company/qbix-studio' },
    ],
  },
];

export default function Colophon() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="footer-logo" src="/qbix-keyboard.png" alt="Qbix" />
              <span className="slash"> / </span>Studio
            </div>
            <p className="footer-tagline">
              An AI-native product design and software studio. We design and build AI products
              from strategy to interface to launch.
            </p>
          </div>

          {cols.map((col) => (
            <div key={col.label} className="footer-col">
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
            </div>
          ))}
        </div>

        <div className="footer-line">
          <span>© 2026 <span className="brand-q">Q</span>bix Studio LLC</span>
          <span>Seattle</span>
        </div>
      </div>
    </footer>
  );
}
