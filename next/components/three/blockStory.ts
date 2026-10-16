import * as THREE from 'three';

/**
 * The site's one object: 27 blocks (a 3 × 3 × 3 cube).
 *
 * On the homepage (mountBlockStory) it is drawn on a fixed, transparent
 * canvas between the chapters' backgrounds and their words. Every chapter
 * (`[data-chapter]`) names an arrangement of the same blocks (`data-form`):
 * the cube, a wall, three slabs, a skyline, a field, a sorted row, a flyer
 * with its posts, a practice site with its phone. When a chapter pins and its
 * words are in place, the blocks slide from the last arrangement to this one,
 * each along a straight line with a small lift, bottom row first, the one
 * lime block first of all; some chapters have a second move while you read
 * (`data-inner`: the slabs press together, the field sorts itself).
 *
 * The object belongs to the page: its blocks are the page's own colours
 * (white on a black chapter, ink on a paper one), it is sized to the words
 * beside it (the same top and bottom lines), and when the next chapter's edge
 * scrolls up through it, the edge cuts the blocks too, so each part matches
 * the page behind it.
 *
 * Pacing: on desktop the wheel and keys can't rush a move. While a move is
 * under way the page advances at most as fast as the move (about 2.2 s per
 * chapter); a jump (a nav link, Home, End) isn't held.
 *
 * On a subpage (mountBlockFigure) the same blocks stand still in one
 * arrangement, gathered out of loose blocks when they first show.
 */

export type StoryHandle = { refresh: () => void; dispose: () => void };
type Opts = {
  canvas: HTMLCanvasElement;
  root: HTMLElement;
  reduced: boolean;
  fine: boolean;
  onReady?: () => void;
};

const N = 27;
const LIME = N - 1;   // the lime block: last in the cube's order (its top front right corner)
type Vec = [number, number, number];
type View = { yaw: number; pitch: number };
type Form = { slots: Vec[]; view: View };
const FORM_NAMES = ['scatter', 'cube', 'wall', 'slabs', 'pressed', 'skyline', 'field', 'sorted', 'flyer', 'practice'] as const;
type FormName = (typeof FORM_NAMES)[number];
const isForm = (s: string | undefined): s is FormName => !!s && (FORM_NAMES as readonly string[]).includes(s);

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const smooth = (a: number, b: number, x: number) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const mixView = (a: View, b: View, k: number): View => ({ yaw: lerp(a.yaw, b.yaw, k), pitch: lerp(a.pitch, b.pitch, k) });

/* ------------------------------------------------------------------ forms */

// Slots sorted bottom row first (y, then z, then x), so block k of one form
// goes to block k of the next and neighbours travel together; the lime block
// is swapped to the slot each form names for it.
function form(slots: Vec[], lime: Vec, view: View): Form {
  const sorted = [...slots].sort((a, b) => a[1] - b[1] || a[2] - b[2] || a[0] - b[0]);
  const li = sorted.findIndex((s) => Math.abs(s[0] - lime[0]) < 1e-6 && Math.abs(s[1] - lime[1]) < 1e-6 && Math.abs(s[2] - lime[2]) < 1e-6);
  if (li >= 0 && li !== LIME) [sorted[li], sorted[LIME]] = [sorted[LIME], sorted[li]];
  if (sorted.length !== N) throw new Error(`form has ${sorted.length} slots`);
  return { slots: sorted, view };
}
function buildForms(): Record<FormName, Form> {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const grid = (xs: number[], ys: number[], zs: number[]) => xs.flatMap((x) => ys.flatMap((y) => zs.map((z): Vec => [x, y, z])));
  const range = (n: number, step = 1) => Array.from({ length: n }, (_, i) => (i - (n - 1) / 2) * step);
  const loose = (w: number, h: number, d: number): Vec[] => Array.from({ length: N }, (): Vec => [(rnd() - 0.5) * w, (rnd() - 0.5) * h, (rnd() - 0.5) * d]);

  const three = [-1, 0, 1];
  const cube = grid(three, three, three);
  // a skyline: nine pillars on a 3 × 3 plan, 27 blocks between them
  const heights = [4, 2, 3, 3, 5, 2, 2, 3, 3];
  const skyline: Vec[] = [];
  three.forEach((z, zi) => three.forEach((x, xi) => { const h = heights[zi * 3 + xi]; for (let j = 0; j < h; j++) skyline.push([x, j - 2, z]); }));
  // a flyer (3 wide, 6 tall) with its posts laid out beside it
  const flyer = [...grid([-3, -2, -1], range(6), [0]), ...grid([1, 2, 3], [-2.5], three)];
  // a practice website (7 wide, 3 tall) with its phone (3 wide, 2 tall)
  const practice = [...grid(range(7), three, [0]), ...grid([4.6, 5.6, 6.6], [-1, 0], [0])];

  const NONE: Vec = [99, 99, 99];   // no lime slot named: the lime block keeps its place (the highest)
  return {
    scatter: form(loose(9, 6, 6), NONE, { yaw: -0.62, pitch: 0.4 }),
    cube: form(cube, [1, 1, 1], { yaw: -0.62, pitch: 0.4 }),
    wall: form(grid(range(9), three, [0]), [-3, 1, 0], { yaw: -0.3, pitch: 0.22 }),
    slabs: form(grid(three, [-2.4, 0, 2.4], three), [0, 2.4, 0], { yaw: -0.62, pitch: 0.42 }),
    pressed: form(cube, [0, 1, 0], { yaw: -0.62, pitch: 0.42 }),
    skyline: form(skyline, [0, 2, 0], { yaw: -0.55, pitch: 0.5 }),
    field: form(loose(7.5, 4, 5), NONE, { yaw: -0.35, pitch: 0.55 }),
    sorted: form(grid(range(9), [0], three), [4, 0, 1], { yaw: -0.35, pitch: 0.8 }),
    flyer: form(flyer, [-3, 2.5, 0], { yaw: -0.3, pitch: 0.3 }),
    practice: form(practice, [-2, -1, 0], { yaw: -0.3, pitch: 0.25 }),
  };
}

/* ---------------------------------------------------------------- shaders */

const VS = /* glsl */ `
attribute float aLime;
attribute float aMask;
varying vec3 vN;
varying vec3 vNo;
varying vec3 vPos;
varying float vLime;
varying float vMask;
void main() {
  vN = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
  vNo = normal;
  vPos = position;
  vLime = aLime;
  vMask = aMask;
  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
}
`;
// The material: solid white, ink or lime, with the things that make a block
// read as a thing and not a flat fill. Three tones of light tell the faces
// apart; a face is pillowed (its centre a touch brighter than its edges) and
// has a tooth of paper grain; where a neighbouring block sits across a gap
// the edge falls into contact shadow (aMask: a bit per side, +x -x +y -y +z
// -z); a free edge catches a hairline of light. No outlines. The page's
// edge (uEdge, in device pixels from the bottom) cuts the block: below it,
// the block takes the next chapter's tone (0 = white blocks, 1 = ink blocks).
const FS = /* glsl */ `
uniform float uEdge;
uniform float uHasEdge;
uniform float uToneAbove;
uniform float uToneBelow;
varying vec3 vN;
varying vec3 vNo;
varying vec3 vPos;
varying float vLime;
varying float vMask;
float bit(float m, float b) { return mod(floor(m / pow(2.0, b) + 0.5), 2.0); }
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main() {
  vec3 n = normalize(vN);
  vec3 no = normalize(vNo);
  vec3 L = normalize(vec3(0.35, 0.9, 0.5));
  float f = 0.45 + 0.55 * max(dot(n, L), 0.0);

  // This face's two axes, and whether a block sits across each of its edges.
  vec3 a = abs(no);
  vec2 uv; float pu, mu, pv, mv;
  if (a.x > 0.5) { uv = vPos.zy; pu = bit(vMask, 4.0); mu = bit(vMask, 5.0); pv = bit(vMask, 2.0); mv = bit(vMask, 3.0); }
  else if (a.y > 0.5) { uv = vPos.xz; pu = bit(vMask, 0.0); mu = bit(vMask, 1.0); pv = bit(vMask, 4.0); mv = bit(vMask, 5.0); }
  else { uv = vPos.xy; pu = bit(vMask, 0.0); mu = bit(vMask, 1.0); pv = bit(vMask, 2.0); mv = bit(vMask, 3.0); }
  const float h = 0.45;
  float ao = pu * (1.0 - smoothstep(0.0, 0.34, h - uv.x)) + mu * (1.0 - smoothstep(0.0, 0.34, h + uv.x))
           + pv * (1.0 - smoothstep(0.0, 0.34, h - uv.y)) + mv * (1.0 - smoothstep(0.0, 0.34, h + uv.y));
  ao = clamp(ao, 0.0, 1.0);
  vec2 q = abs(uv) / h;
  float edge = max(q.x, q.y);
  float pillow = 1.0 - 0.06 * edge * edge;
  float rim = smoothstep(0.86, 1.0, edge) * max(dot(n, L), 0.0) * (1.0 - ao);
  // paper tooth: fine, and only just there
  float grain = (hash(floor(uv * 72.0) + no.xy * 7.0 + no.z * 3.0) - 0.5) * 0.022;

  float tone = uHasEdge > 0.5 && gl_FragCoord.y < uEdge ? uToneBelow : uToneAbove;
  vec3 white = vec3(0.957, 0.961, 0.949) * mix(0.78, 1.0, f) * pillow * (1.0 - 0.16 * ao) + vec3(0.05) * rim;
  vec3 ink = mix(vec3(0.04, 0.045, 0.055), vec3(0.24, 0.25, 0.27), f) * pillow * (1.0 - 0.55 * ao) + vec3(0.05) * rim;
  vec3 c = mix(white, ink, tone);
  vec3 lime = vec3(0.722, 1.0, 0.0) * mix(0.68, 1.0, f) * pillow * (1.0 - 0.3 * ao) + vec3(0.05) * rim;
  c = mix(c, lime, vLime);
  gl_FragColor = vec4(c * (1.0 + grain), 1.0);
}
`;

/* -------------------------------------------------------------------- rig */

type Box = { x: number; y: number; w: number; h: number };
type Ext = { minX: number; maxX: number; minY: number; maxY: number };

/** Everything the blocks need to be drawn, shared by the story and the figures. */
function createRig(canvas: HTMLCanvasElement, maxDpr: number) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.debug.checkShaderErrors = false;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
  const scene = new THREE.Scene();
  // A long lens: the blocks stay square, like things on a page, not in a photo.
  const camera = new THREE.PerspectiveCamera(18, 1.6, 1, 400);
  camera.position.set(0, 0, 120);
  const forms = buildForms();

  const geo = new THREE.BoxGeometry(0.9, 0.9, 0.9);   // a tenth of the pitch is the gap
  const lime = new Float32Array(N);
  lime[LIME] = 1;
  geo.setAttribute('aLime', new THREE.InstancedBufferAttribute(lime, 1));
  // Which sides of each block have a neighbour across the gap (for the
  // contact shadows), recomputed as the blocks move.
  const mask = new Float32Array(N);
  const maskAttr = new THREE.InstancedBufferAttribute(mask, 1);
  maskAttr.setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('aMask', maskAttr);
  const U = { uEdge: { value: 0 }, uHasEdge: { value: 0 }, uToneAbove: { value: 0 }, uToneBelow: { value: 0 } };
  const material = new THREE.ShaderMaterial({ uniforms: U, vertexShader: VS, fragmentShader: FS });
  const mesh = new THREE.InstancedMesh(geo, material, N);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  const group = new THREE.Group();
  group.add(mesh);
  scene.add(group);

  const pos = new Float32Array(N * 3);
  const DIRS: Vec[] = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
  const neighbours = () => {
    for (let k = 0; k < N; k++) {
      let m = 0;
      for (let d = 0; d < 6; d++) {
        const tx = pos[k * 3] + DIRS[d][0], ty = pos[k * 3 + 1] + DIRS[d][1], tz = pos[k * 3 + 2] + DIRS[d][2];
        for (let j = 0; j < N; j++) {
          if (j === k) continue;
          if (Math.abs(pos[j * 3] - tx) < 0.22 && Math.abs(pos[j * 3 + 1] - ty) < 0.22 && Math.abs(pos[j * 3 + 2] - tz) < 0.22) { m += 1 << d; break; }
        }
      }
      mask[k] = m;
    }
    maskAttr.needsUpdate = true;
  };

  const m4 = new THREE.Matrix4(), qId = new THREE.Quaternion();
  const v3 = new THREE.Vector3(), p3 = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1);
  /** Lay the blocks out between arrangements (and toward an inner one); returns their extents as seen. */
  const layout = (from: Form, to: Form, inner: Form | null, e: number, ei: number, q: THREE.Quaternion): Ext => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let k = 0; k < N; k++) {
      // Bottom row first, a wave up through the arrangement; the lime block leads.
      const order = k === LIME ? 0 : 0.08 + (k / (N - 2)) * 0.42;
      const ek = easeInOut(clamp01((e - order) / 0.5)), eik = easeInOut(clamp01((ei - order) / 0.5));
      const a = from.slots[k], b = to.slots[k];
      let x = lerp(a[0], b[0], ek), y = lerp(a[1], b[1], ek) + Math.sin(Math.PI * ek) * (0.7 + 0.5 * (k % 5) / 4), z = lerp(a[2], b[2], ek);
      if (inner) {
        const c = inner.slots[k];
        x = lerp(x, c[0], eik); y = lerp(y, c[1], eik) + Math.sin(Math.PI * eik) * 0.6; z = lerp(z, c[2], eik);
      }
      p3.set(x, y, z);
      pos[k * 3] = x; pos[k * 3 + 1] = y; pos[k * 3 + 2] = z;
      v3.copy(p3).applyQuaternion(q);
      minX = Math.min(minX, v3.x - 0.5); maxX = Math.max(maxX, v3.x + 0.5);
      minY = Math.min(minY, v3.y - 0.5); maxY = Math.max(maxY, v3.y + 0.5);
      m4.compose(p3, qId, one);
      mesh.setMatrixAt(k, m4);
    }
    mesh.instanceMatrix.needsUpdate = true;
    neighbours();
    group.quaternion.copy(q);
    return { minX, maxX, minY, maxY };
  };

  let cw = 0, chh = 0;
  const resize = (w: number, h: number) => {
    if (w === cw && h === chh) return;
    cw = w; chh = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  // Place the extents inside a box (CSS pixels of a canvas w × h), 0.9 of it.
  const fitted = { x: 0, y: 0, s: 1, ok: false };
  const fit = (ext: Ext, box: Box, w: number, h: number, k: number) => {
    const visH = 2 * camera.position.z * Math.tan((camera.fov * Math.PI) / 360), visW = visH * camera.aspect;
    const pxToWorld = visH / h;
    const extW = (ext.maxX - ext.minX) || 1, extH = (ext.maxY - ext.minY) || 1;
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
    mesh.visible = true;
  };
  const dispose = () => {
    geo.dispose();
    material.dispose();
    renderer.dispose();
  };
  return { renderer, scene, camera, group, mesh, U, forms, layout, resize, fit, dispose };
}

/* ------------------------------------------------------------------ story */

type Chapter = {
  el: HTMLElement;
  copy: HTMLElement | null;
  win: HTMLElement | null;
  form: FormName;
  inner: FormName | null;
  tone: number;        // 0: a black chapter (white blocks), 1: a paper one (ink blocks)
  steps: number;
  top: number;
  h: number;
};

export function mountBlockStory({ canvas, root, reduced, fine, onReady }: Opts): StoryHandle {
  const rig = createRig(canvas, fine ? 2 : 1.5);
  const { renderer, scene, camera, U, forms } = rig;

  /* chapters, from the DOM */
  let chapters: Chapter[] = [];
  const readChapters = () => {
    chapters = Array.from(root.querySelectorAll<HTMLElement>('[data-chapter]')).map((el) => ({
      el,
      copy: el.querySelector<HTMLElement>('.ch-copy'),
      win: el.querySelector<HTMLElement>('.ch-window'),
      form: isForm(el.dataset.form) ? el.dataset.form : 'cube',
      inner: isForm(el.dataset.inner) ? el.dataset.inner : null,
      tone: el.dataset.tone === 'paper' ? 1 : 0,
      steps: Number(el.dataset.steps || 0),
      top: 0,
      h: 1,
    }));
  };
  readChapters();
  const measure = () => {
    for (const c of chapters) {
      const r = c.el.getBoundingClientRect();
      c.top = r.top + window.scrollY;
      c.h = Math.max(1, r.height);
    }
  };

  /* input */
  let lastInput = -1e9, pointerIn = false;
  const ndc = new THREE.Vector2();
  const markInput = () => { lastInput = performance.now(); };
  const keys = new Set(['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ']);
  const onKey = (e: KeyboardEvent) => { if (keys.has(e.key)) markInput(); };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    ndc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    pointerIn = true;
  };
  const onLeave = () => { pointerIn = false; };
  window.addEventListener('wheel', markInput, { passive: true });
  window.addEventListener('keydown', onKey);
  window.addEventListener('pointermove', onMove, { passive: true });
  document.documentElement.addEventListener('mouseleave', onLeave);

  /* the loop */
  let raf = 0, running = false, visible = true, ready = false, last = performance.now();
  let Sd = 0, introStart = -1, mxS = 0, myS = 0, stepEl: HTMLElement | null = null, stepIndex = -1;
  const splashDone = () => (window as unknown as { __qbixSplashDone?: boolean }).__qbixSplashDone !== false;

  // A chapter's words, as a box the object sits beside (desktop), or its
  // window (phones): both in CSS pixels.
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
    const minH = vh * 0.46, h = Math.max(r.height, minH), y = r.top + r.height / 2 - h / 2;
    const left = r.left + r.width / 2 < vw / 2;        // the words on the left: the object on the right
    return left ? { x: r.right + gap, y, w: vw - edge - (r.right + gap), h } : { x: edge, y, w: r.left - gap - edge, h };
  };
  const mixBox = (a: Box, b: Box, k: number): Box => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), w: lerp(a.w, b.w, k), h: lerp(a.h, b.h, k) });

  const q = new THREE.Quaternion(), rot = new THREE.Euler();
  const frame = (now: number) => {
    raf = 0;
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = now / 1000;
    if (!chapters.length) return;
    measure();
    const vw = window.innerWidth, vh = window.innerHeight, y = window.scrollY, phone = tall();
    rig.resize(vw, vh);

    // Where the story is: chapter i, pinned progress u, and the slide f toward the next.
    let i = 0;
    for (let k = 0; k < chapters.length; k++) if (chapters[k].top <= y + 1) i = k;
    const ch = chapters[i];
    const pinLen = Math.max(1, ch.h - vh);
    let u = clamp01((y - ch.top) / pinLen);
    let f = i + 1 < chapters.length ? clamp01((y - (ch.top + pinLen)) / vh) : 0;
    if (phone) {
      // Phones: the chapter whose window is nearest the middle; its move plays
      // as the window rises into the upper half of the screen.
      let best = 0, bestD = Infinity;
      chapters.forEach((c, k) => { const r = c.win?.getBoundingClientRect(); if (!r) return; const d = Math.abs(r.top + r.height / 2 - vh / 2); if (d < bestD) { bestD = d; best = k; } });
      i = best;
      const r = chapters[i].win?.getBoundingClientRect();
      u = r ? clamp01((vh * 0.9 - r.top) / (vh * 0.55)) : 1;
      f = 0;
    }
    const S = i + u;

    // Pacing: a move can't be rushed by the wheel or the keys.
    const driving = fine && !reduced && !phone && now - lastInput < 260;
    const inMove = Sd - Math.floor(Sd) < 0.45 && Math.floor(Sd) > 0;
    if (driving && S > Sd && inMove) Sd = Math.min(S, Sd + 0.2 * dt);
    else Sd += (S - Sd) * (1 - Math.exp(-dt * 10));
    Sd = Math.min(chapters.length - 0.001, Math.max(0, Sd));   // the last chapter has its dwell too
    if (driving && S > Sd + 0.08) {
      const k = Math.floor(Sd + 0.08), c = chapters[k];
      const cap = c.top + (Sd + 0.08 - k) * Math.max(1, c.h - vh);
      if (y > cap + 1) window.scrollTo(0, cap);
    }
    const id = Math.min(chapters.length - 1, Math.floor(Sd)), ud = Sd - id, cur = chapters[id];
    const prev = id > 0 ? chapters[id - 1] : null;

    // The blocks: from the last arrangement to this one, then the inner move.
    if (introStart < 0 && splashDone()) introStart = t;
    const intro = reduced ? 1 : introStart < 0 ? 0 : clamp01((t - introStart - 0.15) / 1.9);
    const from = forms[prev ? prev.inner ?? prev.form : 'scatter'];
    const to = forms[cur.form];
    const inner = cur.inner ? forms[cur.inner] : null;
    const e = id === 0 ? intro : reduced ? 1 : smooth(0, 0.45, ud);
    const ei = inner ? (reduced ? 1 : smooth(0.55, 0.88, ud)) : 0;
    let view = mixView(from.view, to.view, easeInOut(e));
    if (inner) view = mixView(view, inner.view, easeInOut(ei));
    mxS += (ndc.x - mxS) * Math.min(1, dt * 3);
    myS += (ndc.y - myS) * Math.min(1, dt * 3);
    const sway = reduced ? 0 : pointerIn ? 1 : 0.6;
    rot.set(view.pitch - myS * 0.07 * sway, view.yaw + Math.sin(t * 0.3) * 0.05 * (reduced ? 0 : 1) + mxS * 0.12 * sway, 0);
    q.setFromEuler(rot);
    const ext = rig.layout(from, to, inner, e, ei, q);

    // Sized to the words beside it: the same top and bottom lines.
    const boxA = boxFor(cur);
    const next = id + 1 < chapters.length ? chapters[id + 1] : null;
    const boxB = f > 0 && next ? boxFor(next) : null;
    const box = boxA && boxB ? mixBox(boxA, boxB, f) : boxA ?? boxB;
    if (box && box.w > 40 && box.h > 40) rig.fit(ext, box, vw, vh, 1 - Math.exp(-dt * 18));

    // The page's colours: the edge of the chapter scrolling up cuts the blocks.
    let edgeCss = -1, above = cur.tone, below = cur.tone;
    for (let k = 0; k < chapters.length; k++) {
      const r = chapters[k].el.getBoundingClientRect();
      if (r.top > 0 && r.top < vh) { edgeCss = r.top; below = chapters[k].tone; above = k > 0 ? chapters[k - 1].tone : below; break; }
      if (r.top <= 0 && r.bottom > 0) above = below = chapters[k].tone;
    }
    U.uHasEdge.value = edgeCss >= 0 ? 1 : 0;
    U.uEdge.value = (vh - edgeCss) * renderer.getPixelRatio();
    U.uToneAbove.value = above;
    U.uToneBelow.value = below;

    // The step the words point at follows the move and the dwell.
    if (cur.steps > 0) {
      const k = Math.min(cur.steps - 1, Math.floor(ud * cur.steps));
      if (stepEl !== cur.el || stepIndex !== k) {
        if (stepEl && stepEl !== cur.el) stepEl.removeAttribute('data-step');
        cur.el.setAttribute('data-step', String(k));
        stepEl = cur.el;
        stepIndex = k;
      }
    }

    renderer.render(scene, camera);
    if (!ready) { ready = true; onReady?.(); }
  };

  const setRunning = () => {
    const want = visible && !document.hidden;
    if (want === running) return;
    running = want;
    if (running) { last = performance.now(); raf = requestAnimationFrame(frame); }
    else if (raf) { cancelAnimationFrame(raf); raf = 0; }
  };
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; setRunning(); });
  io.observe(root);
  const onVis = () => setRunning();
  document.addEventListener('visibilitychange', onVis);
  setRunning();

  return {
    refresh() {
      readChapters();
      stepEl = null;
      stepIndex = -1;
    },
    dispose() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('wheel', markInput);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      rig.dispose();
    },
  };
}

/* ----------------------------------------------------------------- figure */

/**
 * The blocks standing still on a subpage: one arrangement, gathered out of
 * loose blocks when it first shows, swaying a little, tilting with the
 * pointer; `inner` makes it alternate between two arrangements every few
 * seconds. Renders only while on screen.
 */
export function mountBlockFigure(
  canvas: HTMLCanvasElement,
  { form: formName, inner: innerName, tone, reduced }: { form: string; inner?: string; tone: 'dark' | 'paper'; reduced: boolean },
): () => void {
  const rig = createRig(canvas, 2);
  const { renderer, scene, camera, U, forms } = rig;
  const from = forms.scatter;
  const to = forms[isForm(formName) ? formName : 'cube'];
  const inner = isForm(innerName) ? forms[innerName] : null;
  U.uToneAbove.value = tone === 'paper' ? 1 : 0;
  U.uToneBelow.value = U.uToneAbove.value;

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

  let raf = 0, running = false, visible = false, start = -1, last = performance.now(), mxS = 0, myS = 0;
  const q = new THREE.Quaternion(), rot = new THREE.Euler();
  const frame = (now: number) => {
    raf = 0;
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = now / 1000;
    if (start < 0) start = t;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    rig.resize(w, h);
    const e = reduced ? 1 : clamp01((t - start - 0.1) / 1.8);
    // With an inner arrangement: hold, move to it, hold, move back; every 7.5 s.
    let ei = 0;
    if (inner) {
      if (reduced) ei = 1;
      else {
        const c = (t - start - 2.6) % 7.5;
        ei = c < 0 ? 0 : c < 1.3 ? smooth(0, 1, c / 1.3) : c < 4.2 ? 1 : c < 5.5 ? 1 - smooth(0, 1, (c - 4.2) / 1.3) : 0;
      }
    }
    let view = mixView(from.view, to.view, easeInOut(e));
    if (inner) view = mixView(view, inner.view, easeInOut(ei));
    const px = pointerIn ? Math.max(-1, Math.min(1, ndc.x)) : 0, py = pointerIn ? Math.max(-1, Math.min(1, ndc.y)) : 0;
    mxS += (px - mxS) * Math.min(1, dt * 3);
    myS += (py - myS) * Math.min(1, dt * 3);
    rot.set(view.pitch - myS * 0.07, view.yaw + (reduced ? 0 : Math.sin(t * 0.3) * 0.05) + mxS * 0.12, 0);
    q.setFromEuler(rot);
    const ext = rig.layout(from, to, inner, e, ei, q);
    rig.fit(ext, { x: 0, y: 0, w, h }, w, h, 1 - Math.exp(-dt * 18));
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
