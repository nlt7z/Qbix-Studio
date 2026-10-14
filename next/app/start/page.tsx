import type { Metadata } from 'next';
import Link from 'next/link';
import Colophon from '@/components/Colophon';
import BrandText from '@/components/BrandText';
import StartStudio from '@/components/StartStudio';
import Odometer from '@/components/offers/Odometer';
import { Reveal, Words } from '@/components/Reveal';
import { CONTACT_EMAIL, BOOKING_URL } from '@/lib/data';

const START_DESC =
  'Tell Qbix what you’re building. Share your project type, budget, and timeline and we’ll reply within 24 hours — a senior AI product team in Seattle.';

export const metadata: Metadata = {
  title: 'Start a project',
  description: START_DESC,
  alternates: { canonical: '/start' },
  // Its own share card and URL, not the studio homepage's.
  openGraph: {
    type: 'website',
    siteName: 'Qbix',
    locale: 'en_US',
    images: [{ url: '/og/start.png', width: 1200, height: 630, alt: 'Start a project with Qbix: tell us what you’re building.' }],
    url: 'https://qbix.space/start',
    title: 'Start a project with Qbix',
    description: START_DESC,
  },
  twitter: {
    card: 'summary_large_image',
    site: '@QbixStudio',
    creator: '@QbixStudio',
    images: ['/og/start.png'],
    title: 'Start a project with Qbix',
    description: START_DESC,
  },
};

const STEPS = [
  {
    k: '01',
    t: 'We read every brief',
    d: 'We read what you send — not a sales desk. Expect a reply within 24 hours.',
  },
  {
    k: '02',
    t: 'A short scoping call',
    d: 'If it’s a fit, we hop on a 30-minute call to pressure-test scope, goals, and constraints.',
  },
  {
    k: '03',
    t: 'A fixed proposal',
    d: 'You get a clear proposal — scope, price, and timeline — with no agency overhead or hand-off PDFs.',
  },
];

export default function StartPage() {
  return (
    <>
      <main className="start">
        <section className="start-hero" data-nav-theme="dark">
          <div className="container">
            <Link href="/" className="sp-crumb mono">
              ← Qbix
            </Link>
            <Reveal as="span" className="sp-eyebrow mono" speed="fast">
              Start a project
            </Reveal>
            <Words as="h1" className="start-title" text="Tell us what you’re building." speed="slow" step={0.06} />
            <Reveal as="p" className="sp-lede" speed="base" delay={0.35}>
              <BrandText>
                A few more details than the quick form — project type, budget, timeline — so our first reply is already
                useful. We read every brief and answer within 24 hours.
              </BrandText>
            </Reveal>
          </div>
        </section>

        <section className="start-work" data-nav-theme="dark">
          <StartStudio />
        </section>

        <section className="start-next" data-nav-theme="dark">
          <div className="container">
            <Words as="h2" className="start-h2" text="What happens next" />
            <ol className="start-next-list">
              {STEPS.map((s, i) => (
                <Reveal as="li" key={s.k} className="start-next-step" speed="base" delay={i * 0.12}>
                  <span className="start-next-k mono">{s.k}</span>
                  <h3>{s.t}</h3>
                  <p>
                    <BrandText>{s.d}</BrandText>
                  </p>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        <section className="start-sprint-panel" data-nav-theme="light">
          <div className="container start-sprint-grid">
            <div>
              <span className="start-sprint-eyebrow mono">The 48-hour sprint</span>
              <p className="start-sprint-figure">
                <Odometer value="48" className="start-sprint-n" />
                <span className="start-sprint-unit">hours</span>
              </p>
            </div>
            <div className="start-sprint-copy">
              <p className="start-sprint-price">
                From <strong>$500</strong> · idea → working prototype
              </p>
              <Reveal as="p" speed="base">
                From signed SOW to a working prototype in your inbox — senior craft, on the clock. Pick &ldquo;48-hour
                sprint&rdquo; above and we&rsquo;ll send the next open slot.
              </Reveal>
            </div>
          </div>
        </section>

        <section className="start-reach-panel" data-nav-theme="dark">
          <div className="container start-reach-grid">
            <span className="sp-eyebrow mono">Reach us directly</span>
            <a href={`mailto:${CONTACT_EMAIL}`} className="start-reach-big">
              {CONTACT_EMAIL}
            </a>
            <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="start-reach-big">
              Book a 30-min intro call ↗︎
            </a>
            <span className="start-reach-meta mono">Remote, worldwide</span>
          </div>
        </section>
      </main>
      <Colophon />
    </>
  );
}
