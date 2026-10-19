import * as THREE from 'three';
import { KIND } from './blockLook';
import { definePrint, lock, qr, tick, type Draw, type Pen, type TextOpts } from './blockPrints';
import { bedroom, caller, cardFace, headphones, kitchen, landscape, living, openSign, room, street, waveform, waves } from './blockArt';

/**
 * What the pieces make (components/three/blockStory.ts draws and moves
 * them): the cube, and in every other chapter the thing the chapter is
 * about, built of soft, rounded pieces with what's on them printed
 * (blockPrints.ts), and on some screens a real film:
 *
 * - a launch site for "hush", a pair of headphones: its moodboard; the site
 *   on a laptop, its code written beside it; live on its domain, with its
 *   phone;
 * - "kova", a money app that already works, on a phone: its layers lifted
 *   off the screen in grey on a grid; then in colour and type, the tokens
 *   floating by; then pressed back into the screen, its mark popping out as
 *   the app's icon;
 * - the four Labs products, one after another (Strata's own film on a
 *   laptop);
 * - ideas as chat bubbles, floating; then the real thing one became, on a
 *   laptop playing its film;
 * - a listing's flyer, its five posts, its video;
 * - a therapist's questionnaire, the calm homepage made from it, live with
 *   its phone.
 */

export const N = 64;   // the scenes use as many as they need and put the rest away

// Materials (blockLook.ts draws them). FORE is glossy plastic in the colour
// that stands out from the page (white on black, ink on paper), BACK in the
// page's own; LIME lime plastic (PLAY with a play mark); PIC a picture, photo
// paper printed in ink on any page (a photo stays daylight); METAL brushed
// aluminium; GLASS frosted glass; CORE the cube's lime core, glowing. What's
// printed on a piece is in the colour that stands out from it.
export const K = KIND;
export const isLime = (k: number) => k === K.LIME || k === K.PLAY || k === K.CORE;

export type Vec = [number, number, number];
export type View = { yaw: number; pitch: number };
export type Piece = {
  p: Vec;
  s: Vec;
  q: THREE.Quaternion;
  k: number;
  r?: [number, number];   // its rounding: corners (x, y), edges (z); a sharp box to a sphere
  pr?: string;            // what's printed on its front
  media?: string;         // or the film on it (a video's address)
  g?: number;             // its group, when the form floats (a group bobs as one)
  spare?: boolean;
};
/** A piece's rounding unless it says. */
export const ROUND: [number, number] = [0.07, 0.07];
export type Form = {
  id: string;
  float: number;      // how far its parts bob, if they do
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
  o: { lift?: Vec; hold?: number; step?: number | null; order?: 'role' | 'bottom'; float?: number } = {},
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
    id: '',
    float: o.float ?? 0,
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

/** Rough width of words in units, before the fonts are in: for sizing the piece they're printed on. */
const wide = (s: string, size: number, em = 0.6) => s.length * size * em;

/* ---------------------------------------------------------------- shapes */

/** Round a piece: its corners (rxy) and edges (rz). */
const rd = (p: Piece, rxy: number, rz = rxy): Piece => {
  p.r = [rxy, rz];
  return p;
};
/** A pill: as round as its shortest side allows. */
const pill = (p: Piece): Piece => rd(p, Math.min(p.s[0], p.s[1]) / 2, p.s[2] / 2);
/** A ball. */
const ball = (x: number, y: number, z: number, d: number, k: number): Piece => rd(piece(x, y, z, d, d, d, k), d / 2, d / 2);
/** Show a film on a piece's front. */
const film = (p: Piece, url: string): Piece => {
  p.media = url;
  return p;
};
/** Put pieces in one floating group (g < 0: they don't float). */
const grp = (ps: Piece[], g: number): Piece[] => {
  for (const p of ps) p.g = g;
  return ps;
};
const AX = new THREE.Vector3(1, 0, 0), HV = new THREE.Vector3();
/** Turn pieces about a line along x at (y0, z0), like a laptop's lid on its hinge (ang < 0 leans back). */
const hinge = (ps: Piece[], y0: number, z0: number, ang: number): Piece[] => {
  const qa = new THREE.Quaternion().setFromAxisAngle(AX, ang);
  for (const p of ps) {
    HV.set(p.p[0], p.p[1] - y0, p.p[2] - z0).applyQuaternion(qa);
    p.p = [HV.x, HV.y + y0, HV.z + z0];
    p.q = qa.clone().multiply(p.q);
  }
  return ps;
};

export const FILMS = { strata: '/previews/strata-960.mp4', bidding: '/bidking-present.mp4' };   // the small cuts: a 3D screen is a few hundred pixels wide

// A laptop's keys and trackpad, printed on its deck (the deck's back edge at the top).
const keyboard = (rows = 5, cols = 13): Draw => (g) => {
  const kx = 0.32, ky = 0.18, kw = (g.w - kx * 2) / cols, kh = (g.h * 0.58 - ky) / rows;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (r === rows - 1 && c > 3 && c < cols - 4) continue;
    g.frame(kx + c * kw + 0.025, ky + r * kh + 0.025, kw - 0.05, kh - 0.05, 0.014, 'ink', 0.55, 0.04);
  }
  g.frame(kx + 4 * kw + 0.025, ky + (rows - 1) * kh + 0.025, (cols - 8) * kw - 0.05, kh - 0.05, 0.014, 'ink', 0.55, 0.04);
  g.frame(g.w / 2 - g.w * 0.17, g.h * 0.66, g.w * 0.34, g.h * 0.27, 0.016, 'ink', 0.55, 0.08);
};

/**
 * A laptop: an aluminium lid on its hinge leaning back, a screen in it (a film, or what's put
 * on it), the deck in front with its keys. Content for the screen is laid out upright at z
 * `front` and then leaned with the lid by `lean`.
 */
function laptop(o: { name: string; w: number; h: number; x?: number; y?: number; tilt?: number; depth?: number; screen?: number; film?: string }) {
  const { METAL, BACK } = K;
  const x = o.x ?? 0, y = o.y ?? 0, tilt = o.tilt ?? -0.17;
  const hingeY = y - (o.h + 0.5) / 2, D = o.depth ?? o.h * 0.72;
  const lid = rd(piece(x, y, 0, o.w + 0.5, o.h + 0.5, 0.24, METAL), 0.32, 0.1);
  const screen = rd(piece(x, y, 0.13, o.w, o.h, 0.02, o.screen ?? BACK), 0.1, 0.01);
  if (o.film) screen.media = o.film;
  const deck = pr(rd(piece(x, hingeY - 0.11, D / 2 + 0.05, o.w + 0.9, D, 0.22, METAL, 0, -Math.PI / 2), 0.3, 0.1), `${o.name}.keys`, keyboard());
  hinge([lid, screen], hingeY, 0, tilt);
  return { lid, screen, deck, front: 0.14, lean: (ps: Piece[]) => hinge(ps, hingeY, 0, tilt), hingeY, depth: D };
}

/** A phone: a frame, its screen; content goes on the screen at z `front`. */
function phoneParts(o: { x: number; y: number; z: number; w: number; h: number; frame?: number; screen?: number }) {
  const { METAL, FORE } = K;
  const body = rd(piece(o.x, o.y, o.z, o.w, o.h, 0.3, o.frame ?? METAL), Math.min(o.w, o.h) * 0.17, 0.13);
  const screen = rd(piece(o.x, o.y, o.z + 0.16, o.w - 0.18, o.h - 0.18, 0.02, o.screen ?? FORE), Math.min(o.w, o.h) * 0.14, 0.01);
  return { body, screen, front: o.z + 0.17 };
}

/** A chat bubble: a soft cushion with words on it, and a little round tail at one corner. */
function bubble(o: { x: number; y: number; z: number; w: number; h: number; k: number; name: string; text: string[]; size?: number; tail?: 'left' | 'right'; turn?: number }): Piece[] {
  const d = Math.min(0.46, o.h * 0.5);
  const body = rd(piece(o.x, o.y, o.z, o.w, o.h, d, o.k, o.turn ?? 0), Math.min(o.h / 2, 0.46), d / 2);
  const size = o.size ?? 0.17;
  pr(body, o.name, (g) => {
    const lh = size * 1.25, y0 = g.h / 2 - ((o.text.length - 1) * lh) / 2;
    o.text.forEach((s, i) => g.text(s, g.w / 2, y0 + i * lh, { ...fit(g, s, { size, weight: 500 }, g.w - 0.5), align: 'center', mid: true }));
  });
  const side = o.tail === 'right' ? 1 : -1;
  const c = Math.cos(o.turn ?? 0), sn = Math.sin(o.turn ?? 0);
  const tx = side * (o.w / 2 - 0.34), ty = -o.h / 2 - 0.06;
  const tail = ball(o.x + tx * c - ty * sn, o.y + tx * sn + ty * c, o.z - 0.02, 0.26, o.k);
  return [body, tail];
}

/* ------------------------------------------------------------------ forms */

export function buildForms(): Record<string, Form> {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const { FORE, BACK, PIC, METAL, GLASS, LIME, PLAY, CORE } = K;
  const F: Record<string, Form> = {};

  /* The cube: 3 × 3 × 3, rounded like a puzzle cube's pieces. At its heart a lime core, glowing.
     Its corners are brushed aluminium, its edges glossy plastic (white on black, ink on paper),
     and the middle of each face frosted glass, a window onto the core. It turns its layers. */
  const cube: Piece[] = [];
  for (let y = 0; y < 3; y++) for (let z = 0; z < 3; z++) for (let x = 0; x < 3; x++) {
    const middles = (x === 1 ? 1 : 0) + (y === 1 ? 1 : 0) + (z === 1 ? 1 : 0);   // 0 a corner, 1 an edge, 2 a face, 3 the core
    const k = [METAL, FORE, GLASS, CORE][middles];
    cube.push(rd(piece(x - 1, y - 1, z - 1, 0.93, 0.93, 0.93, k), 0.15));
  }
  F.cube = makeForm(cube, { yaw: -0.62, pitch: 0.4 }, { order: 'bottom', lift: [0, 0.8, 0.2] });
  // The cube's own blocks, loose and turned every which way (where the hero's gathering starts).
  F.scatter = makeForm(
    cube.map((c) => rd(piece((rnd() - 0.5) * 11, (rnd() - 0.5) * 7, (rnd() - 0.5) * 7, 0.93, 0.93, 0.93, c.k, (rnd() - 0.5) * 2, (rnd() - 0.5) * 2, (rnd() - 0.5) * 2), 0.15)),
    { yaw: -0.62, pitch: 0.4 },
  );

  /* Design service: a launch site for hush, a pair of headphones: its moodboard; the site on a
     laptop, its code written in a window in front; live on its domain, with its phone standing
     on the laptop's deck. On the paper chapter the site is dark, its words white. */
  const LT = 0.17;        // the laptop screen's face (laid out upright, then leaned with the lid)
  const onW = at(LT);
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
    if (sw === 'ring') g.ring(cx, cy, r - 0.018 * s, 0.035 * s, 'ink', 1);
    else g.dot(cx, cy, r, sw);
    g.text(name, cx + r + 0.16 * s, cy - 0.09 * s, { size: 0.15 * s, weight: 600, mid: true });
    g.text('$249', cx + r + 0.16 * s, cy + 0.15 * s, { size: 0.12 * s, mid: true, a: 0.55 });
  };
  const site = (live: boolean): Piece[] => {
    const lap = laptop({ name: 'hush', w: 8, h: 5.4, screen: FORE });
    const onScreen = [
      live ? pr(rd(onW(0.55, 2.28, 4.8, 0.38, 0.06, LIME), 0.19, 0.03), 'hush.url.live', address('hush.audio', true))
        : pr(rd(onW(0.55, 2.28, 4.8, 0.38, 0.06, BACK), 0.19, 0.03), 'hush.url.dev', address('localhost:3000', false)),   // 1 the address
      rd(onW(-3.55, 2.28, 0.2, 0.2, 0.06, BACK), 0.1, 0.03),                                                     // 2-4 the window's buttons
      rd(onW(-3.19, 2.28, 0.2, 0.2, 0.06, BACK), 0.1, 0.03),
      rd(onW(-2.83, 2.28, 0.2, 0.2, 0.06, BACK), 0.1, 0.03),
      pr(onW(-3.12, 1.55, 0.96, 0.36, 0.02, FORE), 'hush.logo', hushLogo),                                       // 5 the logo
      pr(onW(1.66, 1.55, 0.74, 0.26, 0.02, FORE), 'hush.nav1', label('Sound', NAV)),                             // 6-8 the menu
      pr(onW(2.45, 1.55, 0.74, 0.26, 0.02, FORE), 'hush.nav2', label('Design', NAV)),
      pr(onW(3.24, 1.55, 0.74, 0.26, 0.02, FORE), 'hush.nav3', label('Support', NAV)),
      pr(onW(-2.35, 0.86, 2.5, 0.54, 0.02, FORE), 'hush.h1a', words('Silence,', H1, 0.02)),                      // 9-10 the headline
      pr(onW(-1.8, 0.28, 3.6, 0.54, 0.02, FORE), 'hush.h1b', words('tuned to you.', H1, 0.02)),
      pr(onW(-1.9, -0.26, 3.4, 0.17, 0.02, FORE), 'hush.p1', words('Noise cancelling that learns the room you are in.', P, 0.02)),   // 11-12 text
      pr(onW(-1.9, -0.48, 3.4, 0.17, 0.02, FORE), 'hush.p2', words('Forty hours a charge. Ships in May.', P, 0.02)),
      pr(pill(onW(-2.95, -1.04, 1.3, 0.44, 0.14, live ? BACK : LIME)), 'hush.cta', label('Pre-order', BTN)),     // 13 the button
      pr(rd(onW(1.95, 0.2, 3.3, 2.2, 0.1, PIC), 0.14, 0.04), 'hush.hero', (g) => headphones(g)),                // 14 the picture
      pr(rd(onW(-2.47, -1.95, 2.25, 0.9, 0.1, BACK), 0.16, 0.05), 'hush.card1', colorway('Ink', 'ink')),          // 15-17 the colours it comes in
      pr(rd(onW(0, -1.95, 2.25, 0.9, 0.1, BACK), 0.16, 0.05), 'hush.card2', colorway('Chalk', 'ring')),
      pr(rd(onW(2.47, -1.95, 2.25, 0.9, 0.1, BACK), 0.16, 0.05), 'hush.card3', colorway('Lime', 'lime')),
    ];
    lap.lean(onScreen);
    return [lap.lid, ...onScreen];   // 0 the laptop's lid, 1-17 the site on its screen
  };
  const tail = (lapScreen: Piece, lapDeck: Piece, out: Piece[]) => {
    while (out.length < 27) out.push(spare());
    out[27] = lapScreen;   // 27 the screen
    out[28] = lapDeck;     // 28 the deck
    return out;
  };

  // The code, in an editor floating in front: ink for the words, grey for what's quoted and the punctuation.
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
    g.text('app/page.tsx', 0.2, 0.16, { size: 0.085, font: 'mono', mid: true, a: 0.5 });
    g.box(0, 0.31, g.w, 0.008, 'ink', 1);
    CODE.forEach((_, i) => g.text(String(i + 1), 0.34, 0.46 + i * 0.27, { size: 0.085, font: 'mono', mid: true, a: 0.3, align: 'right' }));
  };
  const codeLine = (s: string): Draw => (g) => {
    let x = 0.03;
    for (const t of s.match(/"[^"]*"|[A-Za-z]+|\s+|./g) ?? []) {
      const a = t.startsWith('"') ? 0.5 : /^[A-Za-z]/.test(t) ? 1 : 0.55;
      x += g.text(t, x, g.h / 2, { size: CS, font: 'mono', mid: true, a });
    }
  };
  const devLap = laptop({ name: 'hush', w: 8, h: 5.4, screen: FORE });
  const dev = site(false);
  dev.push(pr(rd(piece(2.4, -0.5, 1.6, 3.6, 2.7, 0.2, BACK), 0.18, 0.08), 'hush.editor', editor));   // 18 the editor
  const onE = at(1.7);
  CODE.forEach(([ind, s], i) => {
    const w = s.length * CS * 0.6 + 0.08, x = 0.92 + ind * 0.24;
    dev.push(pr(onE(x + w / 2 + 0.1, 0.39 - i * 0.27, w, 0.17, 0.02, BACK), `hush.code${i}`, codeLine(s)));   // 19-26 its lines
  });
  tail(devLap.screen, devLap.deck, dev);
  F.site = makeForm(dev, { yaw: -0.3, pitch: 0.22 }, { lift: [0, 0.25, 1.2], hold: 2.6, step: 1 });

  // Live: the address goes lime, behind a lock, and the code folds into the phone on the deck.
  const liveLap = laptop({ name: 'hush', w: 8, h: 5.4, screen: FORE });
  const live = site(true);
  const ph = phoneParts({ x: 3.75, y: -1.15, z: 2.2, w: 2.1, h: 3.9, frame: METAL, screen: BACK });
  const onS = at(ph.front);
  const MH1: TextOpts = { size: 0.18, font: 'head', track: -0.01 };
  const phoneBits = [
    ph.body,                                                                                                         // 18 the phone
    pill(at(ph.front)(3.75, 0.62, 0.46, 0.1, 0.02, FORE)),                                                        // 19 its speaker
    pr(rd(onS(3.75, -0.12, 1.62, 0.98, 0.05, PIC), 0.1, 0.02), 'hush.m.hero', (g) => headphones(g, 1.1)),           // 20 the picture
    pr(onS(3.42, -0.78, 1.0, 0.24, 0.02, BACK), 'hush.m.h1a', words('Silence,', MH1, 0.01)),                      // 21-22 the headline
    pr(onS(3.75, -1.03, 1.62, 0.24, 0.02, BACK), 'hush.m.h1b', words('tuned to you.', MH1, 0.01)),
    pr(onS(3.75, -1.28, 1.62, 0.12, 0.02, BACK), 'hush.m.p', words('Noise cancelling that learns the room.', { size: 0.07, a: 0.62 }, 0.01)),   // 23 text
    pr(pill(onS(3.37, -1.68, 0.9, 0.3, 0.06, FORE)), 'hush.m.cta', label('Pre-order', { size: 0.1, weight: 600 })),   // 24 the button
    pr(rd(onS(3.75, -2.38, 1.62, 0.6, 0.05, FORE), 0.12, 0.02), 'hush.m.card', colorway('Lime', 'lime', 0.66)),       // 25 a colour
    ph.screen,                                                                                                         // 26 its screen
  ];
  hinge(phoneBits, ph.body.p[1] - 1.95, ph.body.p[2], -0.08);
  live.push(...phoneBits);
  tail(liveLap.screen, liveLap.deck, live);
  F.live = makeForm(live, { yaw: -0.42, pitch: 0.24 }, { lift: [0.5, 0.2, 1.0], hold: 2.8, step: 2 });

  // The moodboard: pictures, the type, the colours and materials, the words for it, pinned to a board.
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
  const mood: Piece[] = new Array(29);
  mood[0] = rd(piece(0, 0, 0, 8.4, 5.6, 0.26, FORE), 0.22, 0.1);   // the board (it becomes the laptop)
  const pin = (i: number, x: number, y: number, w: number, h: number, k: number, rz: number, name?: string, draw?: Draw, r = 0.06) => {
    const p = rd(piece(x, y + 0.2, 0.13 + 0.05 + i * 0.003, w, h, 0.08, k, rz), r, 0.03);
    mood[i] = name && draw ? pr(p, name, draw) : p;
  };
  pin(14, -2.45, 0.6, 2.6, 3.0, PIC, -0.03, 'hush.mood.photo', (g) => headphones(g));   // a photograph (it becomes the picture)
  pin(18, 0.25, 1.35, 2.2, 1.45, PIC, 0.035, 'hush.mood.waves', waves);                 // another (it becomes the editor)
  pin(9, 2.85, 1.45, 1.9, 1.25, BACK, -0.04, 'hush.mood.type', specimen);                // the type (it becomes the headline)
  pin(10, 3.05, -0.25, 1.5, 1.1, METAL, 0.04, undefined, undefined, 0.16);               // the materials: aluminium
  pin(15, -0.25, -0.35, 1.5, 1.2, BACK, 0.05, 'hush.mood.ui', uiSample);                 // a button and a switch
  pin(16, 1.35, -0.3, 1.25, 1.05, BACK, -0.06, 'hush.mood.words', lines(['quiet,', 'warm,', 'a little bold.'], { size: 0.15, font: 'serif', italic: true }, 0.12, 0.3, 0.24));
  pin(17, -3.3, -1.95, 0.95, 0.95, GLASS, 0.06, undefined, undefined, 0.2);              // and frosted glass
  pin(1, -2.35, -1.95, 0.62, 0.62, BACK, -0.05, 'hush.chip.paper', chip('#F7F8F8'), 0.1);   // the colours
  pin(2, -1.61, -1.95, 0.62, 0.62, GLASS, 0.03, undefined, undefined, 0.16);
  pin(3, -0.87, -1.95, 0.62, 0.62, METAL, -0.02, undefined, undefined, 0.16);
  pin(4, -0.13, -1.95, 0.62, 0.62, BACK, 0.05, 'hush.chip.ink', chip('#121417', 1), 0.1);
  pin(13, 0.8, -1.85, 0.8, 0.8, LIME, 0.09, 'hush.chip.lime', chip('#B8FF00'), 0.14);   // the one lime chip (it becomes the button)
  pin(11, 1.85, -1.8, 1.05, 0.8, BACK, -0.05, 'hush.note1', lines(['no stock', 'photos'], { size: 0.13, weight: 500 }, 0.1, 0.27));
  pin(12, 3.1, -1.85, 1.35, 0.8, BACK, 0.04, 'hush.note2', lines(['launch in', 'May'], { size: 0.13, weight: 500 }, 0.1, 0.27));
  // Push pins, round and lime-headed one of them (they become the lines of code).
  const pushpin = (i: number, x: number, y: number) => {
    mood[i] = ball(x, y, 0.36, 0.22, i === 21 ? FORE : BACK);
  };
  pushpin(19, -3.55, 2.15);
  pushpin(20, -1.32, 2.15);
  pushpin(21, 0.25, 2.12);
  pushpin(22, 2.85, 2.12);
  pushpin(23, 1.35, 0.32);
  for (const i of [5, 6, 7, 8, 24, 25, 26]) mood[i] = hidden(dev[i].p);
  mood[27] = hidden(dev[27].p);
  mood[28] = hidden(dev[28].p);
  F.moodboard = makeForm(mood, { yaw: -0.2, pitch: 0.14 }, { lift: [0, 0.3, 1.0], hold: 2.2, step: 0 });

  /* Brand upgrade: kova, a money app that already works, on a phone. Its layers lifted off the
     screen and spread out in front of it, in outline on a grid; then in colour and type, closer
     in, the type and three colours floating by; then pressed back into the screen, the colours
     going into its mark, which pops out as the app's lime icon. */
  const KF = phoneParts({ x: 0, y: 0, z: 0, w: 2.6, h: 5.2 }).front;   // the phone screen's face
  const LAYERS: { y: number; h: number; d: number }[] = [
    { y: 1.86, h: 0.78, d: 0.07 },    // the greeting
    { y: 0.82, h: 1.06, d: 0.09 },    // the balance
    { y: -0.46, h: 1.36, d: 0.09 },   // the chart
    { y: -1.82, h: 1.06, d: 0.09 },   // the list
  ];
  const BARS = [0.42, 0.55, 0.48, 0.66, 0.58, 0.72, 0.6, 0.5, 0.64, 0.78, 0.7, 0.92];
  const kovaHead = (mark: boolean): Draw => (g) => {
    let x = 0.16;
    if (mark) {
      g.box(x, 0.16, 0.28, 0.28, 'lime', 1, 0.07);
      g.text('k', x + 0.14, 0.3, { size: 0.24, weight: 600, align: 'center', mid: true });
      x += 0.38;
    }
    g.text('kova', x, 0.3, { size: 0.2, weight: 600, track: -0.02, mid: true });
    g.dot(g.w - 0.3, 0.3, 0.14, 'ink');
    g.text('A', g.w - 0.3, 0.3, { size: 0.13, weight: 600, align: 'center', mid: true, ink: 'base' });
    g.text('Good morning, Ana', 0.16, 0.6, { size: 0.19, font: 'head', mid: true });
  };
  const kovaBalance: Draw = (g) => {
    g.text('Balance', 0.18, 0.24, { size: 0.1, weight: 500, mid: true, a: 0.55 });
    g.text('$48,210', 0.18, 0.56, { size: 0.36, font: 'head', mid: true });
    g.box(0.18, 0.8, 0.56, 0.17, 'lime', 1, 0.085);
    g.text('+4.2%', 0.46, 0.885, { size: 0.09, weight: 600, align: 'center', mid: true });
  };
  const kovaChart: Draw = (g) => {
    g.text('Spending', 0.18, 0.24, { size: 0.11, weight: 600, mid: true });
    BARS.forEach((v, i) => {
      const x = 0.2 + i * 0.145, bh = v * 0.8;
      g.box(x, 1.18 - bh, 0.09, bh, i === BARS.length - 1 ? 'lime' : 'ink', 1, 0.02);
    });
  };
  const kovaList: Draw = (g) => {
    [['Groceries', '−$84'], ['Studio rent', '−$1,200']].forEach(([n, a], i) => {
      const y = 0.3 + i * 0.44;
      g.dot(0.3, y, 0.12, 'ink', 1);
      g.text(n[0], 0.3, y, { size: 0.1, weight: 600, align: 'center', mid: true, ink: 'base' });
      g.text(n, 0.52, y, { size: 0.11, weight: 500, mid: true });
      g.text(a, g.w - 0.16, y, { size: 0.11, weight: 500, align: 'right', mid: true });
    });
  };
  const kovaWire = (i: number): Draw => (g) => {
    g.frame(0, 0, g.w, g.h, 0.018, 'ink', 1, 0.14);
    g.box(0.18, 0.22, 0.7 - i * 0.08, 0.026, 'ink', 1);
    g.frame(0.18, 0.4, g.w - 0.36, g.h - 0.6, 0.016, 'ink', 1, 0.06);
  };
  const kovaGrid: Draw = (g) => {
    const cols = 4, gut = 0.12, m = 0.16, cw = (g.w - m * 2 - gut * (cols - 1)) / cols;
    for (let i = 0; i < cols; i++) g.box(m + i * (cw + gut), 0.3, cw, g.h - 0.5, 'lime', 0.24, 0.04);
  };
  const DRAWS = [kovaHead, () => kovaBalance, () => kovaChart, () => kovaList];
  const kova = (st: 0 | 1 | 2): Piece[] => {
    const out: Piece[] = [];
    const ps = phoneParts({ x: 0, y: 0, z: 0, w: 2.6, h: 5.2, frame: METAL, screen: FORE });
    out.push(grp([ps.body], 1)[0]);                                                                       // 0 the phone
    out.push(grp([st === 0 ? pr(ps.screen, 'kova.grid', kovaGrid, 60) : pr(ps.screen, 'kova.screen', (g) => {
      g.text('9:41', 0.3, 0.18, { size: 0.09, weight: 600, mid: true });
      g.box(g.w - 0.5, 0.15, 0.24, 0.07, 'ink', 1, 0.03);
    })], 1)[0]);                                                                                          // 1 its screen
    const lift = st === 0 ? [1.6, 1.2, 0.8, 0.4] : st === 1 ? [0.9, 0.68, 0.45, 0.22] : [0, 0, 0, 0];
    LAYERS.forEach((L, i) => {
      const z = KF + L.d / 2 + 0.01 + lift[i];
      const card = rd(piece(0, L.y, z, 2.22, L.h, L.d, FORE, 0, st === 2 ? 0 : -0.06 * (i + 1), 0), 0.16, L.d / 2);
      const name = st === 0 ? `kova.w${i}` : i === 0 ? `kova.head${st === 2 ? '.mark' : ''}` : `kova.l${i}`;
      const draw = st === 0 ? kovaWire(i) : i === 0 ? kovaHead(st === 2) : DRAWS[i](false);
      out.push(grp([pr(card, name, draw)], st === 2 ? 1 : 2 + i)[0]);
    });                                                                                                   // 2-5 its layers
    // the tokens: the type, and three colours
    const type = pr(rd(piece(-2.25, 1.15, 1.1, 1.05, 1.05, 0.34, FORE, 0.12, 0.1, 0.32), 0.26, 0.14), 'kova.type', (g) => {
      g.text('Aa', g.w / 2, g.h * 0.5, { size: 0.5, font: 'head', align: 'center', mid: true });
    });
    const dots = [ball(2.05, 1.55, 1.0, 0.62, FORE), ball(2.4, 0.55, 0.45, 0.5, BACK), ball(1.95, -0.4, 1.3, 0.56, LIME)];
    const icon = pr(rd(piece(-1.85, 2.2, 1.6, 1.3, 1.3, 0.44, LIME, 0.16, -0.18, 0.42), 0.36, 0.17), 'kova.icon', label('k', { size: 0.92, weight: 600 }));
    if (st === 0) out.push(hidden(type.p), ...dots.map((d) => hidden(d.p)));
    else if (st === 1) out.push(...grp([type], 7), ...dots.map((d, i) => grp([d], 8 + i)[0]));
    else out.push(hidden([-0.3, 1.9, KF + 0.1]), hidden(icon.p), hidden(icon.p), grp([icon], 12)[0]);   // 6-9 type, colours (the lime one becomes the icon)
    return out;
  };
  const brandLift: Vec = [0, 0.4, 0.8];
  F.grid = makeForm(kova(0), { yaw: 0.66, pitch: 0.3 }, { lift: brandLift, hold: 2.2, step: 0, float: 0.06 });
  F.colortype = makeForm(kova(1), { yaw: 0.4, pitch: 0.22 }, { lift: brandLift, hold: 2.6, step: 1, float: 0.06 });
  F.mark = makeForm(kova(2), { yaw: 0.18, pitch: 0.14 }, { lift: brandLift, hold: 2.8, step: 2, float: 0.05 });

  /* Labs: the four products, one after another, as the list names them. Strata is its own film,
     playing on a laptop, its parts floating out of the screen; AI Bidding a card table; the two
     on the way are drawn in the page's own colour, like parts not yet painted, tagged SOON. */
  const onL = at(0.15);
  const TTL: TextOpts = { size: 0.24, weight: 600, track: -0.02 };
  const labWin = (k: number) => rd(piece(0, 0, 0, 7.6, 4.6, 0.3, k), 0.3, 0.12);
  const titleW = (s: string) => wide(s, 0.24, 0.58) + 0.1;
  const title = (s: string, k: number = FORE) => pr(onL(-3.6 + titleW(s) / 2, 1.95, titleW(s), 0.36, 0.02, k), `lab.title.${s}`, words(s, TTL, 0.04));
  const soon = (s: string) => pr(pill(onL(-3.6 + titleW(s) + 0.12 + 0.37, 1.95, 0.74, 0.3, 0.08, FORE)), 'lab.soon', label('SOON', { size: 0.1, weight: 600, track: 0.14 }));

  // Strata: the laptop with Strata's film; out of the screen float its colours, its type, a part, a token.
  const strataParts = (): Piece[] => {
    const lap = laptop({ name: 'strata', w: 7.0, h: 3.4, y: 0.5, film: FILMS.strata, depth: 2.7 });
    return [
      grp([lap.lid], -1)[0],                                                                                 // 0 the laptop
      grp([lap.screen], -1)[0],                                                                              // 1 its screen, the film
      grp([lap.deck], -1)[0],                                                                                // 2 its deck
      grp([ball(-3.35, 2.35, 1.5, 0.62, LIME)], 3)[0],                                                       // 3-5 colours
      grp([ball(-2.55, 2.85, 0.9, 0.46, FORE)], 4)[0],
      grp([ball(3.45, 2.45, 1.3, 0.54, BACK)], 5)[0],
      grp([pr(rd(piece(3.4, 1.05, 1.9, 1.0, 1.0, 0.32, FORE, -0.14, 0.1, -0.35), 0.25, 0.14), 'lab.aa', (g) => {
        g.text('Aa', g.w / 2, g.h / 2, { size: 0.46, font: 'head', align: 'center', mid: true });
      })], 6)[0],                                                                                            // 6 the type
      grp([pr(pill(piece(2.9, -0.55, 2.3, 1.8, 0.48, 0.2, LIME, 0.06, 0, -0.25)), 'lab.cta', label('Get started', { size: 0.15, weight: 600 }))], 7)[0],   // 7 a part
      grp([pr(rd(piece(-2.85, -0.35, 2.1, 2.3, 0.62, 0.12, FORE, -0.05, 0, 0.25), 0.14, 0.06), 'lab.token', (g) => {
        const w = g.text('--accent: ', 0.18, g.h / 2, { size: 0.13, font: 'mono', mid: true, a: 0.5 });
        g.text('#B8FF00;', 0.18 + w, g.h / 2, { size: 0.13, font: 'mono', mid: true });
      })], 8)[0],                                                                                            // 8 a token
    ];
  };
  F.strata = makeForm(strataParts(), { yaw: -0.3, pitch: 0.2 }, { lift: [0, 0.3, 1.0], hold: 2.6, step: 0, float: 0.09 });

  // AI Bidding: a table; your aces; the model reading the bluff; fold, bid, or all in.
  const cardBack: Draw = (g) => {
    g.box(0.07, 0.07, g.w - 0.14, g.h - 0.14, 'ink', 1, 0.06);
    g.frame(0.13, 0.13, g.w - 0.26, g.h - 0.26, 0.02, 'base', 1, 0.04);
    g.box(g.w / 2 - 0.09, g.h / 2 - 0.09, 0.18, 0.18, 'lime', 1, 0.03);
  };
  const card = (x: number, y: number, rz: number, k: number, name?: string, draw?: Draw) => {
    const p = rd(piece(x, y, 0.15 + 0.03 + 0.01, 0.82, 1.15, 0.06, k, rz), 0.09, 0.03);
    return name && draw ? pr(p, name, draw) : p;
  };
  const coin = (x: number, y: number, z: number) => rd(piece(x, y, z, 0.56, 0.56, 0.1, BACK), 0.28, 0.05);
  const bidding = (): Piece[] => [
    pr(rd(piece(0, 0, 0, 7.6, 4.6, 0.3, FORE), 0.6, 0.14), 'lab.table', (g) => {
      g.shape((c) => c.ellipse(g.w / 2 + 0.55, g.h / 2 - 0.05, 2.25, 1.95, 0, 0, Math.PI * 2), 'ink', 1, 0.02);
    }, 40),                                                                                                          // 0 the table
    title('AI Bidding'),                                                                                             // 1
    pr(pill(onL(3.05, 1.95, 1.15, 0.4, 0.08, BACK)), 'lab.pot', label('Pot $120', { size: 0.13, weight: 600 })),     // 2 the pot
    pr(rd(onL(-2.55, -0.35, 1.9, 2.1, 0.08, BACK), 0.18, 0.04), 'lab.model', (g) => {
      g.text('The model reads', 0.16, 0.26, { size: 0.1, weight: 500, mid: true, a: 0.55 });
      g.text('Bluff', 0.16, 0.6, { size: 0.26, font: 'head', mid: true });
      g.text('72%', 0.16, 1.08, { size: 0.5, font: 'head', mid: true });
      g.frame(0.16, 1.45, g.w - 0.32, 0.08, 0.014, 'ink', 1, 0.04);
      g.box(0.16, 1.45, (g.w - 0.32) * 0.72, 0.08, 'ink', 1, 0.04);
      g.text('Your hand looks strong.', 0.16, 1.78, { size: 0.085, mid: true, a: 0.6 });
    }),                                                                                                              // 3 the model
    card(0.3, 1.15, 0.05, BACK, 'lab.cardBack', cardBack),                                                           // 4-5 their cards, face down
    card(1.18, 1.15, -0.04, BACK, 'lab.cardBack', cardBack),
    card(-0.05, -0.2, 0, BACK, 'lab.cardQ', (g) => cardFace(g, 'Q', 'heart')),                                       // 6-8 on the table
    card(0.88, -0.2, 0, BACK, 'lab.card10', (g) => cardFace(g, '10', 'diamond')),
    card(1.81, -0.2, 0, BACK, 'lab.card7', (g) => cardFace(g, '7', 'club')),
    card(0.42, -1.6, 0.07, BACK, 'lab.cardA1', (g) => cardFace(g, 'A', 'spade')),                                   // 9-10 your hand
    card(1.3, -1.6, -0.05, BACK, 'lab.cardA2', (g) => cardFace(g, 'A', 'diamond')),
    pr(pill(onL(3.02, -0.72, 1.15, 0.42, 0.1, BACK)), 'lab.fold', label('Fold', { size: 0.13, weight: 600 })),      // 11-13 what you do
    pr(pill(onL(3.02, -1.24, 1.15, 0.42, 0.1, BACK)), 'lab.bid', label('Bid $40', { size: 0.13, weight: 600 })),
    pr(pill(onL(3.02, -1.76, 1.15, 0.42, 0.16, LIME)), 'lab.allin', label('All in', { size: 0.13, weight: 600 })),
    coin(-1.0, -1.5, 0.22),                                                                                         // 14-16 chips, a stack of them
    coin(-0.97, -1.44, 0.33),
    coin(-1.02, -1.38, 0.44),
  ];
  F.bidding = makeForm(bidding(), { yaw: -0.3, pitch: 0.22 }, { lift: [0, 0.3, 1.0], hold: 2.6, step: 1 });

  // TTS Editor: a voice, its script with the pauses and the pitch marked, three dials.
  const SCRIPT: [string, string][] = [['Welcome back.', 'pause 0.6s'], ['Today we take it slow,', 'pitch +2'], ['and say it like we mean it.', 'warm']];
  const SLIDERS: [string, number][] = [['Pitch', 0.35], ['Pace', 0.6], ['Warmth', 0.8]];
  const tts = (): Piece[] => {
    const out: Piece[] = [labWin(BACK), title('TTS Editor', BACK), soon('TTS Editor')];                              // 0-2
    out.push(pr(rd(onL(0, 0.95, 7.0, 0.95, 0.06, BACK), 0.16, 0.03), 'lab.wave', (g) => {
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
      out.push(pr(pill(onL(x + w / 2, 0.02 - i * 0.44, w, 0.3, 0.08, FORE)), `lab.mark${i}`, label(mark, { size: 0.11, weight: 500 })));
    });                                                                                                              // 7-9 what's marked
    SLIDERS.forEach(([s], i) => {
      out.push(pr(rd(onL(-2.45 + i * 2.45, -1.72, 2.2, 0.66, 0.03, BACK), 0.12, 0.015), `lab.slider${i}`, (g) => {
        g.text(s, 0.1, 0.18, { size: 0.1, weight: 500, mid: true, a: 0.6 });
        g.box(0.1, 0.45, g.w - 0.2, 0.016, 'ink', 1);
      }));
    });                                                                                                              // 10-12 three dials
    SLIDERS.forEach(([, v], i) => out.push(ball(-2.45 + i * 2.45 - 1.0 + v * 2.0, -1.86, 0.15 + 0.16, 0.26, FORE)));   // 13-15 their knobs
    return out;
  };
  F.tts = makeForm(tts(), { yaw: -0.3, pitch: 0.18 }, { lift: [0, 0.3, 1.0], hold: 2.6, step: 2 });

  // Interview Assistant: the call, the words as they're said, and hints for what to ask next.
  const HINTS: [string, string][] = [['ASK', 'What did you measure?'], ['FOLLOW UP', 'How big was the team?'], ['NOTE', 'Led the rebuild.']];
  const interview = (): Piece[] => {
    const tileFront = 0.15 + 0.06 + 0.01;
    const onT = at(tileFront);
    const out: Piece[] = [labWin(BACK), title('Interview Assistant', BACK), soon('Interview Assistant')];          // 0-2
    out.push(pr(rd(onL(-1.35, 0, 4.5, 2.9, 0.06, FORE), 0.2, 0.03), 'lab.call', (g) => caller(g, g.w * 0.46)));     // 3 the call
    out.push(pr(rd(onT(0.25, -0.95, 1.0, 0.72, 0.06, BACK), 0.12, 0.03), 'lab.you', (g) => {
      caller(g, g.w * 0.5);
      g.text('You', 0.08, g.h - 0.1, { size: 0.08, weight: 600, mid: true, ink: 'base' });
    }));                                                                                                             // 4 you
    out.push(pr(pill(onT(-2.85, -1.18, 1.3, 0.3, 0.04, FORE)), 'lab.name', label('Sam, candidate', { size: 0.11, weight: 500 })));   // 5 their name
    out.push(pr(rd(onL(-1.35, -1.86, 4.5, 0.42, 0.03, BACK), 0.16, 0.015), 'lab.caption', words('“…so we rebuilt onboarding in two weeks.”', { size: 0.13, a: 0.8 }, 0.1)));   // 6 what they said
    out.push(pr(pill(onL(3.1, 1.95, 1.0, 0.34, 0.06, BACK)), 'lab.rec', (g) => {
      g.dot(0.22, g.h / 2, 0.06, 'ink');
      g.text('12:48', 0.36, g.h / 2, { size: 0.12, weight: 500, mid: true });
    }));                                                                                                             // 7 the clock
    HINTS.forEach(([lab, s], i) => {
      out.push(pr(rd(onL(2.4, 0.85 - i * 0.9, 2.4, 0.76, 0.08, BACK), 0.2, 0.04), `lab.hint${i}`, (g) => {
        g.text(lab, 0.18, 0.24, { size: 0.075, weight: 600, mid: true, a: 0.5, track: 0.1 });
        g.text(s, 0.18, 0.5, { size: 0.13, weight: 500, mid: true });
      }));
    });                                                                                                              // 8-10 hints
    return out;
  };
  F.interview = makeForm(interview(), { yaw: -0.3, pitch: 0.18 }, { lift: [0, 0.3, 1.0], hold: 2.6, step: 3 });

  // The Strata page: one image in; the colours and type taken out of it; the system, on a laptop.
  const sys = strataParts();
  const IMG = pr(rd(piece(0, 0, 0.3, 3.4, 4.2, 0.12, PIC), 0.16, 0.06), 'lab.image.big', landscape);
  const imgSmall = pr(rd(piece(-2.7, 0.3, 0.4, 2.3, 2.85, 0.12, PIC), 0.14, 0.06), 'lab.image.small', landscape);
  F.strataImage = makeForm([...hideAll(sys), IMG], { yaw: -0.24, pitch: 0.12 }, { lift: [0, 0.3, 1.0], hold: 1.8, float: 0.03 });
  F.strataTokens = makeForm([...hideAll(sys.slice(0, 3)), ...sys.slice(3), imgSmall], { yaw: -0.28, pitch: 0.14 }, { lift: [0, 0.3, 1.0], hold: 2.0, float: 0.09 });
  F.strataSystem = makeForm([...strataParts(), hidden([0, 0.5, 0.2])], { yaw: -0.3, pitch: 0.2 }, { lift: [0, 0.3, 1.0], hold: 2.8, float: 0.09 });

  /* About: ideas as chat bubbles, floating, a thought cloud among them, one of them still being
     typed; then pulled back to the ground: the real thing the lime one became, on a laptop
     playing its film, the bubble pinned beside it. */
  const about = (biz: boolean) => {
    const T = biz
      ? { lime: ['a site as calm', 'as my office?'], ideas: [['flyers ready', 'in 48 hours'], ['my listing,', 'on Instagram'], ['a site that', 'books for me'], ['a menu that', 'talks back'], ['a calmer', 'waiting room']] }
      : { lime: ['what if poker had', 'an AI that bluffs?'], ideas: [['a voice you', 'can edit'], ['moodboard in,', 'system out'], ['hints during', 'an interview'], ['flyers in', '48 hours'], ['a calmer', 'clinic site']] };
    const tag = biz ? 'about.biz' : 'about';
    const lap = laptop({ name: 'about', w: 6.4, h: 3.5, y: 0.2, depth: 2.6, film: biz ? undefined : FILMS.bidding });
    if (biz) pr(lap.screen, 'about.biz.screen', (g) => {
      // the calm practice homepage, as it went live
      g.box(0, 0, g.w, g.h, 'ink', 1);
      g.shape((c) => c.ellipse(0.3, 0.32, 0.05, 0.11, 0.6, 0, Math.PI * 2), 'lime');
      g.text('Willow', 0.44, 0.32, { size: 0.2, font: 'serif', mid: true, ink: 'base' });
      g.text('A calm place', 0.3, 1.2, { size: 0.4, font: 'serif', mid: true, ink: 'base' });
      g.text('to begin.', 0.3, 1.7, { size: 0.4, font: 'serif', mid: true, ink: 'base' });
      g.box(0.3, 2.3, 1.5, 0.4, 'lime', 1, 0.2);
      g.text('Book a consult', 1.05, 2.5, { size: 0.13, weight: 600, align: 'center', mid: true });
      g.box(g.w - 2.9, 0.7, 2.5, 2.4, 'base', 1, 0.12);
      room(g.sub(g.w - 2.75, 0.85, 2.2, 2.1));   // its picture: the room you'd sit in
    });
    const real = [grp([lap.lid], -1)[0], grp([lap.screen], -1)[0], grp([lap.deck], -1)[0]];
    // the bubbles, floating
    const spots: [number, number, number, number, number][] = [
      [-2.6, 1.7, 0.6, 2.3, 0.0], [2.5, 2.0, -0.4, 2.1, 0.06], [-3.0, -0.6, 0.2, 2.2, -0.05],
      [2.7, -0.2, 0.8, 2.1, 0.04], [0.2, -1.9, 0.4, 1.9, -0.03],
    ];
    const ideas = T.ideas.map(([a, b], i) => {
      const [x, y, z, w, turn] = spots[i];
      return grp(bubble({ x, y, z, w, h: 0.95, k: i === 2 ? BACK : FORE, name: `${tag}.idea${i}`, text: [a, b], tail: i % 2 ? 'right' : 'left', turn }), 10 + i);
    });
    const yours = grp(bubble({ x: -0.1, y: 0.35, z: 1.4, w: 2.8, h: 1.05, k: LIME, name: `${tag}.yours`, text: T.lime, size: 0.19, turn: 0.04 }), 20);
    // still being typed: a bubble with three dots
    const typing = grp([pill(piece(1.2, 1.15, 1.9, 1.05, 0.5, 0.3, FORE)), ball(0.92, 1.15, 2.07, 0.13, BACK), ball(1.2, 1.15, 2.07, 0.13, BACK), ball(1.48, 1.15, 2.07, 0.13, BACK)], 21);
    // a thought cloud
    const cloud = grp([ball(-1.2, 2.6, -0.8, 0.7, FORE), ball(-0.65, 2.75, -0.7, 0.55, FORE), ball(-1.7, 2.45, -0.75, 0.5, FORE), ball(-0.6, 2.25, -0.4, 0.2, FORE), ball(-0.3, 2.0, -0.2, 0.12, FORE)], 22);
    const dream = [...hideAll(real), ...yours, ...ideas.flat(), ...typing, ...cloud];
    // pulled back to the ground: the laptop; the lime bubble pinned at its corner; the rest gone into the screen
    const into: Vec = [0, 0.2, 0.3];
    const pinned = grp(bubble({ x: -3.2, y: 3.0, z: 1.2, w: 2.8, h: 1.05, k: LIME, name: `${tag}.yours`, text: T.lime, size: 0.19, tail: 'right', turn: -0.05 }), 20);
    const realForm = [...real, ...pinned, ...hideAll(ideas.flat(), into), ...hideAll(typing, into), ...hideAll(cloud, into)];
    return { dream, real: realForm };
  };
  const ab = about(false), abBiz = about(true);
  F.dream = makeForm(ab.dream, { yaw: -0.28, pitch: 0.12 }, { lift: [0, 0.6, 0.6], hold: 2.4, float: 0.16 });
  F.real = makeForm(ab.real, { yaw: -0.36, pitch: 0.22 }, { lift: [0, 0.6, 0.6], hold: 3.0, float: 0.05 });
  F.dreamBiz = makeForm(abBiz.dream, { yaw: -0.28, pitch: 0.12 }, { lift: [0, 0.6, 0.6], hold: 2.4, float: 0.16 });
  F.realBiz = makeForm(abBiz.real, { yaw: -0.36, pitch: 0.22 }, { lift: [0, 0.6, 0.6], hold: 3.0, float: 0.05 });

  /* Listing kit: the print flyer for 1428 Alder Street, then its five posts beside it, then its
     video. On the paper chapter the flyer is ink, its words white, its pictures paper. */
  const fz = (dx: number, z0: number) => (x: number, y: number, w: number, h: number, d: number, k: number) => piece(dx + x, y, z0 + d / 2 + 0.01, w, h, d, k);
  const FLY: TextOpts = { size: 0.13, weight: 500 };
  // `price` LIME: the price picked out to be edited; `sun`: the open house moved, after a round of changes
  const flyer = (dx: number, tagK: number, o: { price?: number; sun?: boolean } = {}): Piece[] => {
    const fo = fz(dx, 0.08), onPhoto = fz(dx, 0.15);
    return [
      rd(piece(dx, 0, 0, 3.2, 4.4, 0.16, FORE), 0.08, 0.05),                                                              // 0 the sheet
      pr(rd(fo(0, 0.75, 2.8, 2.2, 0.06, PIC), 0.05, 0.02), 'lk.house', (g) => street(g)),                                  // 1 the house
      pr(pill(onPhoto(-0.75, 1.6, 1.15, 0.32, 0.1, tagK)), 'lk.tag', label('JUST LISTED', { size: 0.1, weight: 600, track: 0.1 })),   // 2 Just Listed
      pr(fo(-0.2, -0.66, 2.4, 0.34, 0.02, FORE), 'lk.addr', words('1428 Alder Street', { size: 0.25, font: 'head' }, 0.02)),     // 3 the address
      pr(fo(-0.8, -1.06, 1.2, 0.3, 0.02, o.price ?? FORE), 'lk.price', words('$849,000', { size: 0.22, font: 'head' }, 0.02)),   // 4 the price
      pr(fo(-0.4, -1.42, 2.0, 0.18, 0.02, FORE), 'lk.facts', words('3 bd   2 ba   1,850 sq ft', FLY, 0.02)),                   // 5-6 details
      o.sun
        ? pr(fo(-0.4, -1.66, 2.0, 0.18, 0.02, FORE), 'lk.open.sun', words('Open house Sun, 1 to 4', { ...FLY, a: 0.62 }, 0.02))
        : pr(fo(-0.4, -1.66, 2.0, 0.18, 0.02, FORE), 'lk.open', words('Open house Sat, 1 to 4', { ...FLY, a: 0.62 }, 0.02)),
      pr(rd(fo(1.0, -1.5, 0.62, 0.62, 0.06, BACK), 0.06, 0.03), 'lk.qr', (g) => qr(g, 0.06, 0.06, g.w - 0.12, 11)),          // 7 the code to scan
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
      rd(piece(x, y, 0, 1.4, 1.4, 0.12, FORE), 0.14, 0.05),
      pr(rd(piece(x, y + 0.14, 0.1, 1.24, 0.9, 0.06, PIC), 0.07, 0.02), `lk.post${i}`, draw),
      pr(piece(x, y - 0.5, 0.075, 1.24, 0.22, 0.02, FORE), `lk.cap${i}`, words(cap, { size: 0.1, weight: 500 }, 0.02)),
    ]);
  const VIDEO: Vec = [1.6, 0.3, 0];
  const video = (): Piece[] => [
    rd(piece(1.6, 0.2, 0, 4.4, 2.48, 0.14, FORE), 0.18, 0.06),                                                 // the frame
    pr(rd(piece(1.6, 0.3, 0.11, 4.1, 1.95, 0.06, PIC), 0.08, 0.02), 'lk.film', (g) => {
      street(g, { s: g.h * 0.95, gy: g.h * 0.82 });
      g.text('1428 Alder Street', 0.18, g.h - 0.16, { size: 0.15, font: 'head', mid: true, ink: 'base' });
      g.text('0:30', g.w - 0.16, 0.18, { size: 0.1, weight: 600, align: 'right', mid: true });
    }),                                                                                                       // the film
    rd(piece(1.6, 0.3, 0.24, 0.72, 0.72, 0.18, PLAY), 0.36, 0.09),                                            // play, a round button
    pr(pill(piece(1.6, -0.82, 0.1, 4.1, 0.08, 0.04, BACK)), 'lk.progress', (g) => g.box(0, 0, g.w * 0.36, g.h, 'lime', 1, g.h / 2)),   // how far it's played
  ];
  const kitLift: Vec = [0, 0.3, 1.0];
  F.flyer = makeForm([...flyer(0, LIME), ...hideAll(posts()), ...hideAll(video(), VIDEO)], { yaw: -0.24, pitch: 0.14 }, { lift: kitLift, hold: 2.2, step: 0 });
  F.posts = makeForm([...flyer(-2.6, LIME), ...posts(), ...hideAll(video(), VIDEO)], { yaw: -0.22, pitch: 0.14 }, { lift: kitLift, hold: 2.4, step: 1 });
  F.video = makeForm([...flyer(-2.6, BACK), ...hideAll(posts(), VIDEO), ...video()], { yaw: -0.26, pitch: 0.14 }, { lift: kitLift, hold: 2.6, step: 2 });

  /* The listing kit's own page. Its top: the kit whole, floating: the flyer, posts around it, the
     reel on a phone. Then what you get, one at a time as you scroll: the flyer; its five posts;
     the reel; the flyer open to edit (the price picked out in lime, its field in the editor);
     one round of changes (asked, done, and the open house moved to Sunday on the flyer). */
  const YA = new THREE.Vector3(0, 1, 0);
  /** Pieces moved by d and turned about the y axis by ang, through where their first piece lands. */
  const place = (ps: Piece[], d: Vec, ang = 0): Piece[] => {
    const qa = new THREE.Quaternion().setFromAxisAngle(YA, ang);
    const cx = ps[0].p[0] + d[0], cz = ps[0].p[2] + d[2];
    return ps.map((p) => {
      HV.set(p.p[0] + d[0] - cx, p.p[1] + d[1], p.p[2] + d[2] - cz).applyQuaternion(qa);
      return { ...p, p: [HV.x + cx, HV.y, HV.z + cz] as Vec, q: qa.clone().multiply(p.q) };
    });
  };
  // The reel: vertical, on a phone, playing.
  const reel = (x: number, y: number, z: number): Piece[] => {
    const ph = phoneParts({ x, y, z, w: 2.3, h: 4.6, frame: METAL, screen: PIC });
    const on = at(ph.front);
    pr(ph.screen, 'lk.reel', (g) => {
      street(g, { s: g.w * 0.55, gy: g.h * 0.6 });
      g.text('1428 Alder Street', 0.16, g.h - 0.62, { size: 0.17, font: 'head', mid: true });
      g.text('3 bd, 2 ba, open Sat', 0.16, g.h - 0.38, { size: 0.1, weight: 500, mid: true, a: 0.62 });
    });
    return [
      ph.body,                                                                                                   // the phone
      ph.screen,                                                                                                 // the reel on it
      rd(on(x, y + 0.25, 0.8, 0.8, 0.2, PLAY), 0.4, 0.1),                                                         // play
      pr(pill(on(x - 0.45, y + 1.78, 0.95, 0.26, 0.06, FORE)), 'lk.reel.tag', label('REEL  0:30', { size: 0.08, weight: 600, track: 0.08 })),   // its length
      pr(pill(on(x, y - 2.0, 1.8, 0.07, 0.03, BACK)), 'lk.reel.bar', (g) => g.box(0, 0, g.w * 0.42, g.h, 'lime', 1, g.h / 2)),   // how far it's played
      pill(on(x, y + 2.08, 0.5, 0.07, 0.02, BACK)),                                                              // its speaker
    ];
  };
  // The editor beside the flyer: its two fields you'd change yourself.
  const input = (s: string, caret = false): Draw => (g) => {
    g.frame(0, 0, g.w, g.h, 0.014, 'ink', 1, 0.08);
    const w = g.text(s, 0.14, g.h / 2, { size: 0.15, mid: true });
    if (caret) g.box(0.14 + w + 0.03, g.h * 0.22, 0.02, g.h * 0.56, 'ink', 1);
  };
  const tools: Draw = (g) => {
    g.text('T', 0.04, g.h / 2, { size: 0.2, font: 'head', mid: true });
    g.frame(0.34, 0.05, g.h - 0.1, g.h - 0.1, 0.014, 'ink', 1, 0.03);
    g.dot(0.86, g.h / 2, 0.08, 'ink');
    g.dot(1.08, g.h / 2, 0.08, 'lime');
    g.ring(1.3, g.h / 2, 0.075, 0.014, 'ink');
  };
  const editPanel = (x: number, y: number): Piece[] => {
    const on = at(0.13), ED: TextOpts = { size: 0.11, weight: 500, a: 0.55 };
    return [
      rd(piece(x, y, 0, 2.7, 3.7, 0.24, FORE), 0.2, 0.09),                                                        // the panel
      pr(on(x - 0.2, y + 1.45, 2.1, 0.32, 0.02, FORE), 'lk.ed.title', words('Edit your flyer', { size: 0.2, font: 'head' }, 0.02)),
      pr(on(x - 0.55, y + 0.88, 1.4, 0.16, 0.02, FORE), 'lk.ed.l1', words('Price', ED, 0.02)),                    // the price, being typed
      pr(rd(on(x, y + 0.52, 2.3, 0.44, 0.04, FORE), 0.1, 0.02), 'lk.ed.v1', input('$849,000', true)),
      pr(on(x - 0.55, y - 0.06, 1.4, 0.16, 0.02, FORE), 'lk.ed.l2', words('Open house', ED, 0.02)),               // the open house
      pr(rd(on(x, y - 0.42, 2.3, 0.44, 0.04, FORE), 0.1, 0.02), 'lk.ed.v2', input('Sat, 1 to 4')),
      pr(on(x, y - 1.0, 2.3, 0.3, 0.02, FORE), 'lk.ed.tools', tools),                                             // type, a picture, colours
      pr(pill(on(x + 0.55, y - 1.52, 1.0, 0.36, 0.12, BACK)), 'lk.ed.save', label('Save', { size: 0.13, weight: 600 })),
    ];
  };
  // One round of changes: asked, and done.
  const chat = (x: number, y: number): Piece[] => [
    ...grp(bubble({ x, y: y + 0.85, z: 0.3, w: 3.0, h: 1.0, k: FORE, name: 'lk.ask', text: ['Can the open house', 'say Sunday instead?'], tail: 'left', turn: 0.04 }), 10),
    ...grp(bubble({ x: x + 0.4, y: y - 0.6, z: 0.7, w: 2.6, h: 0.95, k: LIME, name: 'lk.done', text: ['Done. New files', 'are in your inbox.'], tail: 'right', turn: -0.04 }), 11),
  ];
  const kitPosts = () => {
    const ps = posts();
    for (let i = 0; i < POSTS.length; i++) grp(ps.slice(i * 3, i * 3 + 3), 2 + i);
    return ps;
  };
  const tour = (st: 0 | 1 | 2 | 3 | 4): Piece[] => {
    const fx = st === 0 ? 0 : st === 1 ? -2.6 : st === 2 ? -2.0 : -1.7;
    const fl = grp(flyer(fx, st < 2 ? LIME : BACK, { price: st === 3 ? LIME : FORE, sun: st === 4 }), 1);
    const ps = kitPosts(), rv = grp(reel(1.6, 0, 0.3), 8), ed = grp(editPanel(1.9, 0), 9), ch = chat(1.9, 0.2);
    return [...fl, ...(st === 1 ? ps : hideAll(ps)), ...(st === 2 ? rv : hideAll(rv)), ...(st === 3 ? ed : hideAll(ed)), ...(st === 4 ? ch : hideAll(ch))];
  };
  F.kitFlyer = makeForm(tour(0), { yaw: -0.24, pitch: 0.14 }, { lift: kitLift, step: 0, float: 0.04 });
  F.kitPosts = makeForm(tour(1), { yaw: -0.22, pitch: 0.14 }, { lift: kitLift, step: 1, float: 0.04 });
  F.kitReel = makeForm(tour(2), { yaw: -0.3, pitch: 0.14 }, { lift: kitLift, step: 2, float: 0.04 });
  F.kitEdit = makeForm(tour(3), { yaw: -0.26, pitch: 0.16 }, { lift: kitLift, step: 3, float: 0.04 });
  F.kitChanges = makeForm(tour(4), { yaw: -0.24, pitch: 0.14 }, { lift: kitLift, step: 4, float: 0.05 });
  const kit = (): Piece[] => {
    const ps = kitPosts(), post = (i: number, to: Vec, ang: number) => place(ps.slice(i * 3, i * 3 + 3), [to[0] - POSTS[i][0], to[1] - POSTS[i][1], to[2]], ang);
    return [
      ...place(grp(flyer(0, BACK), 1), [-1.2, 0.2, 0], 0.22),
      ...place(grp(reel(0, 0, 0), 8), [2.1, -0.35, 1.1], -0.28),
      ...post(0, [-3.8, 1.75, -1.1], 0.3),
      ...post(2, [2.7, 2.55, -1.2], -0.2),
      ...post(4, [-3.4, -2.0, 0.9], 0.35),
    ];
  };
  F.kit = makeForm(kit(), { yaw: -0.18, pitch: 0.12 }, { lift: kitLift, float: 0.1 });

  /* A practice website, for Willow Counseling: the questionnaire, then the calm homepage made
     from it, then live, with its phone. */
  const fq = at(0.1);
  const QL: TextOpts = { size: 0.1, weight: 500, a: 0.55 };
  const field = (s: string): Draw => (g) => {
    g.frame(0, 0, g.w, g.h, 0.014, 'ink', 1, 0.08);
    g.text(s, 0.14, g.h / 2, { size: 0.14, mid: true });
  };
  const questionnaire: Piece[] = [
    rd(piece(0, 0, 0, 3.4, 4.6, 0.2, FORE), 0.22, 0.09),                                                         // 0 the form (it becomes the window)
    pr(fq(-0.1, 1.85, 2.8, 0.36, 0.02, FORE), 'pw.q.title', words('About your practice', { size: 0.24, font: 'head' }, 0.02)),   // 1 its title
    pr(rd(fq(-1.3, -0.72, 0.26, 0.26, 0.06, BACK), 0.06, 0.03), 'pw.q.tick', (g) => tick(g, 0, 0, g.w)),         // 2-4 three choices
    rd(fq(-1.3, -1.08, 0.26, 0.26, 0.06, BACK), 0.06, 0.03),
    pr(rd(fq(-1.3, -1.44, 0.26, 0.26, 0.06, BACK), 0.06, 0.03), 'pw.q.tick', (g) => tick(g, 0, 0, g.w)),
    pr(fq(-0.65, 1.36, 1.6, 0.16, 0.02, FORE), 'pw.q.l1', words('Practice name', QL, 0.02)),                     // 5-6 questions
    pr(fq(-0.5, 0.46, 1.9, 0.16, 0.02, FORE), 'pw.q.l2', words('How should it feel?', QL, 0.02)),
    pr(rd(fq(0, 0.08, 2.9, 0.44, 0.04, FORE), 0.1, 0.02), 'pw.q.a2', field('Calm, warm, no jargon')),            // 7-8 answers
    pr(rd(fq(0, 0.98, 2.9, 0.44, 0.04, FORE), 0.1, 0.02), 'pw.q.a1', field('Willow Counseling')),
    pr(fq(-0.4, -0.72, 1.3, 0.18, 0.02, FORE), 'pw.q.c1', words('In person', { size: 0.13 }, 0.02)),            // 9-10 the choices' words
    pr(fq(-0.4, -1.08, 1.3, 0.18, 0.02, FORE), 'pw.q.c2', words('Evenings', { size: 0.13 }, 0.02)),
    pr(pill(fq(-0.85, -1.92, 1.2, 0.42, 0.14, LIME)), 'pw.q.send', label('Send', { size: 0.14, weight: 600 })),   // 11 send
    pr(fq(-0.4, -1.44, 1.3, 0.18, 0.02, FORE), 'pw.q.c3', words('Online', { size: 0.13 }, 0.02)),               // 12 the last choice's words
    pr(fq(-0.8, -0.36, 1.3, 0.16, 0.02, FORE), 'pw.q.l3', words('Sessions', QL, 0.02)),                         // 13 a question
  ];
  const onWin = at(0.15);
  const WH1: TextOpts = { size: 0.46, font: 'serif' };
  const willowLogo: Draw = (g) => {
    g.shape((c) => c.ellipse(0.14, g.h / 2, 0.06, 0.13, 0.6, 0, Math.PI * 2), 'lime');
    g.text('Willow', 0.3, g.h / 2, { size: 0.24, font: 'serif', mid: true });
  };
  const calm = (live: boolean): Piece[] => [
    rd(piece(0, 0, 0, 8, 5.4, 0.3, FORE), 0.28, 0.12),                                                                 // 0 the window
    live ? pr(rd(onWin(0.55, 2.28, 4.8, 0.38, 0.06, LIME), 0.19, 0.03), 'pw.url.live', address('willowcounseling.com', true))
      : pr(rd(onWin(0.55, 2.28, 4.8, 0.38, 0.06, BACK), 0.19, 0.03), 'pw.url.preview', address('willowcounseling.com/preview', false)),   // 1 the address
    rd(onWin(-3.55, 2.28, 0.2, 0.2, 0.06, BACK), 0.1, 0.03),                                                          // 2-4 the window's buttons
    rd(onWin(-3.19, 2.28, 0.2, 0.2, 0.06, BACK), 0.1, 0.03),
    rd(onWin(-2.83, 2.28, 0.2, 0.2, 0.06, BACK), 0.1, 0.03),
    pr(onWin(-2.95, 1.55, 1.3, 0.36, 0.02, FORE), 'pw.logo', willowLogo),                                              // 5 the logo
    pr(onWin(2.38, 1.55, 0.9, 0.26, 0.02, FORE), 'pw.nav1', label('Services', NAV)),                                   // 6-7 the menu
    pr(onWin(3.25, 1.55, 0.7, 0.26, 0.02, FORE), 'pw.nav2', label('Contact', NAV)),
    pr(onWin(-1.75, 0.72, 3.7, 0.56, 0.02, FORE), 'pw.h1a', words('A calm place', WH1, 0.02)),                         // 8-9 the headline
    pr(onWin(-2.35, 0.12, 2.5, 0.56, 0.02, FORE), 'pw.h1b', words('to begin.', WH1, 0.02)),
    pr(onWin(-1.95, -0.44, 3.3, 0.17, 0.02, FORE), 'pw.p1', words('Individual and couples therapy,', { size: 0.13, a: 0.62 }, 0.02)),   // 10 text
    pr(pill(onWin(-2.8, -1.3, 1.6, 0.44, 0.14, live ? BACK : LIME)), 'pw.cta', label('Book a consult', BTN)),          // 11 the button
    pr(rd(onWin(2.0, -0.3, 3.0, 3.0, 0.1, PIC), 0.16, 0.04), 'pw.room', room),                                         // 12 the room
    pr(onWin(-1.95, -0.66, 3.3, 0.17, 0.02, FORE), 'pw.p2', words('in Portland and online.', { size: 0.13, a: 0.62 }, 0.02)),   // 13 text
  ];
  const pwPhone = phoneParts({ x: 3.05, y: -0.8, z: 1.25, w: 1.7, h: 3.6, frame: METAL, screen: BACK });
  const onScr = at(pwPhone.front);
  const phone = (): Piece[] => [
    pwPhone.body,                                                                                                      // the phone
    pwPhone.screen,                                                                                                    // its screen
    pr(rd(onScr(3.05, 0.0, 1.32, 0.9, 0.05, PIC), 0.08, 0.02), 'pw.m.room', room),
    pr(onScr(2.95, -0.66, 1.1, 0.22, 0.02, BACK), 'pw.m.h1a', words('A calm place', { size: 0.17, font: 'serif' }, 0.01)),
    pr(onScr(2.82, -0.9, 0.85, 0.22, 0.02, BACK), 'pw.m.h1b', words('to begin.', { size: 0.17, font: 'serif' }, 0.01)),
    pr(onScr(2.95, -1.14, 1.1, 0.12, 0.02, BACK), 'pw.m.p', words('Therapy in Portland and online.', { size: 0.065, a: 0.62 }, 0.01)),
    pr(pill(onScr(2.83, -1.58, 0.86, 0.28, 0.06, FORE)), 'pw.m.cta', label('Book a consult', { size: 0.08, weight: 600 })),
    pill(at(pwPhone.front)(3.05, 0.84, 0.36, 0.06, 0.02, FORE)),                                                       // its speaker
  ];
  F.questionnaire = makeForm([...questionnaire, ...hideAll(phone())], { yaw: -0.24, pitch: 0.16 }, { lift: kitLift, hold: 2.2, step: 0 });
  F.homepage = makeForm([...calm(false), ...hideAll(phone())], { yaw: -0.28, pitch: 0.2 }, { lift: kitLift, hold: 2.6, step: 1 });
  F.golive = makeForm([...calm(true), ...phone()], { yaw: -0.42, pitch: 0.22 }, { lift: [0.5, 0.2, 1.0], hold: 2.8, step: 2 });

  /* The practice website's own page. Its top: the site live, with its phone, floating. Then what
     you get, one at a time as you scroll: its pages, stacked behind the homepage; the phone; the
     one next step, lifted out in lime; found on Google; yours (the owner's card, and a key); the
     how-to video on a laptop; thirty days after launch, the days with a fix popping out. */
  // (phone() hands back the same body and screen each time: copies, so each form groups its own)
  const phoneCopy = () => phone().map((p) => ({ ...p }));
  F.pwHero = makeForm([...grp(calm(true), 1), ...grp(phoneCopy(), 2)], { yaw: -0.4, pitch: 0.2 }, { lift: kitLift, float: 0.06 });
  // the homepage, its address and its button in whichever material the scene wants (one lime a scene)
  const pwSite = (o: { addr: number; cta: number; lift?: boolean }): Piece[] => {
    const w = calm(true);
    w[1] = { ...w[1], k: o.addr };
    w[11] = o.lift
      ? place([pr(pill(onWin(-2.3, -1.3, 2.9, 0.72, 0.22, o.cta)), 'pw.cta.big', label('Book a free consultation', { size: 0.16, weight: 600 }))], [0.2, 0.1, 1.1], -0.18)[0]
      : { ...w[11], k: o.cta };
    return grp(w, 1);
  };
  const PAGES = ['About', 'Specialties', 'Fees and insurance', 'Contact'];
  const sheets = (): Piece[] => PAGES.flatMap((t, i) => {
    const x = -0.5 * (i + 1), y = 0.5 * (i + 1), z = -0.45 * (i + 1);
    return grp([
      rd(piece(x, y, z, 8, 5.4, 0.12, FORE), 0.28, 0.05),
      pr(piece(x - 2.6, y + 2.45, z + 0.08, 2.4, 0.3, 0.02, FORE), `pw.pg${i}`, words(t, { size: 0.17, weight: 600 }, 0.02)),
    ], 2 + i);
  });
  const https = (k: number) => grp([pr(pill(piece(3.2, 1.25, 1.6, 1.6, 0.46, 0.14, k)), 'pw.https', (g) => {
    lock(g, 0.24, g.h / 2 - 0.085, 0.17);
    g.text('https', 0.52, g.h / 2, { size: 0.16, weight: 600, mid: true });
  })], 7);
  const google = (): Piece[] => {
    const on = at(0.12);
    return grp([
      pr(pill(piece(0, 1.75, 0, 6.4, 0.72, 0.2, BACK)), 'pw.g.q', (g) => {
        g.ring(0.42, g.h / 2 - 0.02, 0.13, 0.03);
        g.line([0.51, g.h / 2 + 0.08, 0.62, g.h / 2 + 0.19], 0.035);
        g.text('therapist portland anxiety', 0.82, g.h / 2, { size: 0.2, mid: true });
      }),                                                                                                            // the search
      rd(piece(0, -0.35, 0, 6.4, 3.0, 0.2, BACK), 0.2, 0.08),                                                         // the result
      pr(on(-1.25, 0.72, 3.6, 0.2, 0.02, BACK), 'pw.g.url', words('willowcounseling.com', { size: 0.13, a: 0.62 }, 0.02)),
      pr(on(-0.1, 0.28, 5.9, 0.42, 0.02, BACK), 'pw.g.title', words('Willow Counseling · Therapy in Portland', { size: 0.26, font: 'head' }, 0.02)),
      pr(on(-0.2, -0.45, 5.7, 0.62, 0.02, BACK), 'pw.g.text', lines(['Individual and couples therapy, in person and online.', 'Book a free consultation.'], { size: 0.14, a: 0.7 }, 0.02, 0.17, 0.28)),
      pr(pill(on(-1.95, -1.3, 2.1, 0.4, 0.1, LIME)), 'pw.g.open', label('Open today · Portland', { size: 0.12, weight: 600 })),
    ], 8);
  };
  const owner = (): Piece[] => {
    const on = at(0.12);
    return [
      ...grp([
        rd(piece(-0.4, 0.2, 0, 4.6, 2.9, 0.2, BACK), 0.22, 0.08),                                                     // the owner's card
        pr(on(-1.6, 1.15, 1.6, 0.2, 0.02, BACK), 'pw.o.l', words('OWNER', { size: 0.11, weight: 600, track: 0.14, a: 0.55 }, 0.02)),
        pr(on(-1.35, 0.68, 2.1, 0.46, 0.02, BACK), 'pw.o.you', words('You', { size: 0.36, font: 'head' }, 0.02)),
        pr(on(-0.4, -0.05, 4.0, 0.24, 0.02, BACK), 'pw.o.dom', words('willowcounseling.com', { size: 0.16, weight: 500 }, 0.02)),
        pr(on(-0.4, -0.45, 4.0, 0.2, 0.02, BACK), 'pw.o.bill', words('Hosting billed to you, in your name', { size: 0.12, a: 0.62 }, 0.02)),
      ], 9),
      ...grp([
        rd(piece(1.4, -1.35, 0.6, 0.95, 0.95, 0.16, LIME), 0.47, 0.08),                                               // a key: its bow
        rd(piece(2.55, -1.35, 0.6, 1.7, 0.2, 0.12, METAL), 0.1, 0.06),                                                // its blade
      ], 10),
    ];
  };
  const howto = (): Piece[] => {
    const lap = laptop({ name: 'pw.how', w: 5.6, h: 3.4, y: 0.3, depth: 2.4 });
    pr(lap.screen, 'pw.how.screen', (g) => {
      g.text('Willow', 0.4, 0.42, { size: 0.2, font: 'serif', mid: true });
      g.frame(0.3, 0.8, 3.2, 1.1, 0.02, 'lime', 1, 0.06);                                                             // the headline, selected to edit
      g.text('A calm place', 0.42, 1.2, { size: 0.34, font: 'serif', mid: true });
      g.text('to begin.', 0.42, 1.62, { size: 0.34, font: 'serif', mid: true });
      g.box(0.42 + g.measure('to begin.', { size: 0.34, font: 'serif' }) + 0.04, 1.45, 0.025, 0.34, 'ink', 1);       // the cursor
      room(g.sub(g.w - 2.1, 0.55, 1.8, 1.7));
      g.text('Editing your homepage', 0.4, g.h - 0.28, { size: 0.15, weight: 600, mid: true });
      g.text('2:40', g.w - 0.3, g.h - 0.28, { size: 0.12, align: 'right', mid: true, a: 0.6 });
    });
    const on = at(lap.front);
    return grp([
      lap.lid, lap.screen, lap.deck,
      ...lap.lean([rd(on(0, 0.4, 0.86, 0.86, 0.2, PLAY), 0.43, 0.1)]),                                                 // play
      ...lap.lean([pr(pill(on(0, -1.15, 4.8, 0.07, 0.03, BACK)), 'pw.how.bar', (g) => g.box(0, 0, g.w * 0.3, g.h, 'lime', 1, g.h / 2))]),
    ], 11);
  };
  const FIXES = [3, 8, 12, 19, 26];   // the days with a fix (the middle one today's, in lime)
  const calendar = (): Piece[] => {
    const on = at(0.12);
    const cell = (d: number): [number, number] => [-2.1 + (d % 7) * 0.7, 0.95 - Math.floor(d / 7) * 0.62];
    return [
      ...grp([
        rd(piece(0, 0, 0, 5.4, 4.4, 0.22, FORE), 0.24, 0.09),                                                        // the month
        pr(on(0, 1.72, 5.0, 0.4, 0.02, FORE), 'pw.cal.t', words('30 days after launch', { size: 0.24, font: 'head' }, 0.05)),
        pr(on(0, -0.35, 5.0, 3.3, 0.02, FORE), 'pw.cal.grid', (g) => {
          for (let d = 0; d < 30; d++) {
            const u = 0.4 + (d % 7) * 0.7, v = 0.35 + Math.floor(d / 7) * 0.62;
            g.frame(u - 0.3, v - 0.26, 0.6, 0.52, 0.012, 'ink', 0.4, 0.06);
            g.text(String(d + 1), u - 0.22, v - 0.11, { size: 0.1, mid: true, a: 0.6 });
          }
        }),
      ], 12),
      ...FIXES.map((d, i) => {
        const [x, y] = cell(d);
        return grp([pr(rd(piece(x, y, 0.42, 0.56, 0.5, 0.14, i === 2 ? LIME : BACK), 0.08, 0.05), 'pw.cal.fix', (g) => tick(g, g.w / 2 - 0.13, g.h / 2 - 0.13, 0.26))], 13 + i)[0];
      }),
    ];
  };
  // the scenes share their slots: the site, its pages, the phone, https, Google, the owner, the video, the month
  const pwTour = (st: number): Piece[] => {
    const parts: Piece[][] = [
      st === 2 ? pwSite({ addr: BACK, cta: LIME, lift: true }) : st === 1 ? place(pwSite({ addr: BACK, cta: BACK }), [-1.6, 0.4, -1.8], 0.1) : pwSite({ addr: LIME, cta: BACK }),
      sheets(),
      place(grp(phoneCopy(), 6), [-1.7, 0.5, 0.5], -0.12),
      https(LIME),
      google(),
      owner(),
      howto(),
      calendar(),
    ];
    const showing = [[0, 1], [0, 2, 3], [0], [4], [5], [6], [7]][st];
    return parts.flatMap((ps, i) => (showing.includes(i) ? ps : hideAll(ps)));
  };
  F.pwPages = makeForm(pwTour(0), { yaw: -0.3, pitch: 0.18 }, { lift: kitLift, step: 0, float: 0.04 });
  F.pwPhone = makeForm(pwTour(1), { yaw: -0.36, pitch: 0.16 }, { lift: kitLift, step: 1, float: 0.04 });
  F.pwStep = makeForm(pwTour(2), { yaw: -0.24, pitch: 0.14 }, { lift: kitLift, step: 2, float: 0.04 });
  F.pwGoogle = makeForm(pwTour(3), { yaw: -0.2, pitch: 0.16 }, { lift: kitLift, step: 3, float: 0.04 });
  F.pwOwn = makeForm(pwTour(4), { yaw: -0.26, pitch: 0.18 }, { lift: kitLift, step: 4, float: 0.05 });
  F.pwHow = makeForm(pwTour(5), { yaw: -0.3, pitch: 0.2 }, { lift: kitLift, step: 5, float: 0.03 });
  F.pwFixes = makeForm(pwTour(6), { yaw: -0.22, pitch: 0.2 }, { lift: kitLift, step: 6, float: 0.04 });

  for (const [id, f] of Object.entries(F)) f.id = id;
  return F;
}
