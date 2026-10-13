import * as THREE from 'three';
import { watchCovered } from './covered';

/**
 * Hero centrepiece — the Qbix cube in glass: a 2×2×2 assembly of clear glass
 * cubelets with white hairline edges around one solid lime core, the same
 * translucent-layer language as the service cards and the footer's reeded
 * glass.
 *
 * Built to be light: one small fresnel shader for every glass face (faces
 * turned to the viewer stay clear, silhouettes brighten), unlit lines for the
 * edges, an unlit core. No environment map, no shadows, no transmission pass,
 * no generated textures — so it compiles and draws in a few milliseconds.
 *
 * Motion is structural only. Between puzzle-style quarter twists, the cube
 * cycles through four studies (all driven by a few uniforms and positions):
 *  · lit     — one cubelet fills with lime and rides the next few twists;
 *  · explode — the cubelets part along the diagonals, each turning a quarter
 *              on its own axis, then click home;
 *  · wire    — the glass drains to bare edges that turn lime, then refills;
 *  · split   — the core splits into eight cubes that fly into the cubelets
 *              and merge back.
 * The cube leans toward the pointer and can be dragged (with inertia). It
 * stops drawing once the next homepage panel has covered it.
 */

const LIME = new THREE.Color('#B8FF00');
const WHITE = new THREE.Color('#ffffff');

const GLASS_VERT = `
varying vec3 vN;
varying vec3 vV;
varying vec3 vWN;
varying vec3 vWP;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWP = wp.xyz;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  vWN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * mv;
}`;

const GLASS_FRAG = `
varying vec3 vN;
varying vec3 vV;
varying vec3 vWN;
varying vec3 vWP;
uniform vec3 uTint;
uniform vec3 uCenter;
uniform float uFill;   // 0 clear glass → 1 lit lime glass
uniform float uFace;   // 1 glass faces → 0 bare edges (wire study)
void main() {
  float facing = abs(dot(normalize(vN), normalize(vV)));
  float fres = pow(1.0 - facing, 2.2);
  float top = max(normalize(vWN).y, 0.0);               // a soft overhead light
  // Light from the lime core, picked up by the glass nearest to it.
  float glow = 1.0 - smoothstep(0.2, 1.05, length(vWP - uCenter));
  float a = 0.025 + 0.4 * fres + 0.05 * top + 0.14 * glow;
  vec3 col = mix(vec3(0.86, 0.9, 0.95), vec3(1.0), fres);
  col = mix(col, uTint, glow * 0.55);
  // Lit cubelet: lime glass, denser toward its silhouette.
  col = mix(col, mix(uTint, vec3(1.0), fres * 0.35), uFill);
  a = mix(a, 0.42 + 0.4 * fres, uFill);
  gl_FragColor = vec4(col, a * uFace);
}`;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const inOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const outBack = (x: number, s = 1.6) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
/** 0 → 1 over [a, b] of a phase, eased. */
const seg = (k: number, a: number, b: number) => inOut(clamp01((k - a) / (b - a)));

type Axis = 'x' | 'y' | 'z';
const AXES: Record<Axis, THREE.Vector3> = {
  x: new THREE.Vector3(1, 0, 0),
  y: new THREE.Vector3(0, 1, 0),
  z: new THREE.Vector3(0, 0, 1),
};
type Study = 'lit' | 'explode' | 'wire' | 'split';
const STUDIES: Study[] = ['lit', 'explode', 'wire', 'split'];
const STUDY_S: Record<Study, number> = { lit: 0.7, explode: 2.2, wire: 2.6, split: 2.6 };

export function mountHeroCube(
  host: HTMLElement,
  opts: { reduced: boolean; onReady: () => void },
) {
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.className = 'hero-cube-canvas';
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  // --- materials -------------------------------------------------------------
  const glassBase = new THREE.ShaderMaterial({
    vertexShader: GLASS_VERT,
    fragmentShader: GLASS_FRAG,
    uniforms: {
      uTint: { value: LIME.clone() },
      uCenter: { value: new THREE.Vector3() },
      uFill: { value: 0 },
      uFace: { value: 1 },
    },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const edge = new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.7, toneMapped: false });
  const coreMat = new THREE.MeshBasicMaterial({ color: LIME, toneMapped: false });
  const coreEdge = new THREE.LineBasicMaterial({ color: '#efffc2', transparent: true, opacity: 0.9, toneMapped: false });

  // --- the cube --------------------------------------------------------------
  const SIZE = 0.94;   // sharp cubelets, a clear seam between them
  const box = new THREE.BoxGeometry(SIZE, SIZE, SIZE);
  const boxEdges = new THREE.EdgesGeometry(box);
  const coords = [
    [-1, 1, 1], [-1, 1, -1], [1, 1, -1], [1, 1, 1],
    [-1, -1, 1], [-1, -1, -1], [1, -1, -1], [1, -1, 1],
  ];
  const cube = new THREE.Group();
  const cubelets = coords.map(([x, y, z]) => {
    const g = new THREE.Group();
    const mat = glassBase.clone();   // own uniforms (fill) — same shader program
    const mesh = new THREE.Mesh(box, mat);
    mesh.renderOrder = 2;
    g.add(mesh);
    const lines = new THREE.LineSegments(boxEdges, edge);
    lines.renderOrder = 3;
    g.add(lines);
    const home = new THREE.Vector3(x * 0.5, y * 0.5, z * 0.5);
    g.position.copy(home);
    cube.add(g);
    return { g, mat, home, quat: new THREE.Quaternion(), spin: new THREE.Quaternion() };
  });

  // The one solid thing: a lime core held in the middle of the glass.
  const coreGeo = new THREE.BoxGeometry(0.46, 0.46, 0.46);
  const coreEdgeGeo = new THREE.EdgesGeometry(coreGeo);
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.renderOrder = 1;
  core.add(new THREE.LineSegments(coreEdgeGeo, coreEdge));
  cube.add(core);

  // Eight small cores for the split study — hidden until then.
  const shardGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  const shardEdgeGeo = new THREE.EdgesGeometry(shardGeo);
  const shards = coords.map(([x, y, z]) => {
    const m = new THREE.Mesh(shardGeo, coreMat);
    m.add(new THREE.LineSegments(shardEdgeGeo, coreEdge));
    m.renderOrder = 1;
    m.visible = false;
    cube.add(m);
    return { m, dir: new THREE.Vector3(x, y, z).multiplyScalar(0.5) };
  });

  const rig = new THREE.Group();
  rig.add(cube);
  scene.add(rig);

  // High three-quarter view — the top face always reads.
  const camera = new THREE.PerspectiveCamera(23, 1, 0.1, 100);
  camera.position.set(5.2, 5.4, 6.4);
  camera.lookAt(0, -0.05, 0);

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

  /* --- choreography: deterministic, never undoing the previous twist --- */
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

  const MOVE_S = 0.85;
  const REST_S = 1.1;
  type Phase =
    | { kind: 'rest'; t0: number; studied?: boolean }   // studied: a study just ran, twist next
    | { kind: 'move'; t0: number; axis: Axis; layer: number; dir: number; sel: typeof cubelets }
    | { kind: 'study'; t0: number; study: Study };
  let phase: Phase = { kind: 'rest', t0: 0 };
  let moves = 0;
  let studyIx = 0;
  // Lit study: which cubelet glows, and the move count at which it lets go.
  let lit: { c: (typeof cubelets)[number]; until: number } | null = null;
  const qTmp = new THREE.Quaternion();
  const vTmp = new THREE.Vector3();

  const step = (t: number, dt: number) => {
    if (phase.kind === 'rest' && t - phase.t0 > REST_S) {
      if (moves > 0 && moves % 3 === 0 && !phase.studied) {
        const study = STUDIES[studyIx++ % STUDIES.length];
        phase = { kind: 'study', t0: t, study };
        if (study === 'split') shards.forEach((s) => (s.m.visible = true));
        if (study === 'explode') {
          // Each cubelet gets its own quarter turn about a random axis.
          for (const c of cubelets) {
            const ax = (['x', 'y', 'z'] as Axis[])[Math.floor(rnd() * 3)];
            c.spin.setFromAxisAngle(AXES[ax], (Math.PI / 2) * (rnd() < 0.5 ? -1 : 1));
          }
        }
        if (study === 'lit') {
          lit = { c: cubelets[Math.floor(rnd() * cubelets.length)], until: moves + 4 };
        }
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
          c.home.set(
            Math.round(c.g.position.x * 2) / 2,
            Math.round(c.g.position.y * 2) / 2,
            Math.round(c.g.position.z * 2) / 2,
          );
          c.quat.copy(c.g.quaternion).normalize();
          c.g.position.copy(c.home);
        }
        phase = { kind: 'rest', t0: t };
        if (lit && moves >= lit.until) lit = null;
      }
    } else if (phase.kind === 'study') {
      const k = clamp01((t - phase.t0) / STUDY_S[phase.study]);
      const s = phase.study;

      if (s === 'explode') {
        // Part (0→0.4), hold, click home with a small snap.
        const open = k < 0.4 ? inOut(k / 0.4) : 1 - outBack(clamp01((k - 0.55) / 0.45), 2.0);
        const spread = 1 + 0.7 * Math.max(-0.05, open);
        const turn = clamp01(open);
        for (const c of cubelets) {
          c.g.position.copy(c.home).multiplyScalar(spread);
          qTmp.identity().slerp(c.spin, turn);
          c.g.quaternion.copy(qTmp).multiply(c.quat);
        }
        core.scale.setScalar(1 + 0.35 * turn);
      } else if (s === 'wire') {
        const w = seg(k, 0, 0.3) - seg(k, 0.7, 1);
        for (const c of cubelets) c.mat.uniforms.uFace.value = 1 - 0.92 * w;
        edge.color.copy(WHITE).lerp(LIME, w);
        edge.opacity = 0.7 + 0.3 * w;
        core.scale.setScalar(1 - 0.4 * w);
      } else if (s === 'split') {
        const out = seg(k, 0, 0.35) - seg(k, 0.65, 1);
        core.scale.setScalar(Math.max(0.0001, 1 - out));
        for (const sh of shards) {
          sh.m.position.copy(sh.dir).multiplyScalar(out);
          sh.m.scale.setScalar(Math.max(0.0001, out));
          sh.m.rotation.set(out * 1.6, out * 2.1, 0);
        }
      }

      if (k >= 1) {
        // Settle everything exactly back to rest.
        for (const c of cubelets) {
          c.g.position.copy(c.home);
          c.g.quaternion.copy(c.quat);
          c.mat.uniforms.uFace.value = 1;
        }
        edge.color.copy(WHITE);
        edge.opacity = 0.7;
        core.scale.setScalar(1);
        shards.forEach((sh) => (sh.m.visible = false));
        phase = { kind: 'rest', t0: t, studied: true };
      }
    }

    // Lit cubelet fill: rises when lit, drains when released.
    for (const c of cubelets) {
      const target = lit && lit.c === c ? 1 : 0;
      const u = c.mat.uniforms.uFill;
      u.value += (target - u.value) * Math.min(1, dt * (target > u.value ? 5 : 3));
    }
  };

  /* --- pointer: lean + drag with inertia --- */
  const lean = { x: 0, y: 0, tx: 0, ty: 0 };
  const spin = { yaw: 0.35, pitch: 0, vel: 0.2, dragging: false, lastX: 0, lastY: 0, lastT: 0 };
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
      const dtS = Math.max(1, now - spin.lastT) / 1000;
      spin.yaw += dx * 0.008;
      spin.pitch = Math.max(-0.6, Math.min(0.6, spin.pitch + dy * 0.004));
      spin.vel = (dx * 0.008) / dtS;
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
      step(clock, dt);
      if (!spin.dragging) {
        // Inertia decays back to the idle drift speed.
        spin.vel += (0.2 - spin.vel) * Math.min(1, dt * 1.6);
        spin.yaw += spin.vel * dt;
        spin.pitch += (0 - spin.pitch) * Math.min(1, dt * 1.2);
      }
      // The core turns slowly against the shell (faster while exploded).
      const boost = phase.kind === 'study' && phase.study !== 'lit' ? 2.2 : 1;
      core.rotation.x += 0.35 * dt * boost;
      core.rotation.y -= 0.5 * dt * boost;
    }
    lean.x += (lean.tx - lean.x) * 0.05;
    lean.y += (lean.ty - lean.y) * 0.05;
    rig.rotation.set(spin.pitch + lean.y * 0.16, spin.yaw + lean.x * 0.28, 0);
    rig.position.y = opts.reduced ? 0 : Math.sin(clock * 0.9) * 0.06;
    rig.updateMatrixWorld();
    core.getWorldPosition(vTmp);
    for (const c of cubelets) c.mat.uniforms.uCenter.value.copy(vTmp);
    renderer.render(scene, camera);
    if (!ready) {
      ready = true;
      opts.onReady();
    }
  };

  let raf = 0;
  let visible = false;
  let covered = false;
  const loop = (now: number) => {
    raf = 0;
    if (!visible || covered || document.hidden) return;
    render(now);
    raf = requestAnimationFrame(loop);
  };
  const kick = () => {
    if (opts.reduced) return;
    if (visible && !covered && !document.hidden && !raf) {
      prev = performance.now();
      raf = requestAnimationFrame(loop);
    }
  };
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    kick();
  });
  io.observe(host);
  // The hero is a sticky panel: once Services has slid over it, stop drawing.
  const unwatch = watchCovered(host, (c) => {
    covered = c;
    kick();
  });
  document.addEventListener('visibilitychange', kick);
  // Draw the first frame now, independent of visibility — the reveal waits on
  // onReady, so gating it behind the observer could deadlock behind a clip.
  render(performance.now());

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    unwatch();
    document.removeEventListener('visibilitychange', kick);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    host.removeEventListener('pointerdown', onDown);
    [box, boxEdges, coreGeo, coreEdgeGeo, shardGeo, shardEdgeGeo].forEach((g) => g.dispose());
    cubelets.forEach((c) => c.mat.dispose());
    [glassBase, edge, coreMat, coreEdge].forEach((m) => m.dispose());
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  };
}
