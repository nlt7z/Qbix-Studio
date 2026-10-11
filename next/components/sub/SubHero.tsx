import Link from 'next/link';
import type { ReactNode } from 'react';
import { Reveal } from '@/components/Reveal';

/**
 * Secondary-page hero — the landing's language at page scale: a mono eyebrow,
 * a very large Eurostile title, a lede, actions, an optional visual on the
 * right, and an optional instrument line of facts under a hairline.
 */
export default function SubHero({
  crumb,
  eyebrow,
  title,
  lede,
  actions,
  visual,
  meta,
}: {
  crumb?: { href: string; label: string };
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  actions?: ReactNode;
  visual?: ReactNode;
  meta?: { k: string; v: ReactNode }[];
}) {
  return (
    <section className={`sp-hero${visual ? ' sp-hero--visual' : ''}`} data-nav-theme="dark">
      <div className="container sp-hero-grid">
        <div className="sp-hero-copy">
          {crumb && (
            <Link href={crumb.href} className="sp-crumb mono">
              ← {crumb.label}
            </Link>
          )}
          <Reveal as="span" className="sp-eyebrow mono" speed="fast">
            {eyebrow}
          </Reveal>
          <Reveal as="h1" className="sp-title" speed="base" delay={0.05}>
            {title}
          </Reveal>
          {lede && (
            <Reveal as="p" className="sp-lede" speed="base" delay={0.15}>
              {lede}
            </Reveal>
          )}
          {actions && (
            <Reveal className="sp-actions" speed="base" delay={0.25}>
              {actions}
            </Reveal>
          )}
        </div>
        {visual && (
          <Reveal className="sp-hero-visual" speed="base" delay={0.2}>
            {visual}
          </Reveal>
        )}
      </div>
      {meta && (
        <div className="container">
          <dl className="sp-meta">
            {meta.map((m) => (
              <div key={m.k}>
                <dt>{m.k}</dt>
                <dd>{m.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </section>
  );
}
