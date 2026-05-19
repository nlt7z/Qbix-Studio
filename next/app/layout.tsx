import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';

import TopNav from '@/components/TopNav';

export const metadata: Metadata = {
  title: 'Qbix Studio — AI-native product design & software',
  description:
    'Qbix Studio. AI-native product design and software studio. We design and build AI-native products from strategy to interface to launch.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <TopNav />
        {children}
      </body>
    </html>
  );
}
