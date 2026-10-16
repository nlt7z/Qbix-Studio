import * as THREE from 'three';

/**
 * The homepage story: one object, 4,096 blocks, told in chapters.
 *
 * Every chapter of the page is a normal section (`[data-chapter]`) with its
 * own words; this draws the one 3D object behind them on a fixed, transparent
 * canvas. Each chapter names a form (`data-form`): the cube, a website, the
 * brand stack, a pixel screen, a cloud of ideas, the wordmark, a listing kit,
 * a practice website. Scrolling into a chapter (its top travelling up the
 * last screen of the one before) morphs the blocks from the previous form
 * into its own; the rest of the chapter is its dwell, where a form can play
 * an inner step (the brand stack presses together, the ideas gather).
 *
 * All forms live in two GPU textures (position + scale, colour + flags), and
 * the vertex shader blends between any two of them per block, each on its own
 * beat with an arc and a tumble, so a morph costs one draw call. Blocks are
 * paired between forms by where they sit (a Morton curve over each form's
 * box), so the cube's lower left becomes the website's lower left. One block,
 * the idea, has the same index in every form and always moves first.
 *
 * Pacing: on desktop, scrolling can't outrun the story. While a wheel or key
 * is driving the page, the scene may advance at most one chapter every ~2.8s;
 * further ahead, the page is held back until the scene catches up.
 */

export type StoryHandle = { refresh: () => void; dispose: () => void };
type Opts = {
  canvas: HTMLCanvasElement;
  root: HTMLElement;
  reduced: boolean;
  fine: boolean;
  onReady?: () => void;
};

const N = 4096;
const FORMS = ['pix', 'cube', 'site', 'brand', 'press', 'led', 'cloud', 'seed', 'word', 'listing', 'practice'] as const;
type FormName = (typeof FORMS)[number];
const F = Object.fromEntries(FORMS.map((f, i) => [f, i])) as Record<FormName, number>;
const NF = FORMS.length;

// The qbix wordmark (viewBox 918 × 342); its i's dot is the lime.
const MARK = 'M131.5 230H93.5A60.5 60.5 0 1 1 154 169.5V342H187V169.5A93.5 93.5 0 1 0 93.5 263H131.5ZM280.5 0H313.5V169.5A60.5 60.5 0 1 0 374 109H337.5V76H374A93.5 93.5 0 1 1 280.5 169.5ZM583.5 0H616.5V34H583.5ZM583.5 77H616.5V264H583.5ZM709.5 77H752L810.01 143.99A40.5 40.5 0 0 1 810.01 197.01L752 264H709.5L790.47 170.5ZM875.5 77H918L853.92 151H847A16.5 16.5 0 0 1 830.5 134.5V128.96ZM875.5 264H918L853.92 190H847A16.5 16.5 0 0 0 830.5 206.5V212.04Z';
const MW = 918;
const MH = 342;

const WH: RGB = [244, 245, 242];
const IN: RGB = [18, 20, 23];
const LI: RGB = [184, 255, 0];
type RGB = [number, number, number];
type Voxel = { p: [number, number, number]; s: number; c: RGB; flag?: number; idea?: boolean; key?: number };

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const smooth = (a: number, b: number, x: number) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/* ------------------------------------------------------------------ forms */

const FONT: Record<string, string[]> = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  a: ['.....', '.....', '.###.', '....#', '.####', '#...#', '.####'],
};
const glyph = (ch: string, x: number, y: number) => !!FONT[ch]?.[y] && FONT[ch][y][x] === '#';

function buildForms() {
  const pos = new Float32Array(N * NF * 4);
  const col = new Uint8Array(N * NF * 4);
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const part = (n: number) => {
    n &= 1023;
    n = (n | (n << 16)) & 0x030000ff;
    n = (n | (n << 8)) & 0x0300f00f;
    n = (n | (n << 4)) & 0x030c30c3;
    n = (n | (n << 2)) & 0x09249249;
    return n;
  };
  // Write a form: blocks ordered along a Morton curve over the form's own box,
  // spares parked (scale 0) beside their neighbour, the idea last.
  function commit(f: number, list: Voxel[]) {
    const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
    for (const v of list) for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], v.p[k]); mx[k] = Math.max(mx[k], v.p[k]); }
    for (const v of list) {
      const q = [0, 1, 2].map((k) => (mx[k] - mn[k] < 1e-6 ? 512 : Math.round(((v.p[k] - mn[k]) / (mx[k] - mn[k])) * 1023)));
      v.key = (part(q[0]) | (part(q[1]) << 1) | (part(q[2]) << 2)) >>> 0;
    }
    const at = list.findIndex((v) => v.idea);
    const idea = at >= 0 ? list.splice(at, 1)[0] : null;
    list.sort((x, y) => (x.key ?? 0) - (y.key ?? 0));
    const slots = idea ? N - 1 : N, M = Math.min(list.length, slots);
    const write = (i: number, v: Voxel, s: number) => {
      const o = (f * N + i) * 4;
      pos[o] = v.p[0]; pos[o + 1] = v.p[1]; pos[o + 2] = v.p[2]; pos[o + 3] = s;
      col[o] = v.c[0]; col[o + 1] = v.c[1]; col[o + 2] = v.c[2]; col[o + 3] = v.flag ?? 0;
    };
    let k = 0;
    for (let i = 0; i < slots; i++) {
      if (k < M && i === Math.floor((k * slots) / M)) { write(i, list[k], list[k].s); k++; }
      else write(i, list[Math.max(0, k - 1)], 0);
    }
    if (idea) write(N - 1, idea, idea.s);
  }

  // pix · the page's pixels: a flat sheet across the screen, one of them lime (the idea)
  {
    const L: Voxel[] = [];
    for (let r = 0; r < 64; r++) for (let c = 0; c < 64; c++) {
      const idea = c === 22 && r === 33;
      L.push({ p: [(c - 31.5) * 1.45, (31.5 - r) * 1.45, 0], s: idea ? 1.1 : 0.36, c: idea ? LI : WH, idea });
    }
    commit(F.pix, L);
  }
  // cube · 16³, a different pattern on each face, a pixel q on the front, a lime corner
  {
    const L: Voxel[] = [];
    const Q = ['.#####.', '#.....#', '#.....#', '#.....#', '#....##', '.####.#', '......#', '......#', '......#'];
    for (let z = 0; z < 16; z++) for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const fr = z === 15, bk = z === 0, rt = x === 15, lf = x === 0, tp = y === 15, bt = y === 0;
      let c = IN;
      if (fr || bk || rt || lf || tp || bt) {
        c = WH;
        if (bt) c = IN;
        if (bk && (x % 4 === 0 || y % 4 === 0)) c = IN;
        if (lf && y % 3 === 0 && z % 3 === 0) c = IN;
        if (tp && ((x >> 1) + (z >> 1)) % 2 === 0) c = IN;
        if (rt && (y + z) % 4 === 0) c = IN;
        if (fr) { const row = Q[10 - y]; if (row && row[x - 2] === '#') c = IN; }
      }
      if (x >= 12 && y >= 12 && z >= 12) c = LI;
      L.push({ p: [x - 7.5, y - 7.5, z - 7.5], s: 0.9, c, idea: x === 15 && y === 15 && z === 15 });
    }
    commit(F.cube, L);
  }
  // site · a website on its device: nav, a hero that goes live (flag 100), media, three cards
  {
    const L: Voxel[] = [], S = 0.5, sc = 0.46;
    const add = (c: number, r: number, y: number, k: RGB, flag = 0, idea = false) => L.push({ p: [(c - 31.5) * S, y * S, (r - 19.5) * S], s: sc, c: k, flag, idea });
    for (let r = 0; r < 40; r++) for (let c = 0; c < 64; c++) add(c, r, 0, IN);
    [2, 4, 6].forEach((c) => add(c, 1, 1, WH));
    for (let r = 4; r <= 5; r++) for (let c = 3; c <= 60; c++) add(c, r, 1, WH);
    for (let r = 8; r <= 19; r++) for (let c = 3; c <= 36; c++) add(c, r, 1, WH, 100, r === 14 && c === 30);
    for (let c = 6; c <= 27; c++) add(c, 11, 2, IN);
    for (let c = 6; c <= 21; c++) add(c, 13, 2, IN);
    for (let r = 16; r <= 17; r++) for (let c = 6; c <= 12; c++) add(c, r, 2, IN);
    for (let r = 8; r <= 19; r++) for (let c = 39; c <= 60; c++) add(c, r, 1, WH);
    for (let r = 10; r <= 12; r++) for (let c = 54; c <= 56; c++) add(c, r, 2, IN);
    [3, 23, 43].forEach((c0) => {
      for (let r = 23; r <= 33; r++) for (let c = c0; c <= c0 + 17; c++) add(c, r, 1, WH);
      for (let r = 25; r <= 27; r++) for (let c = c0 + 2; c <= c0 + 6; c++) add(c, r, 2, IN);
      for (let c = c0 + 2; c <= c0 + 11; c++) add(c, 30, 2, IN);
    });
    commit(F.site, L);
  }
  // brand, press · grid, colour + type, the mark (lime); exploded, then pressed together
  const brand = (f: number, gap: number) => {
    const L: Voxel[] = [], S = 0.6, sc = 0.55;
    const at = (c: number, r: number, y: number): [number, number, number] => [(c - 11.5) * S, y, (r - 11.5) * S];
    for (let p = 0; p < 3; p++) {
      for (let r = 0; r < 24; r++) for (let c = 0; c < 24; c++) {
        let k: RGB = WH;
        if (p === 0) k = c % 4 === 0 || r % 4 === 0 ? IN : WH;
        if (p === 1) {
          k = IN;
          if (glyph('A', c - 3, r - 4) || glyph('a', c - 9, r - 4)) k = WH;
          if (r >= 15 && r <= 19 && ((c >= 3 && c <= 6) || (c >= 9 && c <= 12) || (c >= 15 && c <= 18))) k = WH;
        }
        L.push({ p: at(c, r, p * gap), s: sc, c: k });
      }
    }
    const top = 2 * gap + S;
    for (let r = 4; r <= 19; r++) for (let c = 4; c <= 19; c++) {
      if (c === 11 || c === 12 || r === 11 || r === 12) L.push({ p: at(c, r, top), s: sc, c: LI, idea: c === 12 && r === 12 });
    }
    for (const [c0, r0] of [[5, 5], [16, 5], [5, 16], [16, 16]]) {
      for (let r = r0; r < r0 + 3; r++) for (let c = c0; c < c0 + 3; c++) L.push({ p: at(c, r, top), s: sc, c: IN });
    }
    commit(f, L);
  };
  brand(F.brand, 6.0);
  brand(F.press, 0.62);
  // led · a pixel screen, 80 × 51: each block is one pixel of the product's film (flag 200)
  {
    const L: Voxel[] = [], S = 0.42;
    for (let gy = 0; gy < 51; gy++) for (let gx = 0; gx < 80; gx++) {
      L.push({ p: [(gx - 39.5) * S, (25 - gy) * S, 0], s: 0.37, c: [gx, gy, 0], flag: 200, idea: gx === 66 && gy === 4 });
    }
    commit(F.led, L);
  }
  // cloud · ideas, scattered; seed · every one of them gathered into one block
  {
    const L: Voxel[] = [];
    for (let i = 0; i < 4095; i++) {
      const u = rnd() * 2 - 1, th = rnd() * Math.PI * 2, rad = 5 + Math.pow(rnd(), 0.6) * 11;
      const sq = Math.sqrt(1 - u * u);
      L.push({ p: [Math.cos(th) * sq * rad * 1.65, u * rad * 0.75, Math.sin(th) * sq * rad * 0.8], s: 0.28 + rnd() * 0.5, c: IN });
    }
    L.push({ p: [0, 0, 9], s: 1.0, c: IN, idea: true });
    commit(F.cloud, L);
    const G: Voxel[] = [], S = 0.46;
    for (let z = 0; z < 16; z++) for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      G.push({ p: [(x - 7.5) * S, (y - 7.5) * S, (z - 7.5) * S], s: 0.42, c: IN, idea: x === 15 && y === 15 && z === 15 });
    }
    commit(F.seed, G);
  }
  // word · the wordmark, three blocks deep, the i's dot lime
  {
    let cols = 104, R = rasterMark(cols);
    while (R.cells.length * 3 > N && cols > 40) { cols -= 4; R = rasterMark(cols); }
    const S = 0.6 * (104 / cols), L: Voxel[] = [];
    let ideaSet = false;
    for (const { c, r, dot } of R.cells) for (let d = 0; d < 3; d++) {
      const idea = !ideaSet && dot && d === 2;
      if (idea) ideaSet = true;
      L.push({ p: [(c - R.cols / 2) * S, (R.rows / 2 - r) * S, (d - 1) * S], s: S * 0.9, c: dot ? LI : WH, idea });
    }
    commit(F.word, L);
  }
  // listing · a print flyer (its Just Listed tag is the lime), five posts dealt off it, a phone
  {
    const L: Voxel[] = [], S = 0.5, sc = 0.46;
    const add = (c: number, r: number, y: number, k: RGB, idea = false) => L.push({ p: [(c - 30) * S, y * S, (r - 21) * S], s: sc, c: k, idea });
    for (let r = 0; r < 34; r++) for (let c = 0; c < 26; c++) {
      const photo = r >= 2 && r <= 15 && c >= 2 && c <= 23;
      const rim = r === 0 || r === 33 || c === 0 || c === 25;   // an ink rim, so white paper reads on the paper panel
      add(c, r, 0, photo || rim ? IN : WH);
    }
    const roof = [[4, 11, 14], [5, 10, 15], [6, 8, 17], [7, 7, 18]];
    for (const [r, c0, c1] of roof) for (let c = c0; c <= c1; c++) add(c, r, 1, WH);
    for (let r = 8; r <= 13; r++) for (let c = 8; c <= 17; c++) add(c, r, 1, r >= 11 && (c === 12 || c === 13) ? IN : WH);
    for (let r = 17; r <= 18; r++) for (let c = 2; c <= 12; c++) add(c, r, 1, LI, r === 17 && c === 7);
    for (const [r, c1] of [[21, 18], [23, 12], [26, 20], [28, 14]]) for (let c = 2; c <= c1; c++) add(c, r, 1, IN);
    for (let r = 30; r <= 31; r++) { add(2, r, 1, IN); add(3, r, 1, IN); for (let c = 5; c <= 14; c++) if (r === 30) add(c, r, 1, IN); }
    for (let k = 0; k < 5; k++) {
      const c0 = 30 + k * 4, r0 = 1 + k * 3, y = k * 0.6;
      for (let r = 0; r < 12; r++) for (let c = 0; c < 12; c++) {
        const rim = r === 0 || r === 11 || c === 0 || c === 11;
        add(c0 + c, r0 + r, y, rim || (r >= 2 && r <= 7 && c >= 2 && c <= 9) ? IN : WH);
      }
      for (let c = 1; c <= 6; c++) add(c0 + c, r0 + 9, y + 1, IN);
    }
    for (let r = 22; r < 42; r++) for (let c = 48; c < 59; c++) {
      const screen = r >= 24 && r <= 39 && c >= 49 && c <= 57;
      add(c, r, 0, screen ? WH : IN);
    }
    for (const [r, c0, c1] of [[29, 52, 52], [30, 52, 53], [31, 52, 54], [32, 52, 53], [33, 52, 52]]) for (let c = c0; c <= c1; c++) add(c, r, 1, IN);
    commit(F.listing, L);
  }
  // practice · a calm practice website (its Book a consultation button is the lime) and its phone
  {
    const L: Voxel[] = [], S = 0.5, sc = 0.46;
    const add = (c: number, r: number, y: number, k: RGB, idea = false) => L.push({ p: [(c - 29) * S, y * S, (r - 15) * S], s: sc, c: k, idea });
    for (let r = 0; r < 30; r++) for (let c = 0; c < 44; c++) {
      const photo = r >= 5 && r <= 21 && c >= 28 && c <= 40;
      add(c, r, 0, photo ? IN : WH);
    }
    for (let c = 3; c <= 10; c++) add(c, 2, 1, IN);
    for (let c = 30; c <= 40; c += 4) { add(c, 2, 1, IN); add(c + 1, 2, 1, IN); }
    for (const [r, c1] of [[6, 24], [7, 24], [9, 18], [10, 18]]) for (let c = 3; c <= c1; c++) add(c, r, 1, IN);
    for (const [r, c1] of [[13, 22], [15, 20]]) for (let c = 3; c <= c1; c++) add(c, r, 1, IN);
    for (let r = 18; r <= 20; r++) for (let c = 3; c <= 12; c++) add(c, r, 1, LI, r === 19 && c === 8);
    for (let c = 3; c <= 40; c++) add(c, 26, 1, IN);
    for (let r = 4; r < 28; r++) for (let c = 48; c < 59; c++) add(c, r, 0, r === 4 || r === 27 || c === 48 || c === 58 ? IN : WH);
    for (const [r, c1] of [[8, 56], [9, 56], [12, 55], [14, 54]]) for (let c = 50; c <= c1; c++) add(c, r, 1, IN);
    for (let r = 20; r <= 21; r++) for (let c = 50; c <= 55; c++) add(c, r, 1, IN);
    commit(F.practice, L);
  }
  return { pos, col };
}

function rasterMark(cols: number) {
  const cell = MW / cols, rows = Math.ceil(MH / cell);
  const ctx = document.createElement('canvas').getContext('2d')!;
  const path = new Path2D(MARK);
  const cells: { c: number; r: number; dot: boolean }[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = (c + 0.5) * cell, y = (r + 0.5) * cell;
    if (ctx.isPointInPath(path, x, y)) cells.push({ c, r, dot: x >= 583.5 && x <= 616.5 && y <= 34 });
  }
  return { cells, cols, rows };
}

// How each form stands in the frame: turned, tilted, sized. `tall` shrinks
// wide forms further on a portrait screen.
type View = { yaw: number; pitch: number; scale: number; sway: number; tall: number; y: number };
const v = (yaw: number, pitch: number, scale: number, sway: number, tall = 1, y = 0): View => ({ yaw, pitch, scale, sway, tall, y });
const VIEW: Record<FormName, View> = {
  pix: v(0, 0, 1, 0),
  cube: v(-0.62, 0.46, 1.12, 1),
  site: v(-0.36, 0.98, 0.94, 0.4, 0.8),
  brand: v(-0.72, 0.4, 1.22, 1),
  press: v(-0.72, 0.4, 1.22, 1),
  led: v(0.22, 0.04, 0.98, 0.3, 0.72),
  cloud: v(-0.3, 0.2, 0.95, 1, 0.9),
  seed: v(-0.62, 0.46, 1.6, 1),
  word: v(0, 0.08, 0.9, 0.25, 0.62, -0.12),   // under the words, not behind them
  listing: v(-0.4, 0.95, 0.98, 0.4, 0.8),
  practice: v(-0.4, 0.95, 1.0, 0.4, 0.8),
};

/* ---------------------------------------------------------------- shaders */

const VS = /* glsl */ `
uniform sampler2D uPos;
uniform sampler2D uCol;
uniform sampler2D uLed;
uniform int uFrom;
uniform int uTo;
uniform int uInner;
uniform int uIdea;
uniform float uT;
uniform float uInnerT;
uniform float uLive;
uniform float uLiveFrom;
uniform float uMotion;
attribute vec3 aDisp;
varying vec3 vColor;
varying vec3 vN;

const int N = ${N};
vec4 posAt(int f, int id) { int k = f * N + id; return texelFetch(uPos, ivec2(k % 64, k / 64), 0); }
vec4 colAt(int f, int id) { int k = f * N + id; return texelFetch(uCol, ivec2(k % 64, k / 64), 0); }
float h1(float n) { return fract(sin(n * 91.3458) * 47453.5453); }
float ease3(float x) { return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) * 0.5; }
mat3 rotAxis(vec3 a, float t) {
  a = normalize(a);
  float s = sin(t), c = cos(t), o = 1.0 - c;
  return mat3(o * a.x * a.x + c,       o * a.x * a.y + a.z * s, o * a.z * a.x - a.y * s,
              o * a.x * a.y - a.z * s, o * a.y * a.y + c,       o * a.y * a.z + a.x * s,
              o * a.z * a.x + a.y * s, o * a.y * a.z - a.x * s, o * a.z * a.z + c);
}
float isLed(vec4 c) { return step(0.7, c.a); }
float isLive(vec4 c) { return step(0.3, c.a) * (1.0 - step(0.5, c.a)); }
vec3 paint(vec4 c) {
  if (c.a > 0.7) return texelFetch(uLed, ivec2(floor(c.rg * 255.0 + 0.5)), 0).rgb;
  return c.rgb;
}

void main() {
  int id = gl_InstanceID;
  float fid = float(id);
  bool idea = id == uIdea;
  vec4 a = posAt(uFrom, id);
  vec4 b = posAt(uTo, id);
  vec4 ca = colAt(uFrom, id);
  vec4 cb = colAt(uTo, id);

  // Every block takes off on its own beat; the idea always goes first.
  float r = idea ? 0.0 : h1(fid + 1.0);
  float e = ease3(clamp((uT - r * 0.42) / 0.58, 0.0, 1.0));
  vec3 p = mix(a.xyz, b.xyz, e);
  float s = mix(a.w, b.w, e);
  float arc = sin(3.14159265 * e) * uMotion;
  vec3 axis = vec3(h1(fid + 11.0) - 0.5, h1(fid + 23.0) - 0.5, h1(fid + 37.0) - 0.5) + 0.001;
  float ang = arc * (1.2 + r * 2.4);
  p += vec3((h1(fid + 5.0) - 0.5) * 4.0, 2.0 + r * 6.0, (h1(fid + 9.0) - 0.5) * 6.0) * arc;

  vec3 c = mix(paint(ca), paint(cb), e);
  c = mix(c, vec3(0.7216, 1.0, 0.0), isLive(ca) * uLiveFrom * (1.0 - e) + isLive(cb) * uLive * e);
  float led = isLed(ca) * (1.0 - e) + isLed(cb) * e;
  p.z += dot(c, vec3(0.299, 0.587, 0.114)) * 1.8 * led;   // bright pixels stand out of the wall

  if (uInner >= 0) {
    vec4 ip = posAt(uInner, id);
    vec4 ic = colAt(uInner, id);
    float d2 = idea ? 0.64 : r * 0.36;                      // ...and lands last here
    float ei = ease3(clamp((uInnerT - d2) / 0.36, 0.0, 1.0));
    float arc2 = sin(3.14159265 * ei) * uMotion;
    p = mix(p, ip.xyz, ei) + vec3(0.0, 1.5 + r * 3.5, 0.0) * arc2;
    s = mix(s, ip.w, ei);
    c = mix(c, paint(ic), ei);
    ang += arc2 * 1.4;
  }
  p += aDisp;

  // A faint per-block tone, so a face reads as tiles, not a sheet: whites
  // vary a few percent, inks lift a little (no outlines to do it for them).
  if (led < 0.5) {
    float tone = h1(fid + 51.0);
    c = dot(c, vec3(0.299, 0.587, 0.114)) < 0.2 ? c + vec3(0.075 * tone) : c * (0.975 + 0.05 * tone);
  }

  mat3 R = rotAxis(axis, ang);
  vec3 world = R * (position * s) + p;
  vN = normalize(normalMatrix * (R * normal));
  vColor = c;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(world, 1.0);
  if (s < 0.002) gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
}
`;

// No outlines: the blocks are told apart by the gaps between them and by
// three tones of light (top brightest), kept high so white stays white.
const FS = /* glsl */ `
varying vec3 vColor;
varying vec3 vN;
void main() {
  vec3 n = normalize(vN);
  float d = max(dot(n, normalize(vec3(-0.3, 0.85, 0.42))), 0.0);
  gl_FragColor = vec4(vColor * (0.74 + 0.26 * d), 1.0);
}
`;

/* ------------------------------------------------------------- pixel film */

const F3: Record<string, string[]> = {
  L: ['#..', '#..', '#..', '#..', '###'],
  I: ['###', '.#.', '.#.', '.#.', '###'],
  V: ['#.#', '#.#', '#.#', '#.#', '.#.'],
  E: ['###', '#..', '##.', '#..', '###'],
};
const FILMS: Record<string, string> = { strata: '/previews/strata.mp4', bidding: '/bidking-present.mp4' };

// The pixel screen's picture: the product's own film, cover-fitted to 80 × 51,
// a Live tag on top (the screen's lime), and a wipe when the film changes.
function makeFilm() {
  const W = 80, H = 51;
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const g = cv.getContext('2d', { willReadFrequently: true })!;
  g.imageSmoothingEnabled = true;
  const videos = new Map<string, HTMLVideoElement>();
  const video = (key: string) => {
    let v = videos.get(key);
    if (!v) {
      v = document.createElement('video');
      v.src = FILMS[key];
      v.muted = true;
      v.loop = true;
      v.playsInline = true;
      v.preload = 'auto';
      v.setAttribute('aria-hidden', 'true');
      videos.set(key, v);
    }
    return v;
  };
  const draw = (key: string, clipW: number) => {
    const v = video(key);
    g.save();
    g.beginPath();
    g.rect(0, 0, clipW, H);
    g.clip();
    g.fillStyle = '#0a0b0c';
    g.fillRect(0, 0, W, H);
    if (v.readyState >= 2 && v.videoWidth) {
      const k = Math.max(W / v.videoWidth, H / v.videoHeight);
      const w = v.videoWidth * k, h = v.videoHeight * k;
      g.drawImage(v, (W - w) / 2, (H - h) / 2, w, h);
    } else {
      for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#2a2d31' : '#16181b'; g.fillRect(6 + (i % 3) * 24, 12 + Math.floor(i / 3) * 19, 20, 16); }
    }
    g.restore();
  };
  const tag = () => {
    g.fillStyle = '#b8ff00';
    g.fillRect(58, 2, 20, 7);
    g.fillStyle = '#121417';
    let x = 60;
    for (const ch of 'LIVE') {
      F3[ch].forEach((row, ry) => { for (let rx = 0; rx < 3; rx++) if (row[rx] === '#') g.fillRect(x + rx, 3 + ry, 1, 1); });
      x += 4;
    }
  };
  return {
    canvas: cv,
    ctx: g,
    /** Show `key` (wiping in from `from` by `wipe` 0→1); play only what's on screen. */
    paint(key: string, from: string | null, wipe: number) {
      videos.forEach((v, k) => {
        const want = k === key || (k === from && wipe < 1);
        if (want && v.paused) v.play().catch(() => {});
        if (!want && !v.paused) v.pause();
      });
      video(key);
      if (from && from !== key && wipe < 1) {
        draw(from, W);
        draw(key, Math.round(W * wipe));
      } else draw(key, W);
      tag();
    },
    pauseAll() { videos.forEach((v) => { if (!v.paused) v.pause(); }); },
    dispose() { videos.forEach((v) => { v.pause(); v.removeAttribute('src'); v.load(); }); videos.clear(); },
  };
}

/* ------------------------------------------------------------------ mount */

type Chapter = {
  el: HTMLElement;
  form: number;
  name: FormName;
  inner: number;
  innerName: FormName | null;
  side: number;          // -1 left, 0 centre, 1 right (where the object stands)
  low: boolean;          // portrait screens: the object sits low (the hero's words come first)
  live: boolean;
  film: string | null;
  steps: number;
  push: boolean;
  win: HTMLElement | null;   // on a phone, the window the object shows through
  top: number;
  h: number;
};

export function mountVoxelStory({ canvas, root, reduced, fine, onReady }: Opts): StoryHandle {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  if (!renderer.capabilities.isWebGL2) throw new Error('WebGL2 is required');
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.debug.checkShaderErrors = false;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1.6, 1, 600);
  camera.position.set(0, 0, 92);

  const { pos, col } = buildForms();
  const posTex = new THREE.DataTexture(pos, 64, (N * NF) / 64, THREE.RGBAFormat, THREE.FloatType);
  posTex.needsUpdate = true;
  const colTex = new THREE.DataTexture(col, 64, (N * NF) / 64, THREE.RGBAFormat, THREE.UnsignedByteType);
  colTex.needsUpdate = true;
  const film = makeFilm();
  const ledTex = new THREE.DataTexture(new Uint8Array(80 * 51 * 4), 80, 51);
  ledTex.needsUpdate = true;

  const disp = new Float32Array(N * 3), vel = new Float32Array(N * 3);
  const box = new THREE.BoxGeometry(1, 1, 1);
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = box.index;
  geo.setAttribute('position', box.attributes.position);
  geo.setAttribute('normal', box.attributes.normal);
  const dispAttr = new THREE.InstancedBufferAttribute(disp, 3);
  dispAttr.setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('aDisp', dispAttr);
  geo.instanceCount = N;
  const U = {
    uPos: { value: posTex }, uCol: { value: colTex }, uLed: { value: ledTex },
    uFrom: { value: F.pix }, uTo: { value: F.cube }, uInner: { value: -1 }, uIdea: { value: N - 1 },
    uT: { value: 0 }, uInnerT: { value: 0 }, uLive: { value: 0 }, uLiveFrom: { value: 0 },
    uMotion: { value: reduced ? 0 : 1 },
  };
  const material = new THREE.ShaderMaterial({ uniforms: U, vertexShader: VS, fragmentShader: FS });
  const mesh = new THREE.Mesh(geo, material);
  mesh.frustumCulled = false;
  const group = new THREE.Group();
  group.add(mesh);
  scene.add(group);

  // The wordmark's home spots, for the push (z slot: visible or not).
  const wp = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const o = (F.word * N + i) * 4;
    wp[i * 3] = pos[o];
    wp[i * 3 + 1] = pos[o + 1];
    wp[i * 3 + 2] = pos[o + 3] > 0 ? 1 : 0;
  }

  /* chapters, from the DOM */
  let chapters: Chapter[] = [];
  const side = (v: string | undefined) => (v === 'left' ? -1 : v === 'right' ? 1 : 0);
  const readChapters = () => {
    chapters = Array.from(root.querySelectorAll<HTMLElement>('[data-chapter]')).map((el) => {
      const name = (el.dataset.form as FormName) || 'cube';
      const innerName = (el.dataset.inner as FormName) || null;
      return {
        el, name, form: F[name] ?? F.cube, innerName, inner: innerName ? F[innerName] : -1,
        side: side(el.dataset.side), low: el.dataset.low === '1', live: el.dataset.live === '1',
        film: el.dataset.film || null, steps: Number(el.dataset.steps || 0), push: el.dataset.push === '1',
        win: el.querySelector<HTMLElement>('.ch-window'), top: 0, h: 1,
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

  /* the story's position: chapter i + half for its morph + half for its dwell */
  const vh = () => window.innerHeight;
  let introStart = -1;
  const splashDone = () => (window as unknown as { __qbixSplashDone?: boolean }).__qbixSplashDone !== false;
  const storyAt = (y: number, intro: number) => {
    const H = vh();
    let S = 0;
    for (let i = 0; i < chapters.length; i++) {
      const c = chapters[i];
      const m = i === 0 ? intro : clamp01((y - (c.top - H)) / H);
      if (i > 0 && m <= 0) break;
      const d = clamp01((y - c.top) / Math.max(1, c.h - H));
      S = i + 0.5 * m + 0.5 * d;
    }
    return S;
  };
  const scrollAt = (S: number) => {
    const H = vh();
    const i = Math.max(0, Math.min(chapters.length - 1, Math.floor(S)));
    const c = chapters[i], f = S - i;
    if (f < 0.5) return i === 0 ? 0 : c.top - H + (f / 0.5) * H;
    return c.top + ((f - 0.5) / 0.5) * Math.max(1, c.h - H);
  };

  /* input: what is driving the scroll, and where the pointer is */
  let lastInput = -1e9, burst = 0, pointerIn = false;
  const ndc = new THREE.Vector2();
  const markInput = () => { lastInput = performance.now(); };
  // Home and End are deliberate jumps, so they're not held back.
  const keys = new Set(['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ']);
  const onKey = (e: KeyboardEvent) => { if (keys.has(e.key)) markInput(); };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    ndc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    pointerIn = true;
  };
  const onDown = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    if ((e.target as HTMLElement | null)?.closest('a, button, input, textarea, select, [role="button"]')) return;
    burst = 1;
  };
  const onLeave = () => { pointerIn = false; };
  window.addEventListener('wheel', markInput, { passive: true });
  window.addEventListener('touchmove', markInput, { passive: true });
  window.addEventListener('keydown', onKey);
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerdown', onDown, { passive: true });
  document.documentElement.addEventListener('mouseleave', onLeave);

  /* the push on the wordmark */
  const ray = new THREE.Raycaster(), inv = new THREE.Matrix4();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hit = new THREE.Vector3();
  const push = (dt: number, on: boolean) => {
    const h = Math.min(dt, 1 / 30);
    let mx = 1e9, my = 1e9;
    if (on && pointerIn) {
      ray.setFromCamera(ndc, camera);
      inv.copy(group.matrixWorld).invert();
      ray.ray.applyMatrix4(inv);
      if (ray.ray.intersectPlane(plane, hit)) { mx = hit.x; my = hit.y; }
    }
    const R = 7, R2 = R * R, b = on ? burst : 0;
    burst = 0;
    let energy = 0;
    for (let i = 0; i < N; i++) {
      const o = i * 3;
      if (!wp[o + 2]) continue;
      let fx = -disp[o] * 70, fy = -disp[o + 1] * 70, fz = -disp[o + 2] * 70;
      const dx = wp[o] + disp[o] - mx, dy = wp[o + 1] + disp[o + 1] - my, d2 = dx * dx + dy * dy;
      if (d2 < R2) {
        const dd = Math.sqrt(d2) + 1e-3, k = 1 - dd / R;
        fx += (dx / dd) * k * k * 520;
        fy += (dy / dd) * k * k * 520;
        fz += k * 300;
      }
      if (b && d2 < R2 * 4) {
        const dd = Math.sqrt(d2) + 1e-3, k = 1 - dd / (R * 2);
        vel[o] += (dx / dd) * 70 * k;
        vel[o + 1] += (dy / dd) * 70 * k;
        vel[o + 2] += 90 * k * (0.4 + Math.random() * 0.6);
      }
      vel[o] = (vel[o] + fx * h) * 0.88;
      vel[o + 1] = (vel[o + 1] + fy * h) * 0.88;
      vel[o + 2] = (vel[o + 2] + fz * h) * 0.88;
      disp[o] += vel[o] * h;
      disp[o + 1] += vel[o + 1] * h;
      disp[o + 2] += vel[o + 2] * h;
      energy += Math.abs(disp[o]) + Math.abs(disp[o + 1]) + Math.abs(disp[o + 2]);
    }
    dispAttr.needsUpdate = true;
    return energy;
  };

  /* the loop */
  let Sd = 0, raf = 0, running = false, visible = true, ready = false, last = performance.now();
  let mxS = 0, myS = 0, energy = 0, filmClock = 0, stepShown: HTMLElement | null = null, stepIndex = -1;
  const mixV = (a: View, b: View, k: number): View => ({
    yaw: lerp(a.yaw, b.yaw, k), pitch: lerp(a.pitch, b.pitch, k), scale: lerp(a.scale, b.scale, k), sway: lerp(a.sway, b.sway, k), tall: lerp(a.tall, b.tall, k), y: lerp(a.y, b.y, k),
  });
  const resize = () => {
    const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, fine ? 2 : 1.5));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener('resize', resize);

  const frame = (now: number) => {
    raf = 0;
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = now / 1000;
    if (!chapters.length) return;
    measure();

    // The intro: once the splash is gone, the page's pixels lift into the cube.
    if (introStart < 0 && splashDone()) introStart = t;
    const intro = reduced ? 1 : introStart < 0 ? 0 : clamp01((t - introStart - 0.2) / 2.4);
    const y = window.scrollY;
    const St = storyAt(y, intro);

    // Pacing: a wheel or a key may not run ahead of the scene.
    const driving = fine && !reduced && now - lastInput < 260;
    const follow = 1 - Math.exp(-dt * 8);
    let next = Sd + (St - Sd) * follow;
    if (driving && next > Sd) next = Math.min(next, Sd + 0.36 * dt);
    if (!driving && St - Sd > 1.2) next = Sd + (St - Sd) * (1 - Math.exp(-dt * 4));   // a jump: catch up fast
    Sd = Math.min(chapters.length, Math.max(0, next));
    if (driving && St > Sd + 0.25) {
      const cap = scrollAt(Sd + 0.25);
      if (y > cap + 1) window.scrollTo(0, cap);
    }
    draw(Sd, dt, t);
  };

  const draw = (S: number, dt: number, t: number) => {
    const i = Math.min(chapters.length - 1, Math.floor(S)), u = Math.min(1, S - i), ch = chapters[i];
    const prev = i > 0 ? chapters[i - 1] : null;
    const m = clamp01(u / 0.5), d = clamp01((u - 0.5) / 0.5);
    const innerT = ch.inner >= 0 ? clamp01(d / 0.85) : 0;
    const fromForm = prev ? (prev.inner >= 0 ? prev.inner : prev.form) : F.pix;
    const fromName: FormName = prev ? (prev.innerName ?? prev.name) : 'pix';
    U.uFrom.value = fromForm;
    U.uTo.value = ch.form;
    U.uInner.value = ch.inner;
    U.uT.value = m;
    U.uInnerT.value = innerT;
    U.uLive.value = ch.live ? smooth(0.08, 0.5, d) : 0;
    U.uLiveFrom.value = prev && prev.live ? 1 : 0;

    // Where the object stands: the chapter's side, its form's turn and size.
    const e = ease(m);
    let view = mixV(VIEW[fromName], VIEW[ch.name], e);
    if (ch.innerName) view = mixV(view, VIEW[ch.innerName], ease(innerT));
    const sd = lerp(prev ? prev.side : ch.side, ch.side, e);
    const low = lerp(prev ? (prev.low ? 1 : 0) : ch.low ? 1 : 0, ch.low ? 1 : 0, e);
    const visH = 2 * camera.position.z * Math.tan((camera.fov * Math.PI) / 360), visW = visH * camera.aspect;
    const tall = camera.aspect < 0.95 || window.innerWidth < 900;   // the words stack under the object
    mxS += (ndc.x - mxS) * Math.min(1, dt * 3);
    myS += (ndc.y - myS) * Math.min(1, dt * 3);
    const sway = reduced ? 0 : view.sway;
    // On a phone the words flow and the object sits in its chapter's window,
    // moving with it like a picture in the page; on a wide screen it stands
    // on the chapter's side while the words are pinned.
    let y = tall ? lerp(visH * 0.2, -visH * 0.18, low) : view.y * visH, fitH = 1;
    if (tall && ch.win) {
      const r = ch.win.getBoundingClientRect();
      if (r.height > 0) {
        y = (0.5 - (r.top + r.height / 2) / window.innerHeight) * visH;
        fitH = Math.min(1, r.height / window.innerHeight / 0.56);
      }
    }
    group.position.set(tall ? 0 : sd * visW * 0.22, y, 0);
    group.scale.setScalar(view.scale * (tall ? Math.min(1, camera.aspect * 1.2) * view.tall * fitH : Math.min(1, camera.aspect / 1.55)));
    group.rotation.set(view.pitch - myS * 0.08 * sway, view.yaw + (Math.sin(t * 0.35) * 0.08 + mxS * 0.18) * sway, 0);
    group.updateMatrixWorld();

    // The step the words point at follows the dwell.
    if (ch.steps > 0) {
      const k = Math.min(ch.steps - 1, Math.floor(d * ch.steps));
      if (stepShown !== ch.el || stepIndex !== k) {
        if (stepShown && stepShown !== ch.el) stepShown.removeAttribute('data-step');
        ch.el.setAttribute('data-step', String(k));
        stepShown = ch.el;
        stepIndex = k;
      }
    }

    // The pixel screen plays the chapter's film (and wipes from the last one).
    const filmOn = ch.film || (prev?.film && m < 1);
    if (filmOn) {
      filmClock += dt;
      if (filmClock > 1 / 30) {
        filmClock = 0;
        const key = ch.film ?? prev!.film!;
        const from = ch.film && prev?.film && prev.film !== ch.film ? prev.film : null;
        film.paint(key, from, from ? e : 1);
        (ledTex.image.data as Uint8Array).set(film.ctx.getImageData(0, 0, 80, 51).data);
        ledTex.needsUpdate = true;
      }
    } else film.pauseAll();

    const pushOn = ch.push && m > 0.98 && fine;
    if (!pushOn) burst = 0;
    if (pushOn || energy > 0.02) energy = push(dt, pushOn);

    renderer.render(scene, camera);
    if (!ready) { ready = true; onReady?.(); }
  };

  const setRunning = () => {
    const want = visible && !document.hidden;
    if (want === running) return;
    running = want;
    if (running) { last = performance.now(); raf = requestAnimationFrame(frame); }
    else { if (raf) cancelAnimationFrame(raf); raf = 0; film.pauseAll(); }
  };
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; setRunning(); }, { rootMargin: '0px' });
  io.observe(root);
  const onVis = () => setRunning();
  document.addEventListener('visibilitychange', onVis);
  setRunning();

  return {
    refresh() {
      readChapters();
      stepShown = null;
      stepIndex = -1;
    },
    dispose() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('resize', resize);
      window.removeEventListener('wheel', markInput);
      window.removeEventListener('touchmove', markInput);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      film.dispose();
      geo.dispose();
      box.dispose();
      material.dispose();
      posTex.dispose();
      colTex.dispose();
      ledTex.dispose();
      renderer.dispose();
    },
  };
}
