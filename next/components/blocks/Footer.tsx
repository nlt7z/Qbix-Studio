import Link from 'next/link';
import { BtnLabel } from '@/components/blocks/Btn';
import Wordmark from '@/components/blocks/Wordmark';
import Clock from '@/components/blocks/variants/Clock';
import FloorMark from '@/components/FloorMark';
import { BOOKING_URL, CONTACT_EMAIL } from '@/lib/data';

/** A footer link; with `wave` (option 4 under review, variants/store.ts 'footer') its letters wave when pointed at. */
function L({ href, wave, children }: { href: string; wave: boolean; children: string }) {
  const inner = wave ? <BtnLabel text={children} arrow={false} /> : children;
  return href.startsWith('/') && !href.startsWith('/motion') ? (
    <Link href={href} aria-label={wave ? children : undefined}>
      {inner}
    </Link>
  ) : (
    <a href={href} aria-label={wave ? children : undefined}>
      {inner}
    </a>
  );
}

/**
 * The foot of every page, after Wise's: the sitemap in columns, a sage band with the logo and the ways to
 * reach us, the small print. The block before it decides its join (blocks.css: a white page end runs on into it).
 */
export default function Footer({ v = 1 }: { v?: number }) {
  return (
    <footer className="block foot fv2" data-tone="white" data-v={v}>
      <div className="in">
        <div className="fv2-top">
          <p className="fv2-say">Where the coolest people build the coolest ideas.</p>
          <nav className="fv2-cols" aria-label="Sitemap">
            <div>
              <h2>Studio</h2>
              <ul>
                <li><L wave={v === 4} href="/#services">Services</L></li>
                <li><L wave={v === 4} href="/products/strata">Products</L></li>
                <li><L wave={v === 4} href="/#about">About us</L></li>
                <li><L wave={v === 4} href="/motion">Motion</L></li>
              </ul>
            </div>
            <div>
              <h2>Products</h2>
              <ul>
                <li><L wave={v === 4} href="/products/strata">Strata</L><span className="st">Live</span></li>
                <li>AI Bidding<span className="st">Live</span></li>
                <li>TTS Editor<span className="st">Soon</span></li>
                <li>Interview Assistant<span className="st">Soon</span></li>
              </ul>
            </div>
            <div>
              <h2>For business</h2>
              <ul>
                <li><L wave={v === 4} href="/listing-kit">Listing Launch Kit</L></li>
                <li><L wave={v === 4} href="/practice-websites">Practice Website Refresh</L></li>
                <li><L wave={v === 4} href="/samples">Samples</L></li>
              </ul>
            </div>
            <div>
              <h2>Contact</h2>
              <ul>
                <li><L wave={v === 4} href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</L></li>
                <li><L wave={v === 4} href={BOOKING_URL}>Book a call</L></li>
                <li><L wave={v === 4} href="/start">Start a project</L></li>
              </ul>
            </div>
          </nav>
        </div>
        <div className="fv2-tile">
          <Link className="fv2-logo" href="/" aria-label="Qbix, home">
            <Wordmark dot />
          </Link>
          {/* one way to reach us here; the rest are in the columns above, and the brief is the dock */}
          <div className="fv2-reach">
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </div>
        </div>
        {v === 2 && (
          <div className="foot-mark">
            <FloorMark />
          </div>
        )}
        <p className="fv2-fine">
          <span>© 2026 Qbix</span>
          <span>
            Seattle, Washington{v === 5 ? <> · <Clock /></> : null} · Remote, worldwide
          </span>
        </p>
      </div>
    </footer>
  );
}
