import type { Metadata } from 'next';
import Dossier from '@/components/Dossier';
import Founders from '@/components/Founders';
import Transmission from '@/components/Transmission';
import Ticker from '@/components/Ticker';
import Colophon from '@/components/Colophon';

export const metadata: Metadata = {
  title: 'studio — qbix// studio',
  description: 'qbix is an independent game studio. Two founders. Small games, sharp systems, strange worlds.',
};

export default function StudioPage() {
  return (
    <main>
      <div style={{ paddingTop: 64 }}>
        <Dossier />
        <Founders />
        <Transmission />
      </div>
      <Ticker />
      <Colophon />
    </main>
  );
}
