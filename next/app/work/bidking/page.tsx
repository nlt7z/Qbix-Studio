import type { Metadata } from 'next';
import Link from 'next/link';
import Colophon from '@/components/Colophon';
import './bidking.css';

const SITE_URL = 'https://qbix.space';

export const metadata: Metadata = {
  title: 'BidKing — case study',
  description: 'Case study: BidKing — a blind-auction game about risk, bluffing, and opening the wrong box. Designed and built by Qbix Studio.',
};

const caseStudyJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  '@id': `${SITE_URL}/work/bidking/#case-study`,
  name: 'BidKing',
  headline: 'BidKing — case study',
  description:
    'A sealed-bid auction reimagined as a mobile game about risk, bluffing, and opening the wrong box. Designed and built by Qbix Studio.',
  url: `${SITE_URL}/work/bidking`,
  inLanguage: 'en-US',
  datePublished: '2025',
  genre: ['Strategy', 'Party game'],
  keywords: 'Mobile game, Game design, Studio product',
  creator: { '@id': `${SITE_URL}/#organization` },
  author: { '@id': `${SITE_URL}/#organization` },
  publisher: { '@id': `${SITE_URL}/#organization` },
};

export default function BidKingPage() {
  return (
    <main className="bk-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(caseStudyJsonLd) }}
      />
      <section className="bk-hero">
        <div className="bk-meta-bar">
          <span className="bk-meta-num">MISSION / 001</span>
          <span className="bk-meta-dot" />
          <span className="bk-meta-status">PLAYABLE PROTOTYPE</span>
        </div>

        <h1 className="bk-title">BIDKING</h1>
        <p className="bk-hook">
          A blind auction. Bid, bluff, or burn.
        </p>

        <div className="bk-video-frame">
          <span className="bk-frame-tag">// BUILD 0.2.4</span>
          <video
            className="bk-video"
            src="/bidking.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
          <span className="bk-scan" aria-hidden />
        </div>

        <ul className="bk-spec">
          <li>
            <span className="k">GENRE</span>
            <span className="v">STRATEGY · PARTY</span>
          </li>
          <li>
            <span className="k">PLATFORM</span>
            <span className="v">iOS / ANDROID</span>
          </li>
          <li>
            <span className="k">SESSION</span>
            <span className="v">15 MIN · 2–4</span>
          </li>
        </ul>
      </section>

      <section className="bk-mechanics">
        <div className="bk-section-label">// MECHANICS</div>
        <h2 className="bk-section-title">How it plays.</h2>
        <p className="bk-mech-body">
          Sealed boxes. Blind bids. The highest bidder pays — and finds out what they bought.
        </p>
        <p className="bk-mech-body">
          Read the table, not the box.
        </p>

        <div className="bk-cta-row">
          <a className="bk-cta disabled" aria-disabled="true">
            <span className="bk-cta-icon"></span>
            <span className="bk-cta-text">
              <span className="bk-cta-label">App Store</span>
              <span className="bk-cta-sub">Soon</span>
            </span>
          </a>
          <a className="bk-cta disabled" aria-disabled="true">
            <span className="bk-cta-icon">▶</span>
            <span className="bk-cta-text">
              <span className="bk-cta-label">Google Play</span>
              <span className="bk-cta-sub">Soon</span>
            </span>
          </a>
        </div>

        <Link href="/#work" className="bk-back">
          ← work
        </Link>

        <p style={{ marginTop: 24, fontSize: 13, lineHeight: 1.6, color: 'var(--text-2)' }}>
          A studio product from{' '}
          <Link href="/" className="text-link">Qbix Studio</Link>, an AI product design
          studio in Seattle. See our{' '}
          <Link href="/services/ai-products" className="text-link">AI product design</Link> work.
        </p>
      </section>

      <Colophon />
    </main>
  );
}
