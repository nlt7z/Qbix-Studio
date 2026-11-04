import type { Metadata } from 'next';
import Colophon from '@/components/Colophon';
import SampleCard from '@/components/samples/SampleCard';
import SamplesSentence from '@/components/samples/SamplesSentence';
import { SAMPLE_GROUPS } from '@/lib/samples';
import '@/app/samples.css';

const SITE_URL = 'https://qbix.space';
const DESC =
  'Short videos and posters we made for local businesses: real estate, remodels, wedding venues, Christmas tree farms, estate sales and auctions.';

export const metadata: Metadata = {
  title: 'Samples',
  description: DESC,
  alternates: { canonical: '/samples' },
  // The local-business share card: this page is for the same people as /business.
  openGraph: {
    type: 'website',
    siteName: 'Qbix',
    locale: 'en_US',
    images: [{ url: '/og/business.png', width: 1200, height: 630, alt: 'Qbix for local businesses: look as good as your work.' }],
    url: `${SITE_URL}/samples`,
    title: 'Samples · Qbix',
    description: DESC,
  },
  twitter: {
    card: 'summary_large_image',
    site: '@QbixStudio',
    creator: '@QbixStudio',
    images: ['/og/business.png'],
    title: 'Samples · Qbix',
    description: DESC,
  },
};

export default function SamplesPage() {
  return (
    <>
      <main className="smp" data-nav-theme="dark">
        <header className="container smp-head">
          <p className="smp-eyebrow">Samples</p>
          <SamplesSentence />
          <p className="smp-hint">
            <span className="smp-hint-hover">Hover over a sample to play it. Click to open it.</span>
            <span className="smp-hint-touch">Tap a sample to play it. Tap again to open it.</span>
            <span className="smp-hint-still">Open a sample to watch it.</span>
          </p>
        </header>
        {SAMPLE_GROUPS.map((g, i) => (
          <section key={g.title} className="container smp-group" aria-labelledby={`smp-g${i + 1}`}>
            <div className="smp-group-head">
              <span className="smp-group-n" aria-hidden>
                {String(i + 1).padStart(2, '0')}
              </span>
              <h2 id={`smp-g${i + 1}`} className="smp-group-title">
                {g.title}
              </h2>
            </div>
            <ul className="smp-grid">
              {g.samples.map((s) => (
                <li key={s.slug}>
                  <SampleCard sample={s} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
      <Colophon />
    </>
  );
}
