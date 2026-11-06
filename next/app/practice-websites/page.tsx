import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { BOOKING_URL, CHECKOUT, CONTACT_EMAIL, PRICES } from '@/lib/data';
import Btn from '@/components/blocks/Btn';
import Chapter, { Steps } from '@/components/blocks/Chapter';
import Footer from '@/components/blocks/Footer';
import { Line, Mark, Rise } from '@/components/blocks/Rise';
import { PracticeHero, PracticeTourScene } from '@/components/scenes/Practice';
import './practice.css';
import { up } from '@/components/blocks/up';

const SITE_URL = 'https://qbix.space';
const DESC =
  'Websites for solo therapy practices, rebuilt in one week. Your words, your photos, a calm design that works on any phone. Exclusive offer: $600 flat, regular $800. $300 to start, $300 at launch.';

export const metadata: Metadata = {
  title: 'Practice Website Refresh: a website as calm as your office',
  description: DESC,
  alternates: { canonical: '/practice-websites' },
  // A page-level openGraph replaces the layout's, so site name and handles are
  // restated here. The share card is this offer's own (public/og), never the
  // studio card: the link goes to agents and therapists, not startups.
  openGraph: {
    type: 'website',
    siteName: 'Qbix',
    locale: 'en_US',
    images: [{ url: '/og/practice-websites.png', width: 1200, height: 630, alt: 'Practice Website Refresh: a website that feels as calm as your office. $600 flat, regular $800.' }],
    url: `${SITE_URL}/practice-websites`,
    title: 'Practice Website Refresh: $600 flat, regular $800',
    description: DESC,
  },
  twitter: {
    card: 'summary_large_image',
    site: '@QbixStudio',
    creator: '@QbixStudio',
    images: ['/og/practice-websites.png'],
    title: 'Practice Website Refresh: $600 flat, regular $800',
    description: DESC,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${SITE_URL}/practice-websites/#service`,
  name: 'Practice Website Refresh',
  description: DESC,
  serviceType: 'Website design for private practices',
  provider: { '@id': `${SITE_URL}/#organization` },
  url: `${SITE_URL}/practice-websites`,
  offers: { '@type': 'Offer', name: 'Practice Website Refresh', price: '600', priceCurrency: 'USD' },
};

const PRICE = PRICES.practice;
const ACT = `Start my website, ${PRICE.deposit} deposit`;


const was = <del aria-label={`Regular price ${PRICE.was}`}>{PRICE.was}</del>;
const split = `${PRICE.deposit} to start, ${PRICE.deposit} when the site goes live.`;

// what you get, one stop of the tour each (the scene's seven states, in its order)
const GET: [string, ReactNode][] = [
  ['3 to 5 pages', 'Home, About, Specialties, Fees and Insurance, Contact.'],
  ['Works on every phone', 'Fast, readable, and secure (https).'],
  ['One clear next step', 'A “Book a free consultation” button on every page, linked to your phone, email, or the booking tool you already use.'],
  ['Found on Google', 'Your name, city, and specialties set up so search results show the right information.'],
  ['You own it', 'Built on Squarespace in your name. Hosting is billed to you directly by the platform, not through us.'],
  ['A short how-to video', 'A short video showing how to edit your text yourself.'],
  ['30 days of small fixes', 'After launch, we make small fixes for 30 days.'],
];

// how it works, by the day
const HOW: { day: number; k: string; v: string }[] = [
  { day: 1, k: 'Fill out a short questionnaire by email.', v: 'It takes about 15 minutes.' },
  { day: 3, k: 'See your new homepage in 3 days.', v: 'Tell us what to change.' },
  { day: 7, k: 'Your full site goes live in 7 days.', v: 'We connect your existing domain and keep your email working.' },
];

const FAQ: { q: string; a: ReactNode; open?: boolean }[] = [
  { q: 'Do we need to meet?', a: 'No. Everything happens by email. A phone call is fine if you prefer one.' },
  { q: 'What happens to my current text?', a: 'We reuse it and tighten it. You approve every word before launch.' },
  {
    q: 'Do you see client information?',
    a: (
      <>
        No. We <Mark>never</Mark> handle client messages or records. The site links to your own email, phone, or secure booking
        tool.
      </>
    ),
    open: true,
  },
  { q: 'Will I lose my domain?', a: 'No. Your domain stays yours.' },
];

export default function PracticeWebsitesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="blocks pg-practice" data-stack="">
        {/* white: the promise, and the offer at a glance */}
        <section className="block block--flat pr-hero" id="top" data-tone="white">
          <div className="in">
            <div className="pr-hero-say">
              <p className="kicker">
                Practice Website Refresh <span>· For solo practices</span>
              </p>
              <Rise as="h1" className="display" fit={{ max: 150, min: 30 }}>
                <Line>A website that</Line>
                <Line>
                  feels as <Mark>calm</Mark>
                </Line>
                <Line>as your office.</Line>
              </Rise>
              <p className="lede" {...up()}>
                We rebuild websites for solo practices in one week. Your words, your photos, a clean design that works on any
                phone.
              </p>
              <ul className="points" {...up(120)}>
                <li>Live in 7 days</li>
                <li>Everything by email</li>
                <li>You never touch the tech</li>
              </ul>
            </div>
            <div {...up(200)}>
              <div className="conv" data-tone="black">
                <p className="conv-q">Exclusive offer. For solo practices.</p>
                <dl className="conv-out">
                  <div className="conv-cell">
                    <dt>Live in</dt>
                    <dd>
                      7 <small>days</small>
                    </dd>
                  </div>
                  <div className="conv-cell">
                    <dt>Flat</dt>
                    <dd>
                      {PRICE.now} {was}
                    </dd>
                  </div>
                </dl>
                <p className="conv-get">
                  <b>{split}</b> 3 to 5 pages that work on every phone, built in your name.
                </p>
                <Btn href={CHECKOUT.practiceDeposit} wide>
                  {ACT}
                </Btn>
                <p className="conv-foot">
                  Secure checkout through Stripe. Questions first? Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* black: why it matters */}
        <section className="block pr-why" id="why" data-tone="black">
          <div className="in">
            <p className="kicker">Why it matters</p>
            <div className="head head--split">
              <Rise className="h1">
                Your profile brings people in. Your website makes them <Mark>reach out.</Mark>
              </Rise>
              <p className="lede" {...up()}>
                Most people look for a therapist on their phone, often late at night. If your site is hard to read on a small
                screen, they move on.
              </p>
            </div>
          </div>
        </section>

        {/* white: what you get, Willow Counseling's site one piece at a time */}
        <Chapter
          id="what"
          className="pr-tour"
          tone="white"
          side="left"
          moves={GET.length - 1}
          steps
          caps={GET.map(([k]) => k)}
          copy={
            <>
              <p className="kicker">
                Practice Website Refresh <span>· For one practice</span>
              </p>
              <Rise className="h2">What you get.</Rise>
              <Steps items={GET.map(([k]) => k)} />
              <div className="notes">
                {GET.map(([k, v]) => (
                  <p key={k}>{v}</p>
                ))}
              </div>
              <div className="acts">
                <Btn href={CHECKOUT.practiceDeposit}>{ACT}</Btn>
              </div>
            </>
          }
          scene={<PracticeTourScene />}
        />

        {/* black: how it works, three days */}
        <section className="block pr-how" id="how" data-tone="black">
          <div className="in">
            <div className="pr-how-head">
              <p className="kicker">How it works</p>
              <Rise className="h1">
                You never have to <Mark>touch the tech.</Mark>
              </Rise>
            </div>
            <ol className="how">
              {HOW.map((s, i) => (
                <li key={s.day} {...up(i * 80)}>
                  <span className="how-day">Day {s.day}</span>
                  <p>{s.k}</p>
                  <span className="how-v">{s.v}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* white: questions, and who answers them */}
        <section className="block pr-q" id="questions" data-tone="white">
          <div className="in">
            <Rise className="h1">Questions.</Rise>
            <div className="pr-q-about" {...up()}>
              <p className="kicker">About us</p>
              <p className="body">
                We’re Sera and the Qbix team, a small design studio in Seattle. We design software, and rebuild websites
                for independent practices.
              </p>
            </div>
            <div className="faq">
              {FAQ.map((f) => (
                <details key={f.q} open={f.open}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* black: the price as the last word, the site live beside it */}
        <section className="block pr-sign" id="price" data-tone="black">
          <div className="in">
            <div>
              <p className="kicker">
                Price <span>· Exclusive offer</span>
              </p>
              <p className="pr-price" {...up()}>
                <span>{PRICE.now}</span>
                {was}
                <span className="pr-price-u">flat</span>
              </p>
              <p className="pr-sign-split">{split}</p>
              <div className="acts">
                <Btn href={CHECKOUT.practiceDeposit}>{ACT}</Btn>
                <a className="link" href={BOOKING_URL}>
                  Book a call
                </a>
              </div>
              <p className="pr-sign-note">
                Secure checkout through Stripe. Questions first? Email{' '}
                <a className="link" href={`mailto:${CONTACT_EMAIL}`}>
                  {CONTACT_EMAIL}
                </a>
              </p>
            </div>
            <div className="pr-live" data-chapter="">
              <div className="scene" data-tone="dark">
                <PracticeHero />
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
