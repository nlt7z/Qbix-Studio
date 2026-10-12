import { CHECKOUT } from '@/lib/data';
import { Reveal, Words } from '@/components/Reveal';
import CheckoutButton from './CheckoutButton';
import Faq from './Faq';
import StickyCta from './StickyCta';
import HouseIllustration from './HouseIllustration';
import KitStage from './KitStage';
import KitTour from './KitTour';
import HourRail from './HourRail';
import Odometer from './Odometer';
import AboutPhoto from './AboutPhoto';

const CTA_LABEL = 'Start my listing kit, $199';
const OFFER = 'Listing Launch Kit';
const VIDEO_LABEL = 'Just the video, $99';
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
  { q: 'Can it match my brand?', a: 'Yes. Send your logo and colors, or I will match your brokerage style.' },
  { q: 'Who owns the files?', a: 'You do.' },
  {
    q: "What if I don't like the drafts?",
    a: "Tell me what feels off and I will redo them. If they still don't work for you, I refund you in full.",
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
              Listing Launch Kit · $199 per listing
            </Reveal>
            <Words as="h1" className="lk-title" text="Your listing, ready to share in 48 hours." speed="slow" step={0.06} delay={0.05} />
            <Reveal as="p" className="lk-lede" speed="base" delay={0.35}>
              A print flyer, five social posts, and a 30-second video for one property. Made by a designer,
              delivered as files you own.
            </Reveal>
          </div>
          <div className="lk-hero-visual">
            <KitStage mode="hero" labels={KIT_LABELS} fallback={<SampleKit />} />
            <span className="lk-drag mono" aria-hidden>Drag to turn</span>
          </div>
          <div className="lk-hero-act">
            <Reveal className="lk-hero-cta" speed="base" delay={0.45}>
              <span className="lk-hero-ctas" data-cta-zone>
                <CheckoutButton href={CHECKOUT.listingKit} offer={OFFER} label={CTA_LABEL} className="btn-primary" />
                <CheckoutButton href="" offer={VIDEO_OFFER} label={VIDEO_LABEL} className="btn-secondary" />
              </span>
            </Reveal>
            <div className="lk-meta mono" aria-hidden>
              <span>Drafts · 48 h</span>
              <span>1 flyer · 5 posts · 1 video</span>
              <span>Files you own</span>
            </div>
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
              You already have the photos. Send me the listing link and I will do the rest.
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
            <Odometer value="$199" className="offer-price-big" />
            <span className="offer-price-unit">per listing</span>
          </div>
          <Reveal as="p" className="offer-price-note" speed="base" delay={0.4}>Just the video: $99.</Reveal>
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
          <Words as="h2" className="offer-h2" text="About me" />
          <div className="offer-me">
            <AboutPhoto />
            <Reveal as="p" className="offer-about" speed="base" delay={0.15}>
              I&rsquo;m Sera. I trained as a painter at Pratt and now design software products in the Bay Area. I make
              marketing for local agents on the side, so I keep it fast and simple.
            </Reveal>
          </div>
          <div className="offer-close" data-cta-zone>
            <CheckoutButton href={CHECKOUT.listingKit} offer={OFFER} label={CTA_LABEL} className="btn-primary" />
          </div>
        </div>
      </section>

      <StickyCta>
        <CheckoutButton href={CHECKOUT.listingKit} offer={OFFER} label={CTA_LABEL} className="btn-primary" />
      </StickyCta>
    </main>
  );
}
