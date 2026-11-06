import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import Footer from '@/components/blocks/Footer';
import { Line, Mark, Rise } from '@/components/blocks/Rise';
import { CONTACT_EMAIL, BOOKING_URL } from '@/lib/data';
import Brief from './Brief';
import './start-page.css';

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
  { t: 'We read every brief', d: 'We read what you send, not a sales desk. Expect a reply within 24 hours.' },
  { t: 'A short scoping call', d: 'If it’s a fit, we hop on a 30-minute call to pressure-test scope, goals, and constraints.' },
  { t: 'A fixed proposal', d: 'You get a clear proposal (scope, price, and timeline) with no agency overhead or hand-off PDFs.' },
];

/**
 * Start a project: the headline across the page, the words and the cube beside the brief (white); what happens
 * next in three numbers (black); the two ways to reach us directly (white). No dock here: this page is the brief.
 */
export default function StartPage() {
  return (
    <main className="blocks pg-start" data-stack>
      <section className="block block--flat hero" data-tone="white" id="top">
        <div className="in">
          <p className="kicker">Start a project</p>
          <Rise as="h1" className="display hero-h" fit={{ max: 150, min: 30 }}>
            <Line>Tell us what</Line>
            <Line>you’re building.</Line>
          </Rise>
          <Brief>
            <p className="lede" data-up="">
              A few details, so our first reply is already useful. We read every brief and answer{' '}
              <Mark>within 24 hours.</Mark>
            </p>
          </Brief>
        </div>
      </section>

      <section className="block" data-tone="black">
        <div className="in">
          <Rise className="h1">
            What happens <Mark>next.</Mark>
          </Rise>
          <ol className="next">
            {STEPS.map((s, i) => (
              <li key={s.t} data-up="" style={i ? ({ '--ud': `${i * 120}ms` } as CSSProperties) : undefined}>
                <span className="next-n">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="h4">{s.t}</h3>
                <p>{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="block" id="reach" data-tone="white">
        <div className="in">
          <p className="kicker">Reach us directly</p>
          <div className="reach-big">
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            <a href={BOOKING_URL} target="_blank" rel="noreferrer">
              Book a 30-min intro call ↗︎
            </a>
          </div>
          <p className="reach-foot">
            <span>
              <b>Remote, worldwide</b>
            </span>
            <span>Based in Seattle, Washington</span>
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
