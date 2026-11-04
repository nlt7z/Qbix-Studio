'use client';

import type { ReactNode } from 'react';
import '@/app/scenes-labs.css';
import Scene from '@/components/scene/Scene';
import { A, Lock, Play, Check, cut, notch } from '@/components/scene/kit';
import { BidScreen, playBid } from '@/components/scenes/BidScreen';
import { E } from '@/lib/scene/timeline';

/**
 * Qbix Labs: four products, one on each face of a cube of windows, as the
 * list beside it names them.
 * 1 · Strata, live, at stratadesign.app: a wall of inspiration (photographs,
 *     public/art), its colours pinned on it in glass, and the system it makes
 *     beside it: colours and their ramps, type, space, components, tokens;
 * 2 · AI Bidding, live: its front screen, drawn (BidScreen.tsx): the game's
 *     stage select, its houses as slanted cards with their lots in them;
 * 3 · TTS Editor, on the way: a voice as a field of bars in depth (time
 *     across, pitch bands going back), its pitch drawn floating over it, a
 *     playhead plane moving through it, and the script lit word by word;
 * 4 · Interview Assistant, on the way: a call (photographs); frosted over
 *     it, the live captions and the assistant, whose hints arrive while the
 *     candidate talks.
 * Each move: the cube pulls back a little and turns a quarter to the left,
 * the next window coming round from the right, then settles back in; its
 * address is typed, its name (its tag with it) comes up in the title above,
 * and its own parts come in. The faces turning away darken (no shadows).
 * Square, like the site; each product keeps its own accent (Strata's and the
 * TTS Editor's lime, AI Bidding's rose).
 */

const TOP = 20; // the names
const TH = 46;
const WY = TOP + TH + 16; // the cube
const CH = 420; // a window's content, 718 × 420
const CW = 718;
const WH = 2 + 36 + CH; // a window: its edge, its bar, its content
const DEPTH = 360; // half the cube's depth (half a window's width)
const PULL = 1100; // how far it pulls back mid-turn
// each turn: from beat k + 0.28 for 0.32 beats (the next product is in by k + 0.6)
const TURN = { at: 0.28, dur: 0.32 };

const PRODUCTS = [
  { name: 'Strata', live: true, url: 'stratadesign.app', lock: true },
  { name: 'AI Bidding', live: true, url: 'AI Bidding' },
  { name: 'TTS Editor', live: false, url: 'Voiceover, take 3' },
  { name: 'Interview Assistant', live: false, url: 'Interview with Sam' },
];

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const inOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/* --- Strata: the wall of inspiration, and the system it makes ------------------ */
const WALL = { x: 16, y: 40, w: 100, h: 110, gap: 8 };
const WALL_PICS: [string, string?][][] = [
  [['ribbon', '58% 50%'], ['wall', '50% 78%'], ['slices']],
  [['calla', '74% 50%'], ['block', '40% 50%'], ['bottle', '50% 26%']],
  [['curves'], ['glass', '46% 50%'], ['ring', '62% 50%']],
];
const cell = (c: number, r: number) => ({ x: WALL.x + c * (WALL.w + WALL.gap), y: WALL.y + r * (WALL.h + WALL.gap) });
// a colour read off a picture: the point, and the glass tag pinned beside it
const PINS: { c: number; r: number; px: number; py: number; hex: string }[] = [
  { c: 2, r: 0, px: 50, py: 58, hex: '#B8FF00' },
  { c: 1, r: 1, px: 40, py: 74, hex: '#6E8F1A' },
  { c: 0, r: 0, px: 20, py: 20, hex: '#121417' },
  { c: 0, r: 2, px: 72, py: 36, hex: '#E6E9E3' },
];
const SYS = { x: 356, w: 346 };
// each colour and the ramp made from it (toward white, or for the palest toward ink)
const SWATCHES: [string, string, string, string][] = [
  ['Lime', '#B8FF00', '#b8ff00', '#fff'],
  ['Moss', '#6E8F1A', '#6e8f1a', '#fff'],
  ['Ink', '#121417', '#121417', '#fff'],
  ['Mist', '#E6E9E3', '#e6e9e3', '#121417'],
];
const RAMP = [100, 78, 56, 34, 14];
const SPACE = [4, 8, 12, 16, 24, 32];

/* --- the TTS Editor: a voice, 4.2 s of it, as a field of bars in depth ----------- */
const DUR = 4.2;
// what's said: [word, from, to (s), loudness]
const SAID: [string, number, number, number][] = [
  ['Welcome', 0.12, 0.66, 0.95],
  ['back.', 0.72, 1.08, 0.8],
  ['Today,', 1.68, 2.12, 0.9],
  ['we', 2.18, 2.34, 0.55],
  ['take', 2.4, 2.78, 0.85],
  ['it', 2.84, 2.98, 0.5],
  ['slow.', 3.04, 3.86, 0.82],
];
const PAUSE: [number, number] = [1.08, 1.68];
const NOW = 3.4; // where the playhead stops (in "slow.")
// the pitch, sentence by sentence: [s, pitch 0..1]; the dots are its points at each word's middle
const PITCH: [number, number][][] = [
  [[0.12, 0.5], [0.39, 0.72], [0.9, 0.46], [1.08, 0.32]],
  [[1.68, 0.52], [1.9, 0.76], [2.26, 0.62], [2.59, 0.7], [2.91, 0.56], [3.45, 0.38], [3.86, 0.22]],
];
const DOTS: [number, number][] = [...PITCH[0].slice(1, 3), ...PITCH[1].slice(1, 6)];

// The field: rows of bars going back (z), each row one band of the voice, time across (x), seen in
// perspective from a little above. Its stage is the panel under the transport bar.
const FLD = { y: 48, h: 270 };
const ROWS = 5;
const DZ = 96; // between rows (the field's own px)
const FOCAL = 480;
const ZB = (ROWS - 1) * DZ; // the back row
const sz = (z: number) => FOCAL / (FOCAL + z); // how big a thing at depth z is drawn
const MIDX = CW / 2;
const HALF = 318; // half the front row
const Y0 = 222; // the front row's ground line (in the stage)
const YH = -40; // the horizon (above the stage: we look down on the field a little)
const gy = (z: number) => YH + (Y0 - YH) * sz(z);
const wx = (s: number) => -HALF + (s / DUR) * 2 * HALF; // a time, across the field
const fx = (s: number, z: number) => MIDX + wx(s) * sz(z);
const f1 = (n: number) => Math.round(n * 10) / 10;
// a little noise that is the same every time, on the server and in any browser (integer maths only)
const rnd = (i: number) => {
  let h = Math.imul(i ^ 0x9e3779b9, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
// each word's loudest band (its formant), going back as the voice goes up
const BAND = [0.8, 1.6, 0.6, 2.2, 1.2, 2.6, 1.4];
const STEP = 0.06; // a bar every 60 ms
// each row, front (0) to back: its bars' ink, as played and as not yet, and their width (before perspective).
// The front row carries the voice; the rows behind it are its higher bands, lighter and thinner.
const INK = [
  { on: 0.9, off: 0.16, w: 4 },
  { on: 0.34, off: 0.1, w: 3.4 },
  { on: 0.24, off: 0.08, w: 3 },
  { on: 0.17, off: 0.065, w: 2.6 },
  { on: 0.12, off: 0.05, w: 2.3 },
];

/** The voice's height at time s in band j (the field's own px, before perspective). */
function level(s: number, j: number, n: number) {
  const w = SAID.findIndex(([, a, b]) => s >= a && s <= b);
  if (w < 0) return 0;
  const [, a, b, loud] = SAID[w];
  const env = Math.pow(Math.sin((Math.PI * (s - a)) / (b - a)), 0.6);
  const band = Math.exp(-((j - BAND[w]) ** 2) / 3);
  const low = 1 - 0.16 * j;
  // the front row is the voice itself, every word in it; the bands behind rise and fall with each word
  const shape = j === 0 ? 0.8 + 0.2 * band : 0.3 + 0.7 * band;
  return 124 * env * loud * shape * low * (0.72 + 0.28 * rnd(n));
}
// each row as one path of bars (back to front), and its bar width
const FIELD = Array.from({ length: ROWS }, (_, r) => {
  const j = ROWS - 1 - r;
  const z = j * DZ;
  const k = sz(z);
  const base = gy(z);
  let d = '';
  for (let s = 0.02, n = 0; s < DUR; s += STEP, n++) {
    const h = level(s, j, n + j * 97) * k;
    if (h >= 1.5) d += `M${f1(fx(s, z))} ${f1(base)}V${f1(base - h)}`;
  }
  // the row's own floor line, and the right edge of what's been played in it at time s
  return { j, d, wide: f1(INK[j].w * k), floor: `M${f1(fx(0, z))} ${f1(base)}H${f1(fx(DUR, z))}`, at: (s: number) => fx(s, z) };
});
// the pitch floats over the field, as high as the voice goes, partway back
const ZP = 2.5 * DZ;
const pitchY = (p: number) => gy(ZP) - (126 + p * 74) * sz(ZP);
const pp = (s: number, p: number): [number, number] => [fx(s, ZP), pitchY(p)];
/** A smooth line through the points (Catmull-Rom, as cubic Béziers). */
function through(pts: [number, number][]) {
  const P = pts.map(([s, p]) => pp(s, p));
  const f = (n: number) => n.toFixed(1);
  let d = `M${f(P[0][0])} ${f(P[0][1])}`;
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[i - 1] ?? P[i];
    const p1 = P[i];
    const p2 = P[i + 1];
    const p3 = P[i + 2] ?? p2;
    d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}
// the ground: a line along each second going back, and the front and back edges
const GROUND = [0, 1, 2, 3, 4].map((s) => `M${f1(fx(s, 0))} ${f1(gy(0))}L${f1(fx(s, ZB))} ${f1(gy(ZB))}`).join('');
// the playhead: a plane standing across the field at its time, as tall as the pitch goes
const PH_H = 186;
/** The playhead plane at time s, as a polygon in the stage, and its front edge. */
function playhead(s: number) {
  const xf = fx(s, 0), xb = fx(s, ZB), yf = gy(0), yb = gy(ZB);
  const plane = `${f1(xf)},${f1(yf)} ${f1(xb)},${f1(yb)} ${f1(xb)},${f1(yb - PH_H * sz(ZB))} ${f1(xf)},${f1(yf - PH_H)}`;
  return { plane, xf, yf };
}

const SLIDERS: [string, string, number][] = [
  ['Pitch', '+2 st', 0.62],
  ['Pace', '0.9×', 0.42],
  ['Warmth', '70%', 0.7],
];

/* --- the Interview Assistant: a call, the assistant and the captions frosted over it --- */
const SIDE = { x: 422, y: 16, w: 280, h: 388 };
const HINTS = { x: 438, w: 248, h: 60, y: [56, 124, 192] };
const HINT = ['Ask what they measured', 'How big was the team?', 'Led the rebuild.'];
const CAPS = { x: 16, y: 336, w: 390, h: 68 };

export default function Labs() {
  const ph0 = playhead(0);
  const panels: ReactNode[] = [
    /* 1 · Strata: the wall of inspiration, its colours pinned in glass; the system beside it */
    <div key="strata" className="labs-panel">
      <A x={WALL.x} y={14} w={316} c="labs-k labs-k--row">
        <span>Inspiration · 9</span>
        <span className="faint">Read 4 colours</span>
      </A>
      {WALL_PICS.map((row, r) =>
        row.map(([src, pos], c) => (
          <A key={src} x={cell(c, r).x} y={cell(c, r).y} w={WALL.w} h={WALL.h} c="labs-pic">
            <img src={`/art/${src}.webp`} alt="" draggable={false} loading="lazy" decoding="async" style={pos ? { objectPosition: pos } : undefined} />
          </A>
        )),
      )}
      {PINS.map((p, i) => {
        const o = cell(p.c, p.r);
        const right = p.c < 2;
        return (
          <div key={p.hex}>
            <i data-k={`st.pt.${i}`} className="a round labs-pt-ring" style={{ left: o.x + p.px - 6, top: o.y + p.py - 6 }} />
            <A
              k={`st.tag.${i}`}
              x={right ? o.x + p.px + 10 : o.x + p.px - 10 - 92}
              y={o.y + p.py - 13}
              w={92}
              h={26}
              c="glass labs-tag notch"
            >
              <i style={{ background: p.hex }} />
              {p.hex}
            </A>
          </div>
        );
      })}
      <A x={SYS.x} y={14} w={SYS.w} c="labs-k labs-k--row">
        <span>System</span>
        <span className="faint">v1.0 · 48 tokens</span>
      </A>
      {SWATCHES.map(([name, hex, bg, toward], i) => (
        <A key={name} k={`st.sw.${i}`} x={SYS.x + i * 88} y={36} w={80} h={86} c="labs-sw">
          <i style={{ background: bg }} />
          <span className="labs-ramp">
            {RAMP.map((p) => (
              <b key={p} style={{ background: `color-mix(in srgb, ${bg} ${p}%, ${toward})` }} />
            ))}
          </span>
          <span>{name}</span>
          <em>{hex}</em>
        </A>
      ))}
      <A k="st.type" x={SYS.x} y={134} w={SYS.w} h={50} c="labs-type">
        <span className="f-head labs-aa">Aa</span>
        <span className="labs-scale">
          <span>
            Display <i>48 / 52</i>
          </span>
          <span>
            Title <i>28 / 32</i>
          </span>
          <span>
            Body <i>15 / 24</i>
          </span>
        </span>
      </A>
      <A k="st.space" x={SYS.x} y={196} w={SYS.w} h={28} c="labs-space">
        <span className="labs-space-k">Space</span>
        {SPACE.map((v) => (
          <span key={v} className="labs-space-v">
            <i style={{ width: v * 1.5 }} />
            {v}
          </span>
        ))}
      </A>
      {/* a component drawn from it: a product card, one of the pictures in it */}
      <A k="st.card" x={SYS.x} y={236} w={160} h={136} c="labs-card-ui">
        <span className="labs-card-pic">
          <img src="/art/cross.webp" alt="" draggable={false} loading="lazy" decoding="async" />
        </span>
        <span className="labs-card-row">
          <span>
            <b>Disc 02</b>
            <em>$64</em>
          </span>
          <span className="labs-card-add cut">Add</span>
        </span>
      </A>
      <A k="st.go" x={SYS.x + 168} y={236} w={116} h={34} c="labs-ui-btn">
        Get started
      </A>
      <A k="st.ui.0" x={SYS.x + 292} y={236} w={54} h={34} c="labs-ui-line">
        Docs
      </A>
      <A k="st.ui.1" x={SYS.x + 168} y={278} w={178} h={34} c="labs-ui-field">
        you@studio.com
      </A>
      <A k="st.ui.2" x={SYS.x + 168} y={320} w={178} h={34} c="labs-ui-row">
        <span className="labs-ui-toggle">
          <i />
        </span>
        Dark mode
        <span className="labs-ui-tag">New</span>
      </A>
      <A x={SYS.x} y={382} w={SYS.w} h={26} c="labs-code f-mono">
        <span data-k="st.code.0" className="t">
          --color-accent: <b>#B8FF00</b>;
        </span>
        <span data-k="st.code.1" className="t">
          --space-4: <b>16px</b>;
        </span>
      </A>
    </div>,

    /* 2 · AI Bidding: its front screen, drawn */
    <div key="bid" className="labs-panel labs-dark">
      <BidScreen k="bid" />
    </div>,

    /* 3 · TTS Editor: the voice as a field in depth, its pitch over it, the script under it */
    <div key="tts" className="labs-panel">
      <A x={0} y={0} w={CW} h={48} c="labs-tb">
        <span className="labs-play">
          <span data-k="tts.play" className="labs-ico">
            <Play size={10} />
          </span>
          <span data-k="tts.pause" className="labs-ico">
            <svg width={10} height={10} viewBox="0 0 10 10" aria-hidden className="ico">
              <rect x={2} y={1.5} width={2.2} height={7} fill="currentColor" />
              <rect x={5.8} y={1.5} width={2.2} height={7} fill="currentColor" />
            </svg>
          </span>
        </span>
        <span className="labs-tc">
          <span data-k="tts.tc">0:00.0</span>
          <i> / 0:04.2</i>
        </span>
        <span className="labs-tb-k">Take 3 of 3</span>
        <span className="labs-voice">
          <img src="/art/ava.webp" alt="" draggable={false} loading="lazy" decoding="async" />
          <span>
            <b>Ava</b>
            <i>Warm, low</i>
          </span>
        </span>
      </A>
      <A x={0} y={FLD.y} w={CW} h={FLD.h} c="labs-fld">
        <svg width={CW} height={FLD.h} viewBox={`0 0 ${CW} ${FLD.h}`} aria-hidden>
          {/* what's been played in each row: up to where the playhead plane stands in it */}
          <defs>
            {FIELD.map(({ j, at }) => (
              <clipPath key={j} id={`labs-tts-row-${j}`}>
                <rect data-k={`tts.played.${j}`} x={0} y={0} width={f1(at(0))} height={FLD.h} />
              </clipPath>
            ))}
          </defs>
          <path className="labs-ground" d={GROUND} />
          {/* each row, back to front: its floor, the voice as it is, then what's been played over it */}
          {FIELD.map(({ j, d, wide, floor }) => (
            <g key={j} style={{ ['--on' as string]: INK[j].on, ['--off' as string]: INK[j].off }}>
              <path className="labs-floor" d={floor} />
              <path className="labs-band" d={d} strokeWidth={wide} />
              <path className="labs-band is-on" d={d} strokeWidth={wide} clipPath={`url(#labs-tts-row-${j})`} />
            </g>
          ))}
          {/* the pause, marked on the ground */}
          <path className="labs-gap-line" d={`M${f1(fx(PAUSE[0] + 0.06, DZ))} ${f1(gy(DZ))}H${f1(fx(PAUSE[1] - 0.06, DZ))}`} />
          <text className="labs-gap" x={f1((fx(PAUSE[0], DZ) + fx(PAUSE[1], DZ)) / 2)} y={f1(gy(DZ) - 8)}>
            0.6s
          </text>
          {/* the playhead plane */}
          <polygon data-k="tts.plane" className="labs-plane" points={ph0.plane} />
          {/* the pitch, floating over the field; a line drops from each word's point to the ground */}
          {DOTS.map(([s, p], i) => (
            <path key={s} data-k={`tts.drop.${i}`} className="labs-drop" d={`M${f1(pp(s, p)[0])} ${f1(pp(s, p)[1])}V${f1(gy(ZP))}`} />
          ))}
          {PITCH.map((pts, i) => (
            <path key={i} data-k={`tts.c${i}`} className="labs-curve" d={through(pts)} pathLength={1} />
          ))}
          {DOTS.map(([s, p], i) => (
            <rect key={s} data-k={`tts.dot.${i}`} className="labs-pt" x={f1(pp(s, p)[0] - 3.5)} y={f1(pp(s, p)[1] - 3.5)} width={7} height={7} />
          ))}
          {/* the time, along the front edge */}
          {Array.from({ length: 43 }, (_, i) => (
            <path key={i} className="labs-tick" d={`M${f1(fx(i / 10, 0))} ${f1(Y0 + 6)}v${i % 10 ? 4 : 8}`} />
          ))}
          {[0, 1, 2, 3, 4].map((s) => (
            <text key={s} className="labs-ruler" x={f1(fx(s, 0))} y={f1(Y0 + 28)}>
              0:0{s}
            </text>
          ))}
        </svg>
        <i data-k="tts.ph" className="a labs-ph" style={{ left: ph0.xf - 1, top: ph0.yf - PH_H, height: PH_H + 14 }} />
      </A>
      <A k="tts.line" x={28} y={FLD.y + FLD.h + 4} h={32} c="labs-script">
        <i data-k="tts.mark" className="labs-mark" />
        <span data-k="tts.w.0">Welcome</span> <span data-k="tts.w.1">back.</span> <span className="labs-pause">0.6s</span>{' '}
        <span data-k="tts.w.2">Today,</span> <span data-k="tts.w.3">we</span> <span data-k="tts.w.4">take</span>{' '}
        <span data-k="tts.w.5">it</span> <span data-k="tts.w.6">slow.</span>
      </A>
      {SLIDERS.map(([k, v, f], i) => (
        <A key={k} x={28 + i * 228} y={FLD.y + FLD.h + 52} w={200} c="labs-sl">
          <span className="labs-sl-k">{k}</span>
          <span className="labs-sl-v">{v}</span>
          <span className="labs-sl-track">
            <i style={{ width: `${f * 100}%` }} />
            <b style={{ left: `${f * 100}%` }} />
          </span>
        </A>
      ))}
    </div>,

    /* 4 · Interview Assistant: the call, and frosted over it the assistant and the captions */
    <div key="int" className="labs-panel labs-call">
      <img className="labs-cam" src="/art/sam.webp" alt="" draggable={false} loading="lazy" decoding="async" />
      <A x={16} y={16} w={120} h={80} c="labs-self">
        <img src="/art/you.webp" alt="" draggable={false} loading="lazy" decoding="async" />
        <span>You</span>
      </A>
      <A x={148} y={16} h={30} c="glass labs-dark-glass labs-chip notch">
        Recording <b>14:32</b>
      </A>
      <A x={16} y={CAPS.y - 40} h={30} c="glass labs-dark-glass labs-chip notch">
        Sam Rivera <i>Candidate</i>
      </A>
      {/* the live captions */}
      <A x={CAPS.x} y={CAPS.y} w={CAPS.w} h={CAPS.h} c="glass labs-dark-glass labs-caps notch">
        <span className="labs-line labs-line--you">
          <b>You</b>
          <span>What was your part in it?</span>
        </span>
        <span className="labs-line">
          <b>
            Sam
            <span className="labs-bars" aria-hidden>
              <i data-k="int.bar.0" style={{ height: 4 }} />
              <i data-k="int.bar.1" style={{ height: 7 }} />
              <i data-k="int.bar.2" style={{ height: 5 }} />
            </span>
          </b>
          <span data-k="int.l1">I led the rebuild of our checkout.</span>
        </span>
      </A>
      {/* the assistant: its hints, the newest lit, and a note */}
      <A x={SIDE.x} y={SIDE.y} w={SIDE.w} h={SIDE.h} c="glass labs-dark-glass labs-side">
        <span className="f-label">Assistant</span>
      </A>
      {HINTS.y.map((y, i) => (
        <A key={y} k={`int.r${i}`} x={HINTS.x} y={y} w={HINTS.w} h={HINTS.h} c={i === 2 ? 'labs-card labs-note' : 'labs-card'} />
      ))}
      {HINT.map((s, i) => (
        <A key={s} k={`int.h${i}`} x={HINTS.x} y={HINTS.y[i]} w={HINTS.w} h={HINTS.h} c="labs-hint">
          <span>
            {i === 2 && <Check size={14} />}
            {s}
          </span>
        </A>
      ))}
      <A k="int.cur" x={HINTS.x} y={HINTS.y[0]} w={HINTS.w} h={HINTS.h} c="labs-cur">
        <div data-k="int.cur.ink" className="labs-cur-ink">
          {HINT.slice(0, 2).map((s, i) => (
            <span key={s} className="labs-hint labs-hint--ink" style={{ top: HINTS.y[i] - HINTS.y[0], height: HINTS.h }}>
              <span>{s}</span>
            </span>
          ))}
        </div>
      </A>
    </div>,
  ];

  return (
    <Scene
      n={4}
      w={720}
      h={560}
      label="Qbix Labs, four products on the faces of a turning cube of windows: Strata turning a wall of pictures into a design system, AI Bidding's game screen with its houses and lots, then the TTS Editor and the Interview Assistant, on the way"
      build={(q, tl) => {
        const stage = q('stage');
        const name = (i: number) => q(`name.${i}`);
        PRODUCTS.forEach((_, i) => tl.from(name(i), { y: TH }));

        /* 0 → 1: the window opens, its address is typed, Strata is in it */
        // (drawn as the chapter comes up the screen: late enough to be seen)
        tl.from(stage, { clip: 'inset(-12% -30% 100% -30%)' }).to(stage, { clip: 'inset(-12% -30% -14% -30%)' }, 0.16, 0.24, E.out);
        tl.type(q('url.0'), 0.3, 0.15);
        tl.to(name(0), { y: 0 }, 0.56, 0.26, E.out);

        /* k → k+1: the cube pulls back, turns a quarter to the left and settles; the name changes over;
           the new window's address is typed once it faces us */
        PRODUCTS.slice(1).forEach((p, j) => {
          const k = j + 1;
          tl.to(name(j), { y: -TH }, k + 0.3, 0.1, E.in);
          tl.to(name(k), { y: 0 }, k + 0.4, 0.2, E.out);
          tl.type(q(`url.${k}`), k + TURN.at + TURN.dur - 0.02, Math.max(0.08, p.url.length * 0.0095));
        });
        const cube = q('cube');
        const shades = PRODUCTS.map((_, i) => q(`shade.${i}`));
        let was = '';
        tl.on((t) => {
          let turned = 0, pull = 0;
          for (let k = 1; k < PRODUCTS.length; k++) {
            const p = clamp01((t - k - TURN.at) / TURN.dur);
            turned += inOut(p);
            pull = Math.max(pull, Math.sin(Math.PI * p));
          }
          const css = `translateZ(${(-DEPTH - PULL * pull).toFixed(1)}px) rotateY(${(-90 * turned).toFixed(2)}deg)`;
          if (!cube || css === was) return;
          was = css;
          cube.style.transform = css;
          // a face turned away from us is in shade: none facing us, darker as it turns
          shades.forEach((el, i) => {
            if (el) el.style.opacity = (0.5 * clamp01(Math.abs(i - turned)) ** 2).toFixed(3);
          });
        });

        /* Strata, settling: its colours are read off the pictures and pinned; the system is set beside them */
        PINS.forEach((_, i) => {
          tl.from(q(`st.pt.${i}`), { s: 0 }).to(q(`st.pt.${i}`), { s: 1 }, 0.72 + i * 0.03, 0.05, E.out);
          tl.from(q(`st.tag.${i}`), { clip: notch(10, [0, 100, 0, 0]) }).to(q(`st.tag.${i}`), { clip: notch(10) }, 0.74 + i * 0.03, 0.07, E.out);
          tl.from(q(`st.sw.${i}`), { clip: [100, 0, 0, 0] }).to(q(`st.sw.${i}`), { clip: [0, 0, 0, 0] }, 0.78 + i * 0.025, 0.08, E.out);
        });
        tl.from(q('st.type'), { clip: [0, 100, 0, 0] }).to(q('st.type'), { clip: [0, 0, 0, 0] }, 0.85, 0.07, E.out);
        tl.from(q('st.space'), { clip: [0, 100, 0, 0] }).to(q('st.space'), { clip: [0, 0, 0, 0] }, 0.87, 0.06, E.out);
        tl.from(q('st.card'), { clip: [100, 0, 0, 0] }).to(q('st.card'), { clip: [0, 0, 0, 0] }, 0.88, 0.08, E.out);
        // the lime button keeps its cut corner as it opens
        tl.from(q('st.go'), { clip: cut(10, 100) }).to(q('st.go'), { clip: cut(10) }, 0.9, 0.06, E.out);
        q.all('st.ui.').forEach((el, i) => {
          tl.from(el, { clip: [0, 100, 0, 0] }).to(el, { clip: [0, 0, 0, 0] }, 0.91 + i * 0.015, 0.06, E.out);
        });
        tl.type(q('st.code.0'), 0.93, 0.03).type(q('st.code.1'), 0.96, 0.025);

        /* AI Bidding, settling: the menu slides in, Start lights, the neon flickers on, a house is picked */
        playBid(q, tl, 'bid', 1 + TURN.at + TURN.dur);

        /* 2 → 3, then: the pitch is drawn over the voice, and the playhead plane moves through it */
        const draw = (el: HTMLElement | null, pts: [number, number][], at: number, dur: number) => {
          // dashes of 1 with gaps of 2, offset past the start: no stray cap before it's drawn
          tl.from(el, { dash: 1.05 }).to(el, { dash: 0 }, at, dur, E.lin);
          const x0 = pts[0][0];
          const x1 = pts[pts.length - 1][0];
          return (s: number) => at + (dur * (s - x0)) / (x1 - x0);
        };
        const on1 = draw(q('tts.c0'), PITCH[0], 2.62, 0.05);
        const on2 = draw(q('tts.c1'), PITCH[1], 2.675, 0.075);
        DOTS.forEach(([s], i) => {
          const at = s < PAUSE[0] ? on1(s) : on2(s);
          tl.from(q(`tts.dot.${i}`), { o: 0 }).to(q(`tts.dot.${i}`), { o: 1 }, at, 0.004, E.lin);
          tl.from(q(`tts.drop.${i}`), { o: 0 }).to(q(`tts.drop.${i}`), { o: 1 }, at, 0.02, E.lin);
        });
        const PH = { at: 2.76, dur: 0.22 };
        const beatOf = (s: number) => PH.at + (PH.dur * s) / NOW;
        // the plane, its front edge and what's been played: each moves straight with the time
        const end = playhead(NOW);
        tl.to(q('tts.ph'), { x: end.xf - ph0.xf }, PH.at, PH.dur, E.lin);
        const plane = q('tts.plane');
        const played = FIELD.map(({ j }) => q(`tts.played.${j}`));
        let at0 = -1;
        tl.on((t) => {
          const s = Math.round(clamp01((t - PH.at) / PH.dur) * NOW * 100) / 100;
          if (s === at0) return;
          at0 = s;
          plane?.setAttribute('points', playhead(s).plane);
          FIELD.forEach(({ at }, i) => played[i]?.setAttribute('width', String(f1(at(s)))));
        });
        // the word being said, lit: from word to word as the playhead reaches each; none in the pause
        const mark = q('tts.mark');
        const words = SAID.map((_, i) => q(`tts.w.${i}`));
        const box = (el: HTMLElement | null) => (el ? { x: el.offsetLeft - 3, w: el.offsetWidth + 6 } : { x: 0, w: 0 });
        const resume = SAID.findIndex(([, a]) => a >= PAUSE[1]);
        tl.from(mark, { ...box(words[0]), o: 0 });
        SAID.forEach(([, a], i) => {
          if (a > NOW) return;
          if (i > 0) tl.set(mark, box(words[i]), beatOf(a));
          if (i === 0 || i === resume) tl.set(mark, { o: 1 }, beatOf(a));
        });
        tl.set(mark, { o: 0 }, beatOf(PAUSE[0]));
        // playing while the playhead runs
        tl.from(q('tts.pause'), { o: 0 }).to(q('tts.pause'), { o: 1 }, PH.at, 0.004, E.lin).to(q('tts.pause'), { o: 0 }, PH.at + PH.dur, 0.004, E.lin);
        tl.to(q('tts.play'), { o: 0 }, PH.at, 0.004, E.lin).to(q('tts.play'), { o: 1 }, PH.at + PH.dur, 0.004, E.lin);
        // the time, counted
        const tc = q('tts.tc');
        let shown = '';
        tl.on((t) => {
          const s = clamp01((t - PH.at) / PH.dur) * NOW;
          const txt = `0:0${s.toFixed(1)}`;
          if (tc && txt !== shown) {
            tc.textContent = txt;
            shown = txt;
          }
        });

        /* 3 → 4, then: Sam answers, and the hints come in, the newest lit */
        const SAYS = { at: 3.58, dur: 0.12 };
        tl.type(q('int.l1'), SAYS.at, SAYS.dur);
        // his voice moves the bars by his name while he talks
        const bars = [0, 1, 2].map((i) => q(`int.bar.${i}`));
        let said = '';
        tl.on((t) => {
          const talking = t > SAYS.at && t < SAYS.at + SAYS.dur;
          const hs = bars.map((_, i) => (talking ? 3 + Math.round(9 * Math.abs(Math.sin(t * 260 + i * 2.1))) : [4, 7, 5][i]));
          const key = hs.join();
          if (key === said) return;
          said = key;
          bars.forEach((b, i) => b && (b.style.height = `${hs[i]}px`));
        });
        const card = (i: number, at: number) =>
          [q(`int.r${i}`), q(`int.h${i}`)].forEach((el) =>
            tl.from(el, { y: 10, clip: 'inset(100% 0% 0% 0%)' }).to(el, { y: 0, clip: 'inset(0% 0% 0% 0%)' }, at, 0.08, E.out),
          );
        // the lime is one block that moves to the newest hint; it carries the hints' words in ink, held in place inside it
        const cur = q('int.cur');
        const ink = q('int.cur.ink');
        const step = HINTS.y[1] - HINTS.y[0];
        card(0, 3.7);
        tl.from(cur, { clip: notch(24, [0, 100, 0, 0]) }).to(cur, { clip: notch(24) }, 3.74, 0.045, E.out);
        card(1, 3.8);
        tl.to(cur, { y: step }, 3.855, 0.05, E.move);
        tl.to(ink, { y: -step }, 3.855, 0.05, E.move);
        card(2, 3.9);
      }}
    >
      {/* --- the names, in a mask: each product's name with its tag --- */}
      <A x={0} y={TOP} w={720} h={TH} c="labs-titles">
        {PRODUCTS.map((p, i) => (
          <div key={p.name} data-k={`name.${i}`} className="labs-row">
            <span className="f-head labs-name">{p.name}</span>
            {p.live ? <span className="live">Live</span> : <span className="labs-soon">Soon</span>}
          </div>
        ))}
      </A>

      {/* --- the cube: a window on each of its four sides, seen in perspective --- */}
      <A k="stage" x={0} y={WY} w={720} h={WH} c="labs-stage">
        <div data-k="cube" className="labs-cube" style={{ transform: `translateZ(${-DEPTH}px)` }}>
          {PRODUCTS.map((p, i) => (
            <div key={p.name} className="win labs-face" style={{ transform: `rotateY(${i * 90}deg) translateZ(${DEPTH}px)` }}>
              <div className="win-bar">
                <span className="win-dots" aria-hidden>
                  <i />
                  <i />
                  <i />
                </span>
                <span className="win-url labs-url">
                  <span data-k={`url.${i}`} className="labs-url-item">
                    {p.lock && (
                      <span className="labs-lock">
                        <Lock />
                      </span>
                    )}
                    <span>{p.url}</span>
                  </span>
                </span>
              </div>
              <div className="win-body labs-body">{panels[i]}</div>
              <i data-k={`shade.${i}`} className="labs-shade" style={{ opacity: i ? 0.5 : 0 }} />
            </div>
          ))}
        </div>
      </A>
    </Scene>
  );
}
