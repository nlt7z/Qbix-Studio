import { CHECKOUT } from '@/lib/data';
import { Reveal } from '@/components/Reveal';
import CheckoutButton from './CheckoutButton';
import Faq from './Faq';
import BeforeAfter from './BeforeAfter';

const CTA_LABEL = 'Start my website, $400 deposit';
const OFFER = 'Practice Website Refresh';

const GET = [
  { k: '3 to 5 pages.', v: 'Home, About, Specialties, Fees and Insurance, Contact.' },
  { k: 'Works on every phone.', v: 'Fast, readable, and secure (https).' },
  {
    k: 'One clear next step.',
    v: 'A "Book a free consultation" button on every page, linked to your phone, email, or the booking tool you already use.',
  },
  { k: 'Found on Google.', v: 'Your name, city, and specialties set up so search results show the right information.' },
  {
    k: 'You own it.',
    v: 'Built on Squarespace in your name. Hosting is billed to you directly by the platform, not through me.',
  },
  { k: 'A short how-to video', v: 'showing how to edit your text yourself.' },
  { k: '30 days of small fixes', v: 'after launch.' },
];

const STEPS = [
  { k: 'Fill out a short questionnaire by email.', v: 'It takes about 15 minutes.' },
  { k: 'See your new homepage in 3 days', v: 'and tell me what to change.' },
  { k: 'Your full site goes live in 7 days.', v: 'I connect your existing domain and keep your email working.' },
];

const FAQ = [
  { q: 'Do we need to meet?', a: 'No. Everything happens by email. A phone call is fine if you prefer one.' },
  { q: 'What happens to my current text?', a: 'I reuse it and tighten it. You approve every word before launch.' },
  {
    q: 'Do you see client information?',
    a: 'No. I never handle client messages or records. The site links to your own email, phone, or secure booking tool.',
  },
  { q: 'Will I lose my domain?', a: 'No. Your domain stays yours.' },
];

export default function PracticeWebsites() {
  return (
    <main className="offer pw">
      <section className="pw-hero" data-nav-theme="light">
        <div className="container pw-narrow">
          <Reveal as="span" className="pw-eyebrow mono" speed="fast">
            Practice Website Refresh
          </Reveal>
          <Reveal as="h1" className="pw-title" speed="base" delay={0.05}>
            A website that feels as calm as your office.
          </Reveal>
          <Reveal as="p" className="pw-lede" speed="base" delay={0.15}>
            I rebuild websites for solo practices in one week. Your words, your photos, a clean design that works on
            any phone. You never have to touch the tech.
          </Reveal>
          <Reveal className="pw-cta-row" speed="base" delay={0.25}>
            <CheckoutButton href={CHECKOUT.practiceDeposit} offer={OFFER} label={CTA_LABEL} className="pw-btn" />
            <span className="pw-cta-note">$800 flat · live in 7 days</span>
          </Reveal>
        </div>
        <Reveal className="container pw-compare" speed="base" delay={0.2}>
          <BeforeAfter />
        </Reveal>
      </section>

      <section className="pw-section" data-nav-theme="light">
        <div className="container pw-narrow">
          <h2 className="pw-h2">Why it matters</h2>
          <p className="pw-text">
            Most people look for a therapist on their phone, often late at night, after reading a few profiles. If
            your site is hard to read on a small screen, or still says 2019 at the bottom, they move on before they
            learn anything about you.
          </p>
          <p className="pw-pull">Your directory profile brings people in. Your website is what makes them reach out.</p>
        </div>
      </section>

      <section className="pw-section" data-nav-theme="light">
        <div className="container pw-narrow">
          <h2 className="pw-h2">What you get</h2>
          <ul className="pw-list">
            {GET.map((g) => (
              <li key={g.k}>
                <strong>{g.k}</strong> {g.v}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="pw-section" data-nav-theme="light">
        <div className="container pw-narrow">
          <h2 className="pw-h2">How it works</h2>
          <ol className="pw-steps">
            {STEPS.map((s, i) => (
              <li key={s.k}>
                <span className="pw-step-n">{i + 1}</span>
                <span>
                  <strong>{s.k}</strong> {s.v}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="pw-section" data-nav-theme="light">
        <div className="container pw-narrow">
          <h2 className="pw-h2">Price</h2>
          <p className="pw-price">
            <span className="pw-price-big">$800</span> flat.
          </p>
          <p className="pw-text">$400 to start, $400 when the site goes live.</p>
        </div>
      </section>

      <section className="pw-section" data-nav-theme="light">
        <div className="container pw-narrow">
          <h2 className="pw-h2">Questions</h2>
          <Faq items={FAQ} className="pw-faq" />
        </div>
      </section>

      <section className="pw-section pw-section--last" data-nav-theme="light">
        <div className="container pw-narrow">
          <h2 className="pw-h2">About me</h2>
          <div className="offer-me">
            <img className="offer-me-photo" src="/assets/sera.jpg" alt="Sera" width={120} height={120} loading="lazy" />
            <p className="pw-text">
              I&rsquo;m Sera. I studied human-centered design at the University of Washington and trained as a painter at
              Pratt. I design software products for a living, and I rebuild websites for independent practices because a
              good one makes a real difference to a small business.
            </p>
          </div>
          <div className="pw-close">
            <CheckoutButton href={CHECKOUT.practiceDeposit} offer={OFFER} label={CTA_LABEL} className="pw-btn" />
          </div>
        </div>
      </section>
    </main>
  );
}
