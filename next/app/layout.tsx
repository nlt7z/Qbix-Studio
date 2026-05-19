import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Bricolage_Grotesque } from 'next/font/google';
import './globals.css';

import TopNav from '@/components/TopNav';
import LoadingScreen from '@/components/LoadingScreen';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal'],
  variable: '--font-display',
  display: 'swap',
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
      className={`${GeistSans.variable} ${GeistMono.variable} ${bricolage.variable}`}
    >
      <body>
        <LoadingScreen />
        <TopNav />
        {children}
      </body>
    </html>
  );
}
