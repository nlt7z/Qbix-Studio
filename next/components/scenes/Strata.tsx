'use client';

import { useRef } from 'react';
import Scene, { type Pick } from '@/components/scene/Scene';
import { A, T, Cursor, Lock, Check } from '@/components/scene/kit';
import { E, type Timeline } from '@/lib/scene/timeline';
import { useQuietPlayback } from '@/components/useQuietPlayback';
import '@/app/scenes-strata.css';

/**
 * Strata, moodboard to design system.
 *
 * Hero: Strata itself, its own film playing in a browser window at
 * stratadesign.app (live), and two of the tokens it makes sliding out from
 * under the window: a type style and a spacing scale.
 *
 * Tour, one image in and a working system out:
 * 1 · an image is dragged in and read: a scan passes over it, sample points
 *     pin its colours as the readout fills, its type and spacing are
 *     measured with redlines;
 * 2 · the readout becomes tokens (each measurement gets a name, the scales
 *     fill in), then the picture itself is redrawn as a component, a card, and
 *     a form is drawn from the same tokens;
 * 3 · exported: the colours drop into the CSS as it's typed out, and the
 *     system is handed to AI.
 * The picture stays left (picture, then components) and the panel right
 * (readout, tokens, code), so everything changes in place and nothing crosses.
 * One lime at a time, passed on: the hero has none (the page's button beside it
 * is the lime); in the tour it's the picture's sun, then the button drawn from
 * the accent, then the accent's chip in the code.
 */

/* =============================================================================
   Hero
   ============================================================================= */

// the window (the film is 1600 × 750: 598 wide, 280 high under the bar)
const HW = { x: 20, y: 59, w: 600, h: 318 };
// the two tokens: glass, over the window's bottom edge (the film shows through them, blurred)
const HC = { x: 40, y: 333, h: 88, w: 272, gap: 16, drop: 36 };

export function StrataHero() {
  const film = useRef<HTMLVideoElement | null>(null);
  useQuietPlayback(film);
  return (
    <Scene
      n={1}
      w={640}
      h={480}
      intro="load"
      label="Strata, live at stratadesign.app: its film plays in a browser window while a type token and a spacing scale slide out from under it"
      build={(q, tl) => {
        const win = q('win');
        // the window opens, its address is typed, it's live
        // (opened past its edges, so its shadow isn't cut)
        tl.from(win, { clip: 'inset(0px 0px 100% 0px round 12px)' }).to(win, { clip: 'inset(-64px -64px -64px -64px round 12px)' }, 0, 0.3, E.out);
        tl.from(q('lock'), { o: 0 }).to(q('lock'), { o: 1 }, 0.18, 0.01, E.lin);
        tl.type(q('addr'), 0.18, 0.18);
        tl.from(q('live'), { clip: [0, 100, 0, 0] }).to(q('live'), { clip: [0, 0, 0, 0] }, 0.38, 0.08, E.out);
        // the tokens come out of the film, one, then the other: each slides down off it,
        // drawn from its top edge down as it goes, to sit over the window's bottom edge
        const peel = (el: HTMLElement | null, at: number) => {
          tl.from(el, { y: -HC.drop, clip: 'inset(0px 0px 100% 0px)' });
          tl.to(el, { y: 0, clip: 'inset(-40px -40px -64px -40px)' }, at, 0.28, E.out);
        };
        peel(q('tok.a'), 0.44);
        peel(q('tok.b'), 0.56);
        // the scale is drawn, step by step
        tl.from(q('dims'), { dash: 1 }).to(q('dims'), { dash: 0 }, 0.74, 0.2, E.soft);
      }}
    >
      <A k="win" x={HW.x} y={HW.y} w={HW.w} h={HW.h} r={12} c="win">
        <div className="win-bar">
          <span className="win-dots" aria-hidden>
            <i />
            <i />
            <i />
          </span>
          <span className="win-url str-url">
            <span data-k="lock" className="str-lock">
              <Lock />
            </span>
            <span data-k="addr" className="win-addr">
              stratadesign.app
            </span>
          </span>
          <span data-k="live" className="live str-live">
            Live
          </span>
        </div>
        <div className="win-body str-film-box">
          <video
            ref={film}
            className="str-film"
            src="/previews/strata.mp4"
            poster="/previews/strata.jpg"
            muted
            loop
            playsInline
            preload="metadata"
          />
        </div>
      </A>

      {/* a type style */}
      <A k="tok.a" x={HC.x} y={HC.y} w={HC.w} h={HC.h} c="str-tok glass">
        <span className="f-mono str-tok-name">type/display</span>
        <span className="str-tok-meta">Eurostile</span>
        <span className="f-head str-tok-aa">Aa</span>
        <span className="str-tok-val">64/68</span>
      </A>
      {/* a spacing scale */}
      <A k="tok.b" x={HC.x + HC.w + HC.gap} y={HC.y} w={HC.w} h={HC.h} c="str-tok glass">
        <span className="f-mono str-tok-name">space</span>
        <span className="str-tok-meta">base 8</span>
        <svg className="str-tok-dims" width="93" height="12" viewBox="0 0 93 12" aria-hidden>
          <path
            data-k="dims"
            d="M0.5 0.5 v11 M0.5 6 h12 M12.5 0.5 v11 M22.5 0.5 v11 M22.5 6 h24 M46.5 0.5 v11 M56.5 0.5 v11 M56.5 6 h36 M92.5 0.5 v11"
            pathLength={1}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="1 1"
          />
        </svg>
        <span className="str-tok-val">8 · 16 · 24</span>
      </A>
    </Scene>
  );
}

/* =============================================================================
   Tour
   ============================================================================= */

// the picture (it becomes the card), and the panel beside it
const IMG = { x: 8, y: 58, w: 424, h: 524 };
const ART = 364; // the picture's image; its caption under it
// the panel is glass, over the picture's right edge (its own content keeps clear of the overlap)
const PAN = { x: 380, y: 58, w: 332, h: 524 };
const PI = { w: PAN.w - 2, r: PAN.w - 2 - 16 }; // the panel's inside: its width, its right edge
// the picture as a card: the band of the image it keeps, and its height
const BAND = { top: 140, h: 212 };
const CARD_H = 344;
const FORM = { x: IMG.x, y: IMG.y + CARD_H + 16, w: IMG.w, h: IMG.h - CARD_H - 16 };
// the caption: the title (64/68), its line under it
const TITLE = { x: 24, y: 392 };
const SUB = { y: 476 };
// in the card: the title set 28/32, the line, the link
const C_TITLE = BAND.h + 20;
const C_SUB = C_TITLE + 40;
const C_LINK = C_SUB + 32;

// the picture's sun (behind the ridges)
const SUN = { x: 232, y: 226, r: 50 };

// the colours it reads, top to bottom as the scan meets them (pins on the picture);
// the accent is the one lime, so the panel draws it as an outline until it's in the code
const ACC = 1;
const COLORS = [
  { hex: '#F4F5F2', name: 'paper', pc: '44%', pin: [56, 92] },
  { hex: '#B8FF00', name: 'accent', pc: '6%', pin: [218, 204] },
  { hex: '#959696', name: 'stone', pc: '21%', pin: [120, 298] },
  { hex: '#121417', name: 'ink', pc: '29%', pin: [300, 340] },
] as const;

// the spacing scale, each step drawn at its size: [value, where it sits in the scale];
// what was measured (16, 24) sits at the start of the row first, then steps over by SP_STEP
const SPACE: [number, number][] = [
  [4, 16],
  [8, 46],
  [16, 80],
  [24, 129],
  [40, 186],
];
const SP_STEP = 64;

// the panel's rows (in its own px): colour rows, type rows, space, mood / radius
const ROW = 28;
const CY = 78;
const TY = 222;
const SY = 310; // space row (state 1); one row lower once the type scale has three
const MY = 370; // mood row (state 1); radius row once it's tokens (one row lower)
const FOOT = PAN.h - 2 - 16 - 36;

// the code it exports
const CODE: [string, string, number?][] = [
  ['sel', ':root {'],
  ['var', '  --paper: #f4f5f2;', 0],
  ['var', '  --accent: #b8ff00;', 1],
  ['var', '  --stone: #959696;', 2],
  ['var', '  --ink: #121417;', 3],
  ['var', '  --display: 64px/68px Eurostile;'],
  ['var', '  --title: 28px/32px Eurostile;'],
  ['var', '  --body: 15px/20px Geist;'],
  ['var', '  --space-1: 4px;'],
  ['var', '  --space-2: 8px;'],
  ['var', '  --space-4: 16px;'],
  ['var', '  --space-6: 24px;'],
  ['var', '  --space-10: 40px;'],
  ['var', '  --radius-none: 0;'],
  ['var', '  --radius-sm: 2px;'],
  ['var', '  --radius-md: 4px;'],
  ['sel', '}'],
];
const CODE_Y = 58;
const LINE = 20;
// a token's name goes where the measurement was; the measurement steps over by this much
const NAME_X = 76;
// the page's tone (the tour sits on a dark chapter): text, and text set back
const FG = 'rgb(244, 245, 242)';
const FG2 = 'rgba(244, 245, 242, 0.62)';

/** A line of CSS, coloured: names mid, values bright, punctuation dim; a colour's chip before its value. */
function Css({ s, chip }: { s: string; chip?: number }) {
  const m = /^(\s*)(--[a-z0-9-]+)(:\s)(.*?)(;)$/.exec(s);
  if (!m) return <span className="str-c-sel">{s}</span>;
  return (
    <>
      <span>{m[1]}</span>
      <span className="str-c-prop">{m[2]}</span>
      <span className="str-c-punc">{m[3]}</span>
      {chip !== undefined && <span data-k={`ph.${chip}`} className="str-ph" />}
      <span>{m[4]}</span>
      <span className="str-c-punc">{m[5]}</span>
    </>
  );
}

/** The picture's three ridges (ink on the paper at 16%, 42%, 100%), in front of its sun. */
function Ridges() {
  return (
    <svg className="a" style={{ left: 0, top: 0 }} width={IMG.w} height={ART} viewBox={`0 0 ${IMG.w} ${ART}`} aria-hidden>
      <path d="M0 246 L40 228 L90 242 L140 204 L190 234 L236 220 L272 236 L312 212 L360 234 L424 216 V364 H0 Z" fill="#d0d1cf" />
      <path d="M0 288 L56 262 L114 282 L174 248 L236 286 L296 264 L352 288 L424 268 V364 H0 Z" fill="#959696" />
      <path d="M0 326 L68 302 L136 322 L206 290 L274 318 L334 300 L394 318 L424 308 V364 H0 Z" fill="#121417" />
    </svg>
  );
}

/** A redline: a measured length with its ends marked, horizontal or vertical. */
function Redline({ k, x, y, len, v }: { k: string; x: number; y: number; len: number; v?: boolean }) {
  const d = v ? `M0.5 0.5 h8 M4.5 0.5 v${len - 1} M0.5 ${len - 0.5} h8` : `M0.5 0.5 v8 M0.5 4.5 h${len - 1} M${len - 0.5} 0.5 v8`;
  return (
    <svg data-k={k} className="a str-rl" style={{ left: x, top: y }} width={v ? 9 : len} height={v ? len : 9} viewBox={`0 0 ${v ? 9 : len} ${v ? len : 9}`} aria-hidden>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/** A corner of radius r, drawn at twice its size (0 is a sharp corner). */
function Corner({ r }: { r: number }) {
  const R = Math.min(r * 2, 15.25);
  return (
    <svg className="str-corner" width="16" height="16" viewBox="0 0 16 16" aria-hidden>
      <path d={`M0.75 16 V${0.75 + R} A${R} ${R} 0 0 1 ${0.75 + R} 0.75 H16`} fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** Where `el` would have to move by (in the scene's px) to sit centred on `to`. */
function offset(el: HTMLElement | null, to: HTMLElement | null) {
  if (!el || !to) return { x: 0, y: 0 };
  const a = el.getBoundingClientRect();
  const b = to.getBoundingClientRect();
  const z = a.width / (el.offsetWidth || 1) || 1;
  return { x: (b.left + b.width / 2 - (a.left + a.width / 2)) / z, y: (b.top + b.height / 2 - (a.top + a.height / 2)) / z };
}

function buildTour(q: Pick, tl: Timeline) {
  const cur = q('cursor');
  const img = q('img');
  // the title's width (set in its face): its box, its tag, the card's tag
  const tw = q('title')?.offsetWidth ?? 180;
  q('tboxsvg')?.setAttribute('width', String(tw));
  q('tbox')?.setAttribute('width', String(tw - 1));
  q('ttag')?.style.setProperty('left', `${TITLE.x + tw + 12}px`);
  q('tag.t')?.style.setProperty('left', `${IMG.x + TITLE.x + Math.round((tw * 28) / 64) + 12}px`);
  const wipe = (el: HTMLElement | null, at: number, dur = 0.06, ease: string = E.out) =>
    tl.from(el, { clip: [0, 100, 0, 0] }).to(el, { clip: [0, 0, 0, 0] }, at, dur, ease);
  const fold = (el: HTMLElement | null, at: number, dur = 0.05) => tl.to(el, { clip: [0, 100, 0, 0] }, at, dur, E.in);
  const click = (at: number) => tl.to(cur, { s: 0.86 }, at, 0.03, E.lin).to(cur, { s: 1 }, at + 0.03, 0.03, E.lin);

  /* 0 → 1: the image is dropped in and read --------------------------------- */
  // where to drop it
  const drop = q('drop');
  tl.from(drop, { clip: 'inset(0% 0% 100% 0% round 12px)' }).to(drop, { clip: 'inset(0% 0% 0% 0% round 12px)' }, 0, 0.12, E.out);
  // the file comes in under the pointer (the picture, small), is carried over and dropped
  const TH = { x: 604 - (IMG.x + IMG.w / 2), y: 536 - (IMG.y + IMG.h / 2), s: 0.3 };
  tl.from(img, { x: TH.x, y: TH.y, s: TH.s, r: -4, clip: 'inset(100% 0% 0% 0% round 12px)' });
  tl.to(img, { clip: 'inset(0% 0% 0% 0% round 12px)' }, 0.06, 0.08, E.out);
  tl.from(cur, { x: 614, y: 548, o: 0 });
  tl.to(cur, { o: 1 }, 0.1, 0.02, E.lin).to(cur, { s: 0.86 }, 0.13, 0.03, E.lin);
  tl.to(img, { x: 0, y: 0 }, 0.16, 0.18, E.move);
  tl.to(cur, { x: 614 - TH.x, y: 548 - TH.y }, 0.16, 0.18, E.move);
  // dropped: it opens to the full picture, the drop zone is gone under it
  tl.to(img, { s: 1, r: 0 }, 0.34, 0.12, E.out);
  tl.to(cur, { s: 1 }, 0.34, 0.03, E.lin).to(cur, { x: 560, y: 616 }, 0.38, 0.12, E.soft).to(cur, { o: 0 }, 0.47, 0.03, E.lin);
  tl.set(drop, { clip: 'inset(0% 0% 100% 0% round 12px)' }, 0.47);

  // the panel opens beside it
  const pan = q('pan');
  tl.from(pan, { clip: 'inset(0px 0px 100% 0px round 12px)' }).to(pan, { clip: 'inset(-64px -64px -64px -64px round 12px)' }, 0.44, 0.1, E.out);
  tl.type(q('h1'), 0.48, 0.06);
  wipe(q('h1m'), 0.52, 0.05);

  // the scan: a line down the picture; each sample point pins as it passes, and its row is read out
  const S0 = 0.54;
  const SD = 0.26;
  const at = (y: number) => S0 + (SD * y) / IMG.h;
  const scan = q('scan');
  tl.from(scan, { clip: [0, 100, 0, 0] }).to(scan, { clip: [0, 0, 0, 0] }, S0 - 0.02, 0.02, E.lin);
  tl.to(scan, { y: IMG.h - 2 }, S0, SD, E.lin);
  tl.to(scan, { clip: [0, 0, 0, 100] }, S0 + SD, 0.02, E.lin);
  wipe(q('g.color'), S0 - 0.01, 0.04);
  COLORS.forEach((c, i) => {
    const t = at(c.pin[1]);
    const pin = q(`pin.${i}`);
    tl.from(pin, { clip: 'inset(50% 50% 50% 50%)' }).to(pin, { clip: 'inset(-3px -3px -3px -3px)' }, t, 0.04, E.out);
    tl.from(q(`c.sw.${i}`), { clip: 'inset(0% 100% 0% 0% round 4px)' }).to(q(`c.sw.${i}`), { clip: 'inset(0% 0% 0% 0% round 4px)' }, t + 0.005, 0.03, E.out);
    wipe(q(`c.hex.${i}`), t + 0.015, 0.05);
    wipe(q(`c.pc.${i}`), t + 0.035, 0.03);
  });
  // the type: its box is drawn round the title, its size tagged; the spacing, redlined
  const tTop = at(TITLE.y);
  tl.from(q('tbox'), { dash: 1 }).to(q('tbox'), { dash: 0 }, tTop, 0.06, E.soft);
  wipe(q('ttag'), tTop + 0.05, 0.04);
  wipe(q('g.type'), tTop, 0.04);
  wipe(q('ty.row.0'), tTop + 0.03, 0.05);
  wipe(q('rl.m'), at(TITLE.y + 34), 0.03);
  wipe(q('rl.m.t'), at(TITLE.y + 34) + 0.02, 0.03);
  wipe(q('rl.g'), at(TITLE.y + 68), 0.02);
  wipe(q('rl.g.t'), at(TITLE.y + 68) + 0.015, 0.03);
  wipe(q('ty.row.1'), at(SUB.y) + 0.01, 0.05);
  wipe(q('g.space'), S0 + SD - 0.01, 0.04);
  wipe(q('sp.16'), S0 + SD + 0.01, 0.03);
  wipe(q('sp.24'), S0 + SD + 0.025, 0.03);
  // and its mood, in three words; then what to do with it
  wipe(q('g.mood'), 0.84, 0.04);
  tl.type(q('mood'), 0.86, 0.06);
  const btn = q('btn');
  tl.from(btn, { clip: 'inset(0% 100% 0% 0% round 18px)' }).to(btn, { clip: 'inset(0% 0% 0% 0% round 18px)' }, 0.92, 0.07, E.out);

  /* 1 → 2: the system is drafted: tokens first, then the components ---------- */
  const BTN = { x: PAN.x + 1 + 16 + (PI.w - 32) / 2, y: PAN.y + 1 + FOOT + 18 };
  tl.set(cur, { x: BTN.x + 70, y: BTN.y + 56 }, 1.0);
  tl.to(cur, { o: 1 }, 1.0, 0.02, E.lin).to(cur, { x: BTN.x + 4, y: BTN.y - 4 }, 1.0, 0.1, E.move);
  click(1.1);
  tl.to(btn, { s: 0.97 }, 1.1, 0.03, E.lin).to(btn, { s: 1 }, 1.13, 0.03, E.lin);
  tl.to(cur, { x: BTN.x + 108, y: BTN.y + 40 }, 1.18, 0.12, E.soft);
  // what it measured on the picture is taken off it
  COLORS.forEach((_, i) => tl.to(q(`pin.${i}`), { clip: 'inset(50% 50% 50% 50%)' }, 1.14 + i * 0.006, 0.035, E.in));
  tl.to(q('tbox'), { dash: 1 }, 1.14, 0.045, E.in);
  ['ttag', 'rl.m', 'rl.m.t', 'rl.g', 'rl.g.t'].forEach((k, i) => fold(q(k), 1.14 + i * 0.004, 0.035));
  // the panel is tokens now: what it read keeps its place, names are given
  fold(q('h1'), 1.18, 0.04);
  fold(q('h1m'), 1.18, 0.04);
  tl.type(q('h2'), 1.22, 0.04);
  wipe(q('h2m'), 1.24, 0.04);
  COLORS.forEach((_, i) => fold(q(`c.pc.${i}`), 1.2 + i * 0.008, 0.04));
  // the measured value moves over (and steps back), its name is typed where it was
  COLORS.forEach((_, i) => {
    tl.to(q(`c.hex.${i}`), { x: NAME_X }, 1.25 + i * 0.012, 0.09, E.move);
    tl.from(q(`c.hex.${i}`), { color: FG }).to(q(`c.hex.${i}`), { color: FG2 }, 1.25 + i * 0.012, 0.09, E.soft);
    tl.type(q(`c.nm.${i}`), 1.33 + i * 0.012, 0.04);
  });
  // named, the accent leaves the picture: its sun keeps only its outline
  const out = q('sun.out');
  tl.from(out, { clip: [0, 0, 100, 0] }).to(out, { clip: [0, 0, 0, 0] }, 1.33 + ACC * 0.012 + 0.03, 0.07, E.soft);
  [0, 1].forEach((j) => {
    tl.to(q(`ty.f.${j}`), { x: NAME_X }, 1.29 + j * 0.012, 0.09, E.move);
    tl.from(q(`ty.f.${j}`), { color: FG }).to(q(`ty.f.${j}`), { color: FG2 }, 1.29 + j * 0.012, 0.09, E.soft);
    tl.type(q(`ty.nm.${j}`), 1.37 + j * 0.012, 0.04);
  });
  // the scales fill in: the mood is set aside, the body row and the spacing step down,
  // the title size between, the spacing sorted into its scale, the radius under it
  fold(q('g.mood'), 1.3, 0.04);
  fold(q('mood'), 1.3, 0.04);
  tl.to(q('ty.row.1'), { y: ROW }, 1.38, 0.08, E.move);
  tl.to(q('g.space'), { y: ROW }, 1.38, 0.08, E.move);
  tl.to(q('sp.row'), { y: ROW }, 1.38, 0.08, E.move);
  wipe(q('ty.row.t'), 1.45, 0.06);
  tl.from(q('sp.16'), { x: -SP_STEP }).to(q('sp.16'), { x: 0 }, 1.47, 0.07, E.move);
  tl.from(q('sp.24'), { x: -SP_STEP }).to(q('sp.24'), { x: 0 }, 1.47, 0.07, E.move);
  ['sp.4', 'sp.8', 'sp.40'].forEach((k, i) => wipe(q(k), 1.52 + i * 0.012, 0.04));
  wipe(q('g.rad'), 1.5, 0.04);
  wipe(q('rad.row'), 1.52, 0.06);

  // then the picture is redrawn as a component: its image cropped to a band, its title set
  // in the title size, its line in the body size; the card at the radius
  const CM = 1.58;
  const CD = 0.2;
  tl.from(img, { h: IMG.h }).to(img, { h: CARD_H }, CM, CD, E.move);
  tl.to(q('art'), { y: -BAND.top, clip: `inset(${BAND.top}px 0px ${ART - BAND.top - BAND.h}px 0px)` }, CM, CD, E.move);
  tl.from(q('art'), { clip: `inset(0px 0px 0px 0px)` });
  tl.to(q('title'), { y: C_TITLE - TITLE.y, s: 28 / 64 }, CM, CD, E.move);
  tl.to(q('sub'), { y: C_SUB - SUB.y }, CM, CD, E.move);
  wipe(q('link'), CM + CD - 0.02, 0.05);
  // and a form, from the same tokens
  const form = q('form');
  tl.from(form, { clip: 'inset(0% 0% 100% 0% round 12px)' }).to(form, { clip: 'inset(0% 0% 0% 0% round 12px)' }, 1.76, 0.08, E.out);
  ['form.h', 'form.p', 'form.in', 'form.btn'].forEach((k, i) => wipe(q(k), 1.79 + i * 0.018, 0.05));
  // where the tokens are used
  ['tag.r', 'tag.t', 'tag.a'].forEach((k, i) => wipe(q(k), 1.88 + i * 0.02, 0.04));
  // the button's next step
  tl.to(q('btn.1'), { y: -10, clip: [0, 0, 100, 0] }, 1.9, 0.04, E.in);
  tl.from(q('btn.2'), { y: 10, clip: [100, 0, 0, 0] }).to(q('btn.2'), { y: 0, clip: [0, 0, 0, 0] }, 1.93, 0.05, E.out);

  /* 2 → 3: exported, handed on ------------------------------------------------- */
  tl.to(cur, { x: BTN.x + 4, y: BTN.y - 4 }, 2.0, 0.08, E.move);
  click(2.08);
  tl.to(btn, { s: 0.97 }, 2.08, 0.03, E.lin).to(btn, { s: 1 }, 2.11, 0.03, E.lin);
  ['tag.r', 'tag.t', 'tag.a'].forEach((k, i) => fold(q(k), 2.1 + i * 0.004, 0.035));
  const ink = q('form.btn.ink');
  tl.from(ink, { clip: [0, 100, 0, 0] }).to(ink, { clip: [0, 0, 0, 0] }, 2.1, 0.06, E.soft);
  // the tokens are taken down, row by row (the colours stay)
  fold(q('h2'), 2.12, 0.04);
  fold(q('h2m'), 2.12, 0.04);
  wipe(q('tabs'), 2.16, 0.06);
  wipe(q('h3m'), 2.19, 0.05);
  const rows = ['g.color', 'c.row.0', 'c.row.1', 'c.row.2', 'c.row.3', 'g.type', 'ty.row.0', 'ty.row.t', 'ty.row.1', 'g.space', 'sp.row', 'g.rad', 'rad.row'];
  rows.forEach((k, i) => fold(q(k), 2.12 + i * 0.005, 0.04));
  // the colours go first, each to its place in the code (they wait there for their lines)
  COLORS.forEach((_, i) => {
    const sw = q(`c.sw.${i}`);
    const o = offset(sw, q(`ph.${i}`));
    tl.to(sw, { x: o.x, y: o.y, s: 10 / 16 }, 2.22 + i * 0.014, 0.07, E.move);
  });
  // landed in its line, the accent fills: the code's one lime
  const landed = 2.22 + ACC * 0.014 + 0.07;
  tl.from(q('acc.fill'), { clip: [0, 100, 0, 0] }).to(q('acc.fill'), { clip: [0, 0, 0, 0] }, landed, 0.03, E.out);
  tl.to(q('acc.ring'), { o: 0 }, landed + 0.03, 0.01, E.lin);
  // then the code is written round them
  const lns = q('lns');
  tl.from(lns, { clip: [0, 0, 100, 0] }).to(lns, { clip: [0, 0, 0, 0] }, 2.31, 0.05, E.out);
  const lines = q.all('code.');
  const total = CODE.reduce((n, [, s]) => n + s.length, 0);
  let t = 2.33;
  lines.forEach((el, i) => {
    const d = (0.27 * CODE[i][1].length) / total;
    tl.type(el, t, d);
    t += d;
  });
  // the next step: copy it, or hand it to AI
  tl.to(q('btn.2'), { y: -10, clip: [0, 0, 100, 0] }, 2.6, 0.03, E.in);
  tl.to(btn, { w: (PI.w - 32 - 8) / 2 }, 2.6, 0.08, E.move);
  tl.from(q('btn.3'), { y: 10, clip: [100, 0, 0, 0] }).to(q('btn.3'), { y: 0, clip: [0, 0, 0, 0] }, 2.63, 0.05, E.out);
  const copy = q('copy');
  tl.from(copy, { clip: 'inset(0% 100% 0% 0% round 18px)' }).to(copy, { clip: 'inset(0% 0% 0% 0% round 18px)' }, 2.64, 0.06, E.out);
  const AI = { x: PAN.x + 1 + PI.r - (PI.w - 40) / 4, y: BTN.y };
  tl.to(cur, { x: AI.x + 2, y: AI.y - 4 }, 2.71, 0.07, E.move);
  click(2.8);
  tl.to(btn, { s: 0.97 }, 2.8, 0.03, E.lin).to(btn, { s: 1 }, 2.83, 0.03, E.lin);
  tl.to(cur, { x: AI.x + 46, y: AI.y + 44 }, 2.86, 0.1, E.soft);
  // handed over: the note slides up from behind the buttons
  const toast = q('toast');
  tl.from(toast, { y: 52, clip: 'inset(0px 0px 40px 0px)' }).to(toast, { y: 0, clip: 'inset(0px 0px -12px 0px)' }, 2.84, 0.1, E.out);
}

export function StrataTour() {
  return (
    <Scene
      n={3}
      w={720}
      h={640}
      label="An image is dropped into Strata and read for its colours, type and spacing; the measurements become named tokens and the picture becomes a card, beside a form drawn from the same tokens; then the system is written out as CSS and handed to AI"
      build={buildTour}
    >
      {/* --- left: where the image is dropped --- */}
      <A k="drop" x={IMG.x} y={IMG.y} w={IMG.w} h={IMG.h} r={12} c="str-drop">
        <svg className="str-drop-edge" width={IMG.w} height={IMG.h} aria-hidden>
          <rect x="0.5" y="0.5" width={IMG.w - 1} height={IMG.h - 1} fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="6 5" />
        </svg>
        <svg className="str-drop-up" width="28" height="28" viewBox="0 0 28 28" aria-hidden>
          <path d="M14 18 V5 M8.5 10.5 L14 5 L19.5 10.5 M5 17 V22.5 H23 V17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="str-drop-t">Drop an image</span>
        <span className="str-drop-s">A moodboard, a screenshot, a photo</span>
      </A>

      {/* the picture: its image, its caption; what's measured on it. It becomes the card. */}
      <A k="img" x={IMG.x} y={IMG.y} w={IMG.w} h={IMG.h} r={12} c="str-img">
        <A k="art" x={0} y={0} w={IMG.w} h={ART}>
          {/* the sun: the picture's one lime; once it's a token, the picture keeps its outline */}
          <A k="sun" x={SUN.x - SUN.r} y={SUN.y - SUN.r} w={SUN.r * 2} h={SUN.r * 2} r={SUN.r} c="str-sun round">
            <i data-k="sun.out" className="str-sun-out round" />
          </A>
          <Ridges />
          <span className="a str-p-mast" style={{ left: 24, top: 22 }}>
            Field notes
          </span>
          <span className="a str-p-mast" style={{ right: IMG.w - (PAN.x - IMG.x) + 24, top: 22 }}>
            No. 04
          </span>
        </A>
        <T k="title" x={TITLE.x} y={TITLE.y} c="f-head str-p-title">
          Ridge
        </T>
        <T k="sub" x={24} y={SUB.y} c="str-p-sub">
          Six days above the tree line.
        </T>
        <T k="link" x={24} y={C_LINK} c="str-p-link">
          Read the notes →
        </T>
        {/* the scan */}
        <A k="scan" x={0} y={0} w={IMG.w} h={2} c="str-scan" />
        {/* where each colour was sampled */}
        {COLORS.map((c, i) => (
          <A key={c.hex} k={`pin.${i}`} x={c.pin[0] - 8} y={c.pin[1] - 8} w={16} h={16} r={8} c="str-pin" />
        ))}
        {/* the title's box, its size; the margin and the gap, redlined */}
        <svg data-k="tboxsvg" className="a str-tbox" style={{ left: TITLE.x, top: TITLE.y }} width="10" height="68" aria-hidden>
          <rect data-k="tbox" x="0.5" y="0.5" width="9" height="67" pathLength={1} fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="1 1" />
        </svg>
        <A k="ttag" x={0} y={TITLE.y + 25} c="str-tag">
          Eurostile 64/68
        </A>
        <Redline k="rl.m" x={0} y={TITLE.y + 30} len={TITLE.x} />
        <T k="rl.m.t" x={5} y={TITLE.y + 14} c="str-rl-t">
          24
        </T>
        <Redline k="rl.g" x={TITLE.x + 8} y={TITLE.y + 68} len={SUB.y - TITLE.y - 68} v />
        <T k="rl.g.t" x={TITLE.x + 20} y={TITLE.y + 69} c="str-rl-t">
          16
        </T>
      </A>

      {/* the form, drawn from the same tokens */}
      <A k="form" x={FORM.x} y={FORM.y} w={FORM.w} h={FORM.h} r={12} c="str-form">
        <T k="form.h" x={24} y={22} c="f-head str-f-h">
          Get the next issue
        </T>
        <T k="form.p" x={24} y={54} c="str-f-p">
          New notes, once a month.
        </T>
        <A k="form.in" x={24} y={96} w={212} h={44} r={6} c="str-f-in">
          you@studio.com
        </A>
        <A k="form.btn" x={248} y={96} w={100} h={44} r={22} c="str-f-btn">
          Subscribe
          <i data-k="form.btn.ink" className="str-f-btn-ink">
            Subscribe
          </i>
        </A>
      </A>
      {/* where the tokens are used */}
      <A k="tag.r" x={IMG.x + 10} y={IMG.y + 10} c="str-tag">
        <svg width="9" height="9" viewBox="0 0 9 9" aria-hidden>
          <path d="M0.75 9 V0.75 H9" fill="none" stroke="currentColor" strokeWidth="1.25" />
        </svg>
        radius 0
      </A>
      <A k="tag.t" x={0} y={IMG.y + C_TITLE + 6} c="str-tag">
        title 28/32
      </A>
      <A k="tag.a" x={FORM.x + 248} y={FORM.y + 72} c="str-tag">
        accent
      </A>

      {/* --- right: the panel (what it read, then tokens, then code) --- */}
      <A k="pan" x={PAN.x} y={PAN.y} w={PAN.w} h={PAN.h} c="str-pan glass">
        <i className="str-hr" />
        <T k="h1" x={16} y={14} c="str-h">
          ridge.jpg
        </T>
        <T k="h1m" x={0} y={16} c="f-mono str-hm" style={{ left: 'auto', right: 16 }}>
          1488 × 2096
        </T>
        <T k="h2" x={16} y={14} c="str-h">
          Tokens
        </T>
        <T k="h2m" x={0} y={16} c="f-mono str-hm" style={{ left: 'auto', right: 16 }}>
          15
        </T>
        <A k="tabs" x={10} y={9} c="str-tabs">
          <span className="is-on">CSS</span>
          <span>Tailwind</span>
          <span>React</span>
        </A>
        <T k="h3m" x={0} y={16} c="f-mono str-hm" style={{ left: 'auto', right: 16 }}>
          tokens.css
        </T>

        {/* colour */}
        <T k="g.color" x={16} y={CY - 20} c="f-label">
          Color
        </T>
        {COLORS.map((c, i) => (
          <A key={c.hex} k={`c.row.${i}`} x={0} y={CY + i * ROW} w={PI.w} h={ROW}>
            <T k={`c.hex.${i}`} x={44} y={7} c="f-mono str-v">
              {c.hex}
            </T>
            <T k={`c.pc.${i}`} x={0} y={7} c="f-mono str-v faint" style={{ left: 'auto', right: 16 }}>
              {c.pc}
            </T>
            <T k={`c.nm.${i}`} x={44} y={6} c="str-nm">
              {c.name}
            </T>
          </A>
        ))}
        {/* type */}
        <T k="g.type" x={16} y={TY - 20} c="f-label">
          Type
        </T>
        {[
          { f: 'Eurostile', v: '64/68', nm: 'display', head: true },
          { f: 'Geist', v: '15/20', nm: 'body', head: false },
        ].map((r, j) => (
          <A key={r.f} k={`ty.row.${j}`} x={0} y={TY + j * ROW} w={PI.w} h={ROW}>
            <span className={`a str-aa ${r.head ? 'str-aa--d f-head' : 'str-aa--b'}`}>
              Aa
            </span>
            <T k={`ty.f.${j}`} x={44} y={6} c="str-nm">
              {r.f}
            </T>
            <T k={`ty.v.${j}`} x={0} y={7} c="f-mono str-v" style={{ left: 'auto', right: 16 }}>
              {r.v}
            </T>
            <T k={`ty.nm.${j}`} x={44} y={6} c="str-nm">
              {r.nm}
            </T>
          </A>
        ))}
        <A k="ty.row.t" x={0} y={TY + ROW} w={PI.w} h={ROW}>
          <span className="a str-aa str-aa--t f-head">
            Aa
          </span>
          <T x={44} y={6} c="str-nm">
            title
          </T>
          <T x={44 + NAME_X} y={6} c="str-nm dim">
            Eurostile
          </T>
          <T x={0} y={7} c="f-mono str-v" style={{ left: 'auto', right: 16 }}>
            28/32
          </T>
        </A>
        {/* space */}
        <T k="g.space" x={16} y={SY - 20} c="f-label">
          Space
        </T>
        <A k="sp.row" x={0} y={SY} w={PI.w} h={ROW}>
          {SPACE.map(([v, x]) => (
            <A key={v} k={`sp.${v}`} x={x} y={0} h={ROW} c="str-sp">
              <svg width={v + 1} height="8" viewBox={`0 0 ${v + 1} 8`} aria-hidden>
                <path d={`M0.5 0 V8 M0.5 4 H${v + 0.5} M${v + 0.5} 0 V8`} fill="none" stroke="currentColor" strokeWidth="1" />
              </svg>
              <span className="f-mono">{v}</span>
            </A>
          ))}
        </A>
        {/* mood (what it read), then radius (a token) */}
        <T k="g.mood" x={16} y={MY - 20} c="f-label">
          Mood
        </T>
        <T k="mood" x={16} y={MY + 6} c="str-nm">
          calm · bright · exact
        </T>
        <T k="g.rad" x={16} y={MY + ROW - 20} c="f-label">
          Radius
        </T>
        <A k="rad.row" x={0} y={MY + ROW} w={PI.w} h={ROW}>
          {[0, 2, 4].map((r, i) => (
            <span key={r} className="a str-rad-i" style={{ left: 16 + i * 64, top: 6 }}>
              <Corner r={r} />
              <span className="f-mono str-v">{r}</span>
            </span>
          ))}
        </A>

        {/* the colours (they stay through all three: read, named, written) */}
        {COLORS.map((c, i) =>
          i === ACC ? (
            <A key={c.hex} k={`c.sw.${i}`} x={16} y={CY + i * ROW + 6} w={16} h={16} r={4} c="str-sw str-sw--out">
              <i data-k="acc.ring" className="str-sw-ring" />
              <b data-k="acc.fill" className="str-sw-fill" />
            </A>
          ) : (
            <A key={c.hex} k={`c.sw.${i}`} x={16} y={CY + i * ROW + 6} w={16} h={16} r={4} c="str-sw" style={{ background: c.hex }} />
          ),
        )}

        {/* the code */}
        <A k="lns" x={0} y={CODE_Y} w={34} h={CODE.length * LINE} c="str-lns f-mono">
          {CODE.map((_, i) => (
            <span key={i} style={{ top: i * LINE + 3 }}>
              {i + 1}
            </span>
          ))}
        </A>
        {CODE.map(([, s, chip], i) => (
          <span key={i} data-k={`code.${String(i).padStart(2, '0')}`} className="a t f-mono str-code" style={{ left: 44, top: CODE_Y + i * LINE + 3 }}>
            <Css s={s} chip={chip} />
          </span>
        ))}

        {/* the toast, and the buttons */}
        <A k="toast" x={16} y={FOOT - 12 - 40} w={PI.w - 32} h={40} r={8} c="str-toast">
          <span className="str-toast-ok">
            <Check size={11} />
          </span>
          <span>Handed to AI</span>
          <i>15 tokens, 2 components</i>
        </A>
        <A k="copy" x={16} y={FOOT} w={(PI.w - 40) / 2} h={36} r={18} c="pill str-copy">
          Copy
        </A>
        <A k="btn" x={0} y={FOOT} w={PI.w - 32} h={36} r={18} c="pill pill--ink str-btn" style={{ left: 'auto', right: 16 }}>
          <span data-k="btn.1" className="str-btn-l">
            Draft system
          </span>
          <span data-k="btn.2" className="str-btn-l">
            Export code
          </span>
          <span data-k="btn.3" className="str-btn-l">
            Hand to AI →
          </span>
        </A>
      </A>

      <Cursor />
    </Scene>
  );
}

