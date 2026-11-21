// =============================================================================
// QBIX — content / positioning
// =============================================================================

// ----- NAVIGATION -------------------------------------------------------------

export type NavItem = {
  num: string;
  label: string;
  href: string;
  tip: string;    // hover tooltip / title
  disabled?: boolean; // shown but not navigable (e.g. Careers — coming soon)
};

export const navItems: NavItem[] = [
  { num: '01', label: 'Services', href: '#services', tip: 'Services'  },
  { num: '02', label: 'Products', href: '#products', tip: 'Products' },
  { num: '03', label: 'About us', href: '#about',    tip: 'About us' },
  { num: '04', label: 'Careers',  href: '#',         tip: 'Careers — coming soon', disabled: true },
];

// ----- SERVICES (studio cards on the homepage; enquiries go to the contact form)

export type Service = {
  slug: string;
  num: string;       // "01"
  audience: string;  // "AI startups" / "Local business" / etc — primary buyer
  title: string;
  blurb: string;
  tags: string[];
  priceFrom: string; // "$2k" / "$15k" — starting anchor
  typical: string;   // "1 – 3 weeks" — duration anchor
};

export const services: Service[] = [
  {
    slug: 'web',
    num: '01',
    audience: 'Founders · Launch sites · Brand',
    title: 'Design service',
    blurb:
      'From moodboard to a live domain. We design it, write the code, and ship it ready for business. Done in one to three weeks.',
    tags: ['Marketing site', 'Portfolio', 'Brand'],
    priceFrom: '$400',
    typical: '1 to 3 weeks',
  },
  {
    slug: 'redesign',
    num: '02',
    audience: 'Growing teams · 1 → 100',
    title: 'Brand upgrade',
    blurb:
      'Your product already runs. We take it from usable to worth sharing. We iterate round by round and merge code straight into your repo.',
    tags: ['Redesign', 'User feedback', 'Iteration'],
    priceFrom: '$5,000',
    typical: '5 to 10 weeks',
  },
];

// ----- FIXED-PRICE OFFERS (own landing pages, Stripe checkout) --------------

/**
 * Stripe Payment Links for the fixed-price offers (same-tab checkout).
 * If a link is empty, its "Start" button opens an email to CONTACT_EMAIL with
 * the offer named in the subject (checkoutHref below), so it's never a dead end.
 *
 * Nov 20, 2026: the per-listing kit ($99, video $49) and the $300 deposit were
 * replaced by two plans: $350 a month for 4 listings, and a $400 website, all
 * in. The new Payment Links are not made yet, so these fall back to email.
 * Retired links (left active in Stripe for older emails):
 *   https://buy.stripe.com/14AfZ946b4J11o04zi6Vq00  $99 Listing Launch Kit
 *   https://buy.stripe.com/5kQbIT1Y31wP5Eg3ve6Vq01  $49 listing video only
 *   https://buy.stripe.com/4gMeV5auz4J16Ik6Hq6Vq02  $300 practice deposit
 */
export const CHECKOUT = {
  listingKit: '',       // $350 a month, Listing Launch Kit (4 listings)
  listingVideo: '',     // retired
  practiceDeposit: '',  // $400 one payment, Practice Website Refresh, all in
};

/** A checkout link, or an email that names the offer when the link is empty. */
export const checkoutHref = (href: string, offer: string) =>
  href || `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Start: ${offer}`)}`;

/**
 * Plan pricing. One source for both offer pages and the homepage cards.
 * `was` is empty now: no struck-through regular price.
 */
export const PRICES = {
  listingKit: { now: '$350', was: '', unit: 'a month', listings: 4 },
  listingVideo: { now: '', was: '' },
  practice: { now: '$400', was: '', deposit: '' },
};

export type Offer = {
  slug: string;
  href: string;          // its own landing page
  num: string;
  audience: string;
  title: string;
  blurb: string;
  tags: string[];
  priceLead: string;     // "Per listing" — or '' when price is a phrase
  price: string;
  wasPrice?: string;     // regular price, shown struck through next to an offer price
  typical: string;
};

export const offers: Offer[] = [
  {
    slug: 'listing-kit',
    href: '/listing-kit',
    num: '03',
    audience: 'Real estate agents · 4 listings a month',
    title: 'Listing Launch Kit',
    blurb:
      'A print flyer, five social posts, and a 30-second video for each listing, four listings a month. Ready to share in 48 hours.',
    tags: ['Print flyer', '5 social posts', '30s video'],
    priceLead: 'Per month',
    price: PRICES.listingKit.now,
    typical: '48 hours',
  },
  {
    slug: 'practice-websites',
    href: '/practice-websites',
    num: '04',
    audience: 'Solo practices · therapists',
    title: 'Practice Website Refresh',
    blurb:
      'A calm, clean website for your practice, rebuilt in one week, plus posters and a business kit. Your words, your photos, and it works on any phone.',
    tags: ['3 to 5 pages', 'Posters', 'Business kit'],
    priceLead: 'All in',
    price: PRICES.practice.now,
    typical: '7 days',
  },
];

// ----- CONTACT ---------------------------------------------------------------

export const CONTACT_EMAIL = 'contact@qbix.space';
export const BOOKING_URL   = 'https://cal.com/qbix-studio/30min';
