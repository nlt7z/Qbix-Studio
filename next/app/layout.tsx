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

export const metadata: Metadata = {
  title: 'Qbix Studio — AI-native product design & software',
  description:
    'Qbix Studio. AI-native product design and software studio. We design and build AI-native products from strategy to interface to launch.',
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
      </body>
    </html>
  );
}
