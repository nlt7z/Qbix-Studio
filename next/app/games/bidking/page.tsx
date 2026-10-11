import type { Metadata } from 'next';
import Link from 'next/link';
import Colophon from '@/components/Colophon';
import SplitText from '@/components/SplitText';
import SubHero from '@/components/sub/SubHero';
import SubSection from '@/components/sub/SubSection';

export const metadata: Metadata = {
  title: 'BidKing — a blind-auction game',
  description: 'BidKing is a blind-auction game about risk, bluffing, and opening the wrong box. A playable prototype from Qbix.',
};

export default function BidKingPage() {
  return (
    <>
      <main className="sp">
        <SubHero
          crumb={{ href: '/games', label: 'Games' }}
          eyebrow="Game · Playable prototype"
          title="BidKing"
          lede="A blind auction. Bid, bluff, or burn."
          actions={
            <>
              <span className="sp-chip mono">App Store · Soon</span>
              <span className="sp-chip mono">Google Play · Soon</span>
            </>
          }
          visual={
            <div className="sp-window">
              <span className="sp-window-bar" aria-hidden>
                <i /><i /><i />
                <span className="mono">Build 0.2.4</span>
              </span>
              <video className="sp-window-video" src="/bidking.mp4" autoPlay muted loop playsInline preload="metadata" />
            </div>
          }
          meta={[
            { k: 'Genre', v: 'Strategy · Party' },
            { k: 'Platform', v: 'iOS · Android' },
            { k: 'Session', v: '15 min · 2–4 players' },
          ]}
        />

        <SubSection tone="lime" index="How it plays" title="Read the table, not the box." narrow>
          <p className="sp-statement">
            Sealed boxes. Blind bids. The highest bidder pays — and finds out what they bought.
          </p>
        </SubSection>

        <section className="sp-close" data-nav-theme="dark">
          <div className="container sp-close-inner">
            <p className="sp-close-line">
              More from the bench. <span className="accent">See every game.</span>
            </p>
            <Link href="/games" className="btn btn-secondary btn-lg split-cta">
              <SplitText text="All games" arrow />
            </Link>
          </div>
        </section>
      </main>
      <Colophon />
    </>
  );
}
