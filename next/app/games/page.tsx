import type { Metadata } from 'next';
import Archive from '@/components/Archive';
import Ticker from '@/components/Ticker';
import Colophon from '@/components/Colophon';

export const metadata: Metadata = {
  title: 'Games archive',
  description:
    'Game and interaction-system experiments from Qbix Studio. Four small game systems in development — one playable, three in concept build.',
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
