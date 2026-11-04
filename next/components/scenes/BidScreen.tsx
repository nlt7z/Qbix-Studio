'use client';

import '@/app/scenes-bid.css';
import type { Pick } from '@/components/scene/Scene';
import { E, type Timeline } from '@/lib/scene/timeline';
import { hud, script } from '@/components/scenes/bidFonts';

/**
 * AI Bidding's front screen, drawn: the game's stage select. Its name, "AI"
 * in the HUD and "Bidding" in neon script (the only light); the menu, one
 * chamfered slab a line, Start lit rose; and the four houses as tall slanted
 * cards side by side, set up and down in turn, each with its lot standing in
 * its room and its number outlined at the head. One is picked: it widens,
 * the rest dim, and its plate comes up with the lot's name. No people: the
 * game's lots, not its cast. Rose is the product's own accent, as Strata's
 * is lime. It fills its box (a panel in Labs, the window in Dream); moving
 * parts are named from `k` for the scene's timeline (playBid).
 */
const LOTS = [
  { lot: 'camera', room: 'bar', name: 'Camera', house: 'Flea market' },
  { lot: 'watch', room: 'marble', name: 'Pocket watch', house: 'Night market' },
  { lot: 'chalice', room: 'curtain', name: 'Chalice', house: 'Grand hall' },
  { lot: 'crown', room: 'redroom', name: 'Crown', house: 'The Devil’s auction' },
];
const MENU: [string, string][] = [
  ['Start', '始'],
  ['Collection', '蔵'],
  ['Settings', '設'],
  ['Credits', '製'],
];
/** the card that gets picked, and how much wider it grows than the rest */
const PICK = 3;
const GROW = 1.9;
const two = (n: number) => String(n).padStart(2, '0');

/** Three heavy chevrons, the game's arrows. */
function Chevrons() {
  const one = (x: number) => `M${x} 0h6l8 8-8 8h-6l8-8z`;
  return (
    <svg className="bs-chev" width="30" height="16" viewBox="0 0 30 16" aria-hidden>
      <path d={[0, 8, 16].map(one).join('')} fill="currentColor" />
    </svg>
  );
}

export function BidScreen({ k = 'bid' }: { k?: string }) {
  return (
    <div className={`bs ${hud.variable} ${script.variable}`}>
      <span className="bs-glyph" aria-hidden>
        競
      </span>
      <div className="bs-left">
        <p className="bs-title">
          <span data-k={`${k}.ai`} className="bs-ai">
            AI
          </span>
          <span data-k={`${k}.neon`} className="bs-neon">
            Bidding
          </span>
        </p>
        <div className="bs-menu">
          {MENU.map(([label, glyph], i) => (
            <span key={label} data-k={`${k}.m${i}`} className={`bs-item${i === 0 ? ' is-rec' : ''}`}>
              {i === 0 && <i data-k={`${k}.lit`} className="bs-lit" />}
              <i className="bs-hatch" />
              <i className="bs-art">{glyph}</i>
              <span className="bs-label">{label}</span>
              <Chevrons />
              {i === 0 && <i className="bs-hz" />}
            </span>
          ))}
        </div>
      </div>
      <div className="bs-line">
        {LOTS.map((c, i) => (
          <div key={c.lot} data-k={`${k}.c${i}`} className="bs-card">
            <span className="bs-face">
              <img className="bs-room" src={`/art/bid/room-${c.room}.webp`} alt="" draggable={false} loading="lazy" decoding="async" />
              <img className="bs-lot" src={`/art/bid/${c.lot}.webp`} alt="" draggable={false} loading="lazy" decoding="async" />
            </span>
            <i data-k={`${k}.dim${i}`} className="bs-dim" />
            <span className="bs-n">{two(i + 1)}</span>
            {i === PICK && (
              <span data-k={`${k}.who`} className="bs-who">
                <span className="bs-tag">{two(i + 1)}</span>
                <span className="bs-name">{c.name}</span>
                <span className="bs-house">{c.house}</span>
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const ramp = (a: number, b: number, t: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};

/**
 * The screen settling, from `at` (beats): the menu slides in line by line and
 * Start lights; the name's neon flickers on; then a house is picked: its card
 * widens, the others dim, and its plate comes up.
 */
export function playBid(q: Pick, tl: Timeline, k: string, at: number) {
  MENU.forEach((_, i) => {
    const el = q(`${k}.m${i}`);
    tl.from(el, { x: -26, o: 0 }).to(el, { x: 0, o: 1 }, at + 0.02 + i * 0.022, 0.09, E.out);
  });
  // Start lights: the rose slab grows in under it and its words go ink
  tl.from(q(`${k}.lit`), { sx: 0 }).to(q(`${k}.lit`), { sx: 1 }, at + 0.13, 0.06, E.out);
  tl.from(q(`${k}.m0`), { color: '#ffffff' }).to(q(`${k}.m0`), { color: '#0b090d' }, at + 0.14, 0.03, E.lin);
  // the neon comes on as a tube does: a stutter, then steady
  const neon = q(`${k}.neon`);
  tl.from(neon, { o: 0 });
  [0.85, 0.12, 1, 0.3, 1].forEach((o, i) => tl.set(neon, { o }, at + 0.06 + i * 0.012));

  const pick = { at: at + 0.2, dur: 0.1 };
  const cards = LOTS.map((_, i) => q(`${k}.c${i}`));
  let was = -1;
  tl.on((t) => {
    const p = Math.round(ramp(pick.at, pick.at + pick.dur, t) * 1000) / 1000;
    if (p === was) return;
    was = p;
    const el = cards[PICK];
    if (el) el.style.flexGrow = String(1 + (GROW - 1) * p);
  });
  LOTS.forEach((_, i) => {
    if (i === PICK) return;
    tl.from(q(`${k}.dim${i}`), { o: 0 }).to(q(`${k}.dim${i}`), { o: 1 }, pick.at, pick.dur, E.soft);
  });
  tl.from(q(`${k}.who`), { y: 96 }).to(q(`${k}.who`), { y: 0 }, pick.at + 0.05, 0.08, E.out);
}
