import type { Metadata } from 'next';
import Link from 'next/link';
import Colophon from '@/components/Colophon';
import BrandText from '@/components/BrandText';
import StartProjectForm from '@/components/StartProjectForm';
import { CONTACT_EMAIL, BOOKING_URL } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Start a project',
  description:
    'Tell Qbix Studio what you’re building. Share your project type, budget, and timeline and we’ll reply within 24 hours — a senior AI-native studio in Seattle.',
  alternates: { canonical: '/start' },
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
      <main className="detail start-page">
        <div className="container">
          <Link href="/" className="detail-crumb">
            <span className="arrow">←</span>{' '}
            <span>
              <span className="brand-q">Q</span>bix Studio
            </span>
          </Link>

          <header className="detail-head">
            <span className="eyebrow">
              <span className="signal-dot" />
              Start a project
            </span>
            <h1 className="detail-title">
              Tell us what you&rsquo;re building.
            </h1>
            <p className="detail-lede">
              <BrandText>
                A few more details than the quick form — project type, budget, timeline — so our
                first reply is already useful. We read every brief and answer within 24 hours.
              </BrandText>
            </p>
          </header>

          <div className="start-layout">
            <div className="start-form-col">
              <StartProjectForm />
            </div>

            <aside className="start-aside">
              <section className="start-aside-block">
                <span className="detail-section-label">FIG · What happens next</span>
                <ol className="start-steps">
                  {STEPS.map((s) => (
                    <li key={s.k} className="start-step">
                      <span className="start-step-k">{s.k}</span>
                      <div className="start-step-body">
                        <h3>{s.t}</h3>
                        <p>
                          <BrandText>{s.d}</BrandText>
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              <section className="contact-sprint start-sprint">
                <div className="contact-sprint-head">
                  <span className="fig">FIG · The 48-hour sprint</span>
                  <span className="contact-sprint-price">
                    From <strong>$500</strong> · idea → working prototype
                  </span>
                  <span className="contact-sprint-status">
                    <span className="contact-sprint-dot" aria-hidden />
                    Live sprint window
                  </span>
                </div>
                <div className="contact-sprint-body">
                  <div className="contact-sprint-figure">
                    <span className="contact-sprint-n">48</span>
                    <span className="contact-sprint-unit">hours</span>
                  </div>
                  <p className="contact-sprint-cap">
                    From signed SOW to a working prototype in your inbox — senior
                    craft, on the clock. Pick &ldquo;48-hour sprint&rdquo; above and
                    we&rsquo;ll send the next open slot.
                  </p>
                </div>
              </section>

              <section className="start-aside-block start-reach">
                <span className="detail-section-label">FIG · Reach us directly</span>
                <a href={`mailto:${CONTACT_EMAIL}`} className="start-reach-link">
                  {CONTACT_EMAIL}
                </a>
                <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="start-reach-link">
                  Book a 30-min intro call ↗
                </a>
                <span className="start-reach-meta">Seattle, WA · remote worldwide</span>
              </section>
            </aside>
          </div>
        </div>
      </main>
      <Colophon />
    </>
  );
}
