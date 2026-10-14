import * as THREE from 'three';
import { momentum } from '@/lib/momentum';
import { watchCovered } from './covered';

/**
 * Hero centrepiece — the Qbix cube as eight material studies around one lime
 * core: clear glass, solid lime, frosted glass, ceramic, satin black, bare
 * wireframe, halftone and lime glass. All eight are one small shader switched
 * by a `uKind` uniform (flat light from above, fresnel on the glass, a hash
 * grain for frost, a dot grid for halftone): no environment map, no shadows,
 * no textures, so it compiles and draws in a few milliseconds.
 *
 * Choreography (structural motion only):
 *  · intro    — the cube starts parted; the cubelets dock one by one, each
 *               naming its material in the label under the cube;
 *  · twists   — puzzle-style quarter turns of one layer;
 *  · studies  — between twists, in turn: a showcase (each cubelet steps out,
 *               turns, names itself, steps back), an explode with
 *               per-cubelet quarter turns, and a core that splits into eight
 *               cubes and merges back.
 * The cube leans toward the pointer and can be dragged (with inertia). It
 * stops drawing once the next homepage panel has covered it.
 */

// sRGB values: the shader writes them straight out, so #B8FF00 lands exact.
const LIME_SRGB = new THREE.Vector3(184 / 255, 1, 0);
const LIME = new THREE.Color('#B8FF00');

const VERT = `
varying vec3 vN;
varying vec3 vV;
varying vec3 vWN;
varying vec3 vWP;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWP = wp.xyz;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  vWN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * mv;
}`;

const FRAG = `
varying vec3 vN;
varying vec3 vV;
varying vec3 vWN;
varying vec3 vWP;
varying vec2 vUv;
uniform float uKind;
uniform vec3 uTint;
uniform vec3 uCenter;
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  float facing = abs(dot(normalize(vN), normalize(vV)));
  float fres = pow(1.0 - facing, 2.2);
  vec3 wn = normalize(vWN);
  float lam = max(dot(wn, normalize(vec3(0.35, 0.9, 0.45))), 0.0);   // light from above
  float top = max(wn.y, 0.0);
  float glow = 1.0 - smoothstep(0.2, 1.05, length(vWP - uCenter));  // the lime core's light
  vec4 c;
  if (uKind < 0.5) {            // clear glass
    vec3 col = mix(vec3(0.86, 0.9, 0.95), vec3(1.0), fres);
    c = vec4(mix(col, uTint, glow * 0.55), 0.025 + 0.4 * fres + 0.05 * top + 0.14 * glow);
  } else if (uKind < 1.5) {     // solid lime
    c = vec4(uTint * (0.74 + 0.26 * lam) + vec3(0.05) * fres, 1.0);
  } else if (uKind < 2.5) {     // frosted glass: milky, sandblasted grain
    float g = (hash(floor(gl_FragCoord.xy)) - 0.5) * 0.09;
    vec3 col = vec3(0.9, 0.93, 0.95) * (0.72 + 0.28 * lam) + g + uTint * glow * 0.18;
    c = vec4(col, 0.6 + 0.3 * fres);
  } else if (uKind < 3.5) {     // ceramic
    c = vec4(vec3(0.93, 0.935, 0.92) * (0.58 + 0.42 * lam), 1.0);
  } else if (uKind < 4.5) {     // satin black
    vec3 col = vec3(0.07, 0.075, 0.085) * (0.7 + 0.7 * lam) + vec3(0.6) * pow(fres, 3.0) * 0.55;
    c = vec4(col, 1.0);
  } else if (uKind < 5.5) {     // wireframe: faces all but gone
    c = vec4(vec3(1.0), 0.015);
  } else if (uKind < 6.5) {     // halftone: lime dots on black
    vec2 g = fract(vUv * 8.0) - 0.5;
    float d = step(length(g), 0.27);
    vec3 base = vec3(0.06, 0.065, 0.07) * (0.8 + 0.5 * lam);
    c = vec4(mix(base, uTint, d), 1.0);
  } else {                      // lime glass
    c = vec4(mix(uTint, vec3(1.0), fres * 0.35), 0.3 + 0.45 * fres);
  }
  gl_FragColor = c;
}`;

/** The eight studies, in the order they dock in the intro. */
const KINDS = [
  { name: 'Frosted glass', kind: 2, glass: true, edge: '#ffffff', edgeA: 0.85 },
  { name: 'Halftone', kind: 6, glass: false, edge: '#4a5058', edgeA: 0.9 },
  { name: 'Clear glass', kind: 0, glass: true, edge: '#ffffff', edgeA: 0.7 },
  { name: 'Solid lime', kind: 1, glass: false, edge: '#0f1a00', edgeA: 0.55 },
  { name: 'Satin black', kind: 4, glass: false, edge: '#4a5058', edgeA: 0.9 },
  { name: 'Wireframe', kind: 5, glass: true, edge: '#B8FF00', edgeA: 1 },
  { name: 'Lime glass', kind: 7, glass: true, edge: '#B8FF00', edgeA: 0.9 },
  { name: 'Ceramic', kind: 3, glass: false, edge: '#a3a8ad', edgeA: 0.7 },
];

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
type Study = 'showcase' | 'explode' | 'split';
const STUDIES: Study[] = ['showcase', 'explode', 'split'];
const SHOW_EACH = 0.55;   // seconds per cubelet in the showcase
const STUDY_S: Record<Study, number> = { showcase: SHOW_EACH * 8 + 0.3, explode: 2.2, split: 2.6 };
const DOCK_GAP = 0.34;    // intro: seconds between cubelets docking
const DOCK_S = 0.7;

export function mountHeroCube(
  host: HTMLElement,
  opts: { reduced: boolean; onReady: () => void; onLabel?: (text: string | null) => void },
) {
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.className = 'hero-cube-canvas';
  // Reading shader logs back stalls the main thread on the first draw.
  renderer.debug.checkShaderErrors = false;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const label = (t: string | null) => opts.onLabel?.(t);

  // --- the cube --------------------------------------------------------------
  const SIZE = 0.94;   // sharp cubelets, a clear seam between them
  const box = new THREE.BoxGeometry(SIZE, SIZE, SIZE);
  const boxEdges = new THREE.EdgesGeometry(box);
  const coords = [
    [-1, 1, 1], [-1, 1, -1], [1, 1, -1], [1, 1, 1],
    [-1, -1, 1], [-1, -1, -1], [1, -1, -1], [1, -1, 1],
  ];
  const center = new THREE.Vector3();
  const cube = new THREE.Group();
  const cubelets = coords.map(([x, y, z], i) => {
    const look = KINDS[i];
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uKind: { value: look.kind },
        uTint: { value: LIME_SRGB },
        uCenter: { value: center },
      },
      transparent: look.glass,
      depthWrite: !look.glass,
      side: look.glass ? THREE.DoubleSide : THREE.FrontSide,
    });
    const edgeMat = new THREE.LineBasicMaterial({ color: look.edge, transparent: true, opacity: look.edgeA, toneMapped: false });
    const g = new THREE.Group();
    const mesh = new THREE.Mesh(box, mat);
    mesh.renderOrder = look.glass ? 2 : 0;
    g.add(mesh);
    const lines = new THREE.LineSegments(boxEdges, edgeMat);
    lines.renderOrder = 3;
    g.add(lines);
    const home = new THREE.Vector3(x * 0.5, y * 0.5, z * 0.5);
    g.position.copy(home);
    cube.add(g);
    return { g, mat, edgeMat, name: look.name, home, quat: new THREE.Quaternion(), spin: new THREE.Quaternion() };
  });

  // The lime core held in the middle (seen through the glass and wire).
  const coreMat = new THREE.MeshBasicMaterial({ color: LIME, toneMapped: false });
  const coreEdge = new THREE.LineBasicMaterial({ color: '#efffc2', transparent: true, opacity: 0.9, toneMapped: false });
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
    if (opts.reduced && compiled) render(performance.now());
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
    | { kind: 'intro'; t0: number }
    | { kind: 'rest'; t0: number; studied?: boolean }   // studied: a study just ran, twist next
    | { kind: 'move'; t0: number; axis: Axis; layer: number; dir: number; sel: typeof cubelets }
    | { kind: 'study'; t0: number; study: Study };
  let phase: Phase = opts.reduced ? { kind: 'rest', t0: 0 } : { kind: 'intro', t0: 0 };
  let moves = 0;
  let studyIx = 0;
  let shown = -1;   // which cubelet's name is in the label
  const qTmp = new THREE.Quaternion();
  const vTmp = new THREE.Vector3();

  // Intro start pose: parted wide, each cubelet turned.
  const introSpin = cubelets.map(() => {
    const ax = (['x', 'y', 'z'] as Axis[])[Math.floor(rnd() * 3)];
    return new THREE.Quaternion().setFromAxisAngle(AXES[ax], (Math.PI / 2) * (rnd() < 0.5 ? -1 : 1));
  });

  const step = (t: number) => {
    if (phase.kind === 'intro') {
      const p = phase;
      cubelets.forEach((c, i) => {
        const k = clamp01((t - p.t0 - 0.2 - i * DOCK_GAP) / DOCK_S);
        const e = outBack(k, 1.4);
        c.g.position.copy(c.home).multiplyScalar(lerpN(3.1, 1, e));
        qTmp.copy(introSpin[i]).slerp(c.quat, clamp01(e));
        c.g.quaternion.copy(qTmp);
        c.g.visible = k > 0;
        if (k > 0 && i > shown) {
          shown = i;
          label(c.name);
        }
      });
      if (t - p.t0 > 0.2 + 7 * DOCK_GAP + DOCK_S + 0.5) {
        cubelets.forEach((c) => {
          c.g.position.copy(c.home);
          c.g.quaternion.copy(c.quat);
        });
        label(null);
        shown = -1;
        phase = { kind: 'rest', t0: t };
      }
      return;
    }

    if (phase.kind === 'rest' && t - phase.t0 > REST_S) {
      if (moves > 0 && moves % 4 === 0 && !phase.studied) {
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
      }
    } else if (phase.kind === 'study') {
      const elapsed = t - phase.t0;
      const k = clamp01(elapsed / STUDY_S[phase.study]);
      const s = phase.study;

      if (s === 'showcase') {
        // One at a time: step out along its own diagonal, turn, step back.
        cubelets.forEach((c, i) => {
          const local = clamp01((elapsed - 0.15 - i * SHOW_EACH) / SHOW_EACH);
          const out = Math.sin(Math.PI * local);
          c.g.position.copy(c.home).multiplyScalar(1 + 0.62 * out);
          qTmp.setFromAxisAngle(AXES.y, (Math.PI / 2) * inOut(local));
          c.g.quaternion.copy(qTmp).multiply(c.quat);
          if (local > 0 && local < 1 && i !== shown) {
            shown = i;
            label(c.name);
          }
        });
      } else if (s === 'explode') {
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
        // Settle everything exactly back to rest. The showcase turns are full
        // quarter turns about y, so bake them like a twist.
        for (const c of cubelets) {
          if (s === 'showcase') {
            qTmp.setFromAxisAngle(AXES.y, Math.PI / 2);
            c.quat.premultiply(qTmp).normalize();
          }
          c.g.position.copy(c.home);
          c.g.quaternion.copy(c.quat);
        }
        core.scale.setScalar(1);
        shards.forEach((sh) => (sh.m.visible = false));
        label(null);
        shown = -1;
        phase = { kind: 'rest', t0: t, studied: true };
      }
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
  let compiled = false;
  let disposed = false;
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
        spin.vel += (0.2 - spin.vel) * Math.min(1, dt * 1.6);
        // Scrolling winds the cube on with the page.
        spin.yaw += (spin.vel + momentum.vel * 2.4) * dt;
        spin.pitch += (0 - spin.pitch) * Math.min(1, dt * 1.2);
      }
      // The core turns slowly against the shell (faster while exploded).
      const boost = phase.kind === 'study' ? 2.2 : 1;
      core.rotation.x += 0.35 * dt * boost;
      core.rotation.y -= 0.5 * dt * boost;
    }
    lean.x += (lean.tx - lean.x) * 0.05;
    lean.y += (lean.ty - lean.y) * 0.05;
    rig.rotation.set(spin.pitch + lean.y * 0.16, spin.yaw + lean.x * 0.28, 0);
    rig.position.y = opts.reduced ? 0 : Math.sin(clock * 0.9) * 0.06;
    rig.updateMatrixWorld();
    core.getWorldPosition(vTmp);
    center.copy(vTmp);
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
    if (opts.reduced || !compiled) return;
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
  // Shaders link off the main thread (KHR_parallel_shader_compile). Then draw
  // the first frame independent of visibility — the reveal waits on onReady,
  // so gating it behind the observer could deadlock behind a clip.
  renderer.compileAsync(scene, camera).then(() => {
    if (disposed) return;
    compiled = true;
    prev = performance.now();
    render(prev);
    kick();
  });

  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    unwatch();
    document.removeEventListener('visibilitychange', kick);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    host.removeEventListener('pointerdown', onDown);
    [box, boxEdges, coreGeo, coreEdgeGeo, shardGeo, shardEdgeGeo].forEach((g) => g.dispose());
    cubelets.forEach((c) => {
      c.mat.dispose();
      c.edgeMat.dispose();
    });
    [coreMat, coreEdge].forEach((m) => m.dispose());
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  };
}

function lerpN(a: number, b: number, k: number) {
  return a + (b - a) * k;
}
