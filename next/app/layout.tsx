import type { Metadata } from 'next';
import { Source_Serif_4 } from 'next/font/google';
import './globals.css';

import TopNav from '@/components/TopNav';
import LoadingScreen from '@/components/LoadingScreen';
import { ContactModalProvider } from '@/components/ContactModalProvider';

// One serif carries the whole site — display, body, and labels alike.
// Source Serif 4: a sharp editorial serif with true italics and optical sizing.
const displayFont = Source_Serif_4({
  subsets: ['latin'],
  weight: 'variable',
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
  axes: ['opsz'],
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
      className={`${displayFont.variable}`}
    >
      <body>
        <LoadingScreen />
        <ContactModalProvider>
          <TopNav />
          {children}
        </ContactModalProvider>
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
