import type { Metadata } from 'next';
import Colophon from '@/components/Colophon';
import { CHECKOUT } from '@/lib/data';
import ListingKit from '@/components/offers/ListingKit';

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

export default function ListingKitPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ListingKit />
      <Colophon />
    </>
  );
}
