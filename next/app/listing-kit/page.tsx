import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { CHECKOUT, CONTACT_EMAIL, PRICES } from '@/lib/data';
import { LISTING_SAMPLES } from '@/lib/samples';
import Btn from '@/components/blocks/Btn';
import Chapter, { Steps } from '@/components/blocks/Chapter';
import Converter, { type ConvItem } from '@/components/blocks/Converter';
import Footer from '@/components/blocks/Footer';
import { Line, Mark, Rise } from '@/components/blocks/Rise';
import VCard from '@/components/blocks/VCard';
import { ListingHero, ListingTour } from '@/components/scenes/Listing';
import './listing.css';
import { up } from '@/components/blocks/up';

const SITE_URL = 'https://qbix.space';
const DESC =
  'A print flyer, five social posts, and a 30-second video for one property, ready to share in 48 hours. Made by a designer, delivered as files you own. Exclusive offer: $99 per listing, regular $249.';

export const metadata: Metadata = {
  title: 'Listing Launch Kit: your listing, ready to share in 48 hours',
  description: DESC,
  alternates: { canonical: '/listing-kit' },
  // A page-level openGraph replaces the layout's, so site name and handles are
  // restated here. The share card is this offer's own (public/og), never the
  // studio card: the link goes to agents and therapists, not startups.
  openGraph: {
    type: 'website',
    siteName: 'Qbix',
    locale: 'en_US',
    images: [{ url: '/og/listing-kit.png', width: 1200, height: 630, alt: 'Listing Launch Kit: your listing, ready to share in 48 hours. $99 per listing, regular $249.' }],
    url: `${SITE_URL}/listing-kit`,
    title: 'Listing Launch Kit: $99 per listing, regular $249',
    description: DESC,
  },
  twitter: {
    card: 'summary_large_image',
    site: '@QbixStudio',
    creator: '@QbixStudio',
    images: ['/og/listing-kit.png'],
    title: 'Listing Launch Kit: $99 per listing, regular $249',
    description: DESC,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${SITE_URL}/listing-kit/#service`,
  name: 'Listing Launch Kit',
  description: DESC,
  serviceType: 'Real estate listing marketing design',
  provider: { '@id': `${SITE_URL}/#organization` },
  url: `${SITE_URL}/listing-kit`,
  offers: [
    { '@type': 'Offer', name: 'Listing Launch Kit', price: '99', priceCurrency: 'USD', url: CHECKOUT.listingKit },
    { '@type': 'Offer', name: 'Listing video only', price: '49', priceCurrency: 'USD', url: CHECKOUT.listingVideo },
  ],
};

const KIT = PRICES.listingKit;
const VIDEO = PRICES.listingVideo;
const KIT_ACT = `Start my listing kit, ${KIT.now}`;
const VIDEO_ACT = `Just the video, ${VIDEO.now}`;


const was = (p: string) => <del aria-label={`Regular price ${p}`}>{p}</del>;

const ask = (
  <>
    Secure checkout through Stripe. Questions first? Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
  </>
);

// the converter: the kit, or just its video
const OPTIONS: ConvItem[] = [
  {
    k: 'kit',
    label: 'The full kit',
    sub: 'Flyer, five posts and a video',
    tlabel: 'Ready in',
    time: (
      <>
        48 <small>hours</small>
      </>
    ),
    plabel: 'Per listing',
    price: (
      <>
        {KIT.now} {was(KIT.was)}
      </>
    ),
    get: (
      <>
        <b>Print flyer, 5 social posts, 30-second video,</b> editable copies, and one round of changes.
      </>
    ),
    href: CHECKOUT.listingKit,
    act: KIT_ACT,
  },
  {
    k: 'video',
    label: 'Just the video',
    sub: '30 seconds, vertical',
    tlabel: 'Length',
    time: (
      <>
        30 <small>seconds</small>
      </>
    ),
    plabel: 'Per listing',
    price: (
      <>
        {VIDEO.now} {was(VIDEO.was)}
      </>
    ),
    get: (
      <>
        <b>Just the video.</b> Vertical, built from your listing photos, with music and captions. Ready for Reels, TikTok, and
        YouTube Shorts.
      </>
    ),
    href: CHECKOUT.listingVideo,
    act: VIDEO_ACT,
  },
];

// what you get, one stop of the tour each
const GET: [string, string][] = [
  ['Print flyer', '8.5 x 11 PDF, front and back, with your brokerage name and DRE number.'],
  ['5 social posts', 'Just Listed, Open House, a feature detail, the neighborhood, and In Escrow. Sized for Instagram feed and Stories.'],
  ['30-second video', 'Vertical, built from your listing photos, with music and captions. Ready for Reels, TikTok, and YouTube Shorts.'],
  ['Editable copies', 'A Canva link, so you can change the price or open house date yourself.'],
  ['One round of changes', 'Ask for changes once, then get your final files.'],
];

const HOW = ['Pay and send your listing link, plus your logo if you have one.', 'Get drafts in 48 hours.', 'Ask for changes once, then get your final files.'];

const FAQ: { q: string; a: ReactNode; open?: boolean }[] = [
  { q: 'Do you need to visit the house?', a: 'No. Everything comes from your listing photos and details.' },
  { q: 'Can it match my brand?', a: 'Yes. Send your logo and colors, or we will match your brokerage style.' },
  { q: 'Who owns the files?', a: 'You do.' },
  {
    q: 'What if I don’t like the drafts?',
    a: (
      <>
        Tell us what feels off and we will redo them. If they still don’t work for you, <Mark>we refund you in full</Mark>.
      </>
    ),
    open: true,
  },
];

export default function ListingKitPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="blocks pg-listing" data-stack="">
        {/* white: the promise, and what each option costs (the converter) */}
        <section className="block block--flat lk-hero" id="top" data-tone="white">
          <div className="in">
            <div className="lk-hero-say">
              <p className="kicker">
                Listing Launch Kit <span>· Real estate agents, per listing</span>
              </p>
              <Rise as="h1" className="display" fit={{ max: 150, min: 30 }}>
                <Line>Your listing,</Line>
                <Line>ready to share</Line>
                <Line>
                  in <Mark>48 hours.</Mark>
                </Line>
              </Rise>
              <p className="lede" {...up()}>
                A print flyer, five social posts, and a 30-second video for one property. Made by a designer, delivered as
                files you own.
              </p>
              <ul className="points" {...up(120)}>
                <li>Drafts in 48 hours</li>
                <li>No visit to the house</li>
                <li>One round of changes</li>
              </ul>
            </div>
            <div {...up(200)}>
              <Converter question="Exclusive offer. What do you need?" items={OPTIONS} foot={ask} />
            </div>
          </div>
        </section>

        {/* black: the work first, the two listings we made for agents */}
        <section className="block lk-samples" id="samples" data-tone="black">
          <div className="in">
            <div className="lk-samples-say">
              <p className="kicker">Samples</p>
              <Rise className="h2">
                Listing videos and posters we made for agents in <Mark>Gig Harbor.</Mark>
              </Rise>
              <div className="acts">
                <Btn href="/samples" variant="2">
                  See all samples
                </Btn>
              </div>
            </div>
            <div className="lk-cards">
              {LISTING_SAMPLES.map((s) => (
                <VCard key={s.slug} s={s} />
              ))}
            </div>
          </div>
        </section>

        {/* white: what you get, 1428 Alder Street's kit one piece at a time */}
        <Chapter
          id="what"
          className="lk-tour"
          tone="white"
          side="left"
          moves={GET.length - 1}
          steps
          caps={GET.map(([k]) => k)}
          copy={
            <>
              <p className="kicker">
                Listing Launch Kit <span>· For one property</span>
              </p>
              <Rise className="h2">What you get.</Rise>
              <Steps items={GET.map(([k]) => k)} />
              <div className="notes">
                {GET.map(([k, v]) => (
                  <p key={k}>{v}</p>
                ))}
              </div>
              <div className="acts">
                <Btn href={CHECKOUT.listingKit}>{KIT_ACT}</Btn>
              </div>
            </>
          }
          scene={<ListingTour />}
        />

        {/* black: why it matters, and the three steps */}
        <section className="block lk-how" id="how" data-tone="black">
          <div className="in">
            <div className="lk-how-head">
              <p className="kicker">How it works</p>
              <Rise className="h1">
                Send us the listing link and <Mark>we will do the rest.</Mark>
              </Rise>
              <p className="lede" {...up()}>
                Most listings look like every other house on the street. A clean flyer and a short video give yours something
                people remember.
              </p>
            </div>
            <ol className="how">
              {HOW.map((s, i) => (
                <li key={s} {...up(i * 80)}>
                  <p>{s}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* white: questions, and who answers them */}
        <section className="block lk-q" id="questions" data-tone="white">
          <div className="in">
            <Rise className="h1">Questions.</Rise>
            <div className="lk-q-about" {...up()}>
              <p className="kicker">About us</p>
              <p className="body">
                We’re Sera and the Qbix team, a small design studio in Seattle. We design software, and make marketing
                for local agents.
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

        {/* black: the price as the last word, the kit at a glance beside it */}
        <section className="block lk-sign" id="price" data-tone="black">
          <div className="in">
            <div>
              <p className="kicker">
                Price <span>· Exclusive offer</span>
              </p>
              <p className="lk-price" {...up()}>
                <span>{KIT.now}</span>
                {was(KIT.was)}
                <span className="lk-price-u">per listing</span>
              </p>
              <p className="lk-sign-video">
                Just the video: <b>{VIDEO.now}</b> {was(VIDEO.was)}
              </p>
              <div className="acts">
                <Btn href={CHECKOUT.listingKit}>{KIT_ACT}</Btn>
                <a className="link" href={CHECKOUT.listingVideo}>
                  {VIDEO_ACT}
                </a>
              </div>
              <p className="lk-sign-note">
                Secure checkout through Stripe. Questions first? Email{' '}
                <a className="link" href={`mailto:${CONTACT_EMAIL}`}>
                  {CONTACT_EMAIL}
                </a>
              </p>
            </div>
            <div className="lk-kit" data-chapter="">
              <div className="scene" data-tone="dark">
                <ListingHero />
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
