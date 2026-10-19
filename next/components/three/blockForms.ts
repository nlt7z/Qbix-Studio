import * as THREE from 'three';
import { definePrint, lock, qr, tick, type Draw, type Pen, type TextOpts } from './blockPrints';
import { bedroom, caller, cardFace, headphones, kitchen, landscape, living, openSign, room, street, waveform, waves } from './blockArt';

/**
 * What the pieces make (components/three/blockStory.ts draws and moves
 * them): the cube, and in every other chapter the thing the chapter is
 * about, built of pieces with what's on them printed (blockPrints.ts):
 *
 * - a launch site for "hush", a pair of headphones: its moodboard; the site,
 *   its code written beside it; live on its domain, with its phone;
 * - "kova", a money app that already works: on a grid in grey; then colour
 *   and type; then its mark, on the app and as its icon;
 * - the four Labs products, one after another;
 * - every idea that came in, loose, then all kept on a board;
 * - a listing's flyer, its five posts, its video;
 * - a therapist's questionnaire, the calm homepage made from it, live with
 *   its phone.
 */

export const N = 64;   // the cube is 4 × 4 × 4; the scenes use as many as they need and put the rest away

// Materials. FORE is the colour that stands out from the page (white on
// black, ink on paper), BACK the page's own; DOT and DOTB are dots of the one
// on the other; LIME the lime (PLAY with a play mark; JELLY the cube's lime
// corner); PIC a picture, white with its print in ink on any page (a photo
// stays daylight). What's printed on a piece is in the colour that stands out
// from it.
export const K = { FORE: 0, DOT: 1, BACK: 5, DOTB: 6, PIC: 7, LIME: 9, PLAY: 10, JELLY: 11 } as const;
export const isLime = (k: number) => k === K.LIME || k === K.PLAY || k === K.JELLY;

export type Vec = [number, number, number];
export type View = { yaw: number; pitch: number };
export type Piece = { p: Vec; s: Vec; q: THREE.Quaternion; k: number; pr?: string; spare?: boolean };
export type Form = {
  pieces: Piece[];
  view: View;
  lift: Vec;          // the arc a piece takes on its way in
  hold: number;       // seconds it stays before a chapter's next form
  step: number | null;
  rank: Float32Array; // each piece's place in the move's order, 0..1
  lime: number;       // the lime piece, or -1
};

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const mixView = (a: View, b: View, k: number): View => ({ yaw: lerp(a.yaw, b.yaw, k), pitch: lerp(a.pitch, b.pitch, k) });

const euler = new THREE.Euler();
const piece = (x: number, y: number, z: number, w = 0.9, h = 0.9, d = 0.9, k: number = K.FORE, rz = 0, rx = 0, ry = 0): Piece => ({
  p: [x, y, z],
  s: [w, h, d],
  q: new THREE.Quaternion().setFromEuler(euler.set(rx, ry, rz)),
  k,
});
/** A piece lying on a face whose front is at z0. */
const at = (z0: number) => (x: number, y: number, w: number, h: number, d: number, k: number, rz = 0) => piece(x, y, z0 + d / 2 + 0.01, w, h, d, k, rz);
/** A piece put away: nothing to see, at the place it will grow from. */
const hidden = (p: Vec): Piece => ({ p: [p[0], p[1], p[2]], s: [0, 0, 0], q: new THREE.Quaternion(), k: K.FORE });
const hideAll = (ps: Piece[], at?: Vec) => ps.map((p) => hidden(at ?? p.p));
export const shown = (p: Piece) => p.s[0] > 0.01 && p.s[1] > 0.01 && p.s[2] > 0.01;
/** A piece a form doesn't use: whichever block lands here is put away where it is. */
const spare = (): Piece => ({ p: [0, 0, 0], s: [0, 0, 0], q: new THREE.Quaternion(), k: K.FORE, spare: true });
/** Print on a piece's front face (sized to it). */
const pr = (p: Piece, name: string, draw: Draw, ppu?: number): Piece => {
  definePrint(name, p.s[0], p.s[1], draw, ppu);
  p.pr = name;
  return p;
};

function makeForm(
  pieces: Piece[],
  view: View,
  o: { lift?: Vec; hold?: number; step?: number | null; order?: 'role' | 'bottom' } = {},
): Form {
  if (pieces.length > N) {
    console.error(`[blocks] a form has ${pieces.length} pieces, more than ${N}`);
    pieces.length = N;
  }
  while (pieces.length < N) pieces.push(spare());
  for (let i = 0; i < N; i++) if (!pieces[i]) pieces[i] = spare();
  const rank = new Float32Array(N);
  if (o.order === 'bottom') {
    const idx = pieces.map((_, i) => i).sort((a, b) => pieces[a].p[1] - pieces[b].p[1] || pieces[a].p[2] - pieces[b].p[2] || pieces[a].p[0] - pieces[b].p[0]);
    idx.forEach((r, i) => (rank[r] = i / (N - 1)));
  } else {
    for (let i = 0; i < N; i++) rank[i] = i / (N - 1);
  }
  return {
    pieces,
    view,
    lift: o.lift ?? [0, 0.8, 0.3],
    hold: o.hold ?? Infinity,
    step: o.step ?? null,
    rank,
    lime: pieces.findIndex((p) => isLime(p.k) && shown(p)),
  };
}

/* ------------------------------------------------------------ print kits */

/** The options with the size brought down, if need be, so the words fit in `room`. */
const fit = (g: Pen, s: string, o: TextOpts, room: number): TextOpts => {
  const w = g.measure(s, o);
  return w > room ? { ...o, size: (o.size * room) / w } : o;
};
/** Words on one line from x, the face's middle through their capitals. */
const words = (s: string, o: TextOpts, x = 0.03): Draw => (g) => {
  g.text(s, x, g.h / 2, { ...fit(g, s, o, g.w - x - 0.02), mid: true });
};
/** Words centred on the face. */
const label = (s: string, o: TextOpts): Draw => (g) => {
  g.text(s, g.w / 2, g.h / 2, { ...fit(g, s, o, g.w - 0.08), align: 'center', mid: true });
};
/** Lines of words down the face, from (x, y), lh apart. */
const lines = (ls: string[], o: TextOpts, x = 0.1, y = 0.3, lh = 0.22): Draw => (g) => {
  ls.forEach((s, i) => s && g.text(s, x, y + i * lh, { ...fit(g, s, o, g.w - x - 0.04), mid: true }));
};
/** An address bar: the address, behind a lock once it's live. */
const address = (s: string, live: boolean): Draw => (g) => {
  let x = 0.18;
  if (live) {
    lock(g, x, g.h / 2 - 0.085, 0.16);
    x += 0.27;
  }
  g.text(s, x, g.h / 2, { size: 0.15, weight: 500, mid: true, a: live ? 1 : 0.55 });
};
const fill = (a: number): Draw => (g) => g.fill('ink', a);

/** Rough width of words in units, before the fonts are in: for sizing the piece they're printed on. */
const wide = (s: string, size: number, em = 0.6) => s.length * size * em;

/* ------------------------------------------------------------------ forms */

export function buildForms(): Record<string, Form> {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const { FORE, DOT, BACK, DOTB, PIC, LIME, PLAY, JELLY } = K;
  const F: Record<string, Form> = {};

  /* The cube: 4 × 4 × 4 white blocks, a few of them dotted (one in five, never two side by
     side: (x + 2y + 3z) mod 5 changes along every axis), its top front corner lime. */
  const cube: Piece[] = [];
  for (let y = 0; y < 4; y++) for (let z = 0; z < 4; z++) for (let x = 0; x < 4; x++) {
    const k = x === 3 && y === 3 && z === 3 ? JELLY : (x + 2 * y + 3 * z) % 5 === 0 ? DOT : FORE;
    cube.push(piece(x - 1.5, y - 1.5, z - 1.5, 0.9, 0.9, 0.9, k));
  }
  F.cube = makeForm(cube, { yaw: -0.62, pitch: 0.4 }, { order: 'bottom', lift: [0, 0.8, 0.2] });
  // The cube's own blocks, loose and turned every which way (where the hero's gathering starts).
  F.scatter = makeForm(
    cube.map((c) => piece((rnd() - 0.5) * 11, (rnd() - 0.5) * 7, (rnd() - 0.5) * 7, 0.9, 0.9, 0.9, c.k, (rnd() - 0.5) * 2, (rnd() - 0.5) * 2, (rnd() - 0.5) * 2)),
    { yaw: -0.62, pitch: 0.4 },
  );

  /* Design service: a launch site for hush, a pair of headphones. On the paper chapter the
     site is ink, its words white on it, its picture and cards paper. */
  const onW = at(0.15);   // on the window
  const NAV: TextOpts = { size: 0.14, weight: 500 };
  const H1: TextOpts = { size: 0.44, font: 'head', track: -0.01 };
  const P: TextOpts = { size: 0.11, a: 0.62 };
  const BTN: TextOpts = { size: 0.15, weight: 600 };
  const hushLogo: Draw = (g) => {
    const w = g.text('hush', 0.02, g.h / 2, { size: 0.28, weight: 600, mid: true, track: -0.03 });
    g.dot(0.02 + w + 0.07, g.h / 2 + 0.06, 0.045, 'lime');
  };
  const colorway = (name: string, sw: 'ink' | 'ring' | 'lime', s = 1): Draw => (g) => {
    const r = 0.2 * s, cx = 0.18 * s + r, cy = g.h / 2;
    if (sw === 'ring') g.ring(cx, cy, r - 0.018 * s, 0.035 * s, 'ink', 0.85);
    else g.dot(cx, cy, r, sw);
    g.text(name, cx + r + 0.16 * s, cy - 0.09 * s, { size: 0.15 * s, weight: 600, mid: true });
    g.text('$249', cx + r + 0.16 * s, cy + 0.15 * s, { size: 0.12 * s, mid: true, a: 0.55 });
  };
  const site = (live: boolean): Piece[] => [
    piece(0, 0, 0, 8, 5.4, 0.3, FORE),                                                                          // 0 the window
    live ? pr(onW(0.55, 2.28, 4.8, 0.38, 0.08, LIME), 'hush.url.live', address('hush.audio', true))
      : pr(onW(0.55, 2.28, 4.8, 0.38, 0.08, BACK), 'hush.url.dev', address('localhost:3000', false)),        // 1 the address
    onW(-3.55, 2.28, 0.2, 0.2, 0.08, BACK),                                                                    // 2-4 the window's buttons
    onW(-3.19, 2.28, 0.2, 0.2, 0.08, BACK),
    onW(-2.83, 2.28, 0.2, 0.2, 0.08, BACK),
    pr(onW(-3.12, 1.55, 0.96, 0.36, 0.02, FORE), 'hush.logo', hushLogo),                                       // 5 the logo
    pr(onW(1.66, 1.55, 0.74, 0.26, 0.02, FORE), 'hush.nav1', label('Sound', NAV)),                             // 6-8 the menu
    pr(onW(2.45, 1.55, 0.74, 0.26, 0.02, FORE), 'hush.nav2', label('Design', NAV)),
    pr(onW(3.24, 1.55, 0.74, 0.26, 0.02, FORE), 'hush.nav3', label('Support', NAV)),
    pr(onW(-2.35, 0.86, 2.5, 0.54, 0.02, FORE), 'hush.h1a', words('Silence,', H1, 0.02)),                      // 9-10 the headline
    pr(onW(-1.8, 0.28, 3.6, 0.54, 0.02, FORE), 'hush.h1b', words('tuned to you.', H1, 0.02)),
    pr(onW(-1.9, -0.26, 3.4, 0.17, 0.02, FORE), 'hush.p1', words('Noise cancelling that learns the room you are in.', P, 0.02)),   // 11-12 text
    pr(onW(-1.9, -0.48, 3.4, 0.17, 0.02, FORE), 'hush.p2', words('Forty hours a charge. Ships in May.', P, 0.02)),
    pr(onW(-2.95, -1.04, 1.3, 0.44, 0.12, live ? BACK : LIME), 'hush.cta', label('Pre-order', BTN)),           // 13 the button
    pr(onW(1.95, 0.2, 3.3, 2.2, 0.12, PIC), 'hush.hero', (g) => headphones(g)),                               // 14 the picture
    pr(onW(-2.47, -1.95, 2.25, 0.9, 0.1, BACK), 'hush.card1', colorway('Ink', 'ink')),                          // 15-17 the colours it comes in
    pr(onW(0, -1.95, 2.25, 0.9, 0.1, BACK), 'hush.card2', colorway('Chalk', 'ring')),
    pr(onW(2.47, -1.95, 2.25, 0.9, 0.1, BACK), 'hush.card3', colorway('Lime', 'lime')),
  ];

  // The code, in an editor in front: ink for the words, grey for what's quoted and the punctuation.
  const CODE: [number, string][] = [
    [0, 'export default function Page() {'],
    [1, 'return ('],
    [2, '<Hero'],
    [3, 'title="Silence, tuned to you."'],
    [3, 'action={<Button>Pre-order</Button>}'],
    [2, '/>'],
    [1, ')'],
    [0, '}'],
  ];
  const CS = 0.1;
  const editor: Draw = (g) => {
    g.text('app/page.tsx', 0.16, 0.16, { size: 0.085, font: 'mono', mid: true, a: 0.5 });
    g.box(0, 0.31, g.w, 0.012, 'ink', 0.1);
    CODE.forEach((_, i) => g.text(String(i + 1), 0.3, 0.46 + i * 0.27, { size: 0.085, font: 'mono', mid: true, a: 0.3, align: 'right' }));
  };
  const codeLine = (s: string): Draw => (g) => {
    let x = 0.03;
    for (const t of s.match(/"[^"]*"|[A-Za-z]+|\s+|./g) ?? []) {
      const a = t.startsWith('"') ? 0.5 : /^[A-Za-z]/.test(t) ? 1 : 0.55;
      x += g.text(t, x, g.h / 2, { size: CS, font: 'mono', mid: true, a });
    }
  };
  const dev = site(false);
  dev.push(pr(piece(2.3, -0.75, 1.3, 3.6, 2.7, 0.2, BACK), 'hush.editor', editor));   // 18 the editor
  const onE = at(1.4);
  CODE.forEach(([ind, s], i) => {
    const w = s.length * CS * 0.6 + 0.08, x = 0.92 + ind * 0.24;
    dev.push(pr(onE(x + w / 2, 0.14 - i * 0.27, w, 0.17, 0.02, BACK), `hush.code${i}`, codeLine(s)));   // 19-26 its lines
  });
  F.site = makeForm(dev, { yaw: -0.28, pitch: 0.18 }, { lift: [0, 0.25, 1.2], hold: 2.6, step: 1 });

  // Live: the address goes lime, behind a lock, and the code folds into the phone.
  const live = site(true);
  const onP = at(1.36), onS = at(1.39);   // on the phone; on its screen
  const MH1: TextOpts = { size: 0.18, font: 'head', track: -0.01 };
  live.push(
    piece(3.6, -0.85, 1.25, 2.1, 3.9, 0.22, BACK),                                                       // 18 the phone
    onP(3.6, 0.88, 0.5, 0.08, 0.02, FORE),                                                               // 19 its speaker
    pr(onS(3.6, 0.1, 1.66, 1.0, 0.05, PIC), 'hush.m.hero', (g) => headphones(g, 1.1)),                  // 20 the picture
    pr(onS(3.27, -0.55, 1.0, 0.24, 0.02, FORE), 'hush.m.h1a', words('Silence,', MH1, 0.01)),            // 21-22 the headline
    pr(onS(3.6, -0.8, 1.66, 0.24, 0.02, FORE), 'hush.m.h1b', words('tuned to you.', MH1, 0.01)),
    pr(onS(3.6, -1.05, 1.66, 0.12, 0.02, FORE), 'hush.m.p', words('Noise cancelling that learns the room.', { size: 0.07, a: 0.62 }, 0.01)),   // 23 text
    pr(onS(3.22, -1.45, 0.9, 0.3, 0.06, BACK), 'hush.m.cta', label('Pre-order', { size: 0.1, weight: 600 })),   // 24 the button
    pr(onS(3.6, -2.15, 1.66, 0.6, 0.05, BACK), 'hush.m.card', colorway('Lime', 'lime', 0.66)),          // 25 a colour
    piece(3.6, -0.97, 1.38, 1.86, 3.36, 0.02, FORE),                                                     // 26 its screen
  );
  F.live = makeForm(live, { yaw: -0.4, pitch: 0.2 }, { lift: [0.5, 0.2, 1.0], hold: 2.8, step: 2 });

  // The moodboard: pictures, the type, the colours and the words for it, taped to a board.
  const specimen: Draw = (g) => {
    g.text('Aa', 0.12, 0.88, { size: 0.68, font: 'head' });
    g.text('Eurostile', 1.1, 0.36, { size: 0.12, weight: 500, mid: true });
    g.text('headlines', 1.1, 0.54, { size: 0.09, mid: true, a: 0.5 });
    g.text('Geist', 1.1, 0.8, { size: 0.12, weight: 500, mid: true });
    g.text('the rest', 1.1, 0.98, { size: 0.09, mid: true, a: 0.5 });
  };
  const uiSample: Draw = (g) => {
    g.box(0.14, 0.18, 1.1, 0.32, 'ink', 1, 0.16);
    g.text('Pre-order', 0.69, 0.34, { size: 0.12, weight: 600, align: 'center', mid: true, ink: 'base' });
    g.box(0.14, 0.68, 0.5, 0.26, 'lime', 1, 0.13);
    g.dot(0.51, 0.81, 0.1, 'ink');
    g.text('$249', 0.8, 0.82, { size: 0.16, font: 'head', mid: true });
  };
  const chip = (hex: string, ink = 0): Draw => (g) => {
    if (ink > 0) g.box(0, 0, g.w, g.h * 0.64, 'ink', ink);
    g.text(hex, 0.06, g.h - 0.1, { size: 0.072, font: 'mono', mid: true, a: 0.75 });
  };
  const mood: Piece[] = new Array(27);   // the moodboard's 27 (the rest are spare)
  mood[0] = piece(0, 0, 0, 8.4, 5.6, 0.26, FORE);   // the board (it becomes the window)
  const pin = (i: number, x: number, y: number, w: number, h: number, k: number, rz: number, name?: string, draw?: Draw) => {
    const p = piece(x, y + 0.2, 0.13 + 0.05 + i * 0.003, w, h, 0.08, k, rz);
    mood[i] = name && draw ? pr(p, name, draw) : p;
  };
  pin(14, -2.45, 0.6, 2.6, 3.0, PIC, -0.03, 'hush.mood.photo', (g) => headphones(g));   // a photograph (it becomes the picture)
  pin(18, 0.25, 1.35, 2.2, 1.45, PIC, 0.035, 'hush.mood.waves', waves);                 // another (it becomes the editor)
  pin(9, 2.85, 1.45, 1.9, 1.25, BACK, -0.04, 'hush.mood.type', specimen);                // the type (it becomes the headline)
  pin(10, 3.05, -0.25, 1.5, 1.1, DOTB, 0.04);                                             // a fabric
  pin(15, -0.25, -0.35, 1.5, 1.2, BACK, 0.05, 'hush.mood.ui', uiSample);                 // a button and a switch
  pin(16, 1.35, -0.3, 1.25, 1.05, BACK, -0.06, 'hush.mood.words', lines(['quiet,', 'warm,', 'a little bold.'], { size: 0.15, font: 'serif', italic: true }, 0.12, 0.3, 0.24));
  pin(17, -3.3, -1.95, 0.95, 0.95, DOTB, 0.06);
  pin(1, -2.35, -1.95, 0.62, 0.62, BACK, -0.05, 'hush.chip.paper', chip('#F7F8F8'));      // the colours
  pin(2, -1.61, -1.95, 0.62, 0.62, BACK, 0.03, 'hush.chip.grey', chip('#8E949A', 0.5));
  pin(3, -0.87, -1.95, 0.62, 0.62, DOTB, -0.02);
  pin(4, -0.13, -1.95, 0.62, 0.62, BACK, 0.05, 'hush.chip.ink', chip('#121417', 1));
  pin(13, 0.8, -1.85, 0.8, 0.8, LIME, 0.09, 'hush.chip.lime', chip('#B8FF00'));          // the one lime chip (it becomes the button)
  pin(11, 1.85, -1.8, 1.05, 0.8, BACK, -0.05, 'hush.note1', lines(['no stock', 'photos'], { size: 0.13, weight: 500 }, 0.1, 0.27));
  pin(12, 3.1, -1.85, 1.35, 0.8, BACK, 0.04, 'hush.note2', lines(['launch in', 'May'], { size: 0.13, weight: 500 }, 0.1, 0.27));
  // Tape on the corners (it becomes the lines of code).
  const tape = (i: number, x: number, y: number, rz: number) => {
    mood[i] = pr(piece(x, y, 0.36, 0.66, 0.2, 0.02, BACK, rz), 'tape', fill(0.1));
  };
  tape(19, -3.62, 2.25, 0.62);
  tape(20, -1.28, 2.25, -0.55);
  tape(21, 0.25, 2.24, 0.05);
  tape(22, 2.85, 2.22, -0.08);
  tape(23, 1.35, 0.4, 0.1);
  for (const i of [5, 6, 7, 8, 24, 25, 26]) mood[i] = hidden(dev[i].p);
  F.moodboard = makeForm(mood, { yaw: -0.2, pitch: 0.14 }, { lift: [0, 0.3, 1.0], hold: 2.2, step: 0 });

  /* Brand upgrade: kova, a money app that already works. First its parts in grey, on a grid;
     then colour and type, the tokens beside it; then its mark, on the app and as its icon.
     On the black chapter the app is white. */
  const onK = at(0.15), onB = at(0.2);   // on the app; on its sidebar
  const KX = [-1.083, 0.85, 2.783];
  const NAVK = ['Overview', 'Payments', 'Cards', 'Reports'];
  const kpi = (lab: string, val: string, foot: 'up' | 'month' | 'bar'): Draw => (g) => {
    g.text(lab, 0.16, 0.26, { size: 0.1, weight: 500, mid: true, a: 0.55 });
    g.text(val, 0.16, 0.6, { size: 0.34, font: 'head', mid: true });
    if (foot === 'up') {
      g.box(0.16, 0.84, 0.56, 0.17, 'lime', 1, 0.085);
      g.text('+4.2%', 0.44, 0.925, { size: 0.09, weight: 600, align: 'center', mid: true });
    } else if (foot === 'month') g.text('this month', 0.16, 0.925, { size: 0.09, mid: true, a: 0.5 });
    else {
      g.box(0.16, 0.9, g.w - 0.32, 0.06, 'ink', 0.12, 0.03);
      g.box(0.16, 0.9, (g.w - 0.32) * 0.62, 0.06, 'ink', 0.85, 0.03);
    }
  };
  const BARS = [0.42, 0.55, 0.48, 0.66, 0.58, 0.72, 0.6, 0.5, 0.64, 0.78, 0.7, 0.92];
  const chart: Draw = (g) => {
    g.text('Spending', 0.2, 0.3, { size: 0.13, weight: 600, mid: true });
    g.text('Last 12 months', 0.2, 0.5, { size: 0.09, mid: true, a: 0.5 });
    for (const y of [0.9, 1.35, 1.8]) g.box(0.2, y, g.w - 0.4, 0.01, 'ink', 0.08);
    BARS.forEach((v, i) => {
      const x = 0.28 + i * 0.262, bh = v * 1.3;
      g.box(x, 2.12 - bh, 0.15, bh, i === BARS.length - 1 ? 'lime' : 'ink', i === BARS.length - 1 ? 1 : 0.82, 0.02);
      g.text('JFMAMJJASOND'[i], x + 0.075, 2.3, { size: 0.075, align: 'center', mid: true, a: 0.45 });
    });
  };
  const ROWS = [['Groceries', 'Food', '−$84'], ['Studio rent', 'Home', '−$1,200'], ['Cloud', 'Work', '−$212'], ['Coffee', 'Food', '−$6']];
  const list: Draw = (g) => {
    g.text('Recent', 0.16, 0.3, { size: 0.13, weight: 600, mid: true });
    ROWS.forEach(([name, sub, amt], i) => {
      const y = 0.74 + i * 0.44;
      g.dot(0.28, y, 0.12, 'ink', 0.85);
      g.text(name[0], 0.28, y, { size: 0.1, weight: 600, align: 'center', mid: true, ink: 'base' });
      g.text(name, 0.5, y - 0.07, { size: 0.1, weight: 500, mid: true });
      g.text(sub, 0.5, y + 0.09, { size: 0.075, mid: true, a: 0.5 });
      g.text(amt, g.w - 0.14, y - 0.07, { size: 0.1, weight: 500, align: 'right', mid: true });
    });
  };
  // The grid: twelve columns over the app's main area, laid over everything like a design
  // tool's, so each part in grey carries its share of the columns (left: its left edge, from the app's).
  const GX = 1.85, GW = 5.6, GUT = 0.2, CW = (GW - GUT * 11) / 12;
  const columns = (g: Pen, left: number, top = 0, bottom = g.h) => {
    for (let i = 0; i < 12; i++) {
      const x = GX + i * (CW + GUT) - left;
      if (x + CW > 0 && x < g.w) g.box(Math.max(0, x), top, Math.min(CW, CW + x, g.w - x), bottom - top, 'lime', 0.22);
    }
  };
  const kovaGrid: Draw = (g) => columns(g, 0, 0.15, g.h - 0.15);
  // a part in grey, on the grid: x and w its place and width on the app
  const wired = (x: number, w: number, inner: Draw, outline = true): Draw => (g) => {
    columns(g, x - w / 2 + 3.8);
    if (outline) g.frame(0, 0, g.w, g.h, 0.025, 'ink', 0.14);
    inner(g);
  };
  const kova = (st: 0 | 1 | 2): Piece[] => {
    const wire = st === 0, k = wire ? FORE : BACK;
    const out: Piece[] = [];
    const win = piece(0, 0, 0, 7.6, 4.9, 0.3, FORE);
    out.push(wire ? pr(win, 'kova.grid', kovaGrid, 40) : win);                                                      // 0 the app
    const side = onK(-2.9, 0, 1.5, 4.6, 0.04, k);
    out.push(wire ? pr(side, 'kova.w.side', fill(0.04)) : side);                                                    // 1 its sidebar
    const logo = onB(-2.9, 1.95, 1.2, 0.36, 0.02, k);
    out.push(
      wire ? pr(logo, 'kova.w.logo', (g) => g.box(0.04, g.h / 2 - 0.08, 0.6, 0.16, 'ink', 0.16))
        : st === 1 ? pr(logo, 'kova.logo', words('kova', { size: 0.24, weight: 600, track: -0.02 }, 0.04))
          : pr(logo, 'kova.logo.mark', (g) => {
            g.box(0.04, g.h / 2 - 0.15, 0.3, 0.3, 'lime');
            g.text('k', 0.19, g.h / 2 - 0.01, { size: 0.26, weight: 600, align: 'center', mid: true, ink: 'base' });
            g.text('kova', 0.44, g.h / 2, { size: 0.24, weight: 600, track: -0.02, mid: true });
          }),
    );                                                                                                               // 2 its logo
    NAVK.forEach((s, i) => {
      const p = onB(-2.9, 1.3 - i * 0.36, 1.2, 0.28, 0.02, k);
      out.push(wire ? pr(p, `kova.w.nav${i}`, (g) => g.box(0.06, g.h / 2 - 0.045, 0.8 - i * 0.08, 0.09, 'ink', 0.14, 0.045))
        : pr(p, `kova.nav${i}`, (g) => {
          if (i === 0) g.box(0.06, g.h / 2 - 0.035, 0.07, 0.07, 'lime');
          g.text(s, 0.22, g.h / 2, { size: 0.13, weight: 500, mid: true, a: i === 0 ? 1 : 0.6 });
        }));
    });                                                                                                              // 3-6 its menu
    const head = onK(-0.2, 1.95, 3.5, 0.44, 0.02, FORE);
    out.push(wire ? pr(head, 'kova.w.head', wired(-0.2, 3.5, (g) => g.box(0.02, g.h / 2 - 0.1, 2.4, 0.2, 'ink', 0.16, 0.03), false))
      : pr(head, 'kova.head', words('Good morning, Ana', { size: 0.3, font: 'head' }, 0.02)));                      // 7 the greeting
    const av = onK(3.43, 1.95, 0.42, 0.42, 0.04, FORE);
    out.push(wire ? pr(av, 'kova.w.avatar', wired(3.43, 0.42, (g) => g.dot(g.w / 2, g.h / 2, 0.19, 'ink', 0.18), false))
      : pr(av, 'kova.avatar', (g) => {
        g.dot(g.w / 2, g.h / 2, 0.19, 'ink');
        g.text('A', g.w / 2, g.h / 2, { size: 0.18, weight: 600, align: 'center', mid: true, ink: 'base' });
      }));                                                                                                           // 8 who's in
    const KPIS: [string, string, 'up' | 'month' | 'bar'][] = [['Balance', '$48,210', 'up'], ['Spent', '$3,120', 'month'], ['Saved', '18%', 'bar']];
    KPIS.forEach(([l, v, f], i) => {
      const p = onK(KX[i], 1.0, 1.733, 1.1, 0.08, FORE);
      out.push(wire ? pr(p, `kova.w.kpi${i}`, wired(KX[i], 1.733, (g) => { g.box(0.16, 0.2, 0.6, 0.09, 'ink', 0.16); g.box(0.16, 0.46, 1.1, 0.24, 'ink', 0.14); }))
        : pr(p, `kova.kpi${i}`, kpi(l, v, f)));
    });                                                                                                              // 9-11 the numbers
    const ch = onK(-0.15, -1.05, 3.6, 2.5, 0.08, FORE);
    out.push(wire ? pr(ch, 'kova.w.chart', wired(-0.15, 3.6, (g) => {
      g.box(0.2, 0.22, 0.9, 0.12, 'ink', 0.16);
      g.box(0.2, 0.9, g.w - 0.4, 1.22, 'ink', 0.1);
    })) : pr(ch, 'kova.chart', chart));                                                                             // 12 the chart
    const ls = onK(2.75, -1.05, 1.8, 2.5, 0.08, FORE);
    out.push(wire ? pr(ls, 'kova.w.list', wired(2.75, 1.8, (g) => {
      g.box(0.16, 0.22, 0.6, 0.12, 'ink', 0.16);
      for (let i = 0; i < 4; i++) { g.dot(0.28, 0.74 + i * 0.44, 0.12, 'ink', 0.14); g.box(0.5, 0.69 + i * 0.44, 0.9, 0.1, 'ink', 0.14); }
    })) : pr(ls, 'kova.list', list));                                                                               // 13 the list
    // the tokens, in front of the sidebar: the type, and the colours (the lime one becomes the icon)
    const type = pr(piece(-2.9, -0.95, 0.85, 1.3, 1.0, 0.14, FORE), 'kova.type', (g) => {
      g.text('Aa', 0.12, 0.62, { size: 0.5, font: 'head' });
      g.text('Eurostile', 0.12, 0.84, { size: 0.09, weight: 500, mid: true, a: 0.6 });
    });
    const chips = [piece(-3.35, -1.95, 0.85, 0.38, 0.38, 0.28, FORE), pr(piece(-2.9, -1.95, 0.85, 0.38, 0.38, 0.28, FORE), 'kova.chip.grey', fill(0.5)), piece(-2.45, -1.95, 0.85, 0.38, 0.38, 0.28, LIME)];
    if (st === 1) out.push(type, ...chips);
    else out.push(hidden(type.p), hidden(chips[0].p), hidden(chips[1].p));
    if (st === 2) out.push(pr(piece(-2.9, -1.35, 0.95, 1.3, 1.3, 0.42, LIME), 'kova.icon', label('k', { size: 0.92, weight: 600 })));
    else if (st === 0) out.push(hidden(chips[2].p));                                                                // 14-17 type, colours; the icon
    return out;
  };
  const brandLift: Vec = [0, 0.3, 1.0];
  F.grid = makeForm(kova(0), { yaw: 0.26, pitch: 0.16 }, { lift: brandLift, hold: 2.2, step: 0 });
  F.colortype = makeForm(kova(1), { yaw: 0.3, pitch: 0.18 }, { lift: brandLift, hold: 2.6, step: 1 });
  F.mark = makeForm(kova(2), { yaw: 0.32, pitch: 0.2 }, { lift: brandLift, hold: 2.8, step: 2 });

  /* Labs: the four products, one after another, as the list names them. The two that are live
     are made in the colour that stands out; the two on the way are in the page's own colour,
     like parts not yet painted, with a tag that says so. */
  const onL = at(0.15);
  const TTL: TextOpts = { size: 0.24, weight: 600, track: -0.02 };
  const labWin = (k: number) => piece(0, 0, 0, 7.6, 4.6, 0.3, k);
  const titleW = (s: string) => wide(s, 0.24, 0.58) + 0.1;
  const title = (s: string, k: number = FORE) => pr(onL(-3.6 + titleW(s) / 2, 1.95, titleW(s), 0.36, 0.02, k), `lab.title.${s}`, words(s, TTL, 0.04));
  // the tag after a title
  const soon = (s: string) => pr(onL(-3.6 + titleW(s) + 0.12 + 0.37, 1.95, 0.74, 0.3, 0.05, FORE), 'lab.soon', label('SOON', { size: 0.1, weight: 600, track: 0.14 }));

  // Strata: an image in; the colours and the type taken from it, the parts made of them, the code.
  const STRATA_CHIPS: [number, string | null, number][] = [[LIME, null, 0], [BACK, null, 0], [BACK, 'lab.chip.mid', 0.42], [BACK, 'lab.chip.light', 0.14], [DOTB, null, 0]];
  const strata = (): Piece[] => [
    labWin(FORE),                                                                                                   // 0
    title('Strata'),                                                                                                // 1
    pr(onL(3.05, 1.95, 1.1, 0.38, 0.06, BACK), 'lab.export', label('Export', { size: 0.13, weight: 600 })),         // 2
    pr(onL(-2.175, -0.235, 2.85, 3.53, 0.1, PIC), 'lab.image', landscape),                                         // 3 the image in
    ...STRATA_CHIPS.map(([k, name, a], i) => {
      const p = onL(-0.12 + i * 0.84, 1.2, 0.66, 0.66, 0.16, k);
      return name ? pr(p, name, fill(a)) : p;
    }),                                                                                                             // 4-8 its colours
    pr(onL(0.45, 0.1, 1.8, 1.05, 0.08, BACK), 'lab.type', (g) => {
      g.text('Aa', 0.14, 0.7, { size: 0.56, font: 'head' });
      g.text('Display', 1.06, 0.36, { size: 0.1, weight: 500, mid: true });
      g.text('48 / 1.0', 1.06, 0.54, { size: 0.085, mid: true, a: 0.5 });
      g.text('Body 16', 1.06, 0.8, { size: 0.085, mid: true, a: 0.5 });
    }),                                                                                                             // 9 its type
    pr(onL(2.6, 0.33, 2.0, 0.44, 0.12, LIME), 'lab.cta', label('Get started', { size: 0.14, weight: 600 })),         // 10-11 parts
    pr(onL(2.6, -0.2, 2.0, 0.44, 0.06, BACK), 'lab.input', (g) => {
      g.text('you@studio.com', 0.16, g.h / 2, { size: 0.12, mid: true, a: 0.45 });
      g.box(1.32, g.h / 2 - 0.1, 0.014, 0.2, 'ink', 0.9);
    }),
    pr(onL(1.575, -1.4, 4.05, 1.2, 0.06, BACK), 'lab.code', (g) => {
      [['--accent', '#B8FF00'], ['--ink', '#121417'], ['--space', '8px']].forEach(([k2, v], i) => {
        const y = 0.3 + i * 0.3;
        const w = g.text(`${k2}: `, 0.18, y, { size: 0.12, font: 'mono', mid: true, a: 0.5 });
        g.text(`${v};`, 0.18 + w, y, { size: 0.12, font: 'mono', mid: true });
      });
    }),                                                                                                             // 12 the code
  ];
  F.strata = makeForm(strata(), { yaw: -0.3, pitch: 0.16 }, { lift: [0, 0.3, 1.0], hold: 2.6, step: 0 });

  // AI Bidding: a table; your aces; the model reading the bluff; fold, bid, or all in.
  const card = (x: number, y: number, rz: number, k: number, name?: string, draw?: Draw) => {
    const p = piece(x, y, 0.15 + 0.03 + 0.01, 0.82, 1.15, 0.06, k, rz);
    return name && draw ? pr(p, name, draw) : p;
  };
  const bidding = (): Piece[] => [
    pr(labWin(FORE), 'lab.table', (g) => {
      g.shape((c) => c.ellipse(g.w / 2 + 0.55, g.h / 2 - 0.05, 2.25, 1.95, 0, 0, Math.PI * 2), 'ink', 0.14, 0.04);
    }, 40),                                                                                                          // 0 the table
    title('AI Bidding'),                                                                                             // 1
    pr(onL(3.05, 1.95, 1.1, 0.38, 0.06, BACK), 'lab.pot', label('Pot $120', { size: 0.13, weight: 600 })),           // 2 the pot
    pr(onL(-2.55, -0.35, 1.9, 2.1, 0.06, BACK), 'lab.model', (g) => {
      g.text('The model reads', 0.16, 0.26, { size: 0.1, weight: 500, mid: true, a: 0.55 });
      g.text('Bluff', 0.16, 0.6, { size: 0.26, font: 'head', mid: true });
      g.text('72%', 0.16, 1.08, { size: 0.5, font: 'head', mid: true });
      g.box(0.16, 1.45, g.w - 0.32, 0.07, 'ink', 0.12, 0.035);
      g.box(0.16, 1.45, (g.w - 0.32) * 0.72, 0.07, 'ink', 0.85, 0.035);
      g.text('Your hand looks strong.', 0.16, 1.78, { size: 0.085, mid: true, a: 0.6 });
    }),                                                                                                              // 3 the model
    card(0.3, 1.15, 0.05, DOTB),                                                                                     // 4-5 their cards, face down
    card(1.18, 1.15, -0.04, DOTB),
    card(-0.05, -0.2, 0, BACK, 'lab.cardQ', (g) => cardFace(g, 'Q', 'heart')),                                       // 6-8 on the table
    card(0.88, -0.2, 0, BACK, 'lab.card10', (g) => cardFace(g, '10', 'diamond')),
    card(1.81, -0.2, 0, BACK, 'lab.card7', (g) => cardFace(g, '7', 'club')),
    card(0.42, -1.6, 0.07, BACK, 'lab.cardA1', (g) => cardFace(g, 'A', 'spade')),                                   // 9-10 your hand
    card(1.3, -1.6, -0.05, BACK, 'lab.cardA2', (g) => cardFace(g, 'A', 'diamond')),
    pr(onL(3.02, -0.72, 1.1, 0.4, 0.08, BACK), 'lab.fold', label('Fold', { size: 0.13, weight: 600 })),             // 11-13 what you do
    pr(onL(3.02, -1.24, 1.1, 0.4, 0.08, BACK), 'lab.bid', label('Bid $40', { size: 0.13, weight: 600 })),
    pr(onL(3.02, -1.76, 1.1, 0.4, 0.12, LIME), 'lab.allin', label('All in', { size: 0.13, weight: 600 })),
    piece(-1.0, -1.62, 0.41, 0.5, 0.1, 0.5, BACK),                                                                    // 14-16 chips
    piece(-0.97, -1.51, 0.41, 0.5, 0.1, 0.5, BACK),
    piece(-1.01, -1.4, 0.41, 0.5, 0.1, 0.5, BACK),
  ];
  F.bidding = makeForm(bidding(), { yaw: -0.3, pitch: 0.2 }, { lift: [0, 0.3, 1.0], hold: 2.6, step: 1 });

  // TTS Editor: a voice, its script with the pauses and the pitch marked, three dials.
  const SCRIPT: [string, string][] = [['Welcome back.', 'pause 0.6s'], ['Today we take it slow,', 'pitch +2'], ['and say it like we mean it.', 'warm']];
  const SLIDERS: [string, number][] = [['Pitch', 0.35], ['Pace', 0.6], ['Warmth', 0.8]];
  const tts = (): Piece[] => {
    const out: Piece[] = [labWin(BACK), title('TTS Editor', BACK), soon('TTS Editor')];                                           // 0-2
    out.push(pr(onL(0, 0.95, 7.0, 0.95, 0.04, BACK), 'lab.wave', (g) => {
      waveform(g, 0.2, 0.1, g.w - 0.4, g.h - 0.32, 0.42);
      g.box(0.2 + (g.w - 0.4) * 0.42, 0.04, 0.02, g.h - 0.2, 'ink', 1);
      ['0:00', '0:04', '0:08', '0:12'].forEach((t, i) => g.text(t, 0.2 + i * (g.w - 0.4) / 3, g.h - 0.08, { size: 0.07, mid: true, a: 0.45, align: i === 3 ? 'right' : 'left' }));
    }));                                                                                                             // 3 the voice
    SCRIPT.forEach(([s], i) => {
      const w = wide(s, 0.2, 0.52) + 0.08;
      out.push(pr(onL(-3.4 + w / 2, 0.02 - i * 0.44, w, 0.32, 0.02, BACK), `lab.line${i}`, words(s, { size: 0.2, weight: 500 }, 0.02)));
    });                                                                                                              // 4-6 the script
    SCRIPT.forEach(([s, mark], i) => {
      const x = -3.4 + wide(s, 0.2, 0.52) + 0.3, w = wide(mark, 0.11, 0.56) + 0.3;
      out.push(pr(onL(x + w / 2, 0.02 - i * 0.44, w, 0.3, 0.05, FORE), `lab.mark${i}`, label(mark, { size: 0.11, weight: 500 })));
    });                                                                                                              // 7-9 what's marked
    SLIDERS.forEach(([s], i) => {
      out.push(pr(onL(-2.45 + i * 2.45, -1.72, 2.2, 0.66, 0.02, BACK), `lab.slider${i}`, (g) => {
        g.text(s, 0.1, 0.18, { size: 0.1, weight: 500, mid: true, a: 0.6 });
        g.box(0.1, 0.44, g.w - 0.2, 0.04, 'ink', 0.22, 0.02);
      }));
    });                                                                                                              // 10-12 three dials
    SLIDERS.forEach(([, v], i) => out.push(onL(-2.45 + i * 2.45 - 1.0 + v * 2.0, -1.86, 0.18, 0.18, 0.12, FORE)));   // 13-15 their knobs
    return out;
  };
  F.tts = makeForm(tts(), { yaw: -0.3, pitch: 0.16 }, { lift: [0, 0.3, 1.0], hold: 2.6, step: 2 });

  // Interview Assistant: the call, the words as they're said, and hints for what to ask next.
  const HINTS: [string, string][] = [['ASK', 'What did you measure?'], ['FOLLOW UP', 'How big was the team?'], ['NOTE', 'Led the rebuild.']];
  const interview = (): Piece[] => {
    const tileFront = 0.15 + 0.06 + 0.01;
    const onT = at(tileFront);
    const out: Piece[] = [labWin(BACK), title('Interview Assistant', BACK), soon('Interview Assistant')];                                  // 0-2
    out.push(pr(onL(-1.35, 0, 4.5, 2.9, 0.06, FORE), 'lab.call', (g) => caller(g, g.w * 0.46)));                     // 3 the call
    out.push(pr(onT(0.25, -0.95, 1.0, 0.72, 0.05, BACK), 'lab.you', (g) => {
      caller(g, g.w * 0.5, 0.7);
      g.text('You', 0.08, g.h - 0.1, { size: 0.08, weight: 600, mid: true, ink: 'base' });
    }));                                                                                                             // 4 you
    out.push(pr(onT(-2.85, -1.18, 1.3, 0.3, 0.02, FORE), 'lab.name', words('Sam, candidate', { size: 0.11, weight: 500 }, 0.06)));   // 5 their name
    out.push(pr(onL(-1.35, -1.86, 4.5, 0.42, 0.02, BACK), 'lab.caption', words('“…so we rebuilt onboarding in two weeks.”', { size: 0.13, a: 0.8 }, 0.06)));   // 6 what they said
    out.push(pr(onL(3.1, 1.95, 1.0, 0.32, 0.02, BACK), 'lab.rec', (g) => {
      g.dot(0.2, g.h / 2, 0.06, 'ink');
      g.text('12:48', 0.34, g.h / 2, { size: 0.12, weight: 500, mid: true });
    }));                                                                                                             // 7 the clock
    HINTS.forEach(([lab, s], i) => {
      out.push(pr(onL(2.4, 0.85 - i * 0.9, 2.4, 0.76, 0.04, BACK), `lab.hint${i}`, (g) => {
        g.text(lab, 0.16, 0.24, { size: 0.075, weight: 600, mid: true, a: 0.5, track: 0.1 });
        g.text(s, 0.16, 0.5, { size: 0.13, weight: 500, mid: true });
      }));
    });                                                                                                              // 8-10 hints
    return out;
  };
  F.interview = makeForm(interview(), { yaw: -0.3, pitch: 0.16 }, { lift: [0, 0.3, 1.0], hold: 2.6, step: 3 });

  // The Strata page: one image in; the colours and type taken out of it; the system.
  const sAll = strata();
  F.strataImage = makeForm([...hideAll(sAll.slice(0, 3)), pr(piece(0, 0, 0.2, 3.4, 4.2, 0.12, PIC), 'lab.image.big', landscape), ...hideAll(sAll.slice(4))], { yaw: -0.24, pitch: 0.12 }, { lift: [0, 0.3, 1.0], hold: 1.8 });
  F.strataTokens = makeForm([sAll[0], sAll[1], hidden(sAll[2].p), ...sAll.slice(3, 10), ...hideAll(sAll.slice(10))], { yaw: -0.28, pitch: 0.14 }, { lift: [0, 0.3, 1.0], hold: 2.0 });
  F.strataSystem = makeForm(strata(), { yaw: -0.3, pitch: 0.16 }, { lift: [0, 0.3, 1.0], hold: 2.8 });

  /* About: every idea that came in, loose; then all of them kept, on a board, from a first idea
     to shipped. The lime one is yours. */
  const COLS: [string, [string, string][]][] = [
    ['Ideas', [['your idea', ''], ['a menu that', 'talks back'], ['plant care', 'by text'], ['a map of', 'quiet cafés']]],
    ['Research', [['voices with', 'feeling'], ['how teams', 'write briefs'], ['what agents', 'print'], ['fonts for', 'kids']]],
    ['Prototype', [['TTS Editor', ''], ['interview', 'hints'], ['the 3-day', 'homepage'], ['calmer clinic', 'sites']]],
    ['Shipped', [['Strata', ''], ['AI Bidding', ''], ['Listing Kit', ''], ['this site', '']]],
  ];
  const notes: Piece[] = [], heads: Piece[] = [];
  COLS.forEach(([col, ideas], c) => {
    const x = -2.25 + c * 1.5;
    heads.push(pr(piece(x, 1.72, 0, 1.3, 0.3, 0.02, BACK), `idea.col${c}`, (g) => {
      g.text(col, 0.04, g.h / 2, { size: 0.15, weight: 600, mid: true });
      g.text(String(ideas.length), g.w - 0.04, g.h / 2, { size: 0.12, mid: true, a: 0.45, align: 'right' });
    }));
    ideas.forEach(([a, b], r) => {
      const yours = c === 0 && r === 0, shipped = c === 3;
      notes.push(pr(piece(x, 0.95 - r * 1.05, 0, 1.3, 0.92, 0.08, yours ? LIME : FORE), `idea.${c}.${r}`, (g) => {
        g.text(a, 0.12, 0.3, { size: yours ? 0.17 : 0.15, weight: yours || shipped ? 600 : 500, mid: true });
        if (b) g.text(b, 0.12, 0.52, { size: 0.15, weight: 500, mid: true });
        if (shipped) tick(g, g.w - 0.36, g.h - 0.36, 0.24, 'ink', 0.85);
        if (yours) g.text('+', g.w - 0.2, g.h - 0.2, { size: 0.24, weight: 500, align: 'center', mid: true });
      }));
    });
  });
  // loose: a jittered lattice, shuffled, so no two ideas overlap; turned a little, still facing out
  const cells: Vec[] = [];
  for (let x = 0; x < 5; x++) for (let y = 0; y < 4; y++) cells.push([(x - 2) * 1.55, (y - 1.5) * 1.15, (rnd() - 0.5) * 1.6]);
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  const loose = notes.map((nt, i) => {
    const c = cells[i];
    const p = piece(c[0] + (rnd() - 0.5) * 0.4, c[1] + (rnd() - 0.5) * 0.3, c[2], 1.3, 0.92, 0.08, nt.k, (rnd() - 0.5) * 0.7, (rnd() - 0.5) * 0.5, (rnd() - 0.5) * 0.7);
    p.pr = nt.pr;
    return p;
  });
  F.field = makeForm([...loose, ...hideAll(heads)], { yaw: -0.25, pitch: 0.2 }, { lift: [0, 0.6, 0.6], hold: 2.2 });
  F.sorted = makeForm([...notes, ...heads], { yaw: -0.2, pitch: 0.12 }, { lift: [0, 0.6, 0.6], hold: 3.0 });

  /* Listing kit: the print flyer for 1428 Alder Street, then its five posts beside it, then its
     video. On the paper chapter the flyer is ink, its words white, its pictures paper. */
  const fz = (dx: number, z0: number) => (x: number, y: number, w: number, h: number, d: number, k: number) => piece(dx + x, y, z0 + d / 2 + 0.01, w, h, d, k);
  const FLY: TextOpts = { size: 0.13, weight: 500 };
  const flyer = (dx: number, tagK: number): Piece[] => {
    const fo = fz(dx, 0.08), onPhoto = fz(dx, 0.15);
    return [
      piece(dx, 0, 0, 3.2, 4.4, 0.16, FORE),                                                                                // 0 the sheet
      pr(fo(0, 0.75, 2.8, 2.2, 0.06, PIC), 'lk.house', (g) => street(g)),                                                   // 1 the house
      pr(onPhoto(-0.75, 1.6, 1.15, 0.32, 0.08, tagK), 'lk.tag', label('JUST LISTED', { size: 0.1, weight: 600, track: 0.1 })),   // 2 Just Listed
      pr(fo(-0.2, -0.66, 2.4, 0.34, 0.02, FORE), 'lk.addr', words('1428 Alder Street', { size: 0.25, font: 'head' }, 0.02)),     // 3 the address
      pr(fo(-0.8, -1.06, 1.2, 0.3, 0.02, FORE), 'lk.price', words('$849,000', { size: 0.22, font: 'head' }, 0.02)),            // 4 the price
      pr(fo(-0.4, -1.42, 2.0, 0.18, 0.02, FORE), 'lk.facts', words('3 bd   2 ba   1,850 sq ft', FLY, 0.02)),                   // 5-6 details
      pr(fo(-0.4, -1.66, 2.0, 0.18, 0.02, FORE), 'lk.open', words('Open house Sat, 1 to 4', { ...FLY, a: 0.62 }, 0.02)),
      pr(fo(1.0, -1.5, 0.62, 0.62, 0.05, BACK), 'lk.qr', (g) => qr(g, 0.06, 0.06, g.w - 0.12, 11)),                         // 7 the code to scan
      pr(fo(-0.5, -1.98, 1.8, 0.16, 0.02, FORE), 'lk.agent', words('Dana Lee, Realtor', { size: 0.1, weight: 500, a: 0.62 }, 0.02)),   // 8 the agent
    ];
  };
  const POSTS: [number, number, string, Draw][] = [
    [0.35, 0.95, 'Just listed', (g) => street(g)],
    [1.9, 0.95, 'Open house Sat', openSign],
    [3.45, 0.95, 'The kitchen', kitchen],
    [1.1, -0.65, '3 bd, 2 ba', bedroom],
    [2.65, -0.65, 'Link in bio', living],
  ];
  const posts = (): Piece[] =>
    POSTS.flatMap(([x, y, cap, draw], i) => [
      piece(x, y, 0, 1.4, 1.4, 0.12, FORE),
      pr(piece(x, y + 0.14, 0.1, 1.24, 0.9, 0.06, PIC), `lk.post${i}`, draw),
      pr(piece(x, y - 0.5, 0.075, 1.24, 0.22, 0.02, FORE), `lk.cap${i}`, words(cap, { size: 0.1, weight: 500 }, 0.02)),
    ]);
  const VIDEO: Vec = [1.6, 0.3, 0];
  const video = (): Piece[] => [
    piece(1.6, 0.2, 0, 4.4, 2.48, 0.14, FORE),                                                                // the frame
    pr(piece(1.6, 0.3, 0.11, 4.1, 1.95, 0.06, PIC), 'lk.film', (g) => {
      street(g, { s: g.h * 0.95, gy: g.h * 0.82 });
      g.text('1428 Alder Street', 0.18, g.h - 0.16, { size: 0.15, font: 'head', mid: true, ink: 'base' });
      g.text('0:30', g.w - 0.16, 0.18, { size: 0.1, weight: 600, align: 'right', mid: true });
    }),                                                                                                       // the film
    piece(1.6, 0.3, 0.21, 0.66, 0.66, 0.12, PLAY),                                                            // play
    pr(piece(1.6, -0.82, 0.1, 4.1, 0.08, 0.04, BACK), 'lk.progress', (g) => g.box(0, 0, g.w * 0.36, g.h, 'lime')),   // how far it's played
  ];
  const kitLift: Vec = [0, 0.3, 1.0];
  F.flyer = makeForm([...flyer(0, LIME), ...hideAll(posts()), ...hideAll(video(), VIDEO)], { yaw: -0.24, pitch: 0.12 }, { lift: kitLift, hold: 2.2, step: 0 });
  F.posts = makeForm([...flyer(-2.6, LIME), ...posts(), ...hideAll(video(), VIDEO)], { yaw: -0.22, pitch: 0.12 }, { lift: kitLift, hold: 2.4, step: 1 });
  F.video = makeForm([...flyer(-2.6, BACK), ...hideAll(posts(), VIDEO), ...video()], { yaw: -0.24, pitch: 0.12 }, { lift: kitLift, hold: 2.6, step: 2 });

  /* A practice website, for Willow Counseling: the questionnaire, then the calm homepage made
     from it, then live, with its phone. */
  const fq = at(0.1);
  const QL: TextOpts = { size: 0.1, weight: 500, a: 0.55 };
  const field = (s: string): Draw => (g) => {
    g.frame(0, 0, g.w, g.h, 0.02, 'ink', 0.3);
    g.text(s, 0.14, g.h / 2, { size: 0.14, mid: true });
  };
  const questionnaire: Piece[] = [
    piece(0, 0, 0, 3.4, 4.6, 0.2, FORE),                                                                          // 0 the form (it becomes the window)
    pr(fq(-0.1, 1.85, 2.8, 0.36, 0.02, FORE), 'pw.q.title', words('About your practice', { size: 0.24, font: 'head' }, 0.02)),   // 1 its title
    pr(fq(-1.3, -0.72, 0.26, 0.26, 0.06, BACK), 'pw.q.tick', (g) => tick(g, 0, 0, g.w)),                         // 2-4 three choices
    fq(-1.3, -1.08, 0.26, 0.26, 0.06, BACK),
    pr(fq(-1.3, -1.44, 0.26, 0.26, 0.06, BACK), 'pw.q.tick', (g) => tick(g, 0, 0, g.w)),
    pr(fq(-0.65, 1.36, 1.6, 0.16, 0.02, FORE), 'pw.q.l1', words('Practice name', QL, 0.02)),                     // 5-6 questions
    pr(fq(-0.5, 0.46, 1.9, 0.16, 0.02, FORE), 'pw.q.l2', words('How should it feel?', QL, 0.02)),
    pr(fq(0, 0.08, 2.9, 0.44, 0.04, FORE), 'pw.q.a2', field('Calm, warm, no jargon')),                          // 7-8 answers
    pr(fq(0, 0.98, 2.9, 0.44, 0.04, FORE), 'pw.q.a1', field('Willow Counseling')),
    pr(fq(-0.4, -0.72, 1.3, 0.18, 0.02, FORE), 'pw.q.c1', words('In person', { size: 0.13 }, 0.02)),            // 9-10 the choices' words
    pr(fq(-0.4, -1.08, 1.3, 0.18, 0.02, FORE), 'pw.q.c2', words('Evenings', { size: 0.13 }, 0.02)),
    pr(fq(-0.85, -1.92, 1.2, 0.42, 0.12, LIME), 'pw.q.send', label('Send', { size: 0.14, weight: 600 })),        // 11 send
    pr(fq(-0.4, -1.44, 1.3, 0.18, 0.02, FORE), 'pw.q.c3', words('Online', { size: 0.13 }, 0.02)),               // 12 the last choice's words
    pr(fq(-0.8, -0.36, 1.3, 0.16, 0.02, FORE), 'pw.q.l3', words('Sessions', QL, 0.02)),                         // 13 a question
  ];
  const WH1: TextOpts = { size: 0.46, font: 'serif' };
  const willowLogo: Draw = (g) => {
    g.shape((c) => c.ellipse(0.14, g.h / 2, 0.06, 0.13, 0.6, 0, Math.PI * 2), 'lime');
    g.text('Willow', 0.3, g.h / 2, { size: 0.24, font: 'serif', mid: true });
  };
  const calm = (live: boolean): Piece[] => [
    piece(0, 0, 0, 8, 5.4, 0.3, FORE),                                                                                  // 0 the window
    live ? pr(onW(0.55, 2.28, 4.8, 0.38, 0.08, LIME), 'pw.url.live', address('willowcounseling.com', true))
      : pr(onW(0.55, 2.28, 4.8, 0.38, 0.08, BACK), 'pw.url.preview', address('willowcounseling.com/preview', false)),   // 1 the address
    onW(-3.55, 2.28, 0.2, 0.2, 0.08, BACK),                                                                            // 2-4 the window's buttons
    onW(-3.19, 2.28, 0.2, 0.2, 0.08, BACK),
    onW(-2.83, 2.28, 0.2, 0.2, 0.08, BACK),
    pr(onW(-2.95, 1.55, 1.3, 0.36, 0.02, FORE), 'pw.logo', willowLogo),                                                // 5 the logo
    pr(onW(2.38, 1.55, 0.9, 0.26, 0.02, FORE), 'pw.nav1', label('Services', NAV)),                                     // 6-7 the menu
    pr(onW(3.25, 1.55, 0.7, 0.26, 0.02, FORE), 'pw.nav2', label('Contact', NAV)),
    pr(onW(-1.75, 0.72, 3.7, 0.56, 0.02, FORE), 'pw.h1a', words('A calm place', WH1, 0.02)),                           // 8-9 the headline
    pr(onW(-2.35, 0.12, 2.5, 0.56, 0.02, FORE), 'pw.h1b', words('to begin.', WH1, 0.02)),
    pr(onW(-1.95, -0.44, 3.3, 0.17, 0.02, FORE), 'pw.p1', words('Individual and couples therapy,', { size: 0.13, a: 0.62 }, 0.02)),   // 10 text
    pr(onW(-2.8, -1.3, 1.6, 0.44, 0.14, live ? BACK : LIME), 'pw.cta', label('Book a consult', BTN)),                  // 11 the button
    pr(onW(2.0, -0.3, 3.0, 3.0, 0.12, PIC), 'pw.room', room),                                                          // 12 the room
    pr(onW(-1.95, -0.66, 3.3, 0.17, 0.02, FORE), 'pw.p2', words('in Portland and online.', { size: 0.13, a: 0.62 }, 0.02)),   // 13 text
  ];
  const onPh = at(1.36), onScr = at(1.39);
  const phone = (): Piece[] => [
    piece(3.05, -0.8, 1.25, 1.7, 3.6, 0.22, BACK),                                                                     // the phone
    piece(3.05, -0.9, 1.38, 1.5, 3.1, 0.02, FORE),                                                                     // its screen
    pr(onScr(3.05, 0.0, 1.32, 0.9, 0.05, PIC), 'pw.m.room', room),
    pr(onScr(2.95, -0.66, 1.1, 0.22, 0.02, FORE), 'pw.m.h1a', words('A calm place', { size: 0.17, font: 'serif' }, 0.01)),
    pr(onScr(2.82, -0.9, 0.85, 0.22, 0.02, FORE), 'pw.m.h1b', words('to begin.', { size: 0.17, font: 'serif' }, 0.01)),
    pr(onScr(2.95, -1.14, 1.1, 0.12, 0.02, FORE), 'pw.m.p', words('Therapy in Portland and online.', { size: 0.065, a: 0.62 }, 0.01)),
    pr(onScr(2.83, -1.58, 0.86, 0.28, 0.06, BACK), 'pw.m.cta', label('Book a consult', { size: 0.08, weight: 600 })),
    onPh(3.05, 0.84, 0.36, 0.06, 0.02, FORE),                                                                          // its speaker
  ];
  F.questionnaire = makeForm([...questionnaire, ...hideAll(phone())], { yaw: -0.24, pitch: 0.14 }, { lift: kitLift, hold: 2.2, step: 0 });
  F.homepage = makeForm([...calm(false), ...hideAll(phone())], { yaw: -0.28, pitch: 0.18 }, { lift: kitLift, hold: 2.6, step: 1 });
  F.golive = makeForm([...calm(true), ...phone()], { yaw: -0.4, pitch: 0.2 }, { lift: [0.5, 0.2, 1.0], hold: 2.8, step: 2 });

  return F;
}

