import * as THREE from 'three';
import { createScroller, type Scroller } from '@/lib/smoothScroll';
import { N, buildForms, clamp01, easeInOut, isLime, lerp, mixView, shown, smooth, type Form, type View } from './blockForms';
import { printAtlas, type Rect } from './blockPrints';

/**
 * The site's one object: 64 pieces. In the hero they are a 4 × 4 × 4 cube of
 * clean white blocks, a few of them dotted and one lime corner; in every
 * other chapter they become the thing the chapter is about
 * (components/three/blockForms.ts), with what's on them printed, the way a
 * keycap carries its letter (blockPrints.ts): a launch site's words and
 * picture, a money app's numbers, a hand of cards, a house on a flyer. Each
 * chapter plays its steps on its own, on a loop.
 *
 * Each arrangement (a Form) names, for each piece, its place, size, turn,
 * material and print; a piece can also be put away (size 0). A move takes
 * every piece from where it is to its place in the next form, each on its
 * own beat (the lime one first, then in the form's reading order), with a
 * small arc, its new material and print coming on across it in pixels as it
 * goes (the page's 4px pixel, on screen, so it matches the rest). Moves
 * are timed, not scrubbed by the scroll, so they always play out whole.
 *
 * The object belongs to the page: its colours are the page's (white on a
 * black chapter, ink on a paper one; everything, prints too, is drawn in
 * those two colours and lime), it is sized to the words beside it, and when
 * the next chapter's edge scrolls up through it the edge cuts it, each part
 * matching the page behind it.
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
attribute vec4 aPrintA;
attribute vec4 aPrintB;
varying vec3 vN;
varying vec3 vNo;
varying vec3 vPos;
varying vec3 vScale;
varying vec3 vKind;
varying vec3 vTx;
varying vec3 vTy;
varying vec3 vTz;
varying vec4 vPrintA;
varying vec4 vPrintB;
void main() {
  vScale = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
  mat3 m = mat3(modelMatrix) * mat3(instanceMatrix);
  vN = normalize(m * normal);
  vTx = normalize(m * vec3(1.0, 0.0, 0.0));
  vTy = normalize(m * vec3(0.0, 1.0, 0.0));
  vTz = normalize(m * vec3(0.0, 0.0, 1.0));
  vNo = normal;
  vPos = position;
  vKind = aKind;
  vPrintA = aPrintA;
  vPrintB = aPrintB;
  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
}
`;
// Each piece is drawn in the page's two colours: FORE (white on a black
// chapter, ink on a paper one) and BACK (the other), as moulded plastic in a
// studio, after the brand's own renders (public/qbix-keyboard.png): soft
// light from above, a gloss whose reflections show two soft boxes, and edges
// rounded in the shading so they catch the light (less so on a thin piece);
// no shadows smudged into the seams, no grain. The dots are printed, round,
// in whole rows that fit the face; the cube's lime corner is lime jelly, lit
// from within. What's printed on a piece's front face comes from the atlas
// (uPrints: red the ink that stands out from the piece, green the lime),
// under the gloss. When a piece changes material or print the next one comes
// on across each face from left to right in a dithered band of the page's
// large pixel, 4px on screen (aKind: from, to, how far; aPrintA, aPrintB:
// where each print is in the atlas). The page's edge (uEdge, device pixels
// from the bottom) cuts the object: below it, the next chapter's colours.
const FS = /* glsl */ `
uniform float uEdge;
uniform float uHasEdge;
uniform float uToneAbove;
uniform float uToneBelow;
uniform sampler2D uPrints;
uniform float uPixel;
varying vec3 vN;
varying vec3 vNo;
varying vec3 vPos;
varying vec3 vScale;
varying vec3 vKind;
varying vec3 vTx;
varying vec3 vTy;
varying vec3 vTz;
varying vec4 vPrintA;
varying vec4 vPrintB;
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
  return k < 4.5 ? 0.0 : 1.0;
}

void main() {
  vec3 no = normalize(vNo);
  vec3 a = abs(no);
  vec2 loc, fs;
  vec3 Tu, Tv;
  float dep;
  if (a.x > 0.5) { loc = vPos.zy; fs = vScale.zy; Tu = vTz; Tv = vTy; dep = vScale.x; }
  else if (a.y > 0.5) { loc = vPos.xz; fs = vScale.xz; Tu = vTx; Tv = vTz; dep = vScale.y; }
  else { loc = vPos.xy; fs = vScale.xy; Tu = vTx; Tv = vTy; dep = vScale.z; }
  vec2 w = loc * fs;
  vec2 fw = fwidth(w);
  // the front face's place in its print, and how fast that changes across the screen (for the atlas's filtering)
  vec2 fuv = vPos.xy + 0.5;
  vec2 gx = dFdx(fuv), gy = dFdy(fuv);

  // A small rounded edge, in the shading only: near an edge the normal turns
  // toward the next face, so the edge catches the light like a moulded part.
  vec2 dE = fs * 0.5 - abs(w);
  float r = min(min(0.07, 0.35 * min(fs.x, fs.y)), 0.5 * dep);
  vec2 bev = 1.0 - smoothstep(vec2(0.0), vec2(max(r, 1e-4)), dE);
  vec3 n = normalize(normalize(vN) + (sign(w.x) * bev.x * Tu + sign(w.y) * bev.y * Tv) * 0.85);

  // the material and print: the next ones coming on across the face, left to right, in the
  // page's large pixel (4px on screen, whatever the piece's size): a dithered edge sweeping over
  float th = (loc.x + 0.5) * 0.6 + bayer4(floor(gl_FragCoord.xy / uPixel)) * 0.4;
  bool toB = vKind.z > th;
  float k = toB ? vKind.y : vKind.x;
  vec4 pr = toB ? vPrintB : vPrintA;
  float tone = uHasEdge > 0.5 && gl_FragCoord.y < uEdge ? uToneBelow : uToneAbove;

  // A studio: a big soft light above and to the front left, the sky, and two
  // soft boxes that show in the reflections. Moulded plastic, gloss on top.
  vec3 V = vec3(0.0, 0.0, 1.0);
  float diff = max(dot(n, normalize(vec3(-0.4, 0.85, 0.55))), 0.0);
  float wrap = 0.55 * diff + 0.45 * (0.5 + 0.5 * n.y);
  vec3 R = reflect(-V, n);
  float box1 = smoothstep(0.82, 0.95, dot(R, normalize(vec3(-0.45, 0.8, 0.4))));
  float box2 = smoothstep(0.9, 0.985, dot(R, normalize(vec3(0.85, 0.3, 0.42))));
  float env = 0.06 + 0.22 * clamp(R.y, 0.0, 1.0) + 0.95 * box1 + 0.45 * box2;
  float nv = clamp(dot(n, V), 0.0, 1.0);
  float fres = 0.045 + 0.955 * pow(1.0 - nv, 5.0);

  vec3 whiteLit = vec3(0.955, 0.958, 0.948) * (0.72 + 0.3 * wrap);
  vec3 inkLit = vec3(0.05, 0.055, 0.062) + vec3(0.135) * wrap;
  vec3 fore = mix(whiteLit, inkLit, tone);
  vec3 back = mix(inkLit, whiteLit, tone);
  vec3 lime = vec3(0.722, 1.0, 0.0);
  vec3 limeLit = lime * (0.74 + 0.3 * wrap);
  bool pic = k > 6.5 && k < 7.5;   // a picture: white on any page, its print in ink
  vec3 c = k > 8.5 ? limeLit : pic ? whiteLit : mix(fore, back, pattern(k, w, fs, fw));
  if (k > 10.5) {
    // lime jelly: lit from within, an inner square brighter, the rim deeper; a stronger sheen
    vec2 q = abs(w) / (fs * 0.5);
    float inner = 1.0 - smoothstep(0.36, 0.74, max(q.x, q.y));
    c = lime * (0.5 + 0.34 * wrap + 0.34 * inner);
    fres = 0.06 + 0.94 * pow(1.0 - nv, 3.0);
  }
  if (k > 9.5 && k < 10.5 && min(fs.x, fs.y) > 0.3) {
    // the play button: an ink triangle on the lime, pointing right
    vec2 t = w / (0.5 * min(fs.x, fs.y));
    float inside = max(-0.32 - t.x, abs(t.y) * 1.25 + t.x * 0.62 - 0.36);
    c = mix(c, vec3(0.06, 0.065, 0.075), cover(inside, max(fw.x, fw.y) * 2.0 / min(fs.x, fs.y)));
  }
  if (pr.z > 0.0 && no.z > 0.5) {
    // the print: in the colour that stands out from the piece (ink on lime), and lime
    vec3 p = textureGrad(uPrints, pr.xy + clamp(fuv, 0.0, 1.0) * pr.zw, gx * pr.zw, gy * pr.zw).rgb;
    vec3 ink = k > 8.5 || pic ? inkLit : k > 4.5 ? fore : back;
    c = c * max(0.0, 1.0 - p.r - p.g) + ink * p.r + limeLit * p.g;
  }
  c += vec3(fres * env);
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
  fpr: (string | undefined)[];   // and its print
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
  // where each block's print is in the atlas, the last one's and the next one's
  const printsA = new Float32Array(N * 4), printsB = new Float32Array(N * 4);
  const printAAttr = new THREE.InstancedBufferAttribute(printsA, 4), printBAttr = new THREE.InstancedBufferAttribute(printsB, 4);
  printAAttr.setUsage(THREE.DynamicDrawUsage);
  printBAttr.setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('aPrintA', printAAttr);
  geo.setAttribute('aPrintB', printBAttr);
  const blank = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
  blank.needsUpdate = true;
  const U = { uEdge: { value: 0 }, uHasEdge: { value: 0 }, uToneAbove: { value: 0 }, uToneBelow: { value: 0 }, uPrints: { value: blank as THREE.Texture }, uPixel: { value: 4 * renderer.getPixelRatio() } };
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
  const pA: (string | undefined)[] = new Array(N).fill(undefined), pB: (string | undefined)[] = new Array(N).fill(undefined);
  let perm = Int32Array.from({ length: N }, (_, i) => i);
  let move: Move | null = null;
  let target: Form = forms.scatter;
  let lastEnd = -Infinity;   // when the last move ends (or ended)
  let dirty = true;
  let disposed = false;

  // The prints: an atlas of the ones these forms use, drawn once the fonts are in. Until it's
  // there, or for a print it doesn't have, a piece goes without.
  let rects: Map<string, Rect> | null = null;
  let tex: THREE.CanvasTexture | null = null;
  let printKey = '';
  let printsReady: Promise<void> = Promise.resolve();
  const usePrints = (fs: Form[]): Promise<void> => {
    const names = new Set<string>();
    for (const f of fs) for (const P of f.pieces) if (P.pr) names.add(P.pr);
    const key = Array.from(names).sort().join('|');
    if (key === printKey) return printsReady;
    printKey = key;
    printsReady = printAtlas(names).then((atlas) => {
      if (disposed || key !== printKey) return;
      const t = new THREE.CanvasTexture(atlas.canvas);
      t.colorSpace = THREE.NoColorSpace;
      t.minFilter = THREE.LinearMipmapLinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      tex?.dispose();
      tex = t;
      U.uPrints.value = t;
      rects = atlas.rects;
      dirty = true;
    });
    return printsReady;
  };

  /** Put the blocks in a form at once. */
  const place = (f: Form) => {
    for (let k = 0; k < N; k++) {
      const P = f.pieces[k];
      for (let a = 0; a < 3; a++) { cp[k * 3 + a] = P.p[a]; cs[k * 3 + a] = P.s[a]; }
      cq[k].copy(P.q);
      kA[k] = kB[k] = P.k;
      pA[k] = pB[k] = P.pr;
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
    const fk = new Float32Array(N), fpr: (string | undefined)[] = new Array(N);
    for (let k = 0; k < N; k++) {
      fk[k] = km[k] >= 0.5 ? kB[k] : kA[k];
      fpr[k] = km[k] >= 0.5 ? pB[k] : pA[k];
    }
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
    // A block that is put away grows in at its new place (it doesn't fly in from wherever it was
    // put away), already what it will be.
    for (let k = 0; k < N; k++) {
      if (cs[k * 3] > 0.01 && cs[k * 3 + 1] > 0.01) continue;
      const P = to.pieces[perm[k]];
      if (P.spare || !shown(P)) continue;
      cp[k * 3] = P.p[0]; cp[k * 3 + 1] = P.p[1]; cp[k * 3 + 2] = P.p[2];
      cq[k].copy(P.q);
      fk[k] = P.k;
      fpr[k] = P.pr;
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
    move = { t0: t, spread, dur, to, perm: perm.slice(), delay, arc, fp: cp.slice(), fs: cs.slice(), fq: cq.map((q) => q.clone()), fk, fpr, viewFrom };
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
          pA[k] = pB[k] = m.fpr[k];
          km[k] = 1;
          continue;
        }
        const arc = Math.sin(Math.PI * ek) * m.arc[k];
        for (let a = 0; a < 3; a++) {
          cp[k * 3 + a] = lerp(m.fp[k * 3 + a], P.p[a], ek) + m.to.lift[a] * arc;
          cs[k * 3 + a] = lerp(m.fs[k * 3 + a], P.s[a], ek);
        }
        cq[k].copy(m.fq[k]).slerp(P.q, ek);
        // a block on its way out keeps what it is while it shrinks
        const toK = shown(P) ? P.k : m.fk[k], toPr = shown(P) ? P.pr : m.fpr[k];
        kA[k] = m.fk[k];
        kB[k] = toK;
        pA[k] = m.fpr[k];
        pB[k] = toPr;
        km[k] = m.fk[k] === toK && m.fpr[k] === toPr ? 1 : smooth(0.2, 0.8, ek);
      }
      dirty = true;
      if (t >= m.t0 + total(m)) {
        move = null;
        for (let k = 0; k < N; k++) { kA[k] = kB[k]; pA[k] = pB[k]; km[k] = 1; }
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
        const ra = pA[k] ? rects?.get(pA[k]!) : undefined, rb = pB[k] ? rects?.get(pB[k]!) : undefined;
        for (let a = 0; a < 4; a++) {
          printsA[k * 4 + a] = ra ? ra[a] : 0;
          printsB[k * 4 + a] = rb ? rb[a] : 0;
        }
      }
      mesh.instanceMatrix.needsUpdate = true;
      kindAttr.needsUpdate = true;
      printAAttr.needsUpdate = true;
      printBAttr.needsUpdate = true;
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
    disposed = true;
    geo.dispose();
    material.dispose();
    tex?.dispose();
    blank.dispose();
    renderer.dispose();
  };
  return {
    renderer, scene, camera, U, forms,
    place, go, update, viewAt, endsAt, usePrints,
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
  rig.usePrints(chapters.flatMap((c) => c.forms));
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

  // Which chapter is on: the last one whose top has passed a little below the
  // middle of the screen. On a phone that is also when the last chapter's
  // pinned window is still whole under the nav, so the object never goes
  // under the nav on its way from one window to the next.
  const pick = () => {
    const vh = window.innerHeight, y = window.scrollY;
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
    // Draw at the canvas's own size: on a phone the fixed canvas is the large
    // viewport tall (100lvh) while innerHeight is the small one when the
    // toolbars show; drawing at innerHeight would stretch the picture and
    // push the object off its window. The canvas's top is the viewport's, so
    // the words' rects are in its coordinates either way.
    const cw = canvas.clientWidth || vw, chh = canvas.clientHeight || vh;
    rig.resize(cw, chh);

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
      // A desktop glides the object to the next chapter's side; a phone puts it straight into the next window
      // (the last one is already scrolling away), and the move plays there.
      const kb = tall() ? 1 : easeInOut(clamp01((t - tEnter) / Math.max(0.001, enterEnds - tEnter)));
      const box = boxFrom && live ? mixBox(boxFrom, live, kb) : live ?? boxFrom;
      if (box && box.w > 40 && box.h > 40) {
        rig.fit(ext, box, cw, chh, 1 - Math.exp(-dt * 14));
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
    U.uEdge.value = (chh - edgeCss) * renderer.getPixelRatio();
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
      rig.usePrints(chapters.flatMap((c) => c.forms));
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
  // gather once the prints are in (or soon anyway)
  let printsIn = false;
  rig.usePrints(seq).then(() => (printsIn = true));
  const printsLate = window.setTimeout(() => (printsIn = true), 1500);
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
    if (!started && printsIn) {
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
    window.clearTimeout(printsLate);
    io.disconnect();
    document.removeEventListener('visibilitychange', onVis);
    window.removeEventListener('pointermove', onMove);
    document.documentElement.removeEventListener('mouseleave', onLeave);
    rig.dispose();
  };
}
