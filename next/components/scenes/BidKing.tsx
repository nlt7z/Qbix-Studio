'use client';

import '@/app/scenes-bid.css';
import Flow from '@/components/scene/Flow';

/**
 * Bid King, AI Bidding's game, drawn: a blind auction at one table. The lot
 * (a shipping container, sealed) with the currents of the room behind it;
 * the four at the table, three of them models, one of them bluffing; and
 * your bid. It fills its box (a panel in Labs, the window in Dream). `lime`
 * is the Bid button; off where the screen's lime is something else. Moving
 * parts are named from `k` for a scene's timeline.
 */
const PLAYERS: [string, string, string][] = [
  ['You', 'Sealed', '$1,200'],
  ['Vex', 'Model', 'Sealed'],
  ['Moss', 'Model', 'Bluffing'],
  ['Juno', 'Model', 'Folded'],
];

/** The lot, drawn: a container's side, its doors at one end, sealed. */
function Container() {
  const ribs = [];
  for (let x = 22; x <= 214; x += 8) ribs.push(x);
  return (
    <svg className="bk-box" viewBox="0 0 300 150" aria-hidden>
      <g className="bk-ln">
        <rect x={10} y={20} width={280} height={110} />
        <path d="M10 28 H290 M10 122 H290 M222 20 V130 M256 28 V122" />
        {[234, 246, 266, 278].map((x) => (
          <path key={x} d={`M${x} 30 V120`} />
        ))}
        {[234, 246, 266, 278].map((x) => (
          <rect key={x} x={x - 2.5} y={70} width={5} height={12} />
        ))}
        {[
          [10, 20],
          [284, 20],
          [10, 124],
          [284, 124],
        ].map(([x, y]) => (
          <rect key={`${x}${y}`} x={x} y={y} width={6} height={6} className="bk-fill" />
        ))}
      </g>
      <g className="bk-rib">
        {ribs.map((x) => (
          <path key={x} d={`M${x} 31 V119`} />
        ))}
      </g>
      {/* the seal on the doors */}
      <g className="bk-ln">
        <path d="M256 82 V92" />
        <rect x={249} y={92} width={14} height={18} />
      </g>
      <path className="bk-ground" d="M0 138 H300" />
    </svg>
  );
}

export function BidTable({ k = 'bid', lime = true }: { k?: string; lime?: boolean }) {
  return (
    <div className="bk">
      <div className="bk-lot">
        <Flow count={360} seed={23} alpha={0.34} scale={1.4} speed={0.7} />
        <div className="bk-head">
          <span className="bk-k">Lot 07 · Blind</span>
          <span className="f-head bk-title">Shipping container</span>
        </div>
        <span className="bk-time">0:12</span>
        <div className="bk-art">
          <Container />
        </div>
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
        <span className="bk-k">At the table</span>
        {PLAYERS.map(([name, kind, said], i) => (
          <div key={name} data-k={`${k}.p${i}`} className={`bk-row${said === 'Folded' ? ' is-out' : ''}`}>
            <i className="bk-av">{name[0]}</i>
            <span className="bk-who">
              <b>{name}</b>
              <em>{kind}</em>
            </span>
            <span className="bk-said">{said}</span>
          </div>
        ))}
        <div data-k={`${k}.read`} className="bk-read">
          <span className="bk-k">The read</span>
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
