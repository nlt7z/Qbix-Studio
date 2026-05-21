import type { Metadata } from 'next';
import Dossier from '@/components/Dossier';
import Founders from '@/components/Founders';
import Transmission from '@/components/Transmission';
import Ticker from '@/components/Ticker';
import Colophon from '@/components/Colophon';

export const metadata: Metadata = {
  title: 'Studio — Seattle, WA',
  description:
    'Qbix is an independent AI-native product design and software studio in Seattle, Washington. Two founders. Small teams, sharp systems, products that ship.',
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
