import type { Metadata } from 'next';
import Btn from '@/components/blocks/Btn';
import Footer from '@/components/blocks/Footer';
import { Mark, Rise } from '@/components/blocks/Rise';
import VCard from '@/components/blocks/VCard';
import { SAMPLE_GROUPS } from '@/lib/samples';
import SamplesMap from './SamplesMap';
import './samples-page.css';

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

// each group's address on the page, in SAMPLE_GROUPS' order
const IDS = ['real-estate', 'remodels', 'wedding-venues', 'tree-farms', 'estate-sales', 'auctions'];

/**
 * The samples: on a map first (where each was made, region by region), then one block a kind of business
 * (white and black in turn, its name on the left and its cards on the right), then the sign-off on black.
 */
export default function SamplesPage() {
  return (
    <main className="blocks pg-samples" data-stack>
      <SamplesMap jump={SAMPLE_GROUPS.map((g, i) => ({ href: `#${IDS[i]}`, title: g.title, n: g.samples.length }))} />

      {SAMPLE_GROUPS.map((g, i) => (
        <section key={g.title} className="block grp" id={IDS[i]} data-tone={i % 2 ? 'black' : 'white'} aria-labelledby={`g${i + 1}`}>
          <div className="in grp-in">
            <header className="grp-head">
              <p className="grp-n num" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </p>
              <Rise className="grp-title" id={`g${i + 1}`}>
                {g.title}
              </Rise>
              <p className="grp-count">
                {g.samples.length} {g.samples.length === 1 ? 'sample' : 'samples'}
              </p>
            </header>
            <ul className="grp-cards">
              {g.samples.map((s) => (
                <li key={s.slug}>
                  <VCard s={s} town="after" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      <section className="block sign" id="contact" data-tone="black">
        <div className="in sign-in">
          <div>
            <div className="head">
              <p className="kicker">For local business</p>
              <Rise className="h1">
                Look as good as <Mark>your work.</Mark>
              </Rise>
              <p className="lede" data-up="">
                Fixed-price design for local businesses, <b>ready in days.</b> A listing kit for real estate agents and a
                calm website for solo practices.
              </p>
            </div>
            <div className="acts">
              <Btn href="/listing-kit">See the listing kit</Btn>
            </div>
          </div>
          <dl className="figs">
            <div className="fig">
              <dt>$99</dt>
              <dd>A print flyer, five social posts, and a 30-second video for one property. Regular $249.</dd>
            </div>
            <div className="fig">
              <dt>48 hours</dt>
              <dd>From your listing link to drafts you can share.</dd>
            </div>
          </dl>
        </div>
      </section>

      <Footer />
    </main>
  );
}
