import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { studioEnvironment } from './studio';

/**
 * Hero centrepiece — the Qbix cube as a live object: a 2×2×2 assembly of eight
 * material studies (knurled silver, lime satin, frosted glass with a lime core,
 * ribbed lime, terrazzo, dark satin, mirror chrome, lime glass).
 *
 * Motion is structural only: a slow drift, a puzzle-style quarter twist of one
 * layer every couple of seconds, and every few moves a "breath" where the
 * cubelets part to show their inner faces and click back together. The cube
 * leans toward the pointer and can be dragged (with inertia).
 */

const LIME = new THREE.Color('#B8FF00');

/* ---------------------------------------------------------------- textures */

/** Tangent-space normal map from a height function h(u, v) ∈ [0, 1]. */
function normalMap(size: number, h: (u: number, v: number) => number, strength: number) {
  const data = new Uint8Array(size * size * 4);
  const H = (x: number, y: number) => h(((x % size) + size) % size / size, ((y % size) + size) % size / size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (H(x + 1, y) - H(x - 1, y)) * strength;
      const dy = (H(x, y + 1) - H(x, y - 1)) * strength;
      const len = Math.hypot(dx, dy, 1);
      const o = (y * size + x) * 4;
      data[o] = (-dx / len * 0.5 + 0.5) * 255;
      data[o + 1] = (-dy / len * 0.5 + 0.5) * 255;
      data[o + 2] = (1 / len * 0.5 + 0.5) * 255;
      data[o + 3] = 255;
    }
  }
  const t = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.magFilter = THREE.LinearFilter;
  t.anisotropy = 4;
  t.needsUpdate = true;
  return t;
}

/** Off-white terrazzo with lime and graphite chips. */
function terrazzo(size: number) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#e9eae4';
  ctx.fillRect(0, 0, size, size);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 900; i++) {
    const r = rnd();
    ctx.fillStyle = r < 0.42 ? '#b8ff00' : r < 0.7 ? '#9aa39a' : r < 0.85 ? '#5d6560' : '#d5e8a8';
    ctx.beginPath();
    const x = rnd() * size;
    const y = rnd() * size;
    const s = 0.6 + rnd() * rnd() * 3.4;
    ctx.ellipse(x, y, s, s * (0.5 + rnd() * 0.6), rnd() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Per-pixel hash — the grain of a bead-blasted surface. */
function grain(u: number, v: number) {
  const x = Math.sin(u * 12.9898 * 977 + v * 78.233 * 991) * 43758.5453;
  return x - Math.floor(x);
}

export function materials() {
  const knurl = normalMap(512, (u, v) => {
    const f = Math.PI * 2 * 16;
    const k = Math.abs(Math.sin(f * (u + v) / 2)) * Math.abs(Math.sin(f * (u - v) / 2));
    return Math.pow(k, 0.6) * 0.92 + grain(u, v) * 0.08;
  }, 3.6);
  const ribs = normalMap(512, (u, v) => {
    const s = Math.sin(Math.PI * 2 * 10 * u);
    return (Math.sign(s) * Math.pow(Math.abs(s), 0.3) * 0.5 + 0.5) * 0.94 + grain(u, v) * 0.06;
  }, 7);
  // Spun-metal finish: fine concentric lathe rings around the face centre.
  const spun = normalMap(512, (u, v) => {
    const r = Math.hypot(u - 0.5, v - 0.5);
    return (Math.sin(r * Math.PI * 2 * 90) * 0.5 + 0.5) * 0.85 + grain(u, v) * 0.15;
  }, 1.4);
  const blast = normalMap(256, grain, 0.9);

  const anodised = (extra: Partial<THREE.MeshPhysicalMaterialParameters> = {}) =>
    new THREE.MeshPhysicalMaterial({
      color: LIME, metalness: 0.32, roughness: 0.3, clearcoat: 0.35, clearcoatRoughness: 0.18,
      normalMap: blast, normalScale: new THREE.Vector2(0.22, 0.22),
      ...extra,
    });

  return {
    knurled: new THREE.MeshPhysicalMaterial({
      color: '#dfe2e6', metalness: 1, roughness: 0.24, normalMap: knurl, normalScale: new THREE.Vector2(0.75, 0.75),
    }),
    limeSatin: anodised(),
    limeRibs: anodised({ normalMap: ribs, normalScale: new THREE.Vector2(1.1, 1.1), roughness: 0.36 }),
    limeFine: anodised({ normalMap: spun, normalScale: new THREE.Vector2(0.7, 0.7), roughness: 0.24, color: '#c4f53a' }),
    frost: new THREE.MeshPhysicalMaterial({
      color: '#f6f9f1', metalness: 0, roughness: 0.22, transmission: 1, thickness: 0.7, ior: 1.42,
      attenuationColor: new THREE.Color('#eef8d6'), attenuationDistance: 3.5, clearcoat: 0.8, clearcoatRoughness: 0.08,
    }),
    limeGlass: new THREE.MeshPhysicalMaterial({
      color: '#d9ff7a', metalness: 0, roughness: 0.06, transmission: 1, thickness: 0.8, ior: 1.5,
      attenuationColor: LIME, attenuationDistance: 0.9, clearcoat: 1, clearcoatRoughness: 0.04,
    }),
    terrazzo: new THREE.MeshPhysicalMaterial({
      map: terrazzo(1024), roughness: 0.5, clearcoat: 0.75, clearcoatRoughness: 0.12,
      normalMap: blast, normalScale: new THREE.Vector2(0.12, 0.12),
    }),
    dark: new THREE.MeshPhysicalMaterial({
      color: '#121417', metalness: 0.4, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.06,
      normalMap: blast, normalScale: new THREE.Vector2(0.1, 0.1),
    }),
    chrome: new THREE.MeshPhysicalMaterial({ color: '#e6e8ea', metalness: 1, roughness: 0.06 }),
    core: new THREE.MeshBasicMaterial({ color: LIME, toneMapped: false }),
    // The mechanism inside — matte black, so every seam reads as a dark line.
    mech: new THREE.MeshStandardMaterial({ color: '#050506', roughness: 0.9, metalness: 0 }),
  };
}

/* ------------------------------------------------------------------ helpers */

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const inOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const outBack = (x: number, s = 1.6) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);

type Axis = 'x' | 'y' | 'z';
const AXES: Record<Axis, THREE.Vector3> = {
  x: new THREE.Vector3(1, 0, 0),
  y: new THREE.Vector3(0, 1, 0),
  z: new THREE.Vector3(0, 0, 1),
};

/* -------------------------------------------------------------------- mount */

export function mountHeroCube(
  host: HTMLElement,
  opts: { reduced: boolean; onReady: () => void },
) {
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;   // keeps the lime saturated
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.className = 'hero-cube-canvas';
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const envTex = studioEnvironment(renderer);
  scene.environment = envTex;
  scene.environmentIntensity = 1.0;

  scene.add(new THREE.HemisphereLight('#eef3f8', '#0a0b0d', 0.35));
  const key = new THREE.DirectionalLight('#ffffff', 1.5);
  key.position.set(3, 6, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -3; key.shadow.camera.right = 3;
  key.shadow.camera.top = 3; key.shadow.camera.bottom = -3;
  key.shadow.radius = 6;
  key.shadow.bias = -0.0004;
  scene.add(key);
  const rim = new THREE.DirectionalLight('#e8f0ff', 1.1);
  rim.position.set(-5, 2.5, -3);
  scene.add(rim);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.ShadowMaterial({ opacity: 0.42 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.55;
  ground.receiveShadow = true;
  scene.add(ground);

  const M = materials();

  // Eight cubelets. Order matches the PNG's composition from the front view.
  const SIZE = 0.962;   // tight tolerances — seams read as fine dark lines
  const geo = new RoundedBoxGeometry(SIZE, SIZE, SIZE, 6, 0.07);
  const looks: THREE.Material[] = [
    M.knurled,   // top front-left
    M.limeSatin, // top back-left
    M.frost,     // top back-right (carries the lime core)
    M.limeFine,  // top front-right
    M.limeRibs,  // bottom front-left
    M.dark,      // bottom back-left
    M.chrome,    // bottom back-right
    M.terrazzo,  // bottom front-right
  ];
  const coords = [
    [-1, 1, 1], [-1, 1, -1], [1, 1, -1], [1, 1, 1],
    [-1, -1, 1], [-1, -1, -1], [1, -1, -1], [1, -1, 1],
  ];
  const cube = new THREE.Group();
  const cubelets = coords.map(([x, y, z], i) => {
    const g = new THREE.Group();
    const mesh = new THREE.Mesh(geo, looks[i]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    g.add(mesh);
    if (looks[i] === M.frost || looks[i] === M.limeGlass) {
      const core = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.5, 0.5, 3, 0.05), M.core);
      g.add(core);
    }
    const home = new THREE.Vector3(x * 0.5, y * 0.5, z * 0.5);
    g.position.copy(home);
    cube.add(g);
    return { g, home, quat: new THREE.Quaternion() };
  });
  // Swap the hidden back-bottom chrome for lime glass so twists reveal it.
  (cubelets[6].g.children[0] as THREE.Mesh).material = M.limeGlass;
  const core6 = new THREE.Mesh(new RoundedBoxGeometry(0.36, 0.36, 0.36, 3, 0.04), M.dark);
  cubelets[6].g.add(core6);

  // The mechanism: a matte-black core that fills the seams with shadow and
  // shows, like a real puzzle cube's, mid-twist and when the cubelets part.
  const mech = new THREE.Mesh(new RoundedBoxGeometry(0.98, 0.98, 0.98, 3, 0.12), M.mech);
  cube.add(mech);

  const rig = new THREE.Group();
  rig.add(cube);
  scene.add(rig);

  // High three-quarter view — the top face always reads, so the cube never
  // flattens into a square as it turns.
  const camera = new THREE.PerspectiveCamera(23, 1, 0.1, 100);
  camera.position.set(5.2, 5.4, 6.4);
  camera.lookAt(0, -0.12, 0);

  const resize = () => {
    const r = host.getBoundingClientRect();
    const w = Math.max(1, r.width);
    const h = Math.max(1, r.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(() => {
    resize();
    if (opts.reduced) render(performance.now());
  });
  ro.observe(host);
  resize();

  /* --- moves: deterministic, never undoing the previous one --- */
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  let last: { axis: Axis; layer: number } | null = null;
  const nextMove = () => {
    let axis: Axis;
    let layer: number;
    do {
      axis = (['x', 'y', 'z'] as Axis[])[Math.floor(rnd() * 3)];
      layer = rnd() < 0.5 ? -1 : 1;
    } while (last && last.axis === axis && last.layer === layer);
    last = { axis, layer };
    return { axis, layer, dir: rnd() < 0.5 ? -1 : 1 };
  };

  const MOVE_S = 0.9;
  const REST_S = 1.35;
  const BREATH_S = 1.5;
  type Phase =
    | { kind: 'rest'; t0: number }
    | { kind: 'move'; t0: number; axis: Axis; layer: number; dir: number; sel: typeof cubelets }
    | { kind: 'breath'; t0: number };
  let phase: Phase = { kind: 'rest', t0: 0 };
  let moves = 0;
  const qTmp = new THREE.Quaternion();

  const step = (t: number) => {
    if (phase.kind === 'rest' && t - phase.t0 > REST_S) {
      if (moves > 0 && moves % 4 === 0) {
        phase = { kind: 'breath', t0: t };
        moves++;
      } else {
        const m = nextMove();
        const sel = cubelets.filter((c) => Math.round(c.home[m.axis] * 2) === m.layer);
        phase = { kind: 'move', t0: t, ...m, sel };
        moves++;
      }
    }

    if (phase.kind === 'move') {
      const k = clamp01((t - phase.t0) / MOVE_S);
      const angle = (Math.PI / 2) * phase.dir * inOut(k);
      qTmp.setFromAxisAngle(AXES[phase.axis], angle);
      for (const c of phase.sel) {
        c.g.position.copy(c.home).applyQuaternion(qTmp);
        c.g.quaternion.copy(qTmp).multiply(c.quat);
      }
      if (k >= 1) {
        // Bake the quarter turn into each cubelet's resting state.
        for (const c of phase.sel) {
          c.home.copy(c.g.position);
          c.home.set(Math.round(c.home.x * 2) / 2, Math.round(c.home.y * 2) / 2, Math.round(c.home.z * 2) / 2);
          c.quat.copy(c.g.quaternion).normalize();
          c.g.position.copy(c.home);
        }
        phase = { kind: 'rest', t0: t };
      }
    } else if (phase.kind === 'breath') {
      const k = clamp01((t - phase.t0) / BREATH_S);
      // Part (0→0.45), hold, then click home with a small snap.
      const open = k < 0.45 ? inOut(k / 0.45) : 1 - outBack(clamp01((k - 0.6) / 0.4), 2.2);
      const spread = 1 + 0.32 * Math.max(-0.08, open);
      for (const c of cubelets) {
        c.g.position.copy(c.home).multiplyScalar(spread);
        c.g.quaternion.copy(c.quat);
      }
      if (k >= 1) {
        for (const c of cubelets) c.g.position.copy(c.home);
        phase = { kind: 'rest', t0: t };
      }
    }
  };

  /* --- pointer: lean + drag with inertia --- */
  const lean = { x: 0, y: 0, tx: 0, ty: 0 };
  const spin = { yaw: 0, pitch: 0, vel: 0.22, dragging: false, lastX: 0, lastY: 0, lastT: 0 };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') {
      const r = host.getBoundingClientRect();
      lean.tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
      lean.ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2));
    }
    if (spin.dragging) {
      const now = performance.now();
      const dx = e.clientX - spin.lastX;
      const dy = e.clientY - spin.lastY;
      const dt = Math.max(1, now - spin.lastT) / 1000;
      spin.yaw += dx * 0.008;
      spin.pitch = Math.max(-0.6, Math.min(0.6, spin.pitch + dy * 0.004));
      spin.vel = (dx * 0.008) / dt;
      spin.lastX = e.clientX;
      spin.lastY = e.clientY;
      spin.lastT = now;
    }
  };
  const onDown = (e: PointerEvent) => {
    spin.dragging = true;
    spin.lastX = e.clientX;
    spin.lastY = e.clientY;
    spin.lastT = performance.now();
    host.setPointerCapture?.(e.pointerId);
  };
  const onUp = () => {
    spin.dragging = false;
  };
  window.addEventListener('pointermove', onMove, { passive: true });
  host.addEventListener('pointerdown', onDown);
  window.addEventListener('pointerup', onUp);

  /* --- render loop --- */
  let ready = false;
  let prev = performance.now();
  let clock = 0;
  const render = (now: number) => {
    const dt = Math.min(0.05, (now - prev) / 1000);
    prev = now;
    if (!opts.reduced) {
      clock += dt;
      step(clock);
      if (!spin.dragging) {
        // Inertia decays back to the idle drift speed.
        spin.vel += (0.22 - spin.vel) * Math.min(1, dt * 1.6);
        spin.yaw += spin.vel * dt;
        spin.pitch += (0 - spin.pitch) * Math.min(1, dt * 1.2);
      }
    }
    lean.x += (lean.tx - lean.x) * 0.05;
    lean.y += (lean.ty - lean.y) * 0.05;
    rig.rotation.set(spin.pitch + lean.y * 0.16, spin.yaw + lean.x * 0.28, 0);
    rig.position.y = opts.reduced ? 0 : Math.sin(clock * 0.9) * 0.06;
    renderer.render(scene, camera);
    if (!ready) {
      ready = true;
      opts.onReady();
    }
  };

  let raf = 0;
  let visible = false;
  const loop = (now: number) => {
    raf = 0;
    if (!visible || document.hidden) return;
    render(now);
    raf = requestAnimationFrame(loop);
  };
  const kick = () => {
    if (opts.reduced) return;
    if (visible && !document.hidden && !raf) {
      prev = performance.now();
      raf = requestAnimationFrame(loop);
    }
  };
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    kick();
  });
  io.observe(host);
  document.addEventListener('visibilitychange', kick);
  // Draw the first frame now, independent of visibility — the reveal waits on
  // onReady, so gating it behind the observer could deadlock behind a clip.
  render(performance.now());

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    document.removeEventListener('visibilitychange', kick);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    host.removeEventListener('pointerdown', onDown);
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
    });
    Object.values(M).forEach((mat) => {
      const withMaps = mat as THREE.MeshPhysicalMaterial;
      withMaps.map?.dispose();
      withMaps.normalMap?.dispose();
      mat.dispose();
    });
    envTex.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  };
}
