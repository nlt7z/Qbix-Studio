import * as THREE from 'three';
import { createStage, siteFonts, canvasTexture, clamp01, seg, lerp, inOut, smooth } from './stage';
import * as Art from './practiceArt';

/**
 * Practice Website Refresh — the rebuild, driven by scroll (0 → 1):
 *
 *   0.00–0.43  the 2019 homepage comes apart: banner, bars, columns, photo and
 *              footer peel off the page one by one and drift up out of frame
 *   0.44–0.74  the calm page is set down: photo, words, nav, one button
 *   0.76–0.88  the window stands up to face you
 *   0.88–0.99  it narrows into a phone and the page reflows into one column
 *
 * Calm on purpose: in-out easing only, no overshoot, no bounce.
 */

export type RebuildOptions = {
  reduced: boolean;
  getProgress: () => number;
  onReady: () => void;
};

const W = 4.8;      // page width
const D = 3.1;      // page height (depth on the table)
const PW = 1.75;    // page width once it is a phone
const PX = 300;     // texture pixels per world unit

export async function mountRebuildScene(host: HTMLElement, opts: RebuildOptions) {
  const F = await siteFonts();
  const stage = createStage(host, { reduced: opts.reduced, onReady: opts.onReady });
  const { scene, coarse } = stage;

  /* ---------------------------------------------------------------- light */
  scene.add(new THREE.HemisphereLight('#ffffff', '#d9d4c8', 1.6));
  const key = new THREE.DirectionalLight('#fffaf0', 1.5);
  key.position.set(-3.5, 9, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048);
  Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 30 });
  key.shadow.radius = 8;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  scene.add(key);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ color: '#2a2418', opacity: 0.13 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.16;
  ground.receiveShadow = true;
  scene.add(ground);

  /* ------------------------------------------------------------ materials */
  const paperEdge = new THREE.MeshStandardMaterial({ color: '#e7e3da', roughness: 0.9 });
  const paperTop = new THREE.MeshStandardMaterial({ color: '#fbf9f4', roughness: 0.95 });
  const bezelMat = new THREE.MeshPhysicalMaterial({ color: '#1d1e1b', roughness: 0.35, metalness: 0.3, clearcoat: 0.8 });

  /** A flat piece of page: a thin slab with its artwork on top. */
  const piece = (w: number, d: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, thick = 0.03) => {
    const tex = canvasTexture(Math.round(w * PX), Math.round(d * PX), draw);
    const top = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 });
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, thick, d), [paperEdge, paperEdge, top, paperEdge, paperEdge, paperEdge]);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  };

  /* ---------------------------------------------------------------- the page */
  const rig = new THREE.Group();
  scene.add(rig);
  const pivot = new THREE.Group();   // hinge on the page's front edge
  pivot.position.z = D / 2;
  rig.add(pivot);
  const page = new THREE.Group();
  page.position.z = -D / 2;
  pivot.add(page);

  const bezel = new THREE.Mesh(new THREE.BoxGeometry(1, 0.1, 1), bezelMat);
  bezel.castShadow = true;
  bezel.position.y = -0.12;
  page.add(bezel);
  const slab = new THREE.Mesh(new THREE.BoxGeometry(W, 0.14, D), [paperEdge, paperEdge, paperTop, paperEdge, paperEdge, paperEdge]);
  slab.position.y = -0.07;
  slab.castShadow = true;
  slab.receiveShadow = true;
  page.add(slab);
  const chrome = piece(W, 0.2, Art.chromeBar, 0.02);
  chrome.position.set(0, 0.01, -D / 2 + 0.1);
  page.add(chrome);

  type Old = { m: THREE.Mesh; base: THREE.Vector3; to: [number, number, number, number, number] };
  const old: Old[] = [];
  const addOld = (m: THREE.Mesh, x: number, z: number, to: Old['to']) => {
    const base = new THREE.Vector3(x, 0.016, z);
    m.position.copy(base);
    page.add(m);
    old.push({ m, base, to });
  };
  // Peel order: the banner first, the footer last. `to` = drift x, rise y, drift z, tilt x, tilt z.
  addOld(piece(4.4, 0.34, Art.oldBanner), 0, -0.68, [0.3, 3.4, -1.2, -0.5, 0.25]);
  addOld(piece(W, 0.24, Art.oldTop), 0, -1.23, [-0.2, 3.8, -1.6, -0.3, -0.2]);
  addOld(piece(W, 0.18, Art.oldNav), 0, -1.02, [0.9, 3.5, -1.4, -0.4, 0.18]);
  addOld(piece(3.05, 1.25, Art.oldCols), 0.78, 0.22, [1.4, 3.9, -1.0, -0.35, -0.22]);
  addOld(piece(1.3, 1.25, Art.oldPhoto), -1.62, 0.22, [-0.2, 3.6, -0.9, -0.3, 0.3]);
  addOld(piece(W, 0.18, Art.oldFoot), 0, 1.36, [0.4, 4.2, -2.4, -0.45, -0.15]);

  type Calm = { m: THREE.Mesh; desk: [number, number, number]; phone: [number, number, number] };
  const calm: Calm[] = [];
  const addCalm = (m: THREE.Mesh, desk: Calm['desk'], phone: Calm['phone']) => {
    page.add(m);
    calm.push({ m, desk, phone });
  };
  // [x, z, scale] on the desktop page and on the phone.
  addCalm(piece(2.1, 2.05, Art.calmPhoto), [1.12, 0.28, 1], [0, -0.4, 0.66]);
  addCalm(piece(2.0, 1.3, (c, w, h) => Art.calmText(c, w, h, F)), [-1.15, -0.05, 1], [-0.02, 0.62, 0.72]);
  addCalm(piece(4.2, 0.22, (c, w, h) => Art.calmNav(c, w, h, F)), [0, -1.12, 1], [0, -1.22, 0.38]);
  const button = piece(0.98, 0.24, (c, w, h) => Art.calmButton(c, w, h, F), 0.07);
  addCalm(button, [-1.66, 0.86, 1], [-0.38, 1.27, 0.8]);

  /* ---------------------------------------------------------------- camera */
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
  let aspect = 1;
  stage.onResize((w, h) => {
    aspect = w / h;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
  });
  const fit = (r: number) => {
    const v = THREE.MathUtils.degToRad(camera.fov) / 2;
    const h = Math.atan(Math.tan(v) * aspect);
    return r / Math.sin(Math.min(v, h));
  };
  const DIR_A = new THREE.Vector3(5.2, 6.6, 6.8).normalize();
  const DIR_B = new THREE.Vector3(0.1, 0.3, 1).normalize();
  const camPos = new THREE.Vector3();
  const look = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  const pageCenter = new THREE.Vector3();

  /* --------------------------------------------------------------- pointer */
  const lean = { x: 0, y: 0, tx: 0, ty: 0 };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    lean.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    lean.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  };
  window.addEventListener('pointermove', onMove, { passive: true });
  stage.onDispose(() => window.removeEventListener('pointermove', onMove));

  let sp = clamp01(opts.getProgress() || 0);

  stage.run(({ t, dt }) => {
    const raw = opts.getProgress();
    const p = Number.isFinite(raw) ? clamp01(raw) : 0;
    sp += (p - sp) * (opts.reduced ? 1 : 1 - Math.exp(-dt * 6));

    // ---- the old page comes apart ----
    old.forEach((o, i) => {
      const a = 0.02 + i * 0.045;
      const k = inOut(seg(sp, a, a + 0.18));
      const [dx, dy, dz, rx, rz] = o.to;
      o.m.position.set(o.base.x + dx * k * k, o.base.y + dy * k, o.base.z + dz * k * k);
      o.m.rotation.set(rx * k, 0, rz * k);
      o.m.visible = k < 0.999;
    });

    // ---- the calm page is set down, then reflows for the phone ----
    const fold = inOut(seg(sp, 0.88, 0.99));
    calm.forEach((c, i) => {
      const a = 0.44 + i * 0.05;
      const k = inOut(seg(sp, a, a + 0.15));
      const x = lerp(c.desk[0], c.phone[0], fold);
      const z = lerp(c.desk[1], c.phone[1], fold);
      const s = lerp(c.desk[2], c.phone[2], fold);
      c.m.position.set(x, lerp(1.6, 0.016, k), z);
      c.m.rotation.x = (1 - k) * 0.12;
      c.m.scale.setScalar(s);
      c.m.visible = k > 0.001;
    });
    button.position.y += 0.02;

    const slabW = lerp(W, PW, fold);
    slab.scale.x = slabW / W;
    chrome.scale.x = slabW / W;
    bezel.scale.set(slabW + 0.16 * fold, Math.max(0.001, fold), D + 0.16 * fold);
    bezel.visible = fold > 0.001;

    // ---- the window stands up to face you ----
    const stand = inOut(seg(sp, 0.76, 0.88));
    pivot.rotation.x = 1.2 * stand;
    pivot.position.y = 0.3 * stand;

    // ---- camera: three-quarter → face on → closer for the phone ----
    lean.x += (lean.tx - lean.x) * 0.04;
    lean.y += (lean.ty - lean.y) * 0.04;
    rig.rotation.y = lean.x * 0.05 + (opts.reduced ? 0 : Math.sin(t * 0.25) * 0.015);
    rig.rotation.x = lean.y * 0.02;
    rig.updateMatrixWorld(true);
    page.localToWorld(pageCenter.set(0, 0, 0));

    const s1 = smooth(seg(sp, 0.74, 0.88));
    const s2 = smooth(seg(sp, 0.86, 0.99));
    look.set(0, -0.05, 0.1).lerp(pageCenter, s1);
    const dir = tmp.copy(DIR_A).lerp(DIR_B, s1).normalize();
    const r = lerp(lerp(3.35, 2.6, s1), 1.95, s2);
    camPos.copy(dir).multiplyScalar(fit(r)).add(look);
    camera.position.copy(camPos);
    camera.lookAt(look);
    return camera;
  });

  return () => stage.dispose();
}
