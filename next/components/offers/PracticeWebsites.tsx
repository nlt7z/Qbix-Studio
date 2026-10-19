import { CHECKOUT, PRICES } from '@/lib/data';
import { Reveal, Words } from '@/components/Reveal';
import CheckoutButton, { CheckoutNote } from './CheckoutButton';
import { OfferBadge, WasPrice } from './OfferPrice';
import Faq from './Faq';
import RebuildHero from './RebuildHero';
import PracticeTour from './PracticeTour';
import DayTiles from './DayTiles';
import PriceHalves from './PriceHalves';
import Odometer from './Odometer';
import AboutPhoto from './AboutPhoto';
import Marker from '@/components/Marker';
import BlockStage from '@/components/story/BlockStage';

const PRICE = PRICES.practice;
const CTA_LABEL = `Start my website, ${PRICE.deposit} deposit`;
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
    v: 'Built on Squarespace in your name. Hosting is billed to you directly by the platform, not through us.',
  },
  { k: 'A short how-to video', v: 'showing how to edit your text yourself.' },
  { k: '30 days of small fixes', v: 'after launch.' },
];

const STEPS = [
  { k: 'Fill out a short questionnaire by email.', v: 'It takes about 15 minutes.', day: 1 },
  { k: 'See your new homepage in 3 days', v: 'and tell us what to change.', day: 3 },
  { k: 'Your full site goes live in 7 days.', v: 'We connect your existing domain and keep your email working.', day: 7 },
];

const FAQ = [
  { q: 'Do we need to meet?', a: 'No. Everything happens by email. A phone call is fine if you prefer one.' },
  { q: 'What happens to my current text?', a: 'We reuse it and tighten it. You approve every word before launch.' },
  {
    q: 'Do you see client information?',
    // Open, with the promise marked: the Questions screen's one lime.
    a: (
      <>
        No. We <Marker>never</Marker> handle client messages or records. The site links to your own email, phone, or
        secure booking tool.
      </>
    ),
    open: true,
  },
  { q: 'Will I lose my domain?', a: 'No. Your domain stays yours.' },
];

export default function PracticeWebsites() {
  return (
    <main className="offer pw story">
      {/* The page's one 3D object, drawn where its two sections ask (components/story/BlockStage). */}
      <BlockStage />
      <RebuildHero>
        <Reveal as="span" className="pw-eyebrow mono" speed="fast">
          Practice Website Refresh
        </Reveal>
        <Words as="h1" className="pw-title" text="A website that feels as calm as your office." speed="slow" step={0.07} delay={0.05} />
        <Reveal as="p" className="pw-lede" speed="slow" delay={0.4}>
          We rebuild websites for solo practices in one week. Your words, your photos, a clean design that works on
          any phone. You never have to touch the tech.
        </Reveal>
        <Reveal className="pw-cta-row" speed="slow" delay={0.55}>
          <CheckoutButton href={CHECKOUT.practiceDeposit} offer={OFFER} label={CTA_LABEL} className="pw-btn" />
          <span className="pw-cta-note">
            {PRICE.now} <WasPrice value={PRICE.was} /> flat · live in 7 days <OfferBadge />
          </span>
        </Reveal>
        <CheckoutNote className="checkout-note--paper" />
      </RebuildHero>

      <section className="pw-section" data-nav-theme="light">
        <div className="container pw-narrow">
          <Words as="h2" className="pw-h2" text="Why it matters" />
          <Reveal as="p" className="pw-text" speed="slow">
            Most people look for a therapist on their phone, often late at night, after reading a few profiles. If
            your site is hard to read on a small screen, or still says 2019 at the bottom, they move on before they
            learn anything about you.
          </Reveal>
          <Reveal as="p" className="pw-pull" speed="slow" delay={0.15}>
            Your directory profile brings people in. Your website is what makes them <Marker delay={0.8}>reach out</Marker>.
          </Reveal>
        </div>
      </section>

      <PracticeTour items={GET} />

      <section className="pw-section" data-nav-theme="light">
        <div className="container pw-narrow">
          <Words as="h2" className="pw-h2" text="How it works" />
          <DayTiles steps={STEPS} />
        </div>
      </section>

      <section className="pw-section" data-nav-theme="light">
        <div className="container pw-narrow">
          <Words as="h2" className="pw-h2" text="Price" />
          <p className="pw-price">
            <Odometer value={PRICE.now} className="pw-price-big" /> <WasPrice value={PRICE.was} className="pw-price-was" /> flat.{' '}
            <OfferBadge />
          </p>
          <PriceHalves amount={PRICE.deposit} />
          <p className="pw-text">
            {PRICE.deposit} to start, {PRICE.deposit} when the site goes live.
          </p>
        </div>
      </section>

      <section className="pw-section" data-nav-theme="light">
        <div className="container pw-narrow">
          <Words as="h2" className="pw-h2" text="Questions" />
          <Faq items={FAQ} className="pw-faq" />
        </div>
      </section>

      <section className="pw-section pw-section--last" data-nav-theme="light">
        <div className="container pw-narrow">
          <Words as="h2" className="pw-h2" text="About us" />
          <div className="offer-me">
            <AboutPhoto />
            <Reveal as="p" className="pw-text" speed="slow" delay={0.15}>
              We&rsquo;re Sera and the Qbix team. We studied human-centered design at the University of Washington and
              trained as painters at Pratt. We design software products for a living, and we rebuild websites for
              independent practices because a good one makes a real difference to a small business.
            </Reveal>
          </div>
          <div className="pw-close">
            <CheckoutButton href={CHECKOUT.practiceDeposit} offer={OFFER} label={CTA_LABEL} className="pw-btn" />
            <CheckoutNote className="checkout-note--paper" />
          </div>
        </div>
      </section>
    </main>
  );
}
