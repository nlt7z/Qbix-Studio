'use client';

import '@/app/scenes-bid.css';
import Flow from '@/components/scene/Flow';

/**
 * Bid King, AI Bidding's game, drawn: a blind auction at one table. The lot
 * is a photograph (a shipping container) behind frosted glass but for one
 * slit, the peek you're allowed; the four at the table, the three models each
 * a little generative face of their own; what the table reads; and your bid.
 * It fills its box (a panel in Labs, the window in Dream). `lime` is the Bid
 * button; off where the screen's lime is something else. Moving parts are
 * named from `k` for a scene's timeline.
 */
const PLAYERS: { name: string; kind: string; said: string; seed?: number }[] = [
  { name: 'You', kind: 'Sealed', said: '$1,200' },
  { name: 'Vex', kind: 'Model', said: 'Sealed', seed: 41 },
  { name: 'Moss', kind: 'Model', said: 'Bluffing', seed: 77 },
  { name: 'Juno', kind: 'Model', said: 'Folded', seed: 13 },
];

export function BidTable({ k = 'bid', lime = true }: { k?: string; lime?: boolean }) {
  return (
    <div className="bk">
      <div className="bk-lot">
        <img className="bk-photo" src="/art/container.webp" alt="" draggable={false} loading="lazy" decoding="async" />
        {/* blind: frosted, but for the slit */}
        <span className="bk-frost bk-frost--l" />
        <span className="bk-frost bk-frost--r" />
        <span className="glass bk-peek notch">Peek 1 of 3</span>
        <div className="bk-head">
          <span className="bk-k">Lot 07 · Blind</span>
          <span className="f-head bk-title">Shipping container</span>
          <span className="bk-est">Est. $800 to $2,400</span>
        </div>
        <span className="bk-time">
          0:12
          <i>
            <b />
          </i>
        </span>
        <div data-k={`${k}.bar`} className="glass bk-bar notch">
          <span className="bk-your">
            <i>Your bid</i>
            <b className="f-head">$1,200</b>
          </span>
          <span className="bk-acts">
            <span className="bk-btn">Bluff</span>
            <span className="bk-btn">All in</span>
            <span data-k={`${k}.go`} className={`bk-btn bk-go cut${lime ? ' is-lime' : ''}`}>Bid</span>
          </span>
        </div>
      </div>
      <div className="bk-side">
        <span className="bk-k bk-side-k">
          At the table <em>4</em>
        </span>
        {PLAYERS.map((p, i) => (
          <div key={p.name} data-k={`${k}.p${i}`} className={`bk-row${p.said === 'Folded' ? ' is-out' : ''}`}>
            <i className="bk-av">
              {p.seed ? (
                <Flow count={70} seed={p.seed} ground="28, 30, 34" alpha={0.9} scale={0.14} speed={1.3} />
              ) : (
                <img src="/art/you.webp" alt="" draggable={false} loading="lazy" decoding="async" />
              )}
            </i>
            <span className="bk-who">
              <b>{p.name}</b>
              <em>{p.kind}</em>
            </span>
            <span className="bk-said">{p.said}</span>
          </div>
        ))}
        <div data-k={`${k}.read`} className="bk-read">
          <span className="bk-k">The read</span>
          <span className="bk-signal">
            <Flow count={110} seed={5} ground="22, 24, 28" alpha={0.7} scale={0.45} speed={1.1} />
          </span>
          <span className="bk-read-v">
            <b>Moss is bluffing</b>
            <em>82%</em>
          </span>
          <span className="bk-meter">
            <i data-k={`${k}.meter`} />
          </span>
        </div>
      </div>
    </div>
  );
}
