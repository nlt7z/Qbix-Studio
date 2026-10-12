import type { Metadata } from 'next';
import Colophon from '@/components/Colophon';
import ListingKit from '@/components/offers/ListingKit';

const SITE_URL = 'https://qbix.space';
const DESC =
  'A print flyer, five social posts, and a 30-second video for one property, ready to share in 48 hours. Made by a designer, delivered as files you own. $199 per listing.';

export const metadata: Metadata = {
  title: 'Listing Launch Kit — your listing, ready to share in 48 hours',
  description: DESC,
  alternates: { canonical: '/listing-kit' },
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
  offers: { '@type': 'Offer', price: '199', priceCurrency: 'USD' },
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
