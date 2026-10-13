import type { Metadata } from 'next';
import Colophon from '@/components/Colophon';
import PracticeWebsites from '@/components/offers/PracticeWebsites';

const SITE_URL = 'https://qbix.space';
const DESC =
  'Websites for solo therapy practices, rebuilt in one week. Your words, your photos, a calm design that works on any phone. Exclusive offer: $600 flat, regular $800. $300 to start, $300 at launch.';

export const metadata: Metadata = {
  title: 'Practice Website Refresh: a website as calm as your office',
  description: DESC,
  alternates: { canonical: '/practice-websites' },
  // A page-level openGraph replaces the layout's, so the share image, site
  // name and handles are restated here.
  openGraph: {
    type: 'website',
    siteName: 'Qbix',
    locale: 'en_US',
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630 }],
    url: `${SITE_URL}/practice-websites`,
    title: 'Practice Website Refresh: $600 flat, regular $800',
    description: DESC,
  },
  twitter: {
    card: 'summary_large_image',
    site: '@QbixStudio',
    creator: '@QbixStudio',
    images: ['/twitter-image.png'],
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

export default function PracticeWebsitesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PracticeWebsites />
      <Colophon />
    </>
  );
}
