import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

import TopNav from '@/components/TopNav';
import LoadingScreen from '@/components/LoadingScreen';
import SiteCursor from '@/components/SiteCursor';
import { ContactModalProvider } from '@/components/ContactModalProvider';

// Headlines — Eurostile (licensed, self-hosted). Single Regular weight, so the
// CSS disables weight synthesis on headings to avoid faux-bold smearing.
const headlineFont = localFont({
  src: [{ path: './fonts/Eurostile-400.woff2', weight: '400', style: 'normal' }],
  variable: '--font-eurostile',
  display: 'swap',
});

// Body voice — Geist (self-hosted 400/500/600), exposed as --font-geist.
const bodyFont = localFont({
  src: [
    { path: './fonts/Geist-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/Geist-500.woff2', weight: '500', style: 'normal' },
    { path: './fonts/Geist-600.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-geist',
  display: 'swap',
});

// Technical register — Encode Sans (labels, tags, timestamps, numbers),
// exposed as --font-encode. Kept tabular so digits still align.
const monoFont = localFont({
  src: [
    { path: './fonts/EncodeSans-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/EncodeSans-500.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-encode',
  display: 'swap',
});

const SITE_URL = 'https://qbix.space';
const SITE_NAME = 'Qbix';
const SITE_DESC =
  'Qbix is where the coolest people build the coolest ideas — an independent AI product team in Seattle, Washington. We build our own products (a TTS editor, moodboard-to-design-system, AI bid, interview assistant) and design and build AI products, web, and SaaS for startups — from strategy to launch.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Qbix — AI-native product design & software · Seattle, WA',
    template: '%s · Qbix',
  },
  description: SITE_DESC,
  applicationName: SITE_NAME,
  authors: [{ name: 'Qbix', url: SITE_URL }],
  creator: 'Qbix',
  publisher: 'Qbix',
  keywords: [
    'Qbix',
    'Qbix space',
    'qbix.space',
    'Qbix AI',
    'Qbix Seattle',
    'Qbix team',
    'what is Qbix',
    'Qubix',
    'Q bix',
    'AI-native product design',
    'AI product team',
    'AI design and engineering',
    'TTS editor',
    'moodboard to design system',
    'AI bid',
    'interview assistant',
    'Seattle AI team',
    'SaaS product design',
    'design and engineering for startups',
  ],
  category: 'AI Product Team',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'Qbix — AI-native product design & software',
    description: SITE_DESC,
    // image auto-picked from app/opengraph-image.png
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Qbix — AI-native product design & software',
    description: SITE_DESC,
    site: '@QbixStudio',
    creator: '@QbixStudio',
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
  // Google Search Console verification (HTML-tag method). The file-based check
  // at /google2e8449b9eae9ef63.html is also in place — either one satisfies GSC.
  verification: { google: 'WeKiH0kunuDvA_zFIlOCeYo59eEx2j6061rmZJXuWi8' },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': ['Organization', 'LocalBusiness'],
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  alternateName: ['Qbix', 'Qbix AI', 'Qbix Seattle', 'Qbix.space'],
  url: SITE_URL,
  logo: `${SITE_URL}/qbix-square.png`,
  image: `${SITE_URL}/hero.png`,
  description: SITE_DESC,
  email: 'qbixspace@gmail.com',
  sameAs: [
    'https://github.com/qbixstudio-bit',
    'https://www.are.na/q-bix/channels',
    'https://x.com/QbixStudio',
    'https://www.instagram.com/qbix_studio/',
  ],
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
      className={`${headlineFont.variable} ${bodyFont.variable} ${monoFont.variable}`}
    >
      <body>
        <LoadingScreen />
        <ContactModalProvider>
          <TopNav />
          {children}
        </ContactModalProvider>
        {/* Campaign texture: film grain over everything, lime cursor accent. */}
        <div className="site-grain" aria-hidden />
        <SiteCursor />
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
