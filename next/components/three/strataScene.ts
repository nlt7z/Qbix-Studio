import * as THREE from 'three';
import { studioEnvironment } from './studio';
import { createStage, siteFonts, canvasTexture, clamp01, seg, lerp, inOut, outQuint, outBack, smooth, type SiteFonts } from './stage';

/**
 * Strata — one image in, a working system out, as an object: a moodboard
 * plate that is scanned and then separates into its strata — color, type,
 * spacing, components, code — which press back into one system.
 *
 *  · hero — on load the plate drops, a lime scan reads it, and the layers
 *    slide out beneath it into an exploded stack that slowly breathes.
 *  · tour — scroll walks the three verbs: read (scan), draft (the layers
 *    separate), ship (the stack presses shut and the code slides out).
 */

export type StrataMode = 'hero' | 'tour';
export type StrataOptions = {
  mode: StrataMode;
  reduced: boolean;
  getProgress?: () => number;
  intro?: boolean;
  onAnchors?: (pts: { x: number; y: number }[], shown: number) => void;
  onReady: () => void;
};

export const STRATA_LAYERS = ['Image', 'Color', 'Type', 'Spacing', 'Components', 'Code'];

const LIME = '#B8FF00';
const W = 2.6;
const D = 1.8;
const BUILD_END = 2.8;

/* ------------------------------------------------------------------ art */

function moodboard(ctx: CanvasRenderingContext2D, w: number, h: number, F: SiteFonts) {
  ctx.fillStyle = '#0d0f11';
  ctx.fillRect(0, 0, w, h);
  const g = w * 0.012;
  const cw = (w - g * 4) / 3;
  const ch = (h - g * 3) / 2;
  const tile = (c: number, r: number, paint: (x: number, y: number) => void) => {
    const x = g + c * (cw + g);
    const y = g + r * (ch + g);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, cw, ch);
    ctx.clip();
    paint(x, y);
    ctx.restore();
  };
  tile(0, 0, (x, y) => {   // a lime orb on ink
    ctx.fillStyle = '#15181c';
    ctx.fillRect(x, y, cw, ch);
    const o = ctx.createRadialGradient(x + cw * 0.55, y + ch * 0.5, 2, x + cw * 0.55, y + ch * 0.5, ch * 0.48);
    o.addColorStop(0, LIME);
    o.addColorStop(0.55, 'rgba(184, 255, 0, 0.55)');
    o.addColorStop(1, 'rgba(184, 255, 0, 0)');
    ctx.fillStyle = o;
    ctx.fillRect(x, y, cw, ch);
  });
  tile(1, 0, (x, y) => {   // brushed chrome
    const l = ctx.createLinearGradient(x, y, x + cw, y + ch);
    l.addColorStop(0, '#f3f5f7');
    l.addColorStop(0.45, '#8d98a2');
    l.addColorStop(0.62, '#eef1f3');
    l.addColorStop(1, '#a9b3bb');
    ctx.fillStyle = l;
    ctx.fillRect(x, y, cw, ch);
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    for (let i = 0; i < 40; i++) ctx.fillRect(x, y + (i / 40) * ch, cw, 1);
  });
  tile(2, 0, (x, y) => {   // sky
    const l = ctx.createLinearGradient(x, y, x, y + ch);
    l.addColorStop(0, '#b6cddd');
    l.addColorStop(1, '#eef4f8');
    ctx.fillStyle = l;
    ctx.fillRect(x, y, cw, ch);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + cw * 0.12, y + ch * 0.62, cw * 0.76, ch * 0.02);
  });
  tile(0, 1, (x, y) => {   // concrete
    ctx.fillStyle = '#9aa3aa';
    ctx.fillRect(x, y, cw, ch);
    let s = 3;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = rnd() < 0.5 ? 'rgba(255,255,255,0.18)' : 'rgba(20,24,28,0.18)';
      ctx.fillRect(x + rnd() * cw, y + rnd() * ch, 2, 2);
    }
  });
  tile(1, 1, (x, y) => {   // white ceramic object
    ctx.fillStyle = '#e9edf0';
    ctx.fillRect(x, y, cw, ch);
    const l = ctx.createLinearGradient(x, y, x + cw, y);
    l.addColorStop(0, '#ffffff');
    l.addColorStop(1, '#cdd4da');
    ctx.fillStyle = l;
    ctx.fillRect(x + cw * 0.28, y + ch * 0.2, cw * 0.44, ch * 0.6);
    ctx.fillStyle = 'rgba(18,20,23,0.18)';
    ctx.fillRect(x + cw * 0.3, y + ch * 0.8, cw * 0.46, ch * 0.05);
  });
  tile(2, 1, (x, y) => {   // ink with a lime rule and a word
    ctx.fillStyle = '#121417';
    ctx.fillRect(x, y, cw, ch);
    ctx.fillStyle = LIME;
    ctx.fillRect(x + cw * 0.1, y + ch * 0.2, cw * 0.3, ch * 0.03);
    ctx.fillStyle = '#f4f6f7';
    ctx.font = `400 ${ch * 0.24}px ${F.head}`;
    ctx.fillText('Calm', x + cw * 0.1, y + ch * 0.7);
  });
}

function typeSheet(ctx: CanvasRenderingContext2D, w: number, h: number, F: SiteFonts) {
  ctx.fillStyle = '#eef2f3';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#121417';
  ctx.font = `400 ${h * 0.62}px ${F.head}`;
  ctx.fillText('Aa', w * 0.06, h * 0.7);
  const rows: [string, number][] = [['Display 72', 0.13], ['Heading 40', 0.09], ['Body 17', 0.06], ['Caption 12', 0.045]];
  let y = h * 0.2;
  for (const [label, s] of rows) {
    ctx.font = `400 ${h * s}px ${F.body}`;
    ctx.fillText('Calm system', w * 0.52, y + h * s);
    ctx.font = `500 ${h * 0.035}px ${F.mono}`;
    ctx.fillStyle = '#6b7178';
    ctx.fillText(label.toUpperCase(), w * 0.52, y + h * s + h * 0.055);
    ctx.fillStyle = '#121417';
    y += h * s + h * 0.1;
  }
}

function componentsSheet(ctx: CanvasRenderingContext2D, w: number, h: number, F: SiteFonts) {
  const u = w / 100;
  ctx.fillStyle = '#f7f8f9';
  ctx.fillRect(0, 0, w, h);
  // primary + secondary button
  ctx.fillStyle = LIME;
  ctx.fillRect(u * 6, u * 6, u * 26, u * 8);
  ctx.fillStyle = '#0F1A00';
  ctx.font = `500 ${u * 2.8}px ${F.body}`;
  ctx.fillText('Get started ↗', u * 9, u * 11);
  ctx.strokeStyle = '#121417';
  ctx.lineWidth = u * 0.3;
  ctx.strokeRect(u * 35, u * 6, u * 22, u * 8);
  ctx.fillStyle = '#121417';
  ctx.fillText('Learn more', u * 38.5, u * 11);
  // input
  ctx.font = `500 ${u * 1.9}px ${F.mono}`;
  ctx.fillStyle = '#6b7178';
  ctx.fillText('EMAIL', u * 6, u * 21);
  ctx.fillStyle = '#e8ecef';
  ctx.fillRect(u * 6, u * 23, u * 51, u * 8);
  ctx.fillStyle = '#9aa1a8';
  ctx.font = `400 ${u * 2.6}px ${F.body}`;
  ctx.fillText('you@studio.com', u * 8, u * 28);
  // toggle
  ctx.fillStyle = '#121417';
  ctx.fillRect(u * 6, u * 36, u * 10, u * 5);
  ctx.fillStyle = LIME;
  ctx.fillRect(u * 11.5, u * 36.8, u * 3.8, u * 3.4);
  // card
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(u * 63, u * 6, u * 31, u * 56);
  ctx.strokeStyle = '#d7dce0';
  ctx.strokeRect(u * 63, u * 6, u * 31, u * 56);
  const gr = ctx.createLinearGradient(0, u * 6, 0, u * 30);
  gr.addColorStop(0, '#b6cddd');
  gr.addColorStop(1, '#e9eff3');
  ctx.fillStyle = gr;
  ctx.fillRect(u * 63, u * 6, u * 31, u * 24);
  ctx.fillStyle = '#121417';
  ctx.font = `500 ${u * 2.8}px ${F.body}`;
  ctx.fillText('Card title', u * 66, u * 37);
  ctx.fillStyle = '#c9cfd4';
  for (let i = 0; i < 3; i++) ctx.fillRect(u * 66, u * (41 + i * 4), u * (24 - i * 5), u * 1.4);
}

function codeSheet(ctx: CanvasRenderingContext2D, w: number, h: number, F: SiteFonts) {
  ctx.fillStyle = '#101215';
  ctx.fillRect(0, 0, w, h);
  const lines: [string, string][] = [
    [':root {', ''],
    ['  --signal:', ' #B8FF00;'],
    ['  --ink:', ' #121417;'],
    ['  --paper:', ' #F4F6F7;'],
    ['  --space-2:', ' 8px;'],
    ['  --font-display:', ' Eurostile;'],
    ['  --radius:', ' 0;'],
    ['}', ''],
  ];
  ctx.font = `500 ${h * 0.07}px ${F.mono}`;
  lines.forEach(([k, v], i) => {
    const y = h * (0.16 + i * 0.1);
    ctx.fillStyle = '#5c636b';
    ctx.fillText(String(i + 1).padStart(2, ' '), w * 0.04, y);
    ctx.fillStyle = '#e6e9ec';
    ctx.fillText(k, w * 0.12, y);
    ctx.fillStyle = LIME;
    ctx.fillText(v, w * 0.12 + ctx.measureText(k).width, y);
  });
}

/* ---------------------------------------------------------------- mount */

export async function mountStrataScene(host: HTMLElement, opts: StrataOptions) {
  const F = await siteFonts();
  const stage = createStage(host, { reduced: opts.reduced, onReady: opts.onReady });
  const { renderer, scene, coarse } = stage;
  const tour = opts.mode === 'tour';
  renderer.toneMappingExposure = 1.05;
  const envTex = studioEnvironment(renderer);
  scene.environment = envTex;
  stage.onDispose(() => envTex.dispose());

  scene.add(new THREE.HemisphereLight('#f2f5f8', '#121417', 0.9));
  const key = new THREE.DirectionalLight('#ffffff', 2.2);
  key.position.set(4, 9, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048);
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 5, bottom: -4, near: 1, far: 25 });
  key.shadow.radius = 5;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  scene.add(key);
  const rim = new THREE.DirectionalLight('#e2ecff', 1.0);
  rim.position.set(-5, 3, -4);
  scene.add(rim);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.4 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.3;
  ground.receiveShadow = true;
  scene.add(ground);

  const M = {
    plinth: new THREE.MeshPhysicalMaterial({ color: '#121417', metalness: 0.4, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.06 }),
    ink: new THREE.MeshPhysicalMaterial({ color: '#16181b', roughness: 0.35, metalness: 0.3, clearcoat: 0.9, clearcoatRoughness: 0.08 }),
    ceramic: new THREE.MeshPhysicalMaterial({ color: '#f4f6f7', roughness: 0.32, clearcoat: 0.7, clearcoatRoughness: 0.15 }),
    frost: new THREE.MeshPhysicalMaterial({
      color: '#e8f0ef', roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05, transparent: true, opacity: 0.85,
      sheen: 1, sheenColor: new THREE.Color('#ffffff'), sheenRoughness: 0.4,
    }),
    lime: new THREE.MeshBasicMaterial({ color: LIME, toneMapped: false }),
    limeSatin: new THREE.MeshPhysicalMaterial({ color: LIME, metalness: 0.3, roughness: 0.32, clearcoat: 0.4 }),
    edge: new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.18 }),
  };
  const face = (draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, emissive = 0.18) => {
    const tex = canvasTexture(1024, Math.round((1024 * D) / W), draw);
    return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: emissive });
  };
  const plate = (t: number, side: THREE.Material, top: THREE.Material) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(W, t, D), [side, side, top, side, side, side]);
    m.castShadow = true;
    m.receiveShadow = true;
    m.add(new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), M.edge));
    return m;
  };

  /* -------------------------------------------------------------- pedestal */
  const rig = new THREE.Group();
  scene.add(rig);
  const plinthG = new THREE.Group();
  plinthG.position.y = -0.3;
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.3, 2.5), M.plinth);
  plinth.position.y = 0.15;
  plinth.receiveShadow = true;
  plinthG.add(plinth);
  for (const [w, d, x, z] of [[3.4, 0.012, 0, 1.25], [0.012, 2.5, 1.7, 0]] as const) {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(w + 0.012, 0.012, d + 0.012), M.lime);
    strip.position.set(x, 0.3, z);
    plinthG.add(strip);
  }
  rig.add(plinthG);

  /* ---------------------------------------------------------------- strata */
  // Top to bottom: image, color, type, spacing, components, code.
  const layers: { g: THREE.Group; t: number }[] = [];
  const addLayer = (g: THREE.Group, t: number) => {
    rig.add(g);
    layers.push({ g, t });
  };

  const imageG = new THREE.Group();
  imageG.add(plate(0.06, M.ink, face((c, w, h) => moodboard(c, w, h, F), 0.25)));
  addLayer(imageG, 0.06);

  const colorG = new THREE.Group();
  colorG.add(plate(0.03, M.frost, M.frost));
  const SW = ['#B8FF00', '#eef1f3', '#a9b3bb', '#6f8796', '#2b3138', '#121417'];
  SW.forEach((c, i) => {
    const h = 0.12 + ((i * 37) % 5) * 0.05;
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, h, 0.32),
      i === 0 ? M.limeSatin : new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.3, clearcoat: 0.8, metalness: i === 2 ? 0.6 : 0.1 }),
    );
    m.position.set(-0.95 + i * 0.38, 0.015 + h / 2, 0);
    m.castShadow = true;
    colorG.add(m);
  });
  addLayer(colorG, 0.32);

  const typeG = new THREE.Group();
  typeG.add(plate(0.04, M.frost, face((c, w, h) => typeSheet(c, w, h, F), 0.15)));
  addLayer(typeG, 0.04);

  const spaceG = new THREE.Group();
  spaceG.add(plate(0.05, M.ink, M.ink));
  [4, 8, 12, 16, 24, 32, 48].forEach((s, i) => {
    const len = 0.1 + s * 0.028;
    const m = new THREE.Mesh(new THREE.BoxGeometry(len, 0.04, 0.09), M.limeSatin);
    m.position.set(-1.1 + len / 2, 0.045, -0.6 + i * 0.2);
    m.castShadow = true;
    spaceG.add(m);
  });
  addLayer(spaceG, 0.09);

  const compG = new THREE.Group();
  compG.add(plate(0.05, M.ceramic, face((c, w, h) => componentsSheet(c, w, h, F), 0.15)));
  addLayer(compG, 0.05);

  const codeG = new THREE.Group();
  codeG.add(plate(0.07, M.ink, face((c, w, h) => codeSheet(c, w, h, F), 0.2)));
  addLayer(codeG, 0.07);

  // Lime scan line that reads the image.
  const scan = new THREE.Mesh(new THREE.BoxGeometry(W + 0.12, 0.02, 0.02), M.lime);
  rig.add(scan);
  const scanGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(W + 0.12, 0.5),
    new THREE.MeshBasicMaterial({ color: LIME, transparent: true, opacity: 0.16, toneMapped: false, depthWrite: false }),
  );
  scanGlow.rotation.x = -Math.PI / 2;
  rig.add(scanGlow);

  /* ---------------------------------------------------------------- camera */
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  let aspect = 1;
  const wideMq = window.matchMedia('(min-width: 960px)');
  let centerX = 0.5;
  stage.onResize((w, h) => {
    aspect = w / h;
    centerX = tour && wideMq.matches ? 0.7 : 0.5;
    camera.aspect = aspect;
    if (centerX !== 0.5) camera.setViewOffset(w, h, -(centerX - 0.5) * w, 0, w, h);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  });
  const fit = (r: number) => {
    const v = THREE.MathUtils.degToRad(camera.fov) / 2;
    const h = Math.atan(Math.tan(v) * aspect * Math.min(1, 2 * (1 - centerX)));
    return r / Math.sin(Math.min(v, h));
  };
  const DIR = new THREE.Vector3(5.6, 3.8, 7.6).normalize();
  const DIR_TOP = new THREE.Vector3(1.6, 7.5, 3.4).normalize();

  /* --------------------------------------------------------------- pointer */
  const lean = { x: 0, y: 0, tx: 0, ty: 0 };
  const spin = { yaw: 0, vel: 0, dragging: false, lastX: 0 };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') {
      const r = host.getBoundingClientRect();
      lean.tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
      lean.ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2));
    }
    if (spin.dragging) {
      const dx = e.clientX - spin.lastX;
      spin.yaw += dx * 0.006;
      spin.vel = dx * 0.006 * 60;
      spin.lastX = e.clientX;
    }
  };
  const onDown = (e: PointerEvent) => {
    if (tour) return;
    spin.dragging = true;
    spin.lastX = e.clientX;
    host.setPointerCapture?.(e.pointerId);
  };
  const onUp = () => (spin.dragging = false);
  window.addEventListener('pointermove', onMove, { passive: true });
  host.addEventListener('pointerdown', onDown);
  window.addEventListener('pointerup', onUp);
  stage.onDispose(() => {
    window.removeEventListener('pointermove', onMove);
    host.removeEventListener('pointerdown', onDown);
    window.removeEventListener('pointerup', onUp);
  });

  let sp = 0;
  const look = new THREE.Vector3();
  const camPos = new THREE.Vector3();
  const tmp = new THREE.Vector3();

  stage.run(({ t, dt }) => {
    const build = tour || opts.reduced || opts.intro === false ? BUILD_END + 1 : t;
    const raw = opts.getProgress ? opts.getProgress() : 0;
    const p = Number.isFinite(raw) ? clamp01(raw) : 0;
    sp += (p - sp) * (opts.reduced ? 1 : 1 - Math.exp(-dt * 6));

    // How far apart the strata stand (0 = all inside the image, 1 = exploded),
    // how tightly they press (1 = shut), and where the scan is.
    let explode: number;
    let press: number;
    let scanK: number;
    let codeOut = 0;
    if (!tour) {
      explode = inOut(seg(build, 1.75, 2.75));
      press = 0;
      scanK = seg(build, 0.95, 1.7);
    } else {
      scanK = seg(sp, 0.03, 0.3);
      explode = smooth(seg(sp, 0.34, 0.62));
      press = smooth(seg(sp, 0.68, 0.84));
      codeOut = smooth(seg(sp, 0.82, 0.97));
    }

    plinthG.scale.y = Math.max(0.001, outQuint(seg(build, 0, 0.5)));
    const drop = outBack(seg(build, 0.4, 0.95), 1.3);

    // Stack from the bottom (code) up to the image.
    const breathe = !tour && !opts.reduced ? Math.sin(t * 0.6) * 0.04 * explode : 0;
    const gap = lerp(0.02, 0.4 + breathe, explode * (1 - press));
    let y = 0.02;
    const ys: number[] = [];
    for (let i = layers.length - 1; i >= 0; i--) {
      ys[i] = y + layers[i].t / 2;
      y += layers[i].t + gap;
    }
    const imageY = ys[0];
    layers.forEach((l, i) => {
      if (i === 0) {
        l.g.position.set(0, imageY + (1 - drop) * 2.4, 0);
        l.g.visible = build > 0.4;
        return;
      }
      // Each stratum slides out from under the image, in order.
      const k = tour ? explode : inOut(seg(build, 1.75 + (i - 1) * 0.12, 2.35 + (i - 1) * 0.12));
      const hidden = tour ? explode < 0.001 && press < 0.001 : k < 0.001;
      l.g.position.set(0, lerp(imageY - 0.02, ys[i], Math.max(k, press)), i === layers.length - 1 ? codeOut * 1.5 : 0);
      l.g.scale.setScalar(lerp(0.96, 1, Math.max(k, press)));
      l.g.visible = !hidden;
    });

    const scanOn = scanK > 0 && scanK < 1;
    scan.visible = scanGlow.visible = scanOn;
    const sz = lerp(-D / 2, D / 2, scanK);
    scan.position.set(0, imageY + 0.05, sz);
    scanGlow.position.set(0, imageY + 0.035, sz - 0.25);

    // ---- world: idle sway, drag, lean ----
    if (!spin.dragging) {
      spin.vel *= Math.exp(-dt * 3);
      spin.yaw += spin.vel * dt;
      if (Math.abs(spin.vel) < 0.02) spin.yaw += (0 - spin.yaw) * Math.min(1, dt * 0.6);
    }
    lean.x += (lean.tx - lean.x) * 0.05;
    lean.y += (lean.ty - lean.y) * 0.05;
    rig.rotation.y = spin.yaw + (opts.reduced ? 0 : Math.sin(t * 0.28) * 0.1) + lean.x * (tour ? 0.06 : 0.14);
    rig.rotation.x = lean.y * 0.03;

    // ---- camera: reading is seen from above, the stack from three-quarter ----
    const top = tour ? 1 - smooth(seg(sp, 0.3, 0.5)) : 0;
    const stackMid = (ys[ys.length - 1] + imageY) / 2;
    look.set(0, lerp(stackMid, imageY, top * 0.8), 0);
    tmp.copy(DIR).lerp(DIR_TOP, top).normalize();
    const r = tour ? lerp(lerp(2.35, 2.1, top), 2.0, press) : 2.5;
    camPos.copy(tmp).multiplyScalar(fit(r)).add(look);
    camera.position.copy(camPos);
    camera.lookAt(look);

    if (opts.onAnchors) {
      camera.updateMatrixWorld();
      rig.updateMatrixWorld(true);
      const pts = layers.map((l) => {
        const v = l.g.localToWorld(new THREE.Vector3(W / 2 + 0.04, 0, D / 2)).project(camera);
        return { x: (v.x + 1) * 0.5 * stage.size.w, y: (1 - v.y) * 0.5 * stage.size.h };
      });
      opts.onAnchors(pts, tour ? explode * (1 - press) : explode);
    }
    return camera;
  }, camera);

  if (opts.reduced && tour) {
    const onScroll = () => stage.redraw();
    window.addEventListener('scroll', onScroll, { passive: true });
    stage.onDispose(() => window.removeEventListener('scroll', onScroll));
  }

  return () => stage.dispose();
}
