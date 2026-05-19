import type { Metadata } from 'next';
import Archive from '@/components/Archive';
import Ticker from '@/components/Ticker';
import Colophon from '@/components/Colophon';

export const metadata: Metadata = {
  title: 'archive — qbix// studio',
  description: 'Four small game systems in development. One playable, three in concept build.',
};

export default function GamesPage() {
  return (
    <main>
      <div style={{ paddingTop: 64 }}>
        <Archive />
      </div>
      <Ticker />
      <Colophon />
    </main>
  );
}
