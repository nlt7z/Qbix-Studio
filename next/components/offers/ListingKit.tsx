import { CHECKOUT, PRICES } from '@/lib/data';
import { Reveal, Words } from '@/components/Reveal';
import CheckoutButton, { CheckoutNote } from './CheckoutButton';
import { OfferBadge, WasPrice } from './OfferPrice';
import Faq from './Faq';
import StickyCta from './StickyCta';
import HouseIllustration from './HouseIllustration';
import SceneStage from './SceneStage';
import KitTour from './KitTour';
import HourRail from './HourRail';
import Odometer from './Odometer';
import AboutPhoto from './AboutPhoto';
import Marker from '@/components/Marker';

const KIT = PRICES.listingKit;
const VIDEO = PRICES.listingVideo;
const CTA_LABEL = `Start my listing kit, ${KIT.now}`;
const OFFER = 'Listing Launch Kit';
const VIDEO_LABEL = `Just the video, ${VIDEO.now}`;
const VIDEO_OFFER = 'Listing video';

const GET = [
  { k: 'Print flyer', v: '8.5 x 11 PDF, front and back, with your brokerage name and DRE number.' },
  { k: '5 social posts', v: 'Just Listed, Open House, a feature detail, the neighborhood, and In Escrow. Sized for Instagram feed and Stories.' },
  { k: '30-second video', v: 'Vertical, built from your listing photos, with music and captions. Ready for Reels, TikTok, and YouTube Shorts.' },
  { k: 'Editable copies', v: 'A Canva link, so you can change the price or open house date yourself.' },
  { k: 'One round of changes', v: '' },
];

const STEPS: [string, string, string] = [
  'Pay and send your listing link, plus your logo if you have one.',
  'Get drafts in 48 hours.',
  'Ask for changes once, then get your final files.',
];

// Blueprint labels the 3D hero pins to the flyer, the posts and the phone.
const KIT_LABELS = ['01 · Print flyer · 8.5 × 11', '02 · Social posts × 5', '03 · Video · 0:30 vertical'];

const FAQ = [
  { q: 'Do you need to visit the house?', a: 'No. Everything comes from your listing photos and details.' },
  { q: 'Can it match my brand?', a: 'Yes. Send your logo and colors, or we will match your brokerage style.' },
  { q: 'Who owns the files?', a: 'You do.' },
  {
    q: "What if I don't like the drafts?",
    // Open, with the promise marked: the Questions screen's one lime.
    a: (
      <>
        Tell us what feels off and we will redo them. If they still don&rsquo;t work for you,{' '}
        <Marker>we refund you in full</Marker>.
      </>
    ),
    open: true,
  },
];

/** The flat sample — a print flyer with a social post over it. Shown when WebGL isn't available. */
function SampleKit() {
  return (
    <figure className="lk-sample" aria-label="Sample listing kit: a print flyer and an Instagram post">
      <span className="lk-sample-tag mono">Sample kit</span>
      <div className="lk-flyer">
        <div className="lk-flyer-photo">
          <HouseIllustration />
        </div>
        <div className="lk-flyer-body">
          <span className="lk-flyer-kicker">Just listed</span>
          <span className="lk-flyer-address">1428 Alder Lane</span>
          <span className="lk-flyer-city">Palo Alto, California</span>
          <div className="lk-flyer-facts">
            <span><strong>$2,195,000</strong></span>
            <span>4 bd</span>
            <span>3 ba</span>
            <span>2,310 sq ft</span>
          </div>
          <span className="lk-flyer-open">Open house · Sat &amp; Sun, 1 to 4 pm</span>
          <div className="lk-flyer-agent">
            <span className="lk-flyer-logo">JL</span>
            <span>
              <strong>Jordan Lee</strong>
              <span>Your Brokerage · DRE #01234567</span>
            </span>
          </div>
        </div>
      </div>
      <div className="lk-post">
        <div className="lk-post-bar">
          <span className="lk-post-avatar">JL</span>
          <span>jordanlee.homes</span>
        </div>
        <div className="lk-post-img">
          <HouseIllustration />
          <span className="lk-post-badge">Just listed</span>
        </div>
        <div className="lk-post-cap">
          <strong>1428 Alder Lane</strong>
          <span>$2,195,000 · Open Sat &amp; Sun</span>
        </div>
      </div>
    </figure>
  );
}

export default function ListingKit() {
  return (
    <main className="offer lk">
      <section className="lk-hero" data-nav-theme="dark">
        <div className="container lk-hero-grid">
          <div className="lk-hero-copy">
            <Reveal as="span" className="offer-eyebrow mono" speed="fast">
              Listing Launch Kit · {KIT.now} <WasPrice value={KIT.was} /> per listing <OfferBadge />
            </Reveal>
            <Words as="h1" className="lk-title" text="Your listing, ready to share in 48 hours." speed="slow" step={0.06} delay={0.05} />
            <Reveal as="p" className="lk-lede" speed="base" delay={0.35}>
              A print flyer, five social posts, and a 30-second video for one property. Made by a designer,
              delivered as files you own.
            </Reveal>
          </div>
          <div className="lk-hero-visual">
            <SceneStage scene="kit" mode="hero" labels={KIT_LABELS} fallback={<SampleKit />} />
            <span className="lk-drag mono" aria-hidden>Drag to turn</span>
          </div>
          <div className="lk-hero-act">
            <Reveal className="lk-hero-cta" speed="base" delay={0.45}>
              <span className="lk-hero-ctas" data-cta-zone>
                <CheckoutButton href={CHECKOUT.listingKit} offer={OFFER} label={CTA_LABEL} className="btn-primary" />
                <CheckoutButton href={CHECKOUT.listingVideo} offer={VIDEO_OFFER} label={VIDEO_LABEL} className="btn-secondary" />
              </span>
              <CheckoutNote />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="offer-section" data-nav-theme="dark">
        <div className="container offer-narrow">
          <Words as="h2" className="offer-h2" text="Why it matters" />
          <div className="offer-prose">
            <Reveal as="p" speed="base">
              Most listings go live with the same photos and the same template as every other house on the
              street. Buyers scroll past in a second. A clean flyer and a short video give your open house
              something people remember. They also show your sellers that you are working hard for them.
            </Reveal>
            <Reveal as="p" className="offer-pull" speed="slow" delay={0.1}>
              You already have the photos. Send us the listing link and <Marker delay={0.7}>we will do the rest</Marker>.
            </Reveal>
          </div>
        </div>
      </section>

      <KitTour items={GET} />

      <section className="offer-section" data-nav-theme="dark">
        <div className="container offer-narrow">
          <Words as="h2" className="offer-h2" text="How it works" />
          <HourRail steps={STEPS} />
        </div>
      </section>

      <section className="offer-section" data-nav-theme="dark">
        <div className="container offer-narrow">
          <Words as="h2" className="offer-h2" text="Price" />
          <div className="offer-price">
            <Odometer value={KIT.now} className="offer-price-big" />
            <WasPrice value={KIT.was} className="offer-price-was" />
            <span className="offer-price-unit">per listing</span>
            <OfferBadge />
          </div>
          <Reveal as="p" className="offer-price-note" speed="base" delay={0.4}>
            Just the video: <strong>{VIDEO.now}</strong> <WasPrice value={VIDEO.was} /> <OfferBadge />
          </Reveal>
        </div>
      </section>

      <section className="offer-section" data-nav-theme="dark">
        <div className="container offer-narrow">
          <Words as="h2" className="offer-h2" text="Questions" />
          <Faq items={FAQ} />
        </div>
      </section>

      <section className="offer-section" data-nav-theme="dark">
        <div className="container offer-narrow">
          <Words as="h2" className="offer-h2" text="About us" />
          <div className="offer-me">
            <AboutPhoto />
            <Reveal as="p" className="offer-about" speed="base" delay={0.15}>
              We&rsquo;re Sera and the Qbix team, a small design studio in Seattle and the Bay Area. We trained at Pratt
              and the University of Washington and design software products for a living. We make marketing for local
              agents on the side, so we keep it fast and simple.
            </Reveal>
          </div>
          <div className="offer-close" data-cta-zone>
            <CheckoutButton href={CHECKOUT.listingKit} offer={OFFER} label={CTA_LABEL} className="btn-primary" />
            <CheckoutNote />
          </div>
        </div>
      </section>

      {/* White, like the nav: chrome that rides along on every screen isn't
          lime, so each screen's own lime accent stays the one. */}
      <StickyCta>
        <CheckoutButton href={CHECKOUT.listingKit} offer={OFFER} label={CTA_LABEL} className="btn-white" />
        <CheckoutNote className="checkout-note--bar" />
      </StickyCta>
    </main>
  );
}
