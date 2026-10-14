import * as THREE from 'three';
import { studioEnvironment } from './studio';
import { createStage, canvasTexture, clamp01, lerp, inOut, outBack, seg } from './stage';

/**
 * /start — the brief, built as you write it. Each part of the form sets one
 * piece of a stack on a lit pedestal: your name a ceramic slab, your email a
 * ribbed silver one, the company an ink plate, the timeline frosted glass,
 * the budget a lime plate, the brief itself a sheet that thickens as you
 * type, and every project type a small block on top. Sending makes the stack
 * hum; once it's received the stack lifts off and a lime cube is left behind.
 */

export type BriefDraft = {
  name: boolean;
  email: boolean;
  company: boolean;
  types: string[];
  budget: number;     // -1 = not chosen
  timeline: number;   // -1 = not chosen
  brief: number;      // characters typed
  status: 'idle' | 'sending' | 'sent' | 'error';
};

export type BriefOptions = {
  reduced: boolean;
  getDraft: () => BriefDraft;
  onReady: () => void;
};

const LIME = new THREE.Color('#B8FF00');
const W = 2.3;   // slab width
const D = 1.5;   // slab depth

function ribsNormal(size = 256, ribs = 22) {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = Math.cos((x / size) * Math.PI * 2 * ribs) * 0.85;
      const len = Math.hypot(dx, 1);
      const o = (y * size + x) * 4;
      data[o] = (-dx / len * 0.5 + 0.5) * 255;
      data[o + 1] = 128;
      data[o + 2] = (1 / len * 0.5 + 0.5) * 255;
      data[o + 3] = 255;
    }
  }
  const t = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}

export async function mountBriefScene(host: HTMLElement, opts: BriefOptions) {
  const stage = createStage(host, { reduced: opts.reduced, onReady: opts.onReady });
  const { renderer, scene, coarse } = stage;
  renderer.toneMappingExposure = 1.05;
  const envTex = studioEnvironment(renderer);
  scene.environment = envTex;
  stage.onDispose(() => envTex.dispose());

  /* ---------------------------------------------------------------- light */
  scene.add(new THREE.HemisphereLight('#f2f5f8', '#121417', 0.85));
  const key = new THREE.DirectionalLight('#ffffff', 2.2);
  key.position.set(4, 8, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048);
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 5, bottom: -4, near: 1, far: 25 });
  key.shadow.radius = 5;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  scene.add(key);
  const rim = new THREE.DirectionalLight('#e2ecff', 1.1);
  rim.position.set(-5, 3, -4);
  scene.add(rim);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.4 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.3;
  ground.receiveShadow = true;
  scene.add(ground);

  /* ------------------------------------------------------------ materials */
  const lines = canvasTexture(512, 334, (ctx, w, h) => {
    ctx.fillStyle = '#f7f8f9';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#c9ced3';
    for (let i = 0; i < 9; i++) ctx.fillRect(w * 0.08, h * (0.14 + i * 0.085), w * (0.5 + ((i * 37) % 40) / 100), h * 0.022);
    ctx.fillStyle = '#B8FF00';
    ctx.fillRect(w * 0.08, h * 0.06, w * 0.05, h * 0.03);
  });
  const M = {
    plinth: new THREE.MeshPhysicalMaterial({ color: '#121417', metalness: 0.4, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.06 }),
    ceramic: new THREE.MeshPhysicalMaterial({ color: '#f4f6f7', roughness: 0.32, clearcoat: 0.7, clearcoatRoughness: 0.15 }),
    // Ribbed ink (was ribbed silver: no greys in the 3D).
    silver: new THREE.MeshPhysicalMaterial({
      color: '#16181b', metalness: 0.3, roughness: 0.35, clearcoat: 0.8,
      normalMap: ribsNormal(), normalScale: new THREE.Vector2(0.8, 0.8),
    }),
    ink: new THREE.MeshPhysicalMaterial({ color: '#16181b', roughness: 0.35, metalness: 0.3, clearcoat: 0.9, clearcoatRoughness: 0.08 }),
    frost: new THREE.MeshPhysicalMaterial({ color: '#f6f7f5', roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.08 }),
    limeSatin: new THREE.MeshPhysicalMaterial({ color: LIME, metalness: 0.3, roughness: 0.32, clearcoat: 0.4 }),
    chrome: new THREE.MeshPhysicalMaterial({ color: '#f6f7f5', roughness: 0.3, clearcoat: 0.8 }),   // was grey chrome
    paper: new THREE.MeshStandardMaterial({ color: '#f7f8f9', roughness: 0.8 }),
    paperTop: new THREE.MeshStandardMaterial({ map: lines, roughness: 0.8, emissive: '#ffffff', emissiveMap: lines, emissiveIntensity: 0.12 }),
    lime: new THREE.MeshBasicMaterial({ color: LIME, toneMapped: false }),
    ghost: new THREE.LineDashedMaterial({ color: LIME, transparent: true, opacity: 0.5, dashSize: 0.06, gapSize: 0.05, toneMapped: false }),
    edge: new THREE.LineBasicMaterial({ color: '#0b0c0d' }),
  };

  const mesh = (geo: THREE.BufferGeometry, mat: THREE.Material | THREE.Material[]) => {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  };

  /* -------------------------------------------------------------- pedestal */
  const rig = new THREE.Group();
  scene.add(rig);
  const plinth = mesh(new THREE.BoxGeometry(3.3, 0.3, 2.4), M.plinth);
  plinth.position.y = -0.15;
  plinth.add(new THREE.LineSegments(new THREE.EdgesGeometry(plinth.geometry), M.edge));
  rig.add(plinth);
  for (const [w, d, x, z] of [[3.3, 0.012, 0, 1.2], [0.012, 2.4, 1.65, 0]] as const) {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(w + 0.012, 0.012, d + 0.012), M.lime);
    strip.position.set(x, 0, z);
    rig.add(strip);
  }

  // The finished stack's outline — where the brief will stand.
  const GHOST_H = 1.3;
  const ghostGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(W, GHOST_H, D));
  const ghost = new THREE.LineSegments(ghostGeo, M.ghost);
  ghost.computeLineDistances();
  ghost.position.y = GHOST_H / 2;
  rig.add(ghost);

  /* ---------------------------------------------------------------- layers */
  type Layer = { m: THREE.Object3D; h: number; k: number; on: (d: BriefDraft) => boolean; height?: (d: BriefDraft) => number };
  const stack = new THREE.Group();
  rig.add(stack);
  const slab = (h: number, mat: THREE.Material | THREE.Material[], inset = 0) => {
    const g = new THREE.Group();
    const m = mesh(new THREE.BoxGeometry(W - inset, 1, D - inset), mat);
    g.add(m);
    g.userData.body = m;
    g.userData.h = h;
    return g;
  };
  const layers: Layer[] = [
    { m: slab(0.22, M.ceramic), h: 0.22, k: 0, on: (d) => d.name },
    { m: slab(0.16, M.silver, 0.06), h: 0.16, k: 0, on: (d) => d.email },
    { m: slab(0.1, M.ink, 0.12), h: 0.1, k: 0, on: (d) => d.company },
    { m: slab(0.14, M.frost), h: 0.14, k: 0, on: (d) => d.timeline >= 0 },
    { m: slab(0.08, M.limeSatin, 0.2), h: 0.08, k: 0, on: (d) => d.budget >= 0, height: (d) => 0.06 + Math.max(0, d.budget) * 0.025 },
    {
      m: slab(0.04, [M.paper, M.paper, M.paperTop, M.paper, M.paper, M.paper], 0.1),
      h: 0.04, k: 0, on: (d) => d.brief > 0,
      height: (d) => 0.03 + Math.min(1, d.brief / 600) * 0.3,
    },
  ];
  layers.forEach((l) => stack.add(l.m));

  // Project-type blocks, one per chosen type, in a row on top.
  const BLOCK_MATS = [M.limeSatin, M.chrome, M.frost, M.ceramic, M.ink, M.silver];
  const blocks = BLOCK_MATS.map((mat, i) => {
    const m = mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), mat);
    stack.add(m);
    return { m, k: 0, slot: i };
  });

  // Received: a lime cube left on the pedestal once the brief has gone.
  const done = mesh(new THREE.BoxGeometry(0.42, 0.42, 0.42), M.limeSatin);
  done.position.y = 0.21;
  done.visible = false;
  rig.add(done);

  // A scan plane that sweeps the stack while sending.
  const scan = new THREE.Mesh(new THREE.BoxGeometry(W + 0.2, 0.008, D + 0.2), M.lime);
  scan.visible = false;
  rig.add(scan);

  /* ---------------------------------------------------------------- camera */
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  let aspect = 1;
  stage.onResize((w, h) => {
    aspect = w / h;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
  });
  const DIR = new THREE.Vector3(5.2, 3.6, 7.4).normalize();
  const TARGET = new THREE.Vector3(0, 0.62, 0);
  const fit = (r: number) => {
    const v = THREE.MathUtils.degToRad(camera.fov) / 2;
    const h = Math.atan(Math.tan(v) * aspect);
    return r / Math.sin(Math.min(v, h));
  };

  const lean = { x: 0, y: 0, tx: 0, ty: 0 };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const r = host.getBoundingClientRect();
    lean.tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
    lean.ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2));
  };
  window.addEventListener('pointermove', onMove, { passive: true });
  stage.onDispose(() => window.removeEventListener('pointermove', onMove));

  let sentAt = -1;

  stage.run(({ t, dt }) => {
    const d = opts.getDraft();
    const rate = opts.reduced ? 1 : 1 - Math.exp(-dt * 6);

    // ---- slabs: drop in, lift out, and the stack closes any gaps ----
    let y = 0;
    layers.forEach((l, i) => {
      const target = l.on(d) ? 1 : 0;
      l.k += (target - l.k) * rate;
      const h = l.height ? l.height(d) : l.h;
      l.m.userData.cur = (l.m.userData.cur ?? h) + (h - (l.m.userData.cur ?? h)) * rate;
      const ch = l.m.userData.cur as number;
      const body = l.m.userData.body as THREE.Mesh;
      body.scale.y = ch;
      const k = outBack(clamp01(l.k), 1.2);
      l.m.position.y = y + ch / 2 + (1 - k) * 1.8;
      l.m.rotation.y = (1 - k) * (i % 2 ? 0.35 : -0.35) + (i % 2 ? 0.012 : -0.012);
      l.m.visible = l.k > 0.01;
      y += ch * clamp01(l.k);
    });

    // ---- project-type blocks on top ----
    const chosen = blocks.filter((b, i) => d.types.length > i);
    blocks.forEach((b, i) => {
      const target = i < d.types.length ? 1 : 0;
      b.k += (target - b.k) * rate;
      const n = Math.max(1, chosen.length);
      const x = (i - (n - 1) / 2) * 0.36;
      const k = outBack(clamp01(b.k), 1.6);
      b.m.position.set(x, y + 0.15 + (1 - k) * 1.4, 0.15 - (i % 2) * 0.32);
      b.m.rotation.y = (1 - k) * 1.2 + i * 0.08;
      b.m.scale.setScalar(Math.max(0.001, k));
      b.m.visible = b.k > 0.01;
    });
    const filled = y + (d.types.length ? 0.3 : 0);

    // ---- sending: hum and scan; sent: lift off, leave a lime cube ----
    const sending = d.status === 'sending';
    stack.position.x = sending && !opts.reduced ? Math.sin(t * 60) * 0.004 : 0;
    scan.visible = sending;
    if (sending) scan.position.y = (Math.sin(t * 3) * 0.5 + 0.5) * Math.max(0.2, filled);
    if (d.status === 'sent' && sentAt < 0) sentAt = t;
    if (d.status !== 'sent') sentAt = -1;
    const lift = sentAt < 0 ? 0 : opts.reduced ? 1 : inOut(seg(t - sentAt, 0, 1.3));
    stack.position.y = lift * 10;
    stack.rotation.y = lift * 0.6;
    stack.visible = lift < 0.999;
    done.visible = sentAt >= 0 && (opts.reduced || t - sentAt > 1.0);
    done.scale.setScalar(opts.reduced ? 1 : Math.max(0.001, outBack(seg(t - sentAt, 1.0, 1.5), 1.8)));
    done.rotation.y = t * 0.4;
    ghost.visible = sentAt < 0;
    (M.ghost as THREE.LineDashedMaterial).opacity = lerp(0.55, 0.15, clamp01(filled / GHOST_H));

    // ---- camera + idle ----
    lean.x += (lean.tx - lean.x) * 0.05;
    lean.y += (lean.ty - lean.y) * 0.05;
    rig.rotation.y = (opts.reduced ? 0 : Math.sin(t * 0.3) * 0.12) + lean.x * 0.18;
    rig.rotation.x = lean.y * 0.04;
    camera.position.copy(DIR).multiplyScalar(fit(2.35)).add(TARGET);
    camera.lookAt(TARGET);
    return camera;
  }, camera);

  // Reduced motion draws on demand, so the form asks for a frame on each change.
  return { dispose: () => stage.dispose(), redraw: () => stage.redraw() };
}
