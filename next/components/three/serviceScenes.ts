import * as THREE from 'three';
import { studioEnvironment } from './studio';

/**
 * Service-card scenes — two small isometric 3D stories rendered with three.js,
 * one per offer: listing (flyer, posts and video for one property) and
 * practice (a calm practice website assembling on a browser slab).
 *
 * Orthographic camera, satin-dark materials with hairline edges (the blueprint
 * language of the old SVGs), one lime signal per scene. Motion is a pure
 * function of time, so reduced-motion simply renders one composed frame.
 */

export type SceneVariant = 'listing' | 'practice';

const LIME = new THREE.Color('#B8FF00');
const WHITE = new THREE.Color('#f2f3ef');
const PALE = new THREE.Color('#dcdfd8');
const CHROME = new THREE.Color('#c9cdd3');

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const inOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const outQuint = (x: number) => 1 - Math.pow(1 - x, 5);
const outBack = (x: number, s = 1.25) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/** Deterministic pseudo-random so every loop scatters the same way. */
function rand(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function materials() {
  // Translucent layer language: clear and lime-tinted glass plates with white
  // hairline edges, a few solid accents (pearl, light type bars, exact lime).
  const layer = (color: THREE.ColorRepresentation, opacity: number, glow = 0) =>
    new THREE.MeshPhysicalMaterial({
      color, transparent: true, opacity, metalness: 0, roughness: 0.14,
      clearcoat: 1, clearcoatRoughness: 0.08, depthWrite: false, side: THREE.DoubleSide,
      // A touch of self-light so tinted glass reads lit, not muddy, on the dark card.
      emissive: color, emissiveIntensity: glow,
    });
  return {
    body: layer('#ffffff', 0.08, 0.05),   // clear glass plate
    frost: layer(LIME, 0.26, 0.35),       // lime-tinted glass plate
    chrome: new THREE.MeshPhysicalMaterial({
      color: '#e9ecef', metalness: 0.45, roughness: 0.24, clearcoat: 0.8, clearcoatRoughness: 0.1,
    }),
    ink: new THREE.MeshPhysicalMaterial({ color: '#eceee8', metalness: 0, roughness: 0.4, clearcoat: 0.4 }),
    inkDark: new THREE.MeshPhysicalMaterial({ color: '#15171a', metalness: 0.2, roughness: 0.35, clearcoat: 0.6 }),
    // The signal colour is unlit and skips tone mapping so it lands as exact #B8FF00.
    lime: new THREE.MeshBasicMaterial({ color: LIME, toneMapped: false }),
    glass: layer(LIME, 0.22, 0.3),
    edge: new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.62 }),
    edgeLime: new THREE.LineBasicMaterial({ color: LIME, transparent: true, opacity: 0.95, toneMapped: false }),
  };
}
type Mats = ReturnType<typeof materials>;

/** Sharp-cornered slab with a crisp hairline outline — the site's no-radius
 *  rule carried into 3D. (The trailing radius argument is kept for call-site
 *  compatibility and ignored.) */
function slab(w: number, h: number, d: number, mat: THREE.Material, edge: THREE.LineBasicMaterial, _r = 0) {
  const g = new THREE.Group();
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.castShadow = !mat.transparent;   // glass layers stay airy — no solid shadow
  mesh.receiveShadow = true;
  g.add(mesh);
  const lines = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)), edge);
  g.add(lines);
  return Object.assign(g, { mesh, lines });
}

/* ----------------------------------------------------------------- listing */

/** Triangular prism along z — a pitched roof. */
function roof(w: number, h: number, d: number, mat: THREE.Material) {
  const shape = new THREE.Shape([new THREE.Vector2(-w / 2, 0), new THREE.Vector2(w / 2, 0), new THREE.Vector2(0, h)]);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false });
  geo.translate(0, 0, -d / 2);
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  return m;
}

function buildListing(scene: THREE.Group, M: Mats) {
  // Print flyer — 8.5 × 11 sheet with a photo panel, a little house, type.
  const flyer = new THREE.Group();
  flyer.add(slab(1.7, 0.03, 2.2, M.body, M.edge, 0.012));
  const photo = slab(1.5, 0.02, 1.12, M.frost, M.edge, 0.01);
  photo.position.set(0, 0.025, -0.44);
  flyer.add(photo);
  const house = new THREE.Group();
  const walls = slab(0.62, 0.36, 0.44, M.body, M.edge, 0.02);
  walls.position.y = 0.18;
  house.add(walls);
  const top = roof(0.74, 0.28, 0.5, M.ink);
  top.position.y = 0.36;
  house.add(top);
  const door = slab(0.12, 0.2, 0.02, M.lime, M.edgeLime, 0.005);
  door.position.set(-0.12, 0.1, 0.225);
  house.add(door);
  [0.1, 0.23].forEach((x) => {
    const w = slab(0.1, 0.1, 0.02, M.chrome, M.edge, 0.005);
    w.position.set(x, 0.2, 0.225);
    house.add(w);
  });
  house.position.set(0, 0.04, -0.44);
  flyer.add(house);
  const line = (w: number, z: number, mat: THREE.Material = M.ink, h = 0.07) => {
    const b = slab(w, 0.012, h, mat, M.edge, 0.005);
    b.position.set(-0.75 + w / 2, 0.022, z);
    flyer.add(b);
  };
  line(0.9, 0.36, M.ink, 0.11);
  line(1.2, 0.54);
  line(0.7, 0.68);
  line(0.34, 0.92, M.lime);   // open-house tag
  flyer.position.set(-0.95, 0.03, -0.1);
  scene.add(flyer);

  // Five social posts — dealt out of the flyer into a fan.
  const posts = [0, 1, 2, 3, 4].map((i) => {
    const g = new THREE.Group();
    g.add(slab(0.66, 0.03, 0.66, M.body, M.edge, 0.012));
    const img = slab(0.56, 0.015, 0.4, M.frost, M.edge, 0.006);
    img.position.set(0, 0.02, -0.08);
    g.add(img);
    const tag = slab(i === 0 ? 0.32 : 0.22, 0.012, 0.06, i === 0 ? (M.lime) : M.ink, M.edge, 0.004);
    tag.position.set(-0.28 + (i === 0 ? 0.16 : 0.11), 0.02, 0.21);
    g.add(tag);
    scene.add(g);
    // A row running along the screen's horizontal (the x−z diagonal in this
    // isometric view), each post a step higher than the last.
    return {
      g,
      home: new THREE.Vector3(-0.15 + i * 0.5, 0.1 + i * 0.07, -1.05 - i * 0.5),
      rot: 0,
    };
  });
  const POST_START = new THREE.Vector3(-0.95, 0.08, -0.1);

  // Vertical video on a phone, with a play mark and a lime progress bar.
  // Built lying flat (screen up), then stood upright facing the camera.
  const phone = new THREE.Group();
  const handset = new THREE.Group();
  handset.add(slab(0.66, 0.06, 1.2, M.body, M.edge, 0.06));
  const screen = slab(0.56, 0.01, 1.04, M.frost, M.edge, 0.02);
  screen.position.y = 0.035;
  handset.add(screen);
  const play = roof(0.2, 0.18, 0.02, M.lime);
  play.rotation.set(-Math.PI / 2, 0, -Math.PI / 2);
  play.position.set(-0.04, 0.05, -0.05);
  handset.add(play);
  const track = slab(0.46, 0.008, 0.025, M.ink, M.edge, 0.004);
  track.position.set(0, 0.045, 0.42);
  handset.add(track);
  const bar = new THREE.Mesh(new THREE.BoxGeometry(1, 0.012, 0.03), M.lime);
  bar.position.set(-0.23, 0.05, 0.42);
  handset.add(bar);
  handset.rotation.x = Math.PI / 2 - 0.22;   // screen faces out, top up, leaning back
  handset.position.y = 0.6;
  phone.add(handset);
  scene.add(phone);

  const LOOP = 9.6;
  return (time: number) => {
    const t = time % LOOP;
    const out = inOut(seg(t, 8.2, 9.0));

    const fin = outQuint(seg(t, 0.15, 1.0));
    flyer.position.z = lerp(-3.3, -0.1, fin);
    flyer.rotation.y = lerp(0.35, 0, fin);
    const hp = outBack(seg(t, 0.85, 1.45), 1.8);
    house.scale.setScalar(Math.max(0.0001, hp * (1 - out)));

    posts.forEach((p, i) => {
      const k = clamp01(outBack(seg(t, 1.4 + i * 0.32, 2.15 + i * 0.32), 1.15) - inOut(seg(t, 7.7 + (4 - i) * 0.08, 8.5 + (4 - i) * 0.08)));
      p.g.position.lerpVectors(POST_START, p.home, k);
      p.g.position.y = lerp(0.08 + i * 0.01, p.home.y, k) + Math.sin(Math.PI * k) * 0.35;
      p.g.rotation.y = p.rot * k + (1 - k) * 0.4;
      p.g.visible = k > 0.001;
    });

    const pin = outQuint(seg(t, 3.5, 4.3));
    const pout = inOut(seg(t, 7.6, 8.3));
    phone.position.set(lerp(4.4, 1.75, pin) + pout * 2.8, 0, lerp(2.4, 0.95, pin));
    phone.rotation.y = Math.PI / 4 + lerp(-0.7, -0.1, pin);
    phone.visible = pin > 0.001 && pout < 0.999;
    const prog = seg(t, 4.4, 7.4);   // the 30-second cut, compressed
    bar.scale.x = Math.max(0.0001, prog * 0.46);
    bar.position.x = -0.23 + (prog * 0.46) / 2;
    play.visible = prog < 0.02 || prog >= 1;

    flyer.visible = t < 9.0;
    flyer.position.x = -0.95 - out * 4.5;
  };
}

/* ---------------------------------------------------------------- practice */

function buildPractice(scene: THREE.Group, M: Mats) {
  const SLAB_H = 0.14;
  const win = slab(4.2, SLAB_H, 2.8, M.body, M.edge, 0.06);
  win.position.y = SLAB_H / 2;
  scene.add(win);
  const bar = slab(4.2, 0.02, 0.3, M.chrome, M.edge, 0.01);
  bar.position.set(0, SLAB_H + 0.01, -1.25);
  scene.add(bar);
  const TOP = SLAB_H + 0.02;

  // Before: a crowded 2019 page — many small, uneven blocks and a dated footer.
  const pale = M.body.clone();
  pale.color.copy(PALE);
  const clutter: { t: THREE.Group; y: number }[] = [];
  let seedI = 3;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 5; col++) {
      seedI++;
      if (rand(seedI) < 0.18) continue;
      const w = 0.42 + rand(seedI + 40) * 0.3;
      const d = 0.26 + rand(seedI + 80) * 0.18;
      const h = 0.04 + rand(seedI + 120) * 0.1;
      const mat = rand(seedI + 160) < 0.35 ? M.chrome : rand(seedI + 200) < 0.3 ? M.ink : pale;
      const tile = slab(w, h, d, mat, M.edge, 0.012);
      tile.position.set(-1.62 + col * 0.8 + (rand(seedI + 240) - 0.5) * 0.14, TOP + h / 2, -0.82 + row * 0.5 + (rand(seedI + 280) - 0.5) * 0.1);
      tile.rotation.y = (rand(seedI + 320) - 0.5) * 0.12;
      scene.add(tile);
      clutter.push({ t: tile, y: tile.position.y });
    }
  }
  const dated = slab(0.7, 0.03, 0.08, M.ink, M.edge, 0.008);
  dated.position.set(-1.5, TOP + 0.015, 1.2);
  scene.add(dated);
  clutter.push({ t: dated, y: dated.position.y });

  // After: one quiet column — a soft photo, a large headline, one lime button.
  const calm: { t: THREE.Object3D; y: number }[] = [];
  const add = (o: THREE.Object3D, x: number, y: number, z: number) => {
    o.position.set(x, y, z);
    scene.add(o);
    calm.push({ t: o, y });
  };
  add(slab(1.5, 0.06, 1.7, M.frost, M.edge, 0.03), 1.05, TOP + 0.03, -0.1);
  add(slab(1.9, 0.03, 0.16, M.ink, M.edge, 0.01), -0.95, TOP + 0.015, -0.6);
  add(slab(1.4, 0.03, 0.16, M.ink, M.edge, 0.01), -1.2, TOP + 0.015, -0.3);
  add(slab(1.6, 0.015, 0.06, M.chrome, M.edge, 0.005), -1.1, TOP + 0.008, 0.02);
  add(slab(1.2, 0.015, 0.06, M.chrome, M.edge, 0.005), -1.3, TOP + 0.008, 0.16);
  const cta = slab(0.95, 0.08, 0.24, M.lime, M.edgeLime, 0.1);
  add(cta, -1.42, TOP + 0.04, 0.6);

  // Phone with the same calm page and its button.
  const phone = new THREE.Group();
  phone.add(slab(0.7, 0.07, 1.3, M.body, M.edge, 0.07));
  const pPhoto = slab(0.56, 0.02, 0.5, M.frost, M.edge, 0.01);
  pPhoto.position.set(0, 0.05, -0.3);
  phone.add(pPhoto);
  const pHead = slab(0.46, 0.012, 0.06, M.ink, M.edge, 0.004);
  pHead.position.set(-0.04, 0.045, 0.08);
  phone.add(pHead);
  const pBtn = slab(0.4, 0.03, 0.11, M.lime, M.edgeLime, 0.05);
  pBtn.position.set(0, 0.05, 0.4);
  phone.add(pBtn);
  scene.add(phone);

  const LOOP = 11;
  return (time: number) => {
    const t = time % LOOP;
    // Clutter sinks into the page, front to back; returns at the loop's end.
    clutter.forEach((c, i) => {
      const k = clamp01(inOut(seg(t, 2.0 + i * 0.05, 2.9 + i * 0.05)) - inOut(seg(t, 10.1 + i * 0.02, 10.8 + i * 0.02)));
      const jitter = (1 - k) * Math.sin(time * 2 + i) * 0.006;
      c.t.scale.y = Math.max(0.0001, 1 - k);
      c.t.position.y = c.y * (1 - k) + TOP * k * 0.5 + jitter;
      c.t.visible = k < 0.999;
    });
    // The calm page rises slowly — no bounce.
    calm.forEach((c, i) => {
      const k = clamp01(inOut(seg(t, 3.4 + i * 0.16, 4.6 + i * 0.16)) - inOut(seg(t, 9.4, 10.1)));
      c.t.scale.y = Math.max(0.0001, k);
      c.t.position.y = c.y * k + TOP * (1 - k);
      c.t.visible = k > 0.001;
    });
    const breathe = 1 + Math.sin(Math.PI * 2 * seg((t - 5.5) % 2, 0, 2)) * 0.035 * (t > 5.5 && t < 9.4 ? 1 : 0);
    cta.scale.set(breathe, cta.scale.y, breathe);

    const pin = outQuint(seg(t, 5.0, 6.0));
    const pout = inOut(seg(t, 9.2, 9.9));
    phone.position.set(lerp(6.2, 3.0, pin) + pout * 3.4, 0, 0.95);
    phone.rotation.y = lerp(-0.5, -0.12, pin);
    phone.visible = pin > 0.001 && pout < 0.999;
    pBtn.scale.setScalar(breathe);
  };
}

/* ------------------------------------------------------------------- mount */

export function mountServiceScene(
  host: HTMLElement,
  variant: SceneVariant,
  opts: { reduced: boolean; pointerTarget: HTMLElement | null; onReady: () => void },
) {
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;   // whites stay white, lime stays lime
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.className = 'svc-scene-canvas';
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const envTex = studioEnvironment(renderer);
  scene.environment = envTex;
  scene.environmentIntensity = 0.9;

  scene.add(new THREE.HemisphereLight('#f2f6fa', '#1a1c20', 0.7));
  const key = new THREE.DirectionalLight('#ffffff', 1.8);
  key.position.set(3.5, 8, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(coarse ? 512 : 1024, coarse ? 512 : 1024);
  key.shadow.camera.left = -5; key.shadow.camera.right = 5;
  key.shadow.camera.top = 5; key.shadow.camera.bottom = -5;
  key.shadow.radius = 4;
  key.shadow.bias = -0.0005;
  scene.add(key);
  // Cool rim from front-left, low — its highlight lands on the slabs' side
  // faces (crisp edges), never flooding the flat tops.
  const rim = new THREE.DirectionalLight('#e6eeff', 0.8);
  rim.position.set(-5, 2, 6);
  scene.add(rim);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.32 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const M = materials();
  const rig = new THREE.Group();
  scene.add(rig);
  const BUILD = { listing: buildListing, practice: buildPractice };
  const update = BUILD[variant](rig, M);

  // Isometric orthographic camera.
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  const camBase = new THREE.Vector3(7, 6.2, 7);
  camera.position.copy(camBase);
  const FOCUS = {
    listing: new THREE.Vector3(0.45, 0.45, -0.1),
    practice: new THREE.Vector3(0.55, 0.7, 0),
  };
  const focus = FOCUS[variant];
  camera.lookAt(focus);
  const VIEW = { listing: 2.15, practice: 2.6 }[variant];   // half-height of the view in world units

  const resize = () => {
    const r = host.getBoundingClientRect();
    const w = Math.max(1, r.width);
    const h = Math.max(1, r.height);
    renderer.setSize(w, h, false);
    const aspect = w / h;
    camera.left = -VIEW * aspect;
    camera.right = VIEW * aspect;
    camera.top = VIEW;
    camera.bottom = -VIEW;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(() => {
    resize();
    if (opts.reduced) render(0);
  });
  ro.observe(host);
  resize();

  // Hover tilt: the rig yaws/pitches a few degrees toward the pointer.
  const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
  const target = opts.pointerTarget;
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || !target) return;
    const r = target.getBoundingClientRect();
    tilt.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    tilt.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
  };
  const onLeave = () => {
    tilt.tx = 0;
    tilt.ty = 0;
  };
  target?.addEventListener('pointermove', onMove);
  target?.addEventListener('pointerleave', onLeave);

  const STILL = { listing: 6.0, practice: 7.5 }[variant];   // a composed, fully-assembled moment
  let start = performance.now();
  let ready = false;
  const render = (now: number) => {
    const t = opts.reduced ? STILL : (now - start) / 1000;
    update(t);
    tilt.x += (tilt.tx - tilt.x) * 0.06;
    tilt.y += (tilt.ty - tilt.y) * 0.06;
    rig.rotation.y = tilt.x * 0.14 + (opts.reduced ? 0 : Math.sin(t * 0.35) * 0.04);
    rig.rotation.x = tilt.y * 0.05;
    renderer.render(scene, camera);
    if (!ready) {
      ready = true;
      opts.onReady();
    }
  };

  let raf = 0;
  let visible = false;
  let pausedAt = 0;
  const loop = (now: number) => {
    raf = 0;
    if (!visible || document.hidden) {
      pausedAt = now;
      return;
    }
    render(now);
    raf = requestAnimationFrame(loop);
  };
  const kick = () => {
    if (opts.reduced) return;
    if (visible && !document.hidden && !raf) {
      // Resume where it paused rather than jumping ahead.
      if (pausedAt) start += performance.now() - pausedAt;
      pausedAt = 0;
      raf = requestAnimationFrame(loop);
    }
  };
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (!visible && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
      pausedAt = performance.now();
    }
    kick();
  });
  io.observe(host);
  document.addEventListener('visibilitychange', kick);
  render(performance.now());   // first frame (and onReady) regardless of visibility

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    document.removeEventListener('visibilitychange', kick);
    target?.removeEventListener('pointermove', onMove);
    target?.removeEventListener('pointerleave', onLeave);
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else mat?.dispose();
    });
    envTex.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  };
}
