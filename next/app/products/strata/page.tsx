import type { Metadata } from 'next';
import Colophon from '@/components/Colophon';
import StrataIntro from '@/components/StrataIntro';

const SITE_URL = 'https://qbix.space';
const STRATA_URL = 'https://stratadesign.app';
const DESC =
  'Strata turns a moodboard into a working design system — tokens, components, and code, ready to hand to AI or your library. A Qbix Labs product, live at stratadesign.app.';

const SHARE_TITLE = 'Strata: one image in, a working design system out';

export const metadata: Metadata = {
  title: 'Strata — image to design system',
  description: DESC,
  alternates: { canonical: '/products/strata' },
  // Its own share card, so a shared link previews Strata rather than the studio.
  openGraph: {
    type: 'website',
    siteName: 'Qbix',
    locale: 'en_US',
    images: [{ url: '/og/strata.png', width: 1200, height: 630, alt: 'Strata: one image in, a working system out.' }],
    url: `${SITE_URL}/products/strata`,
    title: SHARE_TITLE,
    description: DESC,
  },
  twitter: {
    card: 'summary_large_image',
    site: '@QbixStudio',
    creator: '@QbixStudio',
    images: ['/og/strata.png'],
    title: SHARE_TITLE,
    description: DESC,
  },
};

const strataJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  '@id': `${SITE_URL}/products/strata/#software`,
  name: 'Strata',
  description: DESC,
  url: STRATA_URL,
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Web',
  creator: { '@id': `${SITE_URL}/#organization` },
};

export default function StrataPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(strataJsonLd) }}
      />
      <StrataIntro />
      <Colophon />
    </>
  );
}
