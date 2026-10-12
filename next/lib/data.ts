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

// ----- FIXED-PRICE OFFERS (own landing pages, Stripe checkout) --------------

/**
 * Stripe Payment Links for the fixed-price offers. Paste the live links here.
 * While a link is empty, its "Start" button falls back to an email to
 * CONTACT_EMAIL with the offer named in the subject.
 */
export const CHECKOUT = {
  listingKit: '',        // $199 — Listing Launch Kit
  practiceDeposit: '',   // $400 deposit — Practice Website Refresh
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
  typical: string;
};

export const offers: Offer[] = [
  {
    slug: 'listing-kit',
    href: '/listing-kit',
    num: '01',
    audience: 'Real estate agents · per listing',
    title: 'Listing Launch Kit',
    blurb:
      'A print flyer, five social posts, and a 30-second video for one property. Ready to share in 48 hours.',
    tags: ['Print flyer', '5 social posts', '30s video'],
    priceLead: 'Per listing',
    price: '$199',
    typical: '48 hours',
  },
  {
    slug: 'practice-websites',
    href: '/practice-websites',
    num: '02',
    audience: 'Solo practices · therapists',
    title: 'Practice Website Refresh',
    blurb:
      'A calm, clean website for your practice, rebuilt in one week. Your words, your photos, and it works on any phone.',
    tags: ['3 to 5 pages', 'Mobile first', 'You own it'],
    priceLead: '',
    price: '$800 flat',
    typical: '7 days',
  },
];

// ----- CONTACT ---------------------------------------------------------------

export const CONTACT_EMAIL = 'contact@qbix.space';
export const BOOKING_URL   = 'https://cal.com/qbix-studio/30min';
export const CONTACT_NOTE =
  'Qbix is available for AI product design, UX/UI systems, web/mobile design, and product strategy consulting.';
