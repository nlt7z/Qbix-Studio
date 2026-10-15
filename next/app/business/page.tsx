import type { Metadata } from 'next';
import HomePage from '@/components/HomePage';

const SITE_URL = 'https://qbix.space';
const TITLE = 'Qbix for local businesses: listing kits and practice websites';
const DESC =
  'Fixed-price design for local businesses, ready in days. A listing launch kit for real estate agents and a calm website for solo practices. Files you own.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESC,
  alternates: { canonical: '/business' },
  // Its own share card: this link goes to agents and practices, not startups.
  openGraph: {
    type: 'website',
    siteName: 'Qbix',
    locale: 'en_US',
    images: [{ url: '/og/business.png', width: 1200, height: 630, alt: 'Qbix for local businesses: look as good as your work.' }],
    url: `${SITE_URL}/business`,
    title: TITLE,
    description: DESC,
  },
  twitter: {
    card: 'summary_large_image',
    site: '@QbixStudio',
    creator: '@QbixStudio',
    images: ['/og/business.png'],
    title: TITLE,
    description: DESC,
  },
};

export default function BusinessPage() {
  return <HomePage audience="business" />;
}
