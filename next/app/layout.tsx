import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Fraunces } from 'next/font/google';
import './globals.css';

import TopNav from '@/components/TopNav';
import LoadingScreen from '@/components/LoadingScreen';

const displayFont = Fraunces({
  subsets: ['latin'],
  weight: 'variable',
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
  axes: ['SOFT', 'opsz'],
});

const SITE_URL = 'https://qbix.space';
const SITE_NAME = 'Qbix Studio';
const SITE_DESC =
  'Qbix Studio is an independent AI-native product design and software studio based in Seattle, Washington. We design and build AI products, web and SaaS interfaces, and brand systems for startups and growing teams — from strategy to launch.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Qbix Studio — AI-native product design & software · Seattle, WA',
    template: '%s · Qbix Studio',
  },
  description: SITE_DESC,
  applicationName: SITE_NAME,
  authors: [{ name: 'Qbix Studio', url: SITE_URL }],
  creator: 'Qbix Studio',
  publisher: 'Qbix Studio',
  keywords: [
    'Qbix',
    'Qbix Studio',
    'Qbix design studio',
    'AI-native product design',
    'AI product design studio',
    'AI design and engineering',
    'independent design studio',
    'boutique design studio',
    'Seattle design studio',
    'Seattle AI studio',
    'Washington design studio',
    'software development studio',
    'web development studio',
    'SaaS product design',
    'design and engineering for startups',
    'startup design studio Seattle',
  ],
  category: 'Design & Software Studio',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'Qbix Studio — AI-native product design & software',
    description: SITE_DESC,
    // image auto-picked from app/opengraph-image.png
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Qbix Studio — AI-native product design & software',
    description: SITE_DESC,
    // image auto-picked from app/twitter-image.png
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  // After you register the site in Google Search Console, paste the
  // verification token here (the value from the "HTML tag" method).
  // verification: { google: 'PASTE_GOOGLE_SITE_VERIFICATION_TOKEN_HERE' },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': ['Organization', 'LocalBusiness'],
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  alternateName: ['Qbix', 'Qbix Design Studio'],
  url: SITE_URL,
  logo: `${SITE_URL}/qbix-square.png`,
  image: `${SITE_URL}/hero.png`,
  description: SITE_DESC,
  email: 'hello@qbixstudio.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Seattle',
    addressRegion: 'WA',
    addressCountry: 'US',
  },
  areaServed: [
    { '@type': 'Place', name: 'Seattle, WA' },
    { '@type': 'Place', name: 'Washington State' },
    { '@type': 'Place', name: 'United States' },
    { '@type': 'Place', name: 'Worldwide (remote)' },
  ],
  knowsAbout: [
    'AI-native product design',
    'LLM interface design',
    'Agent UX',
    'Web and SaaS product design',
    'Brand systems',
    'Front-end engineering',
    'Design and engineering for startups',
  ],
  slogan: 'AI-native product design and software, shipped end to end.',
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  publisher: { '@id': `${SITE_URL}/#organization` },
  inLanguage: 'en-US',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${displayFont.variable}`}
    >
      <body>
        <LoadingScreen />
        <TopNav />
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </body>
    </html>
  );
}
