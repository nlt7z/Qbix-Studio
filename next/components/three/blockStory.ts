import * as THREE from 'three';
import { createScroller, type Scroller } from '@/lib/smoothScroll';
import { N, ROUND, buildForms, clamp01, easeInOut, isLime, lerp, mixView, shown, smooth, type Form, type View } from './blockForms';
import { KIND, LIGHTS, makeLook, pieceGeometry, pieceMaterials, type Lighting, type LookUniforms } from './blockLook';
import { printAtlas, type Rect } from './blockPrints';

/**
 * The site's one object: 64 pieces. In the hero they are a 3 × 3 × 3 cube
 * around a glowing lime core (brushed aluminium corners, glossy edges, frosted
 * glass windows onto the core) that every few seconds turns one of its layers,
 * like a puzzle cube, while the core breathes; in every other chapter they
 * become the thing the chapter is about (components/three/blockForms.ts):
 * soft, rounded things (a laptop, a phone and its app's layers, chat
 * bubbles, a card table), with what's on them printed (blockPrints.ts) and,
 * on a screen, a real film playing. How the pieces look, their materials and
 * the studio light, is blockLook.ts.
 *
 * Each arrangement (a Form) names, for each piece, its place, size, rounding,
 * turn, material, print or film; a piece can also be put away (size 0). A move
 * takes every piece from where it is to its place in the next form, each on
 * its own beat (the lime one first, then in the form's reading order), with a
 * small arc (a small piece going far turns over on its way), its new
 * material and print coming on across it in pixels (the page's 4px pixel, on
 * screen). Some forms float: their parts bob, each group on its own beat.
 *
 * A chapter with several forms is played by the scroll: its words stay put
 * while the page scrolls through the chapter, and the object goes from one
 * form to the next in step with it (back again if you scroll back), so it
 * never waits for you or makes you wait. Arriving at a chapter, the object
 * moves into the form the scroll is at, in its own time.
 *
 * The object belongs to the page: its plastic is the page's colours (white on
 * a black chapter, ink on a paper one; prints too, with lime), it is sized to
 * the words beside it, and when the next chapter's edge scrolls up through it
 * the edge cuts it, each part matching the page behind it. Each chapter is lit
 * its own way.
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

/* -------------------------------------------------------------------- rig */

type Box = { x: number; y: number; w: number; h: number };
type Ext = { minX: number; maxX: number; minY: number; maxY: number };
type Move = {
  t0: number;
  spread: number;
  dur: number;
  from: Form | null;    // the form it leaves, when it leaves one (else wherever the blocks were)
  to: Form;
  perm: Int32Array;     // block → the piece it becomes
  delay: Float32Array;
  arc: Float32Array;    // how high each block lifts on its way (0: it stays put)
  spin: Float32Array;   // how far a small block that goes far turns over on its way
  fp: Float32Array;     // where each block started
  fs: Float32Array;
  fr: Float32Array;     // its rounding
  fq: THREE.Quaternion[];
  fk: Float32Array;     // its material when it started
  fpr: (string | undefined)[];   // its print
  fm: (string | undefined)[];    // its film
  viewFrom: View;
};
type Twist = { axis: 0 | 1 | 2; dir: number; t0: number; dur: number; members: number[]; p0: Float32Array; q0: THREE.Quaternion[] };

const AXES = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)];

/** Everything the pieces need to be drawn and moved, shared by the story and the figures. */
function createRig(canvas: HTMLCanvasElement, maxDpr: number, fine: boolean) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.debug.checkShaderErrors = false;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
  renderer.autoClear = false;   // draw() clears: see there
  const scene = new THREE.Scene();
  // A long lens: the pieces stay square, like things on a page, not in a photo.
  const camera = new THREE.PerspectiveCamera(18, 1.6, 1, 400);
  camera.position.set(0, 0, 120);
  const forms = buildForms();
  const look = makeLook(renderer, scene, fine);

  const geo = pieceGeometry();
  const attr = (n: number, name: string) => {
    const a = new THREE.InstancedBufferAttribute(new Float32Array(N * n), n);
    a.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute(name, a);
    return a;
  };
  const sizeAttr = attr(3, 'aSize');        // each block's size (its shape is drawn from it)
  const roundAttr = attr(2, 'aRound');      // and its rounding: corners, edges
  const kindAttr = attr(3, 'aKind');        // its material: the last one, the next one, how far
  const printAAttr = attr(4, 'aPrintA');    // where its prints are in the atlas (or its film is cropped), the last and the next
  const printBAttr = attr(4, 'aPrintB');
  const mediaAttr = attr(2, 'aMedia');      // which film it shows, if any: the last and the next
  const sizes = sizeAttr.array as Float32Array, rounds = roundAttr.array as Float32Array, kinds = kindAttr.array as Float32Array;
  const printsA = printAAttr.array as Float32Array, printsB = printBAttr.array as Float32Array, medias = mediaAttr.array as Float32Array;
  const blank = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
  blank.needsUpdate = true;
  const U: LookUniforms = {
    uEdge: { value: 0 },
    uHasEdge: { value: 0 },
    uToneAbove: { value: 0 },
    uToneBelow: { value: 0 },
    uPrints: { value: blank },
    uPixel: { value: 4 * renderer.getPixelRatio() },   // the page's large pixel, on screen
    uVideo1: { value: blank },
    uVideo2: { value: blank },
    uCore: { value: 1 },
  };
  const mats = pieceMaterials(U);
  const mesh = new THREE.InstancedMesh(geo, mats.opaque, N);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.customDepthMaterial = mats.depth;
  // the same blocks again, for the parts of them that are glass
  const glassMesh = new THREE.InstancedMesh(geo, mats.glass, N);
  glassMesh.instanceMatrix = mesh.instanceMatrix;
  glassMesh.frustumCulled = false;
  glassMesh.receiveShadow = false;   // frosted, a shadow on it wouldn't show
  glassMesh.visible = false;
  const group = new THREE.Group();
  group.add(mesh, glassMesh);
  scene.add(group);

  // The blocks as they are now.
  const cp = new Float32Array(N * 3), cs = new Float32Array(N * 3), cr = new Float32Array(N * 2);
  const cq = Array.from({ length: N }, () => new THREE.Quaternion());
  const kA = new Float32Array(N), kB = new Float32Array(N), km = new Float32Array(N);
  const pA: (string | undefined)[] = new Array(N).fill(undefined), pB: (string | undefined)[] = new Array(N).fill(undefined);
  const mA: (string | undefined)[] = new Array(N).fill(undefined), mB: (string | undefined)[] = new Array(N).fill(undefined);
  let perm = Int32Array.from({ length: N }, (_, i) => i);
  let move: Move | null = null;
  let scrubT: number | null = null;   // a move held at a point of its own (the scroll's), not the clock's
  let twist: Twist | null = null;
  let target: Form = forms.scatter;
  let lastEnd = -Infinity;   // when the last timed move ends (or ended)
  let disposed = false;

  // The prints: an atlas of the ones these forms use, drawn once the fonts are in. Until it's
  // there, or for a print it doesn't have, a piece goes without.
  let rects: Map<string, Rect> | null = null;
  let tex: THREE.CanvasTexture | null = null;
  let printKey = '';
  let printsReady: Promise<void> = Promise.resolve();
  const usePrints = (fs: Form[]): Promise<void> => {
    useFilms(fs);
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
    });
    return printsReady;
  };

  // The films: up to two, each a muted video on a loop, playing only while a block shows it.
  type Film = { url: string; video: HTMLVideoElement; texture: THREE.VideoTexture; slot: number; aspect: number };
  const films: Film[] = [];
  const filmOf = (url: string | undefined) => (url ? films.find((f) => f.url === url) : undefined);
  function useFilms(fs: Form[]) {
    for (const f of fs) for (const P of f.pieces) {
      if (!P.media || filmOf(P.media) || films.length >= 2) continue;
      const video = document.createElement('video');
      video.src = P.media;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      const texture = new THREE.VideoTexture(video);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.generateMipmaps = false;
      texture.minFilter = THREE.LinearFilter;
      const film: Film = { url: P.media, video, texture, slot: films.length + 1, aspect: 16 / 9 };
      video.addEventListener('loadedmetadata', () => {
        if (video.videoWidth && video.videoHeight) film.aspect = video.videoWidth / video.videoHeight;
      });
      (film.slot === 1 ? U.uVideo1 : U.uVideo2).value = texture;
      films.push(film);
    }
  }
  let filmsOn = true;
  const filmsShown = new Set<Film>();   // this frame's, so a film off screen doesn't decode
  const showFilms = (on: boolean) => (filmsOn = on);
  // a film covering a face of aspect fa: the middle of it, cropped
  const crop = (film: Film, fa: number, out: Float32Array, i: number) => {
    const va = film.aspect;
    if (va > fa) { const w = fa / va; out[i] = (1 - w) / 2; out[i + 1] = 0; out[i + 2] = w; out[i + 3] = 1; }
    else { const h = va / fa; out[i] = 0; out[i + 1] = (1 - h) / 2; out[i + 2] = 1; out[i + 3] = h; }
  };

  /** Put the blocks in a form at once (each block becomes the piece it is already matched to). */
  const snap = (f: Form) => {
    for (let k = 0; k < N; k++) {
      const P = f.pieces[perm[k]];
      for (let a = 0; a < 3; a++) { cp[k * 3 + a] = P.p[a]; cs[k * 3 + a] = P.spare ? 0 : P.s[a]; }
      cr[k * 2] = (P.r ?? ROUND)[0]; cr[k * 2 + 1] = (P.r ?? ROUND)[1];
      cq[k].copy(P.q);
      kA[k] = kB[k] = P.k;
      pA[k] = pB[k] = P.pr;
      mA[k] = mB[k] = P.media;
      km[k] = 1;
    }
    move = null;
    scrubT = null;
    twist = null;
    target = f;
  };
  const place = (f: Form) => {
    perm = Int32Array.from({ length: N }, (_, i) => i);
    plans.clear();
    snap(f);
    lastEnd = -Infinity;
  };

  const total = (m: Move) => m.spread + m.dur;
  const clock = (t: number) => (scrubT ?? t);
  const viewAt = (t: number): View => (move ? mixView(move.viewFrom, move.to.view, easeInOut(clamp01((clock(t) - move.t0) / total(move)))) : target.view);
  const endsAt = () => lastEnd;

  /** Work out a move to a form from the blocks as they are now. `match` finds the least travel; else each block keeps its piece. */
  const plan = (to: Form, t: number, o: { match: boolean; spread?: number; dur?: number; from?: Form | null }): Move => {
    const viewFrom = o.from ? o.from.view : viewAt(t);
    const fk = new Float32Array(N), fpr: (string | undefined)[] = new Array(N), fm: (string | undefined)[] = new Array(N);
    for (let k = 0; k < N; k++) {
      fk[k] = km[k] >= 0.5 ? kB[k] : kA[k];
      fpr[k] = km[k] >= 0.5 ? pB[k] : pA[k];
      fm[k] = km[k] >= 0.5 ? mB[k] : mA[k];
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
      plans.clear();
    }
    const fp = cp.slice(), fsz = cs.slice(), fr = cr.slice(), fq = cq.map((q) => q.clone());
    // A block that is put away grows in at its new place (it doesn't fly in from wherever it was
    // put away), already what it will be.
    for (let k = 0; k < N; k++) {
      if (fsz[k * 3] > 0.01 && fsz[k * 3 + 1] > 0.01) continue;
      const P = to.pieces[perm[k]];
      if (P.spare || !shown(P)) continue;
      fp[k * 3] = P.p[0]; fp[k * 3 + 1] = P.p[1]; fp[k * 3 + 2] = P.p[2];
      fq[k].copy(P.q);
      fr[k * 2] = (P.r ?? ROUND)[0]; fr[k * 2 + 1] = (P.r ?? ROUND)[1];
      fk[k] = P.k;
      fpr[k] = P.pr;
      fm[k] = P.media;
    }
    const spread = o.spread ?? 0.65, dur = o.dur ?? 0.9;
    const delay = new Float32Array(N), arc = new Float32Array(N), spin = new Float32Array(N);
    // How far each block travels; blocks that travel the same way (a sheet and
    // everything on it) are one group: they leave together and lift alike.
    const dx = new Float32Array(N), dy = new Float32Array(N), dz = new Float32Array(N), lead = new Int32Array(N).fill(-1);
    for (let k = 0; k < N; k++) {
      const T = to.pieces[perm[k]], P = T.spare ? [fp[k * 3], fp[k * 3 + 1], fp[k * 3 + 2]] : T.p;
      dx[k] = P[0] - fp[k * 3]; dy[k] = P[1] - fp[k * 3 + 1]; dz[k] = P[2] - fp[k * 3 + 2];
      delay[k] = perm[k] === to.lime ? 0 : spread * (0.08 + 0.92 * to.rank[perm[k]]);
    }
    const members = new Int32Array(N);
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
    for (let k = 0; k < N; k++) members[lead[k]]++;
    for (let k = 0; k < N; k++) {
      const g = lead[k];
      if (g !== k) {
        arc[k] = arc[g];
        delay[g] = Math.min(delay[g], delay[k]);
      }
      // a small block on its own, going far, turns over once on its way
      const T = to.pieces[perm[k]], big = Math.max(T.s[0], T.s[1], fsz[k * 3], fsz[k * 3 + 1]);
      if (g === k && members[k] === 1 && Math.hypot(dx[k], dy[k], dz[k]) > 2.5 && big < 1.6 && !T.spare) spin[k] = (k % 2 ? 1 : -1) * Math.PI * 2;
    }
    for (let k = 0; k < N; k++) if (lead[k] !== k) delay[k] = delay[lead[k]];
    return { t0: t, spread, dur, from: o.from ?? null, to, perm: perm.slice(), delay, arc, spin, fp, fs: fsz, fr, fq, fk, fpr, fm, viewFrom };
  };

  /** Start a move, on the clock, from wherever the blocks are now to a form. */
  const go = (to: Form, t: number, o: { match: boolean; spread?: number; dur?: number }) => {
    move = plan(to, t, o);
    scrubT = null;
    twist = null;
    target = to;
    lastEnd = t + move.spread + move.dur;
  };

  // The moves between a chapter's forms, worked out once from the forms themselves (the blocks
  // stay matched to the same pieces within a chapter), and held wherever the scroll is.
  const plans = new Map<string, Move>();
  /** The blocks f of the way from form A to form B (0 at A, 1 at B). */
  const scrub = (A: Form, B: Form, f: number) => {
    if (f <= 0.001) { if (move || scrubT !== null || target !== A) snap(A); return; }
    if (f >= 0.999) { if (move || scrubT !== null || target !== B) snap(B); return; }
    const key = `${A.id}>${B.id}`;
    let m = plans.get(key);
    if (!m) {
      snap(A);
      m = plan(B, 0, { match: false, from: A });
      plans.set(key, m);
    }
    move = m;
    twist = null;
    target = B;
    scrubT = f * total(m);
  };

  /** Turn one layer of the cube a quarter, on the clock (like a puzzle cube). Only when nothing else moves. */
  const turnLayer = (t: number, rnd: () => number) => {
    if (move || scrubT !== null || twist) return;
    const axis = Math.floor(rnd() * 3) as 0 | 1 | 2;
    const layer = Math.floor(rnd() * 3) - 1;
    const members: number[] = [];
    for (let k = 0; k < N; k++) if (cs[k * 3] > 0.01 && Math.abs(cp[k * 3 + axis] - layer) < 0.3) members.push(k);
    if (members.length < 2) return;
    twist = { axis, dir: rnd() < 0.5 ? 1 : -1, t0: t, dur: 1.0, members, p0: cp.slice(), q0: cq.map((q) => q.clone()) };
  };
  const twistQ = new THREE.Quaternion(), twistV = new THREE.Vector3();

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

  const m4 = new THREE.Matrix4(), p3 = new THREE.Vector3(), s3 = new THREE.Vector3(1, 1, 1), qf = new THREE.Quaternion(), ef = new THREE.Euler();
  const spinQ = new THREE.Quaternion();
  /** Lay the blocks out for time t; returns the extents to fit (eased from the last form's to the next's). */
  const update = (t: number, q: THREE.Quaternion): Ext => {
    const m = move, tm = clock(t);
    if (m) {
      for (let k = 0; k < N; k++) {
        const P = m.to.pieces[m.perm[k]];
        const e = m.dur > 0 ? clamp01((tm - m.t0 - m.delay[k]) / m.dur) : 1;
        const ek = easeInOut(e);
        if (P.spare) {
          // Put away where it is, and at once: it only shrinks, all of them together, in the move's first moments,
          // so they're gone before the others arrive.
          const gone = m.dur > 0 ? smooth(0, 0.42, (tm - m.t0) / m.dur) : 1;
          for (let a = 0; a < 3; a++) { cp[k * 3 + a] = m.fp[k * 3 + a]; cs[k * 3 + a] = m.fs[k * 3 + a] * (1 - gone); }
          cr[k * 2] = m.fr[k * 2]; cr[k * 2 + 1] = m.fr[k * 2 + 1];
          cq[k].copy(m.fq[k]);
          kA[k] = kB[k] = m.fk[k];
          pA[k] = pB[k] = m.fpr[k];
          mA[k] = mB[k] = m.fm[k];
          km[k] = 1;
          continue;
        }
        const arc = Math.sin(Math.PI * ek) * m.arc[k];
        for (let a = 0; a < 3; a++) {
          cp[k * 3 + a] = lerp(m.fp[k * 3 + a], P.p[a], ek) + m.to.lift[a] * arc;
          cs[k * 3 + a] = lerp(m.fs[k * 3 + a], P.s[a], ek);
        }
        const r = P.r ?? ROUND;
        cr[k * 2] = lerp(m.fr[k * 2], r[0], ek);
        cr[k * 2 + 1] = lerp(m.fr[k * 2 + 1], r[1], ek);
        cq[k].copy(m.fq[k]).slerp(P.q, ek);
        if (m.spin[k]) cq[k].premultiply(spinQ.setFromAxisAngle(AXES[1], m.spin[k] * ek));
        // a block on its way out keeps what it is while it shrinks
        const live = shown(P);
        const toK = live ? P.k : m.fk[k], toPr = live ? P.pr : m.fpr[k], toM = live ? P.media : m.fm[k];
        kA[k] = m.fk[k];
        kB[k] = toK;
        pA[k] = m.fpr[k];
        pB[k] = toPr;
        mA[k] = m.fm[k];
        mB[k] = toM;
        km[k] = m.fk[k] === toK && m.fpr[k] === toPr && m.fm[k] === toM ? 1 : smooth(0.2, 0.8, ek);
      }
      if (scrubT === null && t >= m.t0 + total(m)) {
        move = null;
        for (let k = 0; k < N; k++) { kA[k] = kB[k]; pA[k] = pB[k]; mA[k] = mB[k]; km[k] = 1; }
      }
    }
    // a layer of the cube turning
    const tw = twist;
    if (tw && !m) {
      const e = clamp01((t - tw.t0) / tw.dur), ang = tw.dir * (Math.PI / 2) * easeInOut(e);
      twistQ.setFromAxisAngle(AXES[tw.axis], ang);
      for (const k of tw.members) {
        twistV.set(tw.p0[k * 3], tw.p0[k * 3 + 1], tw.p0[k * 3 + 2]).applyQuaternion(twistQ);
        cp[k * 3] = twistV.x; cp[k * 3 + 1] = twistV.y; cp[k * 3 + 2] = twistV.z;
        cq[k].copy(tw.q0[k]).premultiply(twistQ);
      }
      if (e >= 1) {
        for (const k of tw.members) for (let a = 0; a < 3; a++) cp[k * 3 + a] = Math.round(cp[k * 3 + a] * 2) / 2;
        twist = null;
      }
    }

    // Floating: a form's parts bob, each group on its own beat (blended between forms on a move).
    const fromFloat = m ? (m.from?.float ?? 0) : 0, toFloat = target.float ?? 0;
    const kf = m ? easeInOut(clamp01((tm - m.t0) / total(m))) : 1;
    const amp = lerp(fromFloat, toFloat, kf);
    let glass = false;
    filmsShown.clear();
    for (let k = 0; k < N; k++) {
      p3.set(cp[k * 3], cp[k * 3 + 1], cp[k * 3 + 2]);
      qf.copy(cq[k]);
      if (amp > 0) {
        const g = (m ? m.to : target).pieces[perm[k]].g ?? k, ph = g * 1.7;
        p3.y += amp * Math.sin(t * 1.1 + ph);
        p3.z += amp * 0.5 * Math.sin(t * 0.8 + ph * 1.3);
        qf.premultiply(spinQ.setFromEuler(ef.set(amp * 0.25 * Math.sin(t * 0.9 + ph), amp * 0.35 * Math.sin(t * 0.7 + ph * 0.6), 0)));
      }
      m4.compose(p3, qf, s3);
      mesh.setMatrixAt(k, m4);
      for (let a = 0; a < 3; a++) sizes[k * 3 + a] = cs[k * 3 + a];
      rounds[k * 2] = cr[k * 2];
      rounds[k * 2 + 1] = cr[k * 2 + 1];
      const vis = cs[k * 3] > 0.01;
      if ((kA[k] === KIND.GLASS || kB[k] === KIND.GLASS) && vis) glass = true;
      kinds[k * 3] = kA[k];
      kinds[k * 3 + 1] = kB[k];
      kinds[k * 3 + 2] = km[k];
      // a print from the atlas, or a film cropped to the face
      const fa = cs[k * 3] / Math.max(1e-4, cs[k * 3 + 1]);
      const filmA = filmOf(mA[k]), filmB = filmOf(mB[k]);
      medias[k * 2] = filmA ? filmA.slot : 0;
      medias[k * 2 + 1] = filmB ? filmB.slot : 0;
      if (filmA && vis) filmsShown.add(filmA);
      if (filmB && vis) filmsShown.add(filmB);
      if (filmA) crop(filmA, fa, printsA, k * 4);
      else { const ra = pA[k] ? rects?.get(pA[k]!) : undefined; for (let a = 0; a < 4; a++) printsA[k * 4 + a] = ra ? ra[a] : 0; }
      if (filmB) crop(filmB, fa, printsB, k * 4);
      else { const rb = pB[k] ? rects?.get(pB[k]!) : undefined; for (let a = 0; a < 4; a++) printsB[k * 4 + a] = rb ? rb[a] : 0; }
    }
    mesh.instanceMatrix.needsUpdate = true;
    sizeAttr.needsUpdate = true;
    roundAttr.needsUpdate = true;
    kindAttr.needsUpdate = true;
    printAAttr.needsUpdate = true;
    printBAttr.needsUpdate = true;
    mediaAttr.needsUpdate = true;
    glassMesh.visible = glass;
    for (const f of films) {
      const want = filmsOn && filmsShown.has(f);
      if (want && f.video.paused) f.video.play().catch(() => undefined);
      else if (!want && !f.video.paused) f.video.pause();
    }
    group.quaternion.copy(q);

    const extTo = extentsOf((r) => target.pieces[r], q);
    let ext = extTo;
    if (m && move) {
      const extFrom = m.from
        ? extentsOf((r) => m.from!.pieces[r], q)
        : extentsOf((k) => {
          snapView.p[0] = m.fp[k * 3]; snapView.p[1] = m.fp[k * 3 + 1]; snapView.p[2] = m.fp[k * 3 + 2];
          snapView.s[0] = m.fs[k * 3]; snapView.s[1] = m.fs[k * 3 + 1]; snapView.s[2] = m.fs[k * 3 + 2];
          snapView.q.copy(m.fq[k]);
          return snapView;
        }, q);
      const K2 = easeInOut(clamp01((tm - m.t0) / total(m)));
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
  const fitted = { x: 0, y: 0, s: 1, r: 0, ok: false };
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
    fitted.r = 0.5 * Math.hypot(extW, extH) * fitted.s;
  };
  // Light the object where it is now; the cube's core breathes.
  const centre = new THREE.Vector3();
  const light = (dt: number, t: number, want: Lighting, pointer: { x: number; y: number }) => {
    centre.set(fitted.x, fitted.y, 0);
    look.update(dt, t, want, pointer, centre, fitted.r || 10);
    U.uCore.value = 1 + 0.22 * Math.sin(t * 1.7);
  };
  // The canvas is see-through, so it's cleared to nothing; but what glass sees behind it is the
  // page's own colour (three.js would otherwise see a half-white there). What's behind glass is
  // drawn at half the resolution (frosted, it's blurred anyway): three.js sizes that pass by the
  // camera's viewport, which it uses for nothing else on an ordinary camera.
  const bgDark = new THREE.Color('#08090a'), bgPaper = new THREE.Color('#f3f4f5');
  const behindGlass = new THREE.Vector4();
  (camera as unknown as { viewport?: THREE.Vector4 }).viewport = behindGlass;
  const draw = () => {
    const pr = renderer.getPixelRatio();
    behindGlass.set(0, 0, Math.max(1, Math.round(cw * pr * 0.5)), Math.max(1, Math.round(chh * pr * 0.5)));
    renderer.setRenderTarget(null);
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
    renderer.setClearColor(U.uToneAbove.value > 0.5 ? bgPaper : bgDark, 1);
    renderer.render(scene, camera);
  };
  // If frames start to be missed (the GPU can't keep up at this resolution), draw at a lower one:
  // a step down whenever a sixth of the last 96 frames came late, and back up a step after six
  // seconds without one. Not in the first seconds (shaders compiling, films and fonts loading).
  const startPr = renderer.getPixelRatio(), born = performance.now();
  const lates: boolean[] = [];
  let lastFrame = 0, lastLate = born;
  const setPr = (pr: number) => {
    renderer.setPixelRatio(pr);
    U.uPixel.value = 4 * renderer.getPixelRatio();
    lates.length = 0;
  };
  const pace = (now: number) => {
    const gap = now - lastFrame;
    lastFrame = now;
    if (gap <= 0 || gap > 250 || now - born < 5000) return;   // a pause (a hidden tab, a long task), or still starting
    const late = gap > 21;
    if (late) lastLate = now;
    lates.push(late);
    if (lates.length > 96) lates.shift();
    const pr = renderer.getPixelRatio();
    if (lates.length === 96 && lates.filter(Boolean).length > 16 && pr > 1) setPr(Math.max(1, pr - 0.25));
    else if (pr < startPr && now - lastLate > 6000) { setPr(Math.min(startPr, pr + 0.25)); lastLate = now; }
  };
  const dispose = () => {
    disposed = true;
    geo.dispose();
    mats.opaque.dispose();
    mats.glass.dispose();
    mats.depth.dispose();
    tex?.dispose();
    blank.dispose();
    for (const f of films) {
      f.video.pause();
      f.video.removeAttribute('src');
      f.video.load();
      f.texture.dispose();
    }
    look.dispose();
    renderer.dispose();
  };
  return {
    renderer, U, forms,
    place, go, scrub, turnLayer, update, viewAt, endsAt, usePrints, showFilms,
    busy: (t: number) => scrubT === null && t < endsAt(),
    still: () => !move && scrubT === null && !twist,
    resize, fit, light, draw, pace, dispose,
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
  const rig = createRig(canvas, fine ? 1.75 : 1.5, fine);
  const { renderer, U, forms } = rig;
  const scroller: Scroller | null = fine && !reduced ? createScroller() : null;
  if (reduced) rig.showFilms(false);

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
    const minH = vh * 0.62, h = Math.max(r.height, minH), y = r.top + r.height / 2 - h / 2;
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
  // Where a chapter's scroll has its forms (0 the first form .. n-1 the last): while its words
  // are pinned the scroll goes through them, each move between holds at either end.
  const sceneOf = (c: Chapter) => {
    const n = c.forms.length;
    if (n < 2) return 0;
    const vh = window.innerHeight;
    const run = tall() ? c.h - vh * 0.75 : c.h - vh;
    const p = clamp01((window.scrollY - c.top) / Math.max(1, run));
    const u = p * (n - 1), i = Math.min(n - 2, Math.floor(u));
    return i + smooth(0.2, 0.8, u - i);
  };

  /* the loop */
  let raf = 0, running = false, visible = true, ready = false, last = performance.now();
  let ci = -1, tEnter = 0, enterEnds = 0, first = true, shownAt = 0, nextTurn = 0;
  let scene = 0;   // where the chapter's object is shown, following the scroll's place
  let boxFrom: Box | null = null, lastBox: Box | null = null;
  let mxS = 0, myS = 0;
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const splashDone = () => (window as unknown as { __qbixSplashDone?: boolean }).__qbixSplashDone !== false;
  const setStep = (c: Chapter, s: number) => {
    if (!c.steps) return;
    const f = c.forms[s];
    c.el.setAttribute('data-step', String(f.step ?? s));
  };
  const enter = (k: number, t: number) => {
    const c = chapters[k];
    ci = k;
    // into the form the scroll is at in this chapter (its first coming down, its last going back up)
    shownAt = Math.round(sceneOf(c));
    scene = shownAt;
    const f = c.forms[shownAt];
    if (reduced) rig.go(f, t, { match: true, spread: 0, dur: 0 });
    else if (first) rig.go(f, t, { match: f !== forms.cube, spread: 0.8, dur: 1.1 });   // the hero's gathering
    else rig.go(f, t, { match: true });
    first = false;
    tEnter = t;
    enterEnds = rig.endsAt();
    nextTurn = enterEnds + 1.2;
    boxFrom = lastBox;
    setStep(c, shownAt);
  };

  const q = new THREE.Quaternion(), rot = new THREE.Euler();
  const frame = (now: number) => {
    raf = 0;
    if (!running) return;
    raf = requestAnimationFrame(frame);
    rig.pace(now);
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

    // The chapter that's on, and where its scroll has its forms.
    if (splashDone()) {
      const k = pick();
      if (k !== ci) enter(k, t);
      const c = chapters[ci];
      if (c.forms.length > 1 && !rig.busy(t)) {
        // the object follows the scroll's place, a little behind it so a wheel's steps read as one motion
        const want = sceneOf(c);
        scene = reduced ? Math.round(want) : scene + (want - scene) * (1 - Math.exp(-dt * 7));
        if (Math.abs(want - scene) < 0.002) scene = want;
        const i = Math.min(c.forms.length - 2, Math.floor(scene));
        rig.scrub(c.forms[i], c.forms[i + 1], scene - i);
        const s = Math.round(scene);
        if (s !== shownAt) { shownAt = s; setStep(c, s); }
      } else if (c.forms.length === 1 && c.forms[0] === forms.cube && !reduced && t > nextTurn && rig.still()) {
        // the cube is alive: a layer turns every few seconds
        rig.turnLayer(t, rnd);
        nextTurn = t + 2.4 + rnd() * 1.6;
      }
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

    // Each chapter is lit its own way (by its colour, then its place in the page); the light drifts and follows the pointer.
    if (ci >= 0) {
      const c = chapters[ci], set = LIGHTS[c.tone ? 'paper' : 'dark'];
      rig.light(dt, t, set[ci % set.length], { x: mxS * sway, y: myS * sway });
    }
    rig.draw();
    if (!ready) { ready = true; onReady?.(); }
  };

  const setRunning = () => {
    const want = visible && !document.hidden;
    if (want === running) return;
    running = want;
    if (running) { last = performance.now(); raf = requestAnimationFrame(frame); }
    else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    rig.showFilms(running && !reduced);
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
  const rig = createRig(canvas, 1.75, true);
  const { U } = rig;
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

  let raf = 0, running = false, visible = false, started = reduced, si = 0, last = performance.now(), mxS = 0, myS = 0, nextTurn = 0, seed = 5;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const q = new THREE.Quaternion(), rot = new THREE.Euler();
  const frame = (now: number) => {
    raf = 0;
    if (!running) return;
    raf = requestAnimationFrame(frame);
    rig.pace(now);
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
    } else if (!reduced && seq.length === 1 && seq[0] === rig.forms.cube && rig.still() && t > nextTurn) {
      rig.turnLayer(t, rnd);
      nextTurn = t + 2.4 + rnd() * 1.6;
    }
    const view = rig.viewAt(t);
    const px = pointerIn ? Math.max(-1, Math.min(1, ndc.x)) : 0, py = pointerIn ? Math.max(-1, Math.min(1, ndc.y)) : 0;
    mxS += (px - mxS) * Math.min(1, dt * 3);
    myS += (py - myS) * Math.min(1, dt * 3);
    rot.set(view.pitch - myS * 0.07, view.yaw + (reduced ? 0 : Math.sin(t * 0.3) * 0.05) + mxS * 0.12, 0);
    q.setFromEuler(rot);
    const ext = rig.update(t, q);
    rig.fit(ext, { x: 0, y: 0, w, h }, w, h, 1 - Math.exp(-dt * 14));
    rig.light(dt, t, LIGHTS[tone][0], { x: mxS, y: myS });
    rig.draw();
  };
  const setRunning = () => {
    const want = visible && !document.hidden;
    if (want === running) return;
    running = want;
    if (running) { last = performance.now(); raf = requestAnimationFrame(frame); }
    else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    rig.showFilms(running && !reduced);
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
