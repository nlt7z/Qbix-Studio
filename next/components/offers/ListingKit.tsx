import { CHECKOUT } from '@/lib/data';
import { Reveal } from '@/components/Reveal';
import CheckoutButton from './CheckoutButton';
import Faq from './Faq';
import StickyCta from './StickyCta';
import HouseIllustration from './HouseIllustration';

const CTA_LABEL = 'Start my listing kit, $249';
const OFFER = 'Listing Launch Kit';

const GET = [
  { k: 'Print flyer', v: '8.5 x 11 PDF, front and back, with your brokerage name and DRE number.' },
  { k: '5 social posts', v: 'Just Listed, Open House, a feature detail, the neighborhood, and In Escrow. Sized for Instagram feed and Stories.' },
  { k: '30-second video', v: 'Vertical, built from your listing photos, with music and captions. Ready for Reels, TikTok, and YouTube Shorts.' },
  { k: 'Editable copies', v: 'A Canva link, so you can change the price or open house date yourself.' },
  { k: 'One round of changes', v: '' },
];

const STEPS = [
  'Pay and send your listing link, plus your logo if you have one.',
  'Get drafts in 48 hours.',
  'Ask for changes once, then get your final files.',
];

const FAQ = [
  { q: 'Do you need to visit the house?', a: 'No. Everything comes from your listing photos and details.' },
  { q: 'Can it match my brand?', a: 'Yes. Send your logo and colors, or I will match your brokerage style.' },
  { q: 'Who owns the files?', a: 'You do.' },
  {
    q: "What if I don't like the drafts?",
    a: "Tell me what feels off and I will redo them. If they still don't work for you, I refund you in full.",
  },
];

/** The finished sample: a print flyer with a social post laid over it. */
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
              Listing Launch Kit · $249 per listing
            </Reveal>
            <Reveal as="h1" className="lk-title" speed="base" delay={0.05}>
              Your listing, ready to share in 48 hours.
            </Reveal>
            <Reveal as="p" className="lk-lede" speed="base" delay={0.15}>
              A print flyer, five social posts, and a 30-second video for one property. Made by a designer,
              delivered as files you own.
            </Reveal>
            <Reveal className="lk-hero-cta" speed="base" delay={0.25}>
              <span data-cta-zone>
                <CheckoutButton href={CHECKOUT.listingKit} offer={OFFER} label={CTA_LABEL} className="btn-primary" />
              </span>
            </Reveal>
          </div>
          <Reveal className="lk-hero-visual" speed="base" delay={0.2}>
            <SampleKit />
          </Reveal>
        </div>
      </section>

      <section className="offer-section" data-nav-theme="dark">
        <div className="container offer-narrow">
          <h2 className="offer-h2">Why it matters</h2>
          <div className="offer-prose">
            <p>
              Most listings go live with the same photos and the same template as every other house on the
              street. Buyers scroll past in a second. A clean flyer and a short video give your open house
              something people remember. They also show your sellers that you are working hard for them.
            </p>
            <p className="offer-pull">You already have the photos. Send me the listing link and I will do the rest.</p>
          </div>
        </div>
      </section>

      <section className="offer-section" data-nav-theme="dark">
        <div className="container offer-narrow">
          <h2 className="offer-h2">What you get</h2>
          <ol className="offer-list">
            {GET.map((g, i) => (
              <li key={g.k}>
                <span className="offer-num mono">{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <strong>{g.k}.</strong>
                  {g.v && <> {g.v}</>}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="offer-section" data-nav-theme="dark">
        <div className="container offer-narrow">
          <h2 className="offer-h2">How it works</h2>
          <ol className="offer-steps">
            {STEPS.map((s, i) => (
              <li key={s}>
                <span className="offer-step-n">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="offer-section" data-nav-theme="dark">
        <div className="container offer-narrow">
          <h2 className="offer-h2">Price</h2>
          <div className="offer-price">
            <span className="offer-price-big">$249</span>
            <span className="offer-price-unit">per listing</span>
          </div>
          <p className="offer-price-note">Your next listing in the same month is $199.</p>
        </div>
      </section>

      <section className="offer-section" data-nav-theme="dark">
        <div className="container offer-narrow">
          <h2 className="offer-h2">Questions</h2>
          <Faq items={FAQ} />
        </div>
      </section>

      <section className="offer-section" data-nav-theme="dark">
        <div className="container offer-narrow">
          <h2 className="offer-h2">About me</h2>
          <p className="offer-about">
            I&rsquo;m Yuan. I trained as a painter at Pratt and now design software products in the Bay Area. I make
            marketing for local agents on the side, so I keep it fast and simple.
          </p>
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
