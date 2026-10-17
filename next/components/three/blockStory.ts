import * as THREE from 'three';
import { createScroller, type Scroller } from '@/lib/smoothScroll';

/**
 * The site's one object: 64 pieces. In the hero they are a 4 × 4 × 4 cube of
 * clean white blocks, a few of them dotted and one lime corner (three
 * materials in all: plain, dots, lime); in every other chapter the pieces become
 * the thing the chapter is about, and play its steps on their own, on a loop:
 * a moodboard whose swatches fly into a website while its code is written
 * beside it, then the code folds into a phone and the address goes lime;
 * a brand built up plate by plate, the grid, colour and type, the mark,
 * pressed into one block; four products standing, two still in stripes;
 * every idea loose, then sorted by kind; a flyer, its five posts, its video.
 * Pictures are drawn in plain shapes (a sun over a hill), never a texture.
 *
 * Each arrangement (a Form) names, for each piece, its place, size, turn and
 * material; a piece can also be put away (size 0). A move takes every piece
 * from where it is to its place in the next form, each on its own beat (the
 * lime one first, then in the form's reading order), with a small arc, and
 * dissolves its material into the new one in coarse pixels as it goes. Moves
 * are timed, not scrubbed by the scroll, so they always play out whole.
 *
 * The object belongs to the page: its colours are the page's (white on a
 * black chapter, ink on a paper one; every material is drawn in those two
 * colours), it is sized to the words beside it, and when the next chapter's
 * edge scrolls up through it the edge cuts it, each part matching the page
 * behind it.
 *
 * On a desktop the page's scroll is eased (lib/smoothScroll.ts), and when you
 * arrive at a chapter while its object is still moving, the page eases to a
 * stop until the move has played.
 *
 * On a subpage (mountBlockFigure) the same pieces gather out of loose blocks
 * into one form, or play a sequence of forms on a loop.
 */

export type StoryHandle = { refresh: () => void; dispose: () => void };
type Opts = {
  canvas: HTMLCanvasElement;
  root: HTMLElement;
  reduced: boolean;
  fine: boolean;
  onReady?: () => void;
};

const N = 64;   // the cube is 4 × 4 × 4; the scenes use as many as they need and put the rest away

// Materials. FORE is the colour that stands out from the page (white on
// black, ink on paper), BACK the page's own; the patterns mix the two.
// Three materials: plain, dots, lime. (FORE and BACK are the plain in either
// colour; DOTB the dots on the other; PHOTO a picture drawn in plain shapes;
// PLAY the lime with a play mark.)
const K = { FORE: 0, DOT: 1, PHOTO: 4, BACK: 5, DOTB: 6, LIME: 9, PLAY: 10 } as const;
const isLime = (k: number) => k === K.LIME || k === K.PLAY;

type Vec = [number, number, number];
type View = { yaw: number; pitch: number };
type Piece = { p: Vec; s: Vec; q: THREE.Quaternion; k: number; spare?: boolean };
type Form = {
  pieces: Piece[];
  view: View;
  lift: Vec;          // the arc a piece takes on its way in
  hold: number;       // seconds it stays before a chapter's next form
  step: number | null;
  rank: Float32Array; // each piece's place in the move's order, 0..1
  lime: number;       // the lime piece, or -1
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const mixView = (a: View, b: View, k: number): View => ({ yaw: lerp(a.yaw, b.yaw, k), pitch: lerp(a.pitch, b.pitch, k) });

/* ------------------------------------------------------------------ forms */

const euler = new THREE.Euler();
const piece = (x: number, y: number, z: number, w = 0.9, h = 0.9, d = 0.9, k: number = K.FORE, rz = 0, rx = 0, ry = 0): Piece => ({
  p: [x, y, z],
  s: [w, h, d],
  q: new THREE.Quaternion().setFromEuler(euler.set(rx, ry, rz)),
  k,
});
/** A piece put away: nothing to see, at the place it will grow from. */
const hidden = (p: Vec): Piece => ({ p: [p[0], p[1], p[2]], s: [0, 0, 0], q: new THREE.Quaternion(), k: K.FORE });
const hideAll = (ps: Piece[], at?: Vec) => ps.map((p) => hidden(at ?? p.p));
const shown = (p: Piece) => p.s[0] > 0.01 && p.s[1] > 0.01 && p.s[2] > 0.01;
/** A piece a form doesn't use: whichever block lands here is put away where it is. */
const spare = (): Piece => ({ p: [0, 0, 0], s: [0, 0, 0], q: new THREE.Quaternion(), k: K.FORE, spare: true });

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

function buildForms(): Record<string, Form> {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const { FORE, DOT, PHOTO, BACK, DOTB, LIME, PLAY } = K;
  const F: Record<string, Form> = {};

  /* The cube: 4 × 4 × 4 white blocks, a few of them dotted (one in five, never two side by
     side: (x + 2y + 3z) mod 5 changes along every axis), its top front corner lime. */
  const cube: Piece[] = [];
  for (let y = 0; y < 4; y++) for (let z = 0; z < 4; z++) for (let x = 0; x < 4; x++) {
    const k = x === 3 && y === 3 && z === 3 ? LIME : (x + 2 * y + 3 * z) % 5 === 0 ? DOT : FORE;
    cube.push(piece(x - 1.5, y - 1.5, z - 1.5, 0.9, 0.9, 0.9, k));
  }
  F.cube = makeForm(cube, { yaw: -0.62, pitch: 0.4 }, { order: 'bottom', lift: [0, 0.8, 0.2] });
  // The cube's own blocks, loose and turned every which way (where the hero's gathering starts).
  F.scatter = makeForm(
    cube.map((c) => piece((rnd() - 0.5) * 11, (rnd() - 0.5) * 7, (rnd() - 0.5) * 7, 0.9, 0.9, 0.9, c.k, (rnd() - 0.5) * 2, (rnd() - 0.5) * 2, (rnd() - 0.5) * 2)),
    { yaw: -0.62, pitch: 0.4 },
  );

  /* Design: a moodboard, then the site (and its code), then the site live on its domain, with its phone. */
  const FRONT = 0.15;   // the window's front face
  const on = (x: number, y: number, w: number, h: number, d: number, k: number) => piece(x, y, FRONT + d / 2 + 0.01, w, h, d, k);
  const browser = (urlK: number, buttonK: number): Piece[] => [
    piece(0, 0, 0, 8, 5.4, 0.3, FORE),            // 0 the window
    on(0.55, 2.28, 4.8, 0.38, 0.08, urlK),       // 1 the address
    on(-3.55, 2.28, 0.2, 0.2, 0.08, BACK),       // 2-4 the window's buttons
    on(-3.19, 2.28, 0.2, 0.2, 0.08, BACK),
    on(-2.83, 2.28, 0.2, 0.2, 0.08, BACK),
    on(-3.4, 1.55, 0.4, 0.4, 0.1, BACK),         // 5 the logo
    on(1.7, 1.55, 0.62, 0.12, 0.06, BACK),       // 6-8 the menu
    on(2.6, 1.55, 0.62, 0.12, 0.06, BACK),
    on(3.5, 1.55, 0.62, 0.12, 0.06, BACK),
    on(-1.95, 0.92, 3.3, 0.42, 0.1, BACK),       // 9-10 the headline
    on(-2.45, 0.36, 2.3, 0.42, 0.1, BACK),
    on(-2.05, -0.2, 3.1, 0.1, 0.05, BACK),       // 11-12 a line of text
    on(-2.3, -0.42, 2.6, 0.1, 0.05, BACK),
    on(-2.95, -0.98, 1.3, 0.42, 0.14, buttonK),  // 13 the button
    on(1.95, 0.2, 3.3, 2.2, 0.12, PHOTO),        // 14 the picture
    on(-2.47, -1.95, 2.25, 0.9, 0.1, DOTB),      // 15-17 three cards
    on(0, -1.95, 2.25, 0.9, 0.1, BACK),
    on(2.47, -1.95, 2.25, 0.9, 0.1, DOTB),
  ];
  const site = browser(BACK, LIME);
  site.push(piece(2.3, -0.75, 1.3, 3.6, 2.7, 0.2, BACK));   // 18 the code, in a window in front
  const LEN = [1.5, 2.1, 1.7, 1.0, 2.3, 1.3, 1.8, 0.8];
  const IND = [0, 0.3, 0.6, 0.6, 0.3, 0.6, 0.3, 0];
  LEN.forEach((l, i) => site.push(piece(0.8 + IND[i] + l / 2, 0.22 - i * 0.27, 1.44, l, 0.11, 0.06, FORE)));   // 19-26 its lines
  F.site = makeForm(site, { yaw: -0.28, pitch: 0.18 }, { lift: [0, 0.25, 1.2], hold: 2.6, step: 1 });

  const live = browser(LIME, BACK);
  const PZ = 1.36;   // the phone's face
  const ph = (x: number, y: number, w: number, h: number, d: number, k: number) => piece(x, y, PZ + d / 2 + 0.01, w, h, d, k);
  live.push(
    piece(3.6, -0.85, 1.25, 2.1, 3.9, 0.22, BACK),   // 18 the phone
    ph(3.6, 0.85, 0.5, 0.09, 0.04, FORE),             // 19 its speaker
    ph(3.6, 0.15, 1.75, 1.05, 0.06, PHOTO),           // 20 the picture
    ph(3.4, -0.6, 1.35, 0.2, 0.06, FORE),             // 21-22 the headline
    ph(3.25, -0.88, 1.05, 0.2, 0.06, FORE),
    ph(3.4, -1.18, 1.35, 0.07, 0.04, FORE),           // 23-24 text
    ph(3.3, -1.33, 1.15, 0.07, 0.04, FORE),
    ph(3.12, -1.72, 0.8, 0.26, 0.08, FORE),           // 25 the button
    ph(3.6, -2.35, 1.75, 0.55, 0.06, DOT),            // 26 a card
  );
  F.live = makeForm(live, { yaw: -0.4, pitch: 0.2 }, { lift: [0.5, 0.2, 1.0], hold: 2.8, step: 2 });

  const mood: Piece[] = new Array(27);   // the moodboard's 27 (the rest are spare)
  mood[0] = piece(0, 0, 0, 8.4, 5.6, 0.26, FORE);   // the board (it becomes the window)
  const swatch = (i: number, x: number, y: number, w: number, h: number, k: number, rz: number) => {
    mood[i] = piece(x, y + 0.2, 0.13 + 0.05 + i * 0.003, w, h, 0.08, k, rz);
  };
  swatch(14, -2.45, 0.6, 2.6, 3.0, PHOTO, -0.03);    // a photograph (it becomes the picture)
  swatch(18, 0.25, 1.35, 2.2, 1.45, PHOTO, 0.035);    // another (it becomes the code's window)
  swatch(9, 2.85, 1.45, 1.9, 1.25, BACK, -0.04);      // a type specimen (lines on it below)
  swatch(10, 3.05, -0.25, 1.5, 1.1, DOTB, 0.04);
  swatch(15, -0.25, -0.35, 1.5, 1.2, BACK, 0.05);
  swatch(16, 1.35, -0.3, 1.25, 1.05, BACK, -0.06);
  swatch(17, -3.3, -1.95, 0.95, 0.95, DOTB, 0.06);
  swatch(1, -2.35, -1.95, 0.62, 0.62, DOTB, -0.05);    // a row of chips
  swatch(2, -1.61, -1.95, 0.62, 0.62, BACK, 0.03);
  swatch(3, -0.87, -1.95, 0.62, 0.62, DOTB, -0.02);
  swatch(4, -0.13, -1.95, 0.62, 0.62, BACK, 0.05);
  swatch(13, 0.8, -1.85, 0.8, 0.8, LIME, 0.09);        // the one lime chip (it becomes the button)
  swatch(11, 1.85, -1.8, 1.05, 0.8, BACK, -0.05);      // notes
  swatch(12, 3.1, -1.85, 1.35, 0.8, BACK, 0.04);
  // Lines of type on the specimen and on a note: they become the lines of code.
  const onTile = (i: number, tile: number, ox: number, oy: number, w: number, h: number) => {
    const T = mood[tile], rz = new THREE.Euler().setFromQuaternion(T.q).z, c = Math.cos(rz), sn = Math.sin(rz);
    mood[i] = piece(T.p[0] + ox * c - oy * sn, T.p[1] + ox * sn + oy * c, T.p[2] + T.s[2] / 2 + 0.03, w, h, 0.05, FORE, rz);
  };
  onTile(19, 9, -0.2, 0.3, 1.2, 0.2);
  onTile(20, 9, -0.1, 0.0, 1.4, 0.07);
  onTile(21, 9, -0.25, -0.18, 1.1, 0.07);
  onTile(22, 12, -0.12, 0.12, 0.9, 0.07);
  onTile(23, 12, -0.22, -0.06, 0.7, 0.07);
  for (const i of [5, 6, 7, 8, 24, 25, 26]) mood[i] = hidden(site[i].p);
  F.moodboard = makeForm(mood, { yaw: -0.2, pitch: 0.14 }, { lift: [0, 0.3, 1.0], hold: 2.2, step: 0 });

  /* Brand: plate by plate, the grid, colour and type, the mark; then pressed into one block. */
  const plate = (y: number, kinds: number[], thick = 0.3, wide = 0.94): Piece[] => {
    const out: Piece[] = [];
    let i = 0;
    for (const z of [-1, 0, 1]) for (const x of [-1, 0, 1]) out.push(piece(x, y, z, wide, thick, wide, kinds[i++]));
    return out;
  };
  const gridK = new Array<number>(9).fill(FORE);
  const typeK = [DOT, FORE, BACK, FORE, DOT, FORE, BACK, FORE, DOT];
  const markK = [FORE, FORE, FORE, FORE, LIME, FORE, FORE, FORE, FORE];
  const brandLift: Vec = [0, 1.0, 0];
  // The grid plate's tiles stand a little apart, so its seams read as the grid.
  const gridPlate = () => plate(-1.1, gridK, 0.3, 0.84);
  F.grid = makeForm([...gridPlate(), ...hideAll(plate(1.4, gridK)), ...hideAll(plate(2.8, gridK))], { yaw: -0.5, pitch: 0.62 }, { lift: brandLift, hold: 1.8, step: 0 });
  F.colortype = makeForm([...gridPlate(), ...plate(0, typeK), ...hideAll(plate(2.8, gridK))], { yaw: -0.55, pitch: 0.5 }, { lift: brandLift, hold: 1.9, step: 1 });
  F.mark = makeForm([...gridPlate(), ...plate(0, typeK), ...plate(1.1, markK)], { yaw: -0.6, pitch: 0.44 }, { lift: brandLift, hold: 1.6, step: 2 });
  F.pressed = makeForm([...plate(-1, gridK, 0.9, 0.9), ...plate(0, typeK, 0.9, 0.9), ...plate(1, markK, 0.9, 0.9)], { yaw: -0.62, pitch: 0.4 }, { lift: [0, 0.3, 0], hold: 2.6, step: 2 });

  /* Products: four towers, in the list's order; the two still on the way are in the page's own colour. */
  const towers: Piece[] = [];
  const block = (x: number, y: number, z: number, k: number) => towers.push(piece(x, y - 1.5, z, 0.9, 0.9, 0.9, k));
  const strataK = [FORE, DOT, DOT, FORE, DOT, FORE, FORE, DOT, FORE, DOT, DOT, LIME];
  let n = 0;
  for (let y = 0; y < 3; y++) for (const z of [-0.5, 0.5]) for (const x of [-3.3, -2.3]) block(x, y, z, strataK[n++]);
  const biddingK = [DOT, FORE, FORE, DOT, DOT, FORE, FORE, DOT];
  n = 0;
  for (let y = 0; y < 4; y++) for (const x of [-0.95, 0.05]) block(x, y, 0, biddingK[n++]);
  for (let y = 0; y < 4; y++) block(1.4, y, 0, BACK);
  for (let y = 0; y < 3; y++) block(2.75, y, 0, BACK);
  F.towers = makeForm(towers, { yaw: -0.5, pitch: 0.3 }, { order: 'bottom', lift: [0, 1.0, 0] });

  /* About: every idea, loose; then every one of them kept, sorted by kind (plain, dotted, the lime). */
  const ideaK = [...new Array<number>(16).fill(FORE), ...new Array<number>(10).fill(DOT), LIME];
  const sorted: Piece[] = [];
  n = 0;
  for (let x = -4; x <= 4; x++) for (const z of [-1, 0, 1]) sorted.push(piece(x, 0, z, 0.9, 0.9, 0.9, ideaK[n++]));
  // loose: a jittered lattice, shuffled, so no two ideas overlap
  const cells: Vec[] = [];
  for (let x = 0; x < 6; x++) for (let y = 0; y < 3; y++) for (let z = 0; z < 2; z++) cells.push([(x - 2.5) * 1.45, (y - 1) * 1.45, (z - 0.5) * 1.6]);
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  const field = ideaK.map((k, i) => {
    const c = cells[i];
    return piece(c[0] + (rnd() - 0.5) * 0.4, c[1] + (rnd() - 0.5) * 0.4, c[2] + (rnd() - 0.5) * 0.4, 0.9, 0.9, 0.9, k, (rnd() - 0.5) * 1.1, (rnd() - 0.5) * 1.1, (rnd() - 0.5) * 1.1);
  });
  F.field = makeForm(field, { yaw: -0.35, pitch: 0.5 }, { lift: [0, 0.8, 0], hold: 2.2 });
  F.sorted = makeForm(sorted, { yaw: -0.35, pitch: 0.85 }, { lift: [0, 1.2, 0], hold: 3.0 });

  /* Listing kit: the print flyer, then its five posts beside it, then its video. */
  const FZ = 0.08;
  const fo = (dx: number, x: number, y: number, w: number, h: number, d: number, k: number) => piece(dx + x, y, FZ + d / 2 + 0.01, w, h, d, k);
  const flyer = (dx: number, tagK: number): Piece[] => [
    piece(dx, 0, 0, 3.2, 4.4, 0.16, FORE),       // the sheet
    fo(dx, 0, 0.75, 2.8, 2.2, 0.06, PHOTO),      // the photograph
    fo(dx, -0.82, 1.55, 1.0, 0.32, 0.1, tagK),   // Just Listed
    fo(dx, -0.35, -0.72, 2.1, 0.34, 0.06, BACK), // the address
    fo(dx, -0.85, -1.2, 1.1, 0.26, 0.06, BACK),  // the price
    fo(dx, -0.3, -1.6, 2.2, 0.08, 0.04, BACK),   // details
    fo(dx, -0.45, -1.8, 1.9, 0.08, 0.04, BACK),
    fo(dx, 1.15, -1.7, 0.5, 0.5, 0.06, DOTB),    // the agent's mark
  ];
  const POSTS: [number, number][] = [[0.35, 0.95], [1.9, 0.95], [3.45, 0.95], [1.1, -0.65], [2.65, -0.65]];
  const posts = (): Piece[] =>
    POSTS.flatMap(([x, y]) => [
      piece(x, y, 0, 1.4, 1.4, 0.12, FORE),
      piece(x, y + 0.17, 0.1, 1.2, 0.85, 0.06, PHOTO),
      piece(x - 0.2, y - 0.47, 0.09, 0.8, 0.09, 0.04, BACK),
    ]);
  const VIDEO: Vec = [1.6, 0.3, 0];
  const video = (): Piece[] => [
    piece(1.6, 0.2, 0, 4.4, 2.48, 0.14, FORE),          // the frame
    piece(1.6, 0.3, 0.11, 4.1, 1.95, 0.06, PHOTO),      // the film
    piece(1.6, 0.3, 0.21, 0.66, 0.66, 0.12, PLAY),      // play
    piece(1.6, -0.82, 0.1, 4.1, 0.06, 0.04, BACK),      // its progress
  ];
  const kitLift: Vec = [0, 0.3, 1.0];
  F.flyer = makeForm([...flyer(0, LIME), ...hideAll(posts()), ...hideAll(video(), VIDEO)], { yaw: -0.24, pitch: 0.12 }, { lift: kitLift, hold: 2.2, step: 0 });
  F.posts = makeForm([...flyer(-2.6, LIME), ...posts(), ...hideAll(video(), VIDEO)], { yaw: -0.22, pitch: 0.12 }, { lift: kitLift, hold: 2.4, step: 1 });
  F.video = makeForm([...flyer(-2.6, BACK), ...hideAll(posts(), VIDEO), ...video()], { yaw: -0.24, pitch: 0.12 }, { lift: kitLift, hold: 2.6, step: 2 });

  /* A practice website: the questionnaire, then the calm homepage, then live, with its phone. */
  const QZ = 0.1;
  const fq = (x: number, y: number, w: number, h: number, d: number, k: number) => piece(x, y, QZ + d / 2 + 0.01, w, h, d, k);
  const questionnaire: Piece[] = [
    piece(0, 0, 0, 3.4, 4.6, 0.2, FORE),         // 0 the form (it becomes the window)
    fq(-0.6, 1.8, 1.8, 0.28, 0.06, BACK),        // 1 its title
    fq(-1.3, -0.45, 0.24, 0.24, 0.06, BACK),     // 2-4 three choices
    fq(-1.3, -0.85, 0.24, 0.24, 0.06, BACK),
    fq(-1.3, -1.25, 0.24, 0.24, 0.06, BACK),
    fq(-0.95, 1.2, 1.1, 0.09, 0.04, BACK),       // 5 a question
    fq(-1.05, 0.38, 0.9, 0.09, 0.04, BACK),      // 6 a question
    fq(0, 0.02, 2.9, 0.06, 0.04, BACK),          // 7 an answer line
    fq(0, 0.84, 2.9, 0.06, 0.04, BACK),          // 8 an answer line
    fq(-0.35, -0.45, 1.6, 0.08, 0.04, BACK),     // 9-10 the choices' words
    fq(-0.45, -0.85, 1.4, 0.08, 0.04, BACK),
    fq(-0.75, -1.85, 1.5, 0.44, 0.12, LIME),     // 11 send
    fq(-0.5, -1.25, 1.3, 0.08, 0.04, BACK),      // 12 the last choice's words
  ];
  const calm = (urlK: number, buttonK: number): Piece[] => [
    piece(0, 0, 0, 8, 5.4, 0.3, FORE),
    on(0.55, 2.28, 4.8, 0.38, 0.08, urlK),
    on(-3.55, 2.28, 0.2, 0.2, 0.08, BACK),
    on(-3.19, 2.28, 0.2, 0.2, 0.08, BACK),
    on(-2.83, 2.28, 0.2, 0.2, 0.08, BACK),
    on(-3.4, 1.55, 0.4, 0.4, 0.1, BACK),
    on(2.6, 1.55, 0.62, 0.12, 0.06, BACK),
    on(3.5, 1.55, 0.62, 0.12, 0.06, BACK),
    on(-1.85, 0.75, 3.5, 0.46, 0.1, BACK),
    on(-2.3, 0.15, 2.6, 0.46, 0.1, BACK),
    on(-2.05, -0.5, 3.1, 0.1, 0.05, BACK),
    on(-2.95, -1.25, 1.3, 0.42, 0.14, buttonK),
    on(2.0, -0.25, 3.0, 3.0, 0.12, PHOTO),
  ];
  const ph2 = (x: number, y: number, w: number, h: number, d: number, k: number) => piece(x, y, PZ + d / 2 + 0.01, w, h, d, k);
  const phone = (): Piece[] => [
    piece(3.05, -0.8, 1.25, 1.7, 3.6, 0.22, BACK),
    ph2(3.05, 0.25, 1.4, 0.95, 0.06, PHOTO),
    ph2(2.9, -0.48, 1.1, 0.18, 0.06, FORE),
    ph2(2.78, -0.72, 0.86, 0.18, 0.06, FORE),
    ph2(2.9, -1.0, 1.1, 0.06, 0.04, FORE),
    ph2(2.68, -1.45, 0.66, 0.24, 0.08, FORE),
    ph2(3.05, 0.78, 0.4, 0.07, 0.04, FORE),
  ];
  const spare = (at: Vec) => Array.from({ length: 7 }, () => hidden(at));
  F.questionnaire = makeForm([...questionnaire, ...hideAll(phone()), ...spare([0, 0, 0])], { yaw: -0.24, pitch: 0.14 }, { lift: kitLift, hold: 2.2, step: 0 });
  F.homepage = makeForm([...calm(BACK, LIME), ...hideAll(phone()), ...spare([0, 0, 0])], { yaw: -0.28, pitch: 0.18 }, { lift: kitLift, hold: 2.6, step: 1 });
  F.golive = makeForm([...calm(LIME, BACK), ...phone(), ...spare([3.05, -0.8, 0])], { yaw: -0.4, pitch: 0.2 }, { lift: [0.5, 0.2, 1.0], hold: 2.8, step: 2 });

  return F;
}

/** The least travel from the pieces as they are to a form's places (the Hungarian method). */
function hungarian(a: number[][]): number[] {
  const n = a.length;
  const u = new Float64Array(n + 1), v = new Float64Array(n + 1);
  const p = new Int32Array(n + 1), way = new Int32Array(n + 1);
  for (let i = 1; i <= n; i++) {
    p[0] = i;
    let j0 = 0;
    const minv = new Float64Array(n + 1).fill(Infinity);
    const used = new Uint8Array(n + 1);
    do {
      used[j0] = 1;
      const i0 = p[j0];
      let delta = Infinity, j1 = 0;
      for (let j = 1; j <= n; j++) {
        if (used[j]) continue;
        const cur = a[i0 - 1][j - 1] - u[i0] - v[j];
        if (cur < minv[j]) { minv[j] = cur; way[j] = j0; }
        if (minv[j] < delta) { delta = minv[j]; j1 = j; }
      }
      for (let j = 0; j <= n; j++) {
        if (used[j]) { u[p[j]] += delta; v[j] -= delta; }
        else minv[j] -= delta;
      }
      j0 = j1;
    } while (p[j0] !== 0);
    do { const j1 = way[j0]; p[j0] = p[j1]; j0 = j1; } while (j0);
  }
  const ans = new Array<number>(n);
  for (let j = 1; j <= n; j++) ans[p[j] - 1] = j - 1;
  return ans;
}

/* ---------------------------------------------------------------- shaders */

const VS = /* glsl */ `
attribute vec3 aKind;
varying vec3 vN;
varying vec3 vNo;
varying vec3 vPos;
varying vec3 vScale;
varying vec3 vKind;
void main() {
  vScale = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
  vN = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
  vNo = normal;
  vPos = position;
  vKind = aKind;
  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
}
`;
// Each piece is drawn in the page's two colours: FORE (white on a black
// chapter, ink on a paper one) and BACK (the other). Clean, like a printed
// thing: three tones of light (the top brightest, then the left, then the
// right), no shadows smudged into the seams, no rims, no grain. The dots are
// round, in whole rows that fit the face, the same size on every piece. A
// picture is drawn in plain shapes, a sun over a hill. When a piece changes
// material it dissolves into the next in coarse pixels (aKind: from, to, how
// far). The page's edge (uEdge, device pixels from the bottom) cuts the
// object: below it, the next chapter's colours.
const FS = /* glsl */ `
uniform float uEdge;
uniform float uHasEdge;
uniform float uToneAbove;
uniform float uToneBelow;
varying vec3 vN;
varying vec3 vNo;
varying vec3 vPos;
varying vec3 vScale;
varying vec3 vKind;
float bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
// how much of the pixel lies where d < 0, over a footprint w
float cover(float d, float w) { return clamp(0.5 - d / max(w, 1e-5), 0.0, 1.0); }

// 0: the face colour (FORE), 1: the second colour (BACK)
float pattern(float k, vec2 w, vec2 fs, vec2 fw) {
  if (k < 0.5) return 0.0;                                   // FORE: plain
  if (k > 4.5 && k < 5.5) return 1.0;                        // BACK: plain, in the other colour
  if (min(fs.x, fs.y) < 0.3) return k < 3.5 ? 0.0 : 1.0;      // a thin edge: plain
  if (k < 1.5 || (k > 5.5 && k < 6.5)) {                     // DOT, DOTB: round dots in whole rows
    vec2 n = max(vec2(1.0), floor(fs / 0.225 + 0.5));
    vec2 cell = fs / n;
    vec2 g = (fract((w + fs * 0.5) / cell) - 0.5) * cell;
    float c = cover(length(g) - 0.3 * min(cell.x, cell.y), max(fw.x, fw.y) * 1.2);
    return k < 1.5 ? c : 1.0 - c;
  }
  if (k > 3.5 && k < 4.5) {                                  // PHOTO: a picture in plain shapes, a sun over a hill
    if (max(fs.x, fs.y) <= 1.0) return 1.0;
    vec2 uv = w / fs + 0.5;
    float pu = max(fw.x / fs.x, fw.y / fs.y) * 1.5;
    float hill = max(0.3 + 0.13 * sin(uv.x * 4.0 + 0.6), 0.18 + 0.09 * sin(uv.x * 7.0 + 2.4));
    float land = cover(uv.y - hill, pu);
    float sun = cover(length((uv - vec2(0.72, 0.7)) * vec2(fs.x / fs.y, 1.0)) - 0.12, pu);
    return 1.0 - max(land, sun);
  }
  return k < 4.5 ? 0.0 : 1.0;
}

void main() {
  vec3 n = normalize(vN);
  vec3 no = normalize(vNo);
  // light from above, a little from the front left: the top brightest, then the left face, then the right
  vec3 L = normalize(vec3(-0.25, 0.85, 0.6));
  float t3 = clamp((max(dot(n, L), 0.0) - 0.0) / 0.95, 0.0, 1.0);

  vec3 a = abs(no);
  vec2 loc, fs;
  if (a.x > 0.5) { loc = vPos.zy; fs = vScale.zy; }
  else if (a.y > 0.5) { loc = vPos.xz; fs = vScale.xz; }
  else { loc = vPos.xy; fs = vScale.xy; }
  vec2 w = loc * fs;
  vec2 fw = fwidth(w);

  // the material: the last one dissolving into the next, in coarse pixels
  float th = bayer4(floor(w * 5.0) + floor(no.xy * 3.0 + no.z * 5.0));
  float k = vKind.z > th ? vKind.y : vKind.x;

  float tone = uHasEdge > 0.5 && gl_FragCoord.y < uEdge ? uToneBelow : uToneAbove;
  vec3 white = vec3(0.957, 0.961, 0.949) * mix(0.83, 1.0, t3);
  vec3 ink = mix(vec3(0.055, 0.06, 0.068), vec3(0.17, 0.18, 0.2), t3);
  vec3 fore = mix(white, ink, tone);
  vec3 back = mix(ink, white, tone);
  vec3 c = k > 8.5 ? vec3(0.722, 1.0, 0.0) * mix(0.82, 1.0, t3) : mix(fore, back, pattern(k, w, fs, fw));
  if (k > 9.5 && min(fs.x, fs.y) > 0.3) {
    // the play button: an ink triangle on the lime, pointing right
    vec2 t = w / (0.5 * min(fs.x, fs.y));
    float inside = max(-0.32 - t.x, abs(t.y) * 1.25 + t.x * 0.62 - 0.36);
    c = mix(c, vec3(0.06, 0.065, 0.075), cover(inside, max(fw.x, fw.y) * 2.0 / min(fs.x, fs.y)));
  }
  gl_FragColor = vec4(c, 1.0);
}
`;

/* -------------------------------------------------------------------- rig */

type Box = { x: number; y: number; w: number; h: number };
type Ext = { minX: number; maxX: number; minY: number; maxY: number };
type Move = {
  t0: number;
  spread: number;
  dur: number;
  to: Form;
  perm: Int32Array;     // block → the piece it becomes
  delay: Float32Array;
  arc: Float32Array;    // how high each block lifts on its way (0: it stays put)
  fp: Float32Array;     // where each block started
  fs: Float32Array;
  fq: THREE.Quaternion[];
  fk: Float32Array;     // its material when it started
  viewFrom: View;
};

/** Everything the pieces need to be drawn and moved, shared by the story and the figures. */
function createRig(canvas: HTMLCanvasElement, maxDpr: number) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.debug.checkShaderErrors = false;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
  const scene = new THREE.Scene();
  // A long lens: the pieces stay square, like things on a page, not in a photo.
  const camera = new THREE.PerspectiveCamera(18, 1.6, 1, 400);
  camera.position.set(0, 0, 120);
  const forms = buildForms();

  const geo = new THREE.BoxGeometry(1, 1, 1);
  const kinds = new Float32Array(N * 3);
  const kindAttr = new THREE.InstancedBufferAttribute(kinds, 3);
  kindAttr.setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('aKind', kindAttr);
  const U = { uEdge: { value: 0 }, uHasEdge: { value: 0 }, uToneAbove: { value: 0 }, uToneBelow: { value: 0 } };
  const material = new THREE.ShaderMaterial({ uniforms: U, vertexShader: VS, fragmentShader: FS });
  const mesh = new THREE.InstancedMesh(geo, material, N);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  const group = new THREE.Group();
  group.add(mesh);
  scene.add(group);

  // The blocks as they are now.
  const cp = new Float32Array(N * 3), cs = new Float32Array(N * 3);
  const cq = Array.from({ length: N }, () => new THREE.Quaternion());
  const kA = new Float32Array(N), kB = new Float32Array(N), km = new Float32Array(N);
  let perm = Int32Array.from({ length: N }, (_, i) => i);
  let move: Move | null = null;
  let target: Form = forms.scatter;
  let lastEnd = -Infinity;   // when the last move ends (or ended)
  let dirty = true;

  /** Put the blocks in a form at once. */
  const place = (f: Form) => {
    for (let k = 0; k < N; k++) {
      const P = f.pieces[k];
      for (let a = 0; a < 3; a++) { cp[k * 3 + a] = P.p[a]; cs[k * 3 + a] = P.s[a]; }
      cq[k].copy(P.q);
      kA[k] = kB[k] = P.k;
      km[k] = 1;
    }
    perm = Int32Array.from({ length: N }, (_, i) => i);
    move = null;
    target = f;
    lastEnd = -Infinity;
    dirty = true;
  };
  place(forms.scatter);

  const total = (m: Move) => m.spread + m.dur;
  const viewAt = (t: number): View => (move ? mixView(move.viewFrom, move.to.view, easeInOut(clamp01((t - move.t0) / total(move)))) : target.view);
  const endsAt = () => lastEnd;

  /** Start a move from wherever the blocks are now to a form. `match` finds the least travel; else each block keeps its piece. */
  const go = (to: Form, t: number, o: { match: boolean; spread?: number; dur?: number }) => {
    const viewFrom = viewAt(t);
    const fk = new Float32Array(N);
    for (let k = 0; k < N; k++) fk[k] = km[k] >= 0.5 ? kB[k] : kA[k];
    if (o.match) {
      let lime = -1;
      for (let k = 0; k < N; k++) if (isLime(fk[k]) && cs[k * 3] > 0.01) { lime = k; break; }
      const cost: number[][] = [];
      for (let k = 0; k < N; k++) {
        const row: number[] = [];
        const vis = cs[k * 3] > 0.01 && cs[k * 3 + 1] > 0.01;
        for (let r = 0; r < N; r++) {
          const P = to.pieces[r];
          const dx = cp[k * 3] - P.p[0], dy = cp[k * 3 + 1] - P.p[1], dz = cp[k * 3 + 2] - P.p[2];
          let c = P.spare ? 0 : dx * dx + dy * dy + dz * dz;
          if (vis !== shown(P)) c += 4;
          if (lime >= 0 && to.lime >= 0 && (k === lime) !== (r === to.lime)) c += 1e6;
          row.push(c);
        }
        cost.push(row);
      }
      perm = Int32Array.from(hungarian(cost));
    }
    const spread = o.spread ?? 0.65, dur = o.dur ?? 0.9;
    const delay = new Float32Array(N), arc = new Float32Array(N);
    // How far each block travels; blocks that travel the same way (a sheet and
    // everything on it) are one group: they leave together and lift alike.
    const dx = new Float32Array(N), dy = new Float32Array(N), dz = new Float32Array(N), lead = new Int32Array(N).fill(-1);
    for (let k = 0; k < N; k++) {
      const T = to.pieces[perm[k]], P = T.spare ? [cp[k * 3], cp[k * 3 + 1], cp[k * 3 + 2]] : T.p;
      dx[k] = P[0] - cp[k * 3]; dy[k] = P[1] - cp[k * 3 + 1]; dz[k] = P[2] - cp[k * 3 + 2];
      delay[k] = perm[k] === to.lime ? 0 : spread * (0.08 + 0.92 * to.rank[perm[k]]);
    }
    for (let k = 0; k < N; k++) {
      if (lead[k] >= 0) continue;
      lead[k] = k;
      const d = Math.hypot(dx[k], dy[k], dz[k]);
      arc[k] = Math.min(1, d / 2) * (0.6 + 0.4 * ((k * 7) % 5) / 4);
      if (d < 0.05) continue;
      for (let j = k + 1; j < N; j++) {
        if (lead[j] < 0 && Math.abs(dx[j] - dx[k]) < 0.05 && Math.abs(dy[j] - dy[k]) < 0.05 && Math.abs(dz[j] - dz[k]) < 0.05) lead[j] = k;
      }
    }
    for (let k = 0; k < N; k++) {
      const g = lead[k];
      if (g !== k) {
        arc[k] = arc[g];
        delay[g] = Math.min(delay[g], delay[k]);
      }
    }
    for (let k = 0; k < N; k++) if (lead[k] !== k) delay[k] = delay[lead[k]];
    move = { t0: t, spread, dur, to, perm: perm.slice(), delay, arc, fp: cp.slice(), fs: cs.slice(), fq: cq.map((q) => q.clone()), fk, viewFrom };
    target = to;
    lastEnd = t + spread + dur;
  };

  // Extents of a set of pieces as seen through a view: their boxes' corners, turned.
  const v3 = new THREE.Vector3(), c3 = new THREE.Vector3();
  const extentsOf = (get: (i: number) => { p: ArrayLike<number>; s: ArrayLike<number>; q: THREE.Quaternion } | null, q: THREE.Quaternion): Ext | null => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < N; i++) {
      const it = get(i);
      if (!it || it.s[0] < 0.02 || it.s[1] < 0.02) continue;
      for (let c = 0; c < 8; c++) {
        c3.set(((c & 1) - 0.5) * it.s[0], (((c >> 1) & 1) - 0.5) * it.s[1], (((c >> 2) & 1) - 0.5) * it.s[2]).applyQuaternion(it.q);
        v3.set(it.p[0] + c3.x, it.p[1] + c3.y, it.p[2] + c3.z).applyQuaternion(q);
        if (v3.x < minX) minX = v3.x;
        if (v3.x > maxX) maxX = v3.x;
        if (v3.y < minY) minY = v3.y;
        if (v3.y > maxY) maxY = v3.y;
      }
    }
    return minX === Infinity ? null : { minX, maxX, minY, maxY };
  };
  const snapView = { p: [0, 0, 0] as number[], s: [0, 0, 0] as number[], q: new THREE.Quaternion() };

  const m4 = new THREE.Matrix4(), p3 = new THREE.Vector3(), s3 = new THREE.Vector3();
  /** Lay the blocks out for time t; returns the extents to fit (eased from the last form's to the next's). */
  const update = (t: number, q: THREE.Quaternion): Ext => {
    const m = move;
    if (m) {
      for (let k = 0; k < N; k++) {
        const P = m.to.pieces[m.perm[k]];
        const e = m.dur > 0 ? clamp01((t - m.t0 - m.delay[k]) / m.dur) : 1;
        const ek = easeInOut(e);
        if (P.spare) {
          // Put away where it is, and at once: it only shrinks, all of them together, in the move's first moments,
          // so they're gone before the others arrive.
          const gone = m.dur > 0 ? smooth(0, 0.42, (t - m.t0) / m.dur) : 1;
          for (let a = 0; a < 3; a++) { cp[k * 3 + a] = m.fp[k * 3 + a]; cs[k * 3 + a] = m.fs[k * 3 + a] * (1 - gone); }
          cq[k].copy(m.fq[k]);
          kA[k] = kB[k] = m.fk[k];
          km[k] = 1;
          continue;
        }
        const arc = Math.sin(Math.PI * ek) * m.arc[k];
        for (let a = 0; a < 3; a++) {
          cp[k * 3 + a] = lerp(m.fp[k * 3 + a], P.p[a], ek) + m.to.lift[a] * arc;
          cs[k * 3 + a] = lerp(m.fs[k * 3 + a], P.s[a], ek);
        }
        cq[k].copy(m.fq[k]).slerp(P.q, ek);
        kA[k] = m.fk[k];
        kB[k] = P.k;
        km[k] = m.fk[k] === P.k ? 1 : smooth(0.2, 0.8, ek);
      }
      dirty = true;
      if (t >= m.t0 + total(m)) {
        move = null;
        for (let k = 0; k < N; k++) { kA[k] = kB[k]; km[k] = 1; }
      }
    }
    if (dirty) {
      for (let k = 0; k < N; k++) {
        p3.set(cp[k * 3], cp[k * 3 + 1], cp[k * 3 + 2]);
        s3.set(Math.max(1e-4, cs[k * 3]), Math.max(1e-4, cs[k * 3 + 1]), Math.max(1e-4, cs[k * 3 + 2]));
        m4.compose(p3, cq[k], s3);
        mesh.setMatrixAt(k, m4);
        kinds[k * 3] = kA[k];
        kinds[k * 3 + 1] = kB[k];
        kinds[k * 3 + 2] = km[k];
      }
      mesh.instanceMatrix.needsUpdate = true;
      kindAttr.needsUpdate = true;
      dirty = false;
    }
    group.quaternion.copy(q);

    const extTo = extentsOf((r) => target.pieces[r], q);
    let ext = extTo;
    if (m && move) {
      const extFrom = extentsOf((k) => {
        snapView.p[0] = m.fp[k * 3]; snapView.p[1] = m.fp[k * 3 + 1]; snapView.p[2] = m.fp[k * 3 + 2];
        snapView.s[0] = m.fs[k * 3]; snapView.s[1] = m.fs[k * 3 + 1]; snapView.s[2] = m.fs[k * 3 + 2];
        snapView.q.copy(m.fq[k]);
        return snapView;
      }, q);
      const K2 = easeInOut(clamp01((t - m.t0) / total(m)));
      if (extFrom && extTo) ext = { minX: lerp(extFrom.minX, extTo.minX, K2), maxX: lerp(extFrom.maxX, extTo.maxX, K2), minY: lerp(extFrom.minY, extTo.minY, K2), maxY: lerp(extFrom.maxY, extTo.maxY, K2) };
      else ext = extTo ?? extFrom;
    }
    return ext ?? { minX: -1, maxX: 1, minY: -1, maxY: 1 };
  };

  let cw = 0, chh = 0;
  const resize = (w: number, h: number) => {
    if (w === cw && h === chh) return;
    cw = w;
    chh = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  // Place the extents inside a box (CSS pixels of a canvas w × h), 0.9 of it.
  const fitted = { x: 0, y: 0, s: 1, ok: false };
  const fit = (ext: Ext, box: Box, w: number, h: number, k: number) => {
    const visH = 2 * camera.position.z * Math.tan((camera.fov * Math.PI) / 360), visW = visH * camera.aspect;
    const pxToWorld = visH / h;
    const extW = ext.maxX - ext.minX || 1, extH = ext.maxY - ext.minY || 1;
    const s = Math.min((box.w * pxToWorld) / extW, (box.h * pxToWorld) / extH) * 0.9;
    const cx = (box.x + box.w / 2) / w - 0.5, cy = 0.5 - (box.y + box.h / 2) / h;
    const ox = ((ext.minX + ext.maxX) / 2) * s, oy = ((ext.minY + ext.maxY) / 2) * s;
    const kk = fitted.ok ? k : 1;
    fitted.x = lerp(fitted.x, cx * visW - ox, kk);
    fitted.y = lerp(fitted.y, cy * visH - oy, kk);
    fitted.s = lerp(fitted.s, s, kk);
    fitted.ok = true;
    group.position.set(fitted.x, fitted.y, 0);
    group.scale.setScalar(fitted.s);
  };
  const dispose = () => {
    geo.dispose();
    material.dispose();
    renderer.dispose();
  };
  return {
    renderer, scene, camera, U, forms,
    place, go, update, viewAt, endsAt,
    busy: (t: number) => t < endsAt(),
    resize, fit, dispose,
  };
}

const formList = (rig: { forms: Record<string, Form> }, names: string | undefined) =>
  (names ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s in rig.forms)
    .map((s) => rig.forms[s]);

/* ------------------------------------------------------------------ story */

type Chapter = {
  el: HTMLElement;
  copy: HTMLElement | null;
  win: HTMLElement | null;
  forms: Form[];
  tone: number;        // 0: a black chapter, 1: a paper one
  steps: number;
  top: number;
  h: number;
};

export function mountBlockStory({ canvas, root, reduced, fine, onReady }: Opts): StoryHandle {
  const rig = createRig(canvas, fine ? 2 : 1.5);
  const { renderer, scene, camera, U, forms } = rig;
  const scroller: Scroller | null = fine && !reduced ? createScroller() : null;

  /* chapters, from the DOM */
  let chapters: Chapter[] = [];
  const readChapters = () => {
    chapters = Array.from(root.querySelectorAll<HTMLElement>('[data-chapter]')).map((el) => {
      const list = formList(rig, el.dataset.forms ?? el.dataset.form);
      return {
        el,
        copy: el.querySelector<HTMLElement>('.ch-copy'),
        win: el.querySelector<HTMLElement>('.ch-window'),
        forms: list.length ? list : [forms.cube],
        tone: el.dataset.tone === 'paper' ? 1 : 0,
        steps: Number(el.dataset.steps || 0),
        top: 0,
        h: 1,
      };
    });
  };
  readChapters();
  const measure = () => {
    for (const c of chapters) {
      const r = c.el.getBoundingClientRect();
      c.top = r.top + window.scrollY;
      c.h = Math.max(1, r.height);
    }
  };

  /* the pointer: the object leans toward it a little */
  let pointerIn = false;
  const ndc = new THREE.Vector2();
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    ndc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    pointerIn = true;
  };
  const onLeave = () => { pointerIn = false; };
  window.addEventListener('pointermove', onMove, { passive: true });
  document.documentElement.addEventListener('mouseleave', onLeave);

  // A chapter's words, as a box the object sits beside (desktop), or its
  // window (phones and tall windows): both in CSS pixels.
  const tall = () => window.innerWidth < 900 || window.innerWidth / window.innerHeight < 0.95;
  const boxFor = (c: Chapter): Box | null => {
    const vw = window.innerWidth, vh = window.innerHeight;
    if (tall()) {
      const r = c.win?.getBoundingClientRect();
      if (!r || r.height <= 0) return null;
      const gut = Math.max(16, Math.min(vw * 0.04, 32));
      return { x: gut, y: r.top, w: vw - gut * 2, h: r.height };
    }
    const r = c.copy?.getBoundingClientRect();
    if (!r) return null;
    const edge = Math.max(Math.min(vw * 0.04, 32), (vw - 1440) / 2 + Math.min(vw * 0.04, 32));
    const gap = Math.min(vw * 0.04, 56);
    const minH = vh * 0.5, h = Math.max(r.height, minH), y = r.top + r.height / 2 - h / 2;
    const left = r.left + r.width / 2 < vw / 2;   // the words on the left: the object on the right
    return left ? { x: r.right + gap, y, w: vw - edge - (r.right + gap), h } : { x: edge, y, w: r.left - gap - edge, h };
  };
  const mixBox = (a: Box, b: Box, k: number): Box => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), w: lerp(a.w, b.w, k), h: lerp(a.h, b.h, k) });

  // Which chapter is on: on a desktop, the one past the middle of the screen;
  // on a phone, the one whose window is nearest the middle.
  const pick = () => {
    const vh = window.innerHeight;
    if (tall()) {
      let best = 0, bestD = Infinity;
      chapters.forEach((c, k) => {
        const r = c.win?.getBoundingClientRect();
        if (!r) return;
        const d = Math.abs(r.top + r.height / 2 - vh / 2);
        if (d < bestD) { bestD = d; best = k; }
      });
      return best;
    }
    const y = window.scrollY;
    let k = 0;
    for (let j = 0; j < chapters.length; j++) if (chapters[j].top <= y + vh * 0.55) k = j;
    return k;
  };

  /* the loop */
  let raf = 0, running = false, visible = true, ready = false, last = performance.now();
  let ci = -1, si = 0, tEnter = 0, enterEnds = 0, first = true;
  let boxFrom: Box | null = null, lastBox: Box | null = null;
  let mxS = 0, myS = 0;
  const splashDone = () => (window as unknown as { __qbixSplashDone?: boolean }).__qbixSplashDone !== false;
  const setStep = (c: Chapter, s: number) => {
    if (!c.steps) return;
    const f = c.forms[s];
    c.el.setAttribute('data-step', String(f.step ?? s));
  };
  const enter = (k: number, t: number) => {
    const c = chapters[k];
    ci = k;
    si = reduced ? c.forms.length - 1 : 0;
    const f = c.forms[si];
    if (reduced) rig.go(f, t, { match: true, spread: 0, dur: 0 });
    else if (first) rig.go(f, t, { match: f !== forms.cube, spread: 0.8, dur: 1.1 });   // the hero's gathering
    else rig.go(f, t, { match: true });
    first = false;
    tEnter = t;
    enterEnds = rig.endsAt();
    boxFrom = lastBox;
    setStep(c, si);
  };

  const q = new THREE.Quaternion(), rot = new THREE.Euler();
  const frame = (now: number) => {
    raf = 0;
    if (!running) return;
    raf = requestAnimationFrame(frame);
    scroller?.step(now);   // the page first, so the object is placed against where the words are this frame
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = now / 1000;
    if (!chapters.length) return;
    measure();
    const vw = window.innerWidth, vh = window.innerHeight;
    rig.resize(vw, vh);

    // The chapter that's on, and its scenes: one after another, on a loop.
    if (splashDone()) {
      const k = pick();
      if (k !== ci) enter(k, t);
      else if (!reduced) {
        const c = chapters[ci];
        if (c.forms.length > 1 && !rig.busy(t) && t - rig.endsAt() >= c.forms[si].hold) {
          si = (si + 1) % c.forms.length;
          rig.go(c.forms[si], t, { match: false });
          setStep(c, si);
        }
      }
    }

    // Arriving at a chapter whose object is still on its way: the page eases to a stop at the chapter's top until it's there.
    if (scroller) {
      let hold: number | null = null;
      if (ci > 0 && !tall() && t < enterEnds + 0.5) {
        const top = chapters[ci].top;
        if (window.scrollY <= top + 2) hold = top;
      }
      scroller.holdY = hold;
    }

    // The view: the form's, with a slow sway, leaning toward the pointer.
    const view = rig.viewAt(t);
    mxS += (ndc.x - mxS) * Math.min(1, dt * 3);
    myS += (ndc.y - myS) * Math.min(1, dt * 3);
    const sway = reduced ? 0 : pointerIn ? 1 : 0.6;
    rot.set(view.pitch - myS * 0.07 * sway, view.yaw + Math.sin(t * 0.3) * 0.05 * (reduced ? 0 : 1) + mxS * 0.12 * sway, 0);
    q.setFromEuler(rot);
    const ext = rig.update(t, q);

    // Sized to the words beside it, gliding there when the chapter changes.
    if (ci >= 0) {
      const live = boxFor(chapters[ci]);
      const kb = easeInOut(clamp01((t - tEnter) / Math.max(0.001, enterEnds - tEnter)));
      const box = boxFrom && live ? mixBox(boxFrom, live, kb) : live ?? boxFrom;
      if (box && box.w > 40 && box.h > 40) {
        rig.fit(ext, box, vw, vh, 1 - Math.exp(-dt * 14));
        lastBox = box;
      }
    }

    // The page's colours: the edge of the chapter scrolling up cuts the object.
    let edgeCss = -1, above = 0, below = 0;
    for (let k = 0; k < chapters.length; k++) {
      const r = chapters[k].el.getBoundingClientRect();
      if (r.top > 0 && r.top < vh) { edgeCss = r.top; below = chapters[k].tone; above = k > 0 ? chapters[k - 1].tone : below; break; }
      if (r.top <= 0 && r.bottom > 0) above = below = chapters[k].tone;
    }
    U.uHasEdge.value = edgeCss >= 0 ? 1 : 0;
    U.uEdge.value = (vh - edgeCss) * renderer.getPixelRatio();
    U.uToneAbove.value = above;
    U.uToneBelow.value = below;

    renderer.render(scene, camera);
    if (!ready) { ready = true; onReady?.(); }
  };

  const setRunning = () => {
    const want = visible && !document.hidden;
    if (want === running) return;
    running = want;
    if (running) { last = performance.now(); raf = requestAnimationFrame(frame); }
    else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    if (!running && scroller) scroller.holdY = null;
  };
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; setRunning(); });
  io.observe(root);
  const onVis = () => setRunning();
  document.addEventListener('visibilitychange', onVis);
  setRunning();

  return {
    refresh() {
      readChapters();
      measure();
      ci = -1;   // the chapters may be new: take whichever is on now
    },
    dispose() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      scroller?.dispose();
      rig.dispose();
    },
  };
}

/* ----------------------------------------------------------------- figure */

/**
 * The pieces on a subpage: gathered out of loose blocks into the first form
 * when they first show, then, with more than one form (`form` is a comma
 * list), playing them on a loop. Sways a little, tilts with the pointer;
 * renders only while on screen.
 */
export function mountBlockFigure(
  canvas: HTMLCanvasElement,
  { form, tone, reduced }: { form: string; tone: 'dark' | 'paper'; reduced: boolean },
): () => void {
  const rig = createRig(canvas, 2);
  const { renderer, scene, camera, U } = rig;
  const seq = formList(rig, form);
  if (!seq.length) seq.push(rig.forms.cube);
  U.uToneAbove.value = tone === 'paper' ? 1 : 0;
  U.uToneBelow.value = U.uToneAbove.value;
  if (reduced) rig.place(seq[seq.length - 1]);

  const ndc = new THREE.Vector2();
  let pointerIn = false;
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    pointerIn = true;
  };
  const onLeave = () => { pointerIn = false; };
  window.addEventListener('pointermove', onMove, { passive: true });
  document.documentElement.addEventListener('mouseleave', onLeave);

  let raf = 0, running = false, visible = false, started = reduced, si = 0, last = performance.now(), mxS = 0, myS = 0;
  const q = new THREE.Quaternion(), rot = new THREE.Euler();
  const frame = (now: number) => {
    raf = 0;
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = now / 1000;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    rig.resize(w, h);
    if (!started) {
      started = true;
      rig.go(seq[0], t + 0.1, { match: seq[0] !== rig.forms.cube, spread: 0.8, dur: 1.1 });
    } else if (!reduced && seq.length > 1 && !rig.busy(t) && t - rig.endsAt() >= seq[si].hold) {
      si = (si + 1) % seq.length;
      rig.go(seq[si], t, { match: false });
    }
    const view = rig.viewAt(t);
    const px = pointerIn ? Math.max(-1, Math.min(1, ndc.x)) : 0, py = pointerIn ? Math.max(-1, Math.min(1, ndc.y)) : 0;
    mxS += (px - mxS) * Math.min(1, dt * 3);
    myS += (py - myS) * Math.min(1, dt * 3);
    rot.set(view.pitch - myS * 0.07, view.yaw + (reduced ? 0 : Math.sin(t * 0.3) * 0.05) + mxS * 0.12, 0);
    q.setFromEuler(rot);
    const ext = rig.update(t, q);
    rig.fit(ext, { x: 0, y: 0, w, h }, w, h, 1 - Math.exp(-dt * 14));
    renderer.render(scene, camera);
  };
  const setRunning = () => {
    const want = visible && !document.hidden;
    if (want === running) return;
    running = want;
    if (running) { last = performance.now(); raf = requestAnimationFrame(frame); }
    else if (raf) { cancelAnimationFrame(raf); raf = 0; }
  };
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; setRunning(); }, { rootMargin: '120px 0px' });
  io.observe(canvas);
  const onVis = () => setRunning();
  document.addEventListener('visibilitychange', onVis);

  return () => {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    io.disconnect();
    document.removeEventListener('visibilitychange', onVis);
    window.removeEventListener('pointermove', onMove);
    document.documentElement.removeEventListener('mouseleave', onLeave);
    rig.dispose();
  };
}
