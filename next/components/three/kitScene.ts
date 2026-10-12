import * as THREE from 'three';
import { studioEnvironment } from './studio';
import { createStage, siteFonts, canvasTexture, clamp01, seg, lerp, inOut, outQuint, outBack, smooth } from './stage';
import { drawFlyer, drawPost, drawPhoneOverlay, drawSign, drawStamp, drawSky, LISTING } from './listingArt';

/**
 * Listing Launch Kit — the house as an architectural model on a plinth, and
 * the kit it produces: a print flyer, five posts dealt into a fan, and a
 * phone playing the 30-second video (a live render of the same house).
 *
 *  · hero — a 2.6 s build on load (ground, house, lights on, print, deal,
 *    play), then a slow idle. Drag to turn it.
 *  · tour — the assembled kit, driven by scroll progress through the five
 *    "What you get" items: the camera flies to each piece in turn.
 */

export type KitMode = 'hero' | 'tour';
export type KitOptions = {
  mode: KitMode;
  reduced: boolean;
  /** 0–1 through the pinned tour; read every frame. */
  getProgress?: () => number;
  /** Play the load sequence (off when a phone re-mounts a recycled stage). */
  intro?: boolean;
  /** Screen positions (px in the canvas) of the flyer, posts and phone label anchors; `shown` once built. */
  onAnchors?: (pts: { x: number; y: number }[], shown: number) => void;
  onReady: () => void;
};

const LIME = new THREE.Color('#B8FF00');
const BUILD_END = 2.7;   // seconds — the hero's load sequence

function woodTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#a6764d';
  ctx.fillRect(0, 0, 256, 256);
  let seed = 5;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let x = 0; x < 256; x += 32) {
    ctx.fillStyle = `rgba(120, 80, 48, ${0.15 + rnd() * 0.2})`;
    ctx.fillRect(x + 4, 0, 26, 256);
    ctx.fillStyle = '#7f5737';
    ctx.fillRect(x, 0, 4, 256);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

export async function mountKitScene(host: HTMLElement, opts: KitOptions) {
  const F = await siteFonts();
  const stage = createStage(host, { reduced: opts.reduced, onReady: opts.onReady });
  const { renderer, scene, coarse } = stage;
  const tour = opts.mode === 'tour';

  renderer.toneMappingExposure = 1.06;
  const envTex = studioEnvironment(renderer);
  scene.environment = envTex;
  scene.environmentIntensity = 0.85;
  stage.onDispose(() => envTex.dispose());

  /* ---------------------------------------------------------------- light */
  const hemi = new THREE.HemisphereLight('#f6f3ec', '#1b1d20', 1.0);
  const key = new THREE.DirectionalLight('#fff6e8', 2.4);
  key.position.set(4.5, 8, 5.5);
  key.castShadow = true;
  key.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048);
  Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 30 });
  key.shadow.radius = 5;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  const rim = new THREE.DirectionalLight('#dfe8ff', 0.9);
  rim.position.set(-6, 3, -4);
  for (const l of [hemi, key, rim]) {
    l.layers.enable(1);   // the phone's video camera sees layer 1
    scene.add(l);
  }

  /* ------------------------------------------------------------ materials */
  const wood = woodTexture();
  const M = {
    plinth: new THREE.MeshPhysicalMaterial({ color: '#16181b', metalness: 0.35, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.08 }),
    lawn: new THREE.MeshStandardMaterial({ color: '#8f9c70', roughness: 0.92 }),
    ceramic: new THREE.MeshPhysicalMaterial({ color: '#f3f0ea', roughness: 0.4, clearcoat: 0.5, clearcoatRoughness: 0.22 }),
    roof: new THREE.MeshPhysicalMaterial({ color: '#22211f', roughness: 0.42, metalness: 0.15, clearcoat: 0.6 }),
    wood: new THREE.MeshPhysicalMaterial({ map: wood, roughness: 0.62, clearcoat: 0.15 }),
    glow: new THREE.MeshStandardMaterial({ color: '#3a2c18', emissive: '#ffcf7a', emissiveIntensity: 0, roughness: 0.18 }),
    brass: new THREE.MeshStandardMaterial({ color: '#c9a86a', metalness: 0.8, roughness: 0.3 }),
    drive: new THREE.MeshStandardMaterial({ color: '#d8d2c6', roughness: 0.9 }),
    planter: new THREE.MeshStandardMaterial({ color: '#6f7560', roughness: 0.8 }),
    trunk: new THREE.MeshStandardMaterial({ color: '#5f4a36', roughness: 0.85 }),
    leafA: new THREE.MeshStandardMaterial({ color: '#76875a', roughness: 0.8 }),
    leafB: new THREE.MeshStandardMaterial({ color: '#6b7b51', roughness: 0.8 }),
    leafC: new THREE.MeshStandardMaterial({ color: '#829364', roughness: 0.8 }),
    white: new THREE.MeshStandardMaterial({ color: '#f4f5f1', roughness: 0.5 }),
    paper: new THREE.MeshStandardMaterial({ color: '#f1eee7', roughness: 0.85 }),
    phone: new THREE.MeshPhysicalMaterial({ color: '#0f1113', metalness: 0.55, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.05 }),
    lime: new THREE.MeshBasicMaterial({ color: LIME, toneMapped: false }),
    edge: new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.16 }),
  };

  const box = (w: number, h: number, d: number, mat: THREE.Material | THREE.Material[], cast = true) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.castShadow = cast;
    m.receiveShadow = true;
    return m;
  };

  /* --------------------------------------------------------------- ground */
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.38 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.26;
  ground.receiveShadow = true;
  scene.add(ground);

  const world = new THREE.Group();   // turned by drag / pointer lean
  scene.add(world);
  const model = new THREE.Group();   // everything the phone's video sees
  world.add(model);

  // Plinth — grows up out of the floor.
  const plinthG = new THREE.Group();
  plinthG.position.y = -0.26;
  const plinth = box(4.6, 0.26, 3.4, M.plinth, false);
  plinth.position.y = 0.13;
  plinth.add(new THREE.LineSegments(new THREE.EdgesGeometry(plinth.geometry), M.edge));
  plinthG.add(plinth);
  model.add(plinthG);

  // Lawn — wipes in from the left edge.
  const lawnGeo = new THREE.BoxGeometry(4.2, 0.04, 3.0);
  lawnGeo.translate(2.1, 0, 0);
  const lawn = new THREE.Mesh(lawnGeo, M.lawn);
  lawn.receiveShadow = true;
  lawn.position.set(-2.1, 0.02, 0);
  model.add(lawn);

  const house = new THREE.Group();
  house.position.set(-0.15, 0.04, -0.2);
  model.add(house);

  // White stucco volume.
  const whiteG = new THREE.Group();
  whiteG.position.set(-0.55, 0, 0);
  const whiteBody = box(1.9, 0.84, 1.3, M.ceramic);
  whiteBody.position.y = 0.42;
  whiteG.add(whiteBody);
  const pane = box(1.04, 0.5, 0.02, M.glow, false);
  pane.position.set(-0.28, 0.44, 0.655);
  whiteG.add(pane);
  for (const x of [-0.45, -0.11]) {
    const v = box(0.025, 0.5, 0.03, M.roof, false);
    v.position.set(x, 0.44, 0.66);
    whiteG.add(v);
  }
  const hbar = box(1.04, 0.025, 0.03, M.roof, false);
  hbar.position.set(-0.28, 0.44, 0.66);
  whiteG.add(hbar);
  const door = box(0.24, 0.62, 0.03, M.roof, false);
  door.position.set(0.55, 0.31, 0.66);
  whiteG.add(door);
  const handle = box(0.015, 0.06, 0.02, M.brass, false);
  handle.position.set(0.64, 0.33, 0.68);
  whiteG.add(handle);
  const sidePane = box(0.02, 0.3, 0.42, M.glow, false);
  sidePane.position.set(-0.955, 0.48, 0.1);
  whiteG.add(sidePane);
  const whiteRoof = box(2.02, 0.08, 1.42, M.roof);
  whiteRoof.position.set(-0.55, 0.88, 0);
  house.add(whiteG, whiteRoof);

  // Wood-clad volume.
  const woodG = new THREE.Group();
  woodG.position.set(0.95, 0, -0.05);
  const woodBody = box(0.95, 1.32, 1.1, M.wood);
  woodBody.position.y = 0.66;
  woodG.add(woodBody);
  const tall = box(0.36, 0.86, 0.02, M.glow, false);
  tall.position.set(-0.05, 0.72, 0.555);
  woodG.add(tall);
  const tallBar = box(0.025, 0.86, 0.03, M.roof, false);
  tallBar.position.set(-0.05, 0.72, 0.56);
  woodG.add(tallBar);
  const woodRoof = box(1.05, 0.08, 1.2, M.roof);
  woodRoof.position.set(0.95, 1.36, -0.05);
  house.add(woodG, woodRoof);

  const planter = box(1.7, 0.12, 0.18, M.planter);
  planter.position.set(-0.55, 0.06, 0.82);
  const drive = box(0.62, 0.012, 1.25, M.drive, false);
  drive.position.set(0.62, 0.0, 1.05);
  house.add(planter, drive);

  // A voxel tree — sharp cubes, no spheres.
  const tree = new THREE.Group();
  tree.position.set(-1.95, 0.04, -0.95);
  const trunk = box(0.07, 0.55, 0.07, M.trunk);
  trunk.position.y = 0.27;
  tree.add(trunk);
  const leaves: THREE.Mesh[] = [];
  ([[0, 0.74, 0, 0.5, M.leafA, 0.3], [-0.2, 0.58, 0.12, 0.34, M.leafB, -0.4], [0.21, 0.62, -0.08, 0.32, M.leafC, 0.7]] as const).forEach(
    ([x, y, z, s, mat, r]) => {
      const c = box(s, s, s, mat);
      c.position.set(x, y, z);
      c.rotation.y = r;
      tree.add(c);
      leaves.push(c);
    },
  );
  model.add(tree);

  // The lime yard sign — the scene's one signal.
  const signTex = canvasTexture(512, 272, (ctx, w, h) => drawSign(ctx, w, h, F));
  const signFace = new THREE.MeshBasicMaterial({ map: signTex, toneMapped: false });
  const sign = new THREE.Group();
  sign.position.set(-1.2, 0.04, 1.22);
  const post = box(0.035, 0.66, 0.035, M.white);
  post.position.y = 0.33;
  const board = box(0.64, 0.34, 0.02, [M.lime, M.lime, M.lime, M.lime, signFace, M.lime]);
  board.position.y = 0.56;
  sign.add(post, board);
  model.add(sign);

  model.traverse((o) => o.layers.enable(1));

  /* ----------------------------------------------------------------- flyer */
  let flyerPrice = LISTING.price;
  let flyerCaret = false;
  const flyerTex = canvasTexture(1024, 1325, (ctx, w, h) => drawFlyer(ctx, w, h, F));
  const flyerFace = new THREE.MeshStandardMaterial({ map: flyerTex, roughness: 0.78 });
  const flyer = new THREE.Group();
  const sheet = box(1.7, 2.2, 0.012, [M.paper, M.paper, M.paper, M.paper, flyerFace, M.paper]);
  flyer.add(sheet);
  const stampTex = canvasTexture(512, 128, (ctx, w, h) => drawStamp(ctx, w, h, F));
  const stamp = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 0.215), new THREE.MeshBasicMaterial({ map: stampTex, toneMapped: false }));
  stamp.position.set(0.3, -0.18, 0.012);
  stamp.rotation.z = -0.12;
  stamp.visible = false;
  flyer.add(stamp);
  world.add(flyer);
  const FLYER_REST = { p: new THREE.Vector3(-2.95, 1.4, 0.95), r: new THREE.Euler(-0.05, 0.5, 0.035) };

  /* ----------------------------------------------------------------- posts */
  const fan = new THREE.Group();
  world.add(fan);
  const FAN_REST = { p: new THREE.Vector3(1.55, 1.35, -0.55), r: new THREE.Euler(0, -0.42, 0) };
  const FAN_ROW = { p: new THREE.Vector3(0.1, 2.05, 0.9), r: new THREE.Euler(0, -0.32, 0) };
  const posts = [0, 1, 2, 3, 4].map((i) => {
    const tex = canvasTexture(640, 800, (ctx, w, h) => drawPost(ctx, w, h, F, i));
    const face = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 });
    const m = box(0.96, 1.2, 0.01, [M.paper, M.paper, M.paper, M.paper, face, M.paper]);
    fan.add(m);
    const a = (i - 2) * 0.21;
    return {
      m,
      fanP: new THREE.Vector3(Math.sin(a) * 1.5, Math.cos(a) * 1.5 - 0.2, i * 0.03),
      fanR: -a,
      rowP: new THREE.Vector3((i - 2) * 1.08, 0, 0),
    };
  });

  /* ----------------------------------------------------------------- phone */
  const rtW = coarse ? 192 : 288;
  const rt = new THREE.WebGLRenderTarget(rtW, Math.round(rtW * (1.27 / 0.6)), { samples: coarse ? 0 : 4 });
  stage.onDispose(() => rt.dispose());
  const rtCam = new THREE.PerspectiveCamera(30, 0.6 / 1.27, 0.1, 60);
  rtCam.layers.set(1);
  const skyTex = canvasTexture(64, 256, drawSky);
  stage.onDispose(() => skyTex.dispose());

  const phone = new THREE.Group();
  const body = box(0.66, 1.34, 0.07, M.phone);
  phone.add(body);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 1.27), new THREE.MeshBasicMaterial({ map: rt.texture }));
  screen.position.z = 0.036;
  phone.add(screen);
  let shownSecond = -1;
  const overlayTex = canvasTexture(360, 762, (ctx, w, h) => drawPhoneOverlay(ctx, w, h, F, 0));
  const overlay = new THREE.Mesh(
    new THREE.PlaneGeometry(0.6, 1.27),
    new THREE.MeshBasicMaterial({ map: overlayTex, transparent: true, depthWrite: false }),
  );
  overlay.position.z = 0.037;
  phone.add(overlay);
  const track = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.012), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.45 }));
  track.position.set(0, -0.52, 0.038);
  const fillGeo = new THREE.PlaneGeometry(0.5, 0.016);
  fillGeo.translate(0.25, 0, 0);
  const fill = new THREE.Mesh(fillGeo, M.lime);
  fill.position.set(-0.25, -0.52, 0.039);
  phone.add(track, fill);
  world.add(phone);
  const PHONE_REST = { p: new THREE.Vector3(3.0, 1.0, 1.75), r: new THREE.Euler(-0.04, -0.5, 0) };
  const PHONE_FWD = { p: new THREE.Vector3(2.3, 1.25, 2.6), r: new THREE.Euler(-0.02, -0.34, 0) };

  /* ---------------------------------------------------------------- camera */
  const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 100);
  const HERO_DIR = new THREE.Vector3(5.6, 3.4, 8.6).normalize();
  const HERO_TARGET = new THREE.Vector3(0, 1.2, 0.15);
  const HERO_R = 3.55;   // radius of the composition the hero must fit
  let aspect = 1;
  // On wide screens the tour canvas fills the viewport behind the list, so its
  // subject is centred in the right-hand part of the frame.
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
  /** Camera distance that fits a sphere of radius r in the usable part of the frame. */
  const fit = (r: number) => {
    const v = THREE.MathUtils.degToRad(camera.fov) / 2;
    const h = Math.atan(Math.tan(v) * aspect * Math.min(1, 2 * (1 - centerX)));
    return r / Math.sin(Math.min(v, h));
  };

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

  /* ----------------------------------------------------------------- poses */
  const tmpV = new THREE.Vector3();
  const qA = new THREE.Quaternion();
  const qB = new THREE.Quaternion();
  const pose = (o: THREE.Object3D, a: { p: THREE.Vector3; r: THREE.Euler }, b: { p: THREE.Vector3; r: THREE.Euler }, k: number) => {
    o.position.lerpVectors(a.p, b.p, k);
    qA.setFromEuler(a.r);
    qB.setFromEuler(b.r);
    o.quaternion.slerpQuaternions(qA, qB, k);
  };

  const setPrice = (price: string, caret: boolean) => {
    if (price === flyerPrice && caret === flyerCaret) return;
    flyerPrice = price;
    flyerCaret = caret;
    flyerTex.redraw((ctx, w, h) => drawFlyer(ctx, w, h, F, price, caret));
  };

  // Tour shots: where the camera looks and how much it must fit.
  type Shot = { target: THREE.Vector3; dir: THREE.Vector3; r: number };
  const normalOf = (o: THREE.Object3D) => new THREE.Vector3(0, 0, 1).applyQuaternion(o.getWorldQuaternion(new THREE.Quaternion()));
  const overview: Shot = { target: HERO_TARGET.clone(), dir: HERO_DIR.clone(), r: HERO_R };
  const shotCam = (s: Shot, out: { pos: THREE.Vector3; look: THREE.Vector3 }) => {
    out.look.copy(s.target);
    out.pos.copy(s.dir).multiplyScalar(fit(s.r)).add(s.target);
  };
  const camA = { pos: new THREE.Vector3(), look: new THREE.Vector3() };
  const camB = { pos: new THREE.Vector3(), look: new THREE.Vector3() };
  const camNow = { pos: new THREE.Vector3(), look: new THREE.Vector3(), init: false };

  let smoothP = 0;
  const ANCHORS: [THREE.Object3D, THREE.Vector3][] = [
    [flyer, new THREE.Vector3(-0.85, 1.1, 0)],
    [posts[0].m, new THREE.Vector3(-0.48, 0.6, 0)],
    [phone, new THREE.Vector3(-0.33, -0.67, 0)],
  ];

  /* ------------------------------------------------------------------ loop */
  stage.run(({ t, dt }) => {
    const build = tour || opts.reduced || opts.intro === false ? BUILD_END + 1 : t;
    const idle = tour ? t : Math.max(0, t - BUILD_END);

    // ---- load sequence (hero) ----
    plinthG.scale.y = Math.max(0.001, outQuint(seg(build, 0, 0.55)));
    lawn.scale.x = Math.max(0.001, inOut(seg(build, 0.2, 0.75)));
    const drop = (o: THREE.Object3D, a: number, b: number, h: number) => {
      const k = outBack(seg(build, a, b), 1.5);
      o.position.y = lerp(h, 0, k) + (o.userData.y ?? 0);
      o.visible = build > a;
    };
    whiteRoof.userData.y ??= whiteRoof.position.y;
    woodRoof.userData.y ??= woodRoof.position.y;
    drop(whiteG, 0.55, 1.05, 2.4);
    drop(whiteRoof, 0.78, 1.2, 2.4);
    drop(woodG, 0.85, 1.35, 2.8);
    drop(woodRoof, 1.05, 1.5, 2.8);
    M.glow.emissiveIntensity = 1.35 * inOut(seg(build, 1.35, 1.7));
    planter.scale.y = Math.max(0.001, outQuint(seg(build, 1.1, 1.4)));
    drive.scale.z = Math.max(0.001, inOut(seg(build, 1.1, 1.5)));
    leaves.forEach((c, i) => c.scale.setScalar(Math.max(0.001, outBack(seg(build, 1.3 + i * 0.08, 1.65 + i * 0.08), 2))));
    trunk.scale.y = Math.max(0.001, outQuint(seg(build, 1.2, 1.45)));
    sign.scale.y = Math.max(0.001, outBack(seg(build, 1.45, 1.85), 1.8));

    // ---- flyer: slides out from under the house, rises, turns to face you ----
    const fk = inOut(seg(build, 1.45, 2.15));
    const under = { p: new THREE.Vector3(-0.6, 0.06, 0.1), r: new THREE.Euler(-Math.PI / 2, 0, 0) };
    const out = { p: new THREE.Vector3(-1.9, 0.5, 1.6), r: new THREE.Euler(-0.9, 0.3, 0) };
    if (fk < 0.5) pose(flyer, under, out, fk * 2);
    else pose(flyer, out, FLYER_REST, (fk - 0.5) * 2);
    flyer.visible = build > 1.45;

    // ---- posts: dealt one by one into the fan; open into a row on the tour ----
    const raw = opts.getProgress ? opts.getProgress() : 0;
    const p = Number.isFinite(raw) ? clamp01(raw) : 0;
    smoothP += (p - smoothP) * (1 - Math.exp(-dt * 7));
    const sp = tour ? clamp01(smoothP) : 0;
    const chapter = Math.min(4, Math.floor(sp * 5));
    const q = sp * 5 - chapter;
    const rowAmt = tour ? (chapter === 1 ? smooth(seg(q, 0.05, 0.6)) : chapter === 2 ? 1 - smooth(seg(q, 0, 0.4)) : 0) : 0;
    pose(fan, FAN_REST, FAN_ROW, rowAmt);
    posts.forEach((it, i) => {
      const k = outBack(seg(build, 1.85 + i * 0.07, 2.35 + i * 0.07), 1.3);
      const bob = opts.reduced ? 0 : Math.sin(idle * 1.1 + i * 0.9) * 0.03 * (1 - rowAmt);
      tmpV.lerpVectors(it.fanP, it.rowP, rowAmt);
      it.m.position.set(lerp(-1.4, tmpV.x, k), lerp(0.6, tmpV.y, k) + bob, tmpV.z);
      it.m.rotation.z = lerp(0, it.fanR * (1 - rowAmt), k);
      it.m.scale.setScalar(Math.max(0.001, lerp(0.35, 1, Math.min(1, k))));
      it.m.visible = build > 1.85 + i * 0.07;
    });

    // ---- phone: stands up and plays; comes forward on the tour ----
    const standK = outBack(seg(build, 2.0, 2.6), 1.2);
    const lying = { p: new THREE.Vector3(2.1, 0.08, 1.3), r: new THREE.Euler(-Math.PI / 2, 0, -0.5) };
    const fwd = tour ? (chapter === 2 ? smooth(seg(q, 0, 0.45)) : chapter === 3 ? 1 - smooth(seg(q, 0, 0.4)) : 0) : 0;
    if (standK < 1) pose(phone, lying, PHONE_REST, standK);
    else pose(phone, PHONE_REST, PHONE_FWD, fwd);
    phone.visible = build > 2.0;

    // The video: scroll is the playhead on the tour, an 8 s loop otherwise.
    const seconds = tour && chapter === 2 ? 30 * seg(q, 0.1, 0.95) : tour && chapter > 2 ? 30 : (idle * 3.75) % 30;
    fill.scale.x = Math.max(0.001, seconds / 30);
    const sec = Math.floor(seconds);
    if (sec !== shownSecond) {
      shownSecond = sec;
      overlayTex.redraw((ctx, w, h) => drawPhoneOverlay(ctx, w, h, F, seconds));
    }

    // ---- tour: price retype, one flip, the stamp ----
    if (tour) {
      if (chapter < 3) setPrice(LISTING.price, false);
      else if (chapter === 3) {
        const e = seg(q, 0.15, 0.85);
        const old = LISTING.price;
        const keep = '$2,1';
        const str = e < 0.5
          ? old.slice(0, old.length - Math.round((old.length - keep.length) * seg(e, 0, 0.45)))
          : keep + LISTING.newPrice.slice(keep.length, keep.length + Math.round((LISTING.newPrice.length - keep.length) * seg(e, 0.55, 1)));
        setPrice(str, Math.floor(t * 2.2) % 2 === 0);
      } else setPrice(LISTING.newPrice, false);
      const flip = chapter === 4 ? inOut(seg(q, 0.05, 0.5)) : 0;
      flyer.rotateY(flip * Math.PI * 2);
      const sk = chapter === 4 ? outQuint(seg(q, 0.5, 0.72)) : 0;
      stamp.visible = sk > 0;
      stamp.scale.setScalar(lerp(1.7, 1, sk));
    }

    // ---- world: idle sway, drag, lean ----
    if (!spin.dragging) {
      spin.vel *= Math.exp(-dt * 3);
      spin.yaw += (spin.vel * dt);
      if (Math.abs(spin.vel) < 0.02) spin.yaw += (0 - spin.yaw) * Math.min(1, dt * 0.6);
    }
    lean.x += (lean.tx - lean.x) * 0.05;
    lean.y += (lean.ty - lean.y) * 0.05;
    const sway = opts.reduced ? 0 : Math.sin(idle * 0.32) * 0.07;
    world.rotation.y = spin.yaw + sway + lean.x * (tour ? 0.05 : 0.12);
    world.rotation.x = lean.y * 0.03;

    // ---- the phone's video: a slow orbit of the house at golden hour ----
    if (phone.visible && (!coarse || Math.floor(t * 60) % 2 === 0)) {
      const th = 0.35 + seconds * 0.055;
      rtCam.position.set(Math.sin(th) * 6.4, 1.15 + Math.sin(seconds * 0.2) * 0.25, Math.cos(th) * 6.4);
      rtCam.lookAt(0.1, 0.55, 0);
      const bg = scene.background;
      scene.background = skyTex;
      phone.visible = false;
      renderer.setRenderTarget(rt);
      renderer.render(scene, rtCam);
      renderer.setRenderTarget(null);
      phone.visible = true;
      scene.background = bg;
    }

    // ---- camera ----
    if (!tour) {
      shotCam(overview, camA);
      camNow.pos.copy(camA.pos);
      camNow.look.copy(camA.look);
    } else {
      world.updateMatrixWorld(true);
      const fc = flyer.getWorldPosition(new THREE.Vector3());
      const shots: Shot[] = [
        { target: fc, dir: normalOf(flyer).lerp(HERO_DIR, 0.25).normalize(), r: 1.6 },
        { target: fan.localToWorld(new THREE.Vector3(0, 0, 0)), dir: normalOf(fan).lerp(HERO_DIR, 0.2).normalize(), r: 3.05 },
        { target: phone.getWorldPosition(new THREE.Vector3()), dir: normalOf(phone).lerp(HERO_DIR, 0.2).normalize(), r: 1.1 },
        { target: flyer.localToWorld(new THREE.Vector3(-0.05, -0.3, 0)), dir: new THREE.Vector3(0, 0, 1).applyQuaternion(qA.setFromEuler(FLYER_REST.r)).lerp(HERO_DIR, 0.15).normalize(), r: 1.0 },
        { target: fc, dir: new THREE.Vector3(0, 0, 1).applyQuaternion(qA.setFromEuler(FLYER_REST.r)).lerp(HERO_DIR, 0.3).normalize(), r: 1.65 },
      ];
      const from = chapter === 0 ? overview : shots[chapter - 1];
      shotCam(from, camA);
      shotCam(shots[chapter], camB);
      const blend = smooth(seg(q, 0, 0.45));
      tmpV.lerpVectors(camA.pos, camB.pos, blend);
      const look = new THREE.Vector3().lerpVectors(camA.look, camB.look, blend);
      // Pull back to the whole kit for the last stretch of the section.
      const back = smooth(seg(sp, 0.9, 1));
      shotCam(overview, camA);
      tmpV.lerp(camA.pos, back);
      look.lerp(camA.look, back);
      if (!camNow.init) {
        camNow.pos.copy(tmpV);
        camNow.look.copy(look);
        camNow.init = true;
      } else {
        const k = 1 - Math.exp(-dt * 5);
        camNow.pos.lerp(tmpV, k);
        camNow.look.lerp(look, k);
      }
    }
    camera.position.copy(camNow.pos);
    camera.lookAt(camNow.look);

    if (opts.onAnchors) {
      camera.updateMatrixWorld();
      world.updateMatrixWorld(true);
      const pts = ANCHORS.map(([o, local]) => {
        const v = o.localToWorld(local.clone()).project(camera);
        return { x: (v.x + 1) * 0.5 * stage.size.w, y: (1 - v.y) * 0.5 * stage.size.h };
      });
      opts.onAnchors(pts, seg(build, BUILD_END - 0.2, BUILD_END + 0.4));
    }
    return camera;
  });

  if (opts.reduced && tour && opts.getProgress) {
    // Reduced motion still follows scroll, one frame per scroll event.
    const onScroll = () => stage.redraw();
    window.addEventListener('scroll', onScroll, { passive: true });
    stage.onDispose(() => window.removeEventListener('scroll', onScroll));
  }

  return () => stage.dispose();
}
