import type { Metadata } from 'next';
import Colophon from '@/components/Colophon';
import PracticeWebsites from '@/components/offers/PracticeWebsites';

const SITE_URL = 'https://qbix.space';
const DESC =
  'Websites for solo therapy practices, rebuilt in one week. Your words, your photos, a calm design that works on any phone. $800 flat.';

export const metadata: Metadata = {
  title: 'Practice Website Refresh — a website as calm as your office',
  description: DESC,
  alternates: { canonical: '/practice-websites' },
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
  offers: { '@type': 'Offer', price: '800', priceCurrency: 'USD' },
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
