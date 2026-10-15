import * as THREE from 'three';
import { watchCovered } from './covered';

/**
 * Service-card scenes — two small isometric 3D stories rendered with three.js,
 * one per service:
 *
 *  · design — moodboard tiles hang scattered in the air, then drop one by one
 *    into a website layout on a dark browser slab; the hero block lights lime
 *    ("live"), a phone slides in carrying the same layout, then it all lifts
 *    apart again.
 *  · brand  — a three-plate brand stack (grid → colour/type → mark) explodes,
 *    a scan plane sweeps it round by round while the swatches refine and the
 *    mark turns and tightens, then the plates press back into one slab.
 *
 * Orthographic camera, satin-dark materials with hairline edges (the blueprint
 * language of the old SVGs). Lime is the lead card's one accent: the design
 * card's image square and its hero block going live, the listing card's photo. Motion is a pure
 * function of time, so reduced-motion simply renders one composed frame.
 */

export type SceneVariant = 'design' | 'brand' | 'listing' | 'practice';

const LIME = new THREE.Color('#B8FF00');
const WHITE = new THREE.Color('#f2f3ef');
// No greys: what used to be the pale tone is white now.
const PALE = new THREE.Color('#f2f3ef');

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
  // Solid objects only (user: no grey or white see-through 3D): white paper
  // bodies held by ink hairlines, ink for images, type and accents. Lime is
  // the services screen's one accent, so only the lead card of each audience
  // carries it (the design card, the listing card).
  // Kept deliberately cheap — Lambert solids, unlit lime, no environment map
  // or shadows — so four scenes compile and draw without stalling the page.
  // Whites carry an emissive floor so their shaded sides stay white, not grey.
  const white = () => new THREE.MeshLambertMaterial({ color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 0.55 });
  const ink = () => new THREE.MeshLambertMaterial({ color: '#15171a' });
  return {
    body: white(),                    // the object itself: white, opaque
    frost: ink(),                     // image wells and inset panels
    chrome: white(),
    ink: ink(),
    inkDark: ink(),
    // Accents are ink on the white objects (a page's button, a door, a tag)
    // and white on ink (hi).
    accent: ink(),
    // Unlit and not tone-mapped, so it lands as the exact brand #B8FF00.
    lime: new THREE.MeshBasicMaterial({ color: LIME, toneMapped: false }),
    hi: new THREE.MeshBasicMaterial({ color: WHITE }),
    glass: ink(),                     // the top plate of the brand stack, solid
    edge: new THREE.LineBasicMaterial({ color: '#0b0c0d' }),
    edgeHi: new THREE.LineBasicMaterial({ color: '#f4f5f2', transparent: true, opacity: 0.95 }),
  };
}
type Mats = ReturnType<typeof materials>;

/** Sharp-cornered slab with a crisp hairline outline — the site's no-radius
 *  rule carried into 3D. (The trailing radius argument is kept for call-site
 *  compatibility and ignored.) */
function slab(w: number, h: number, d: number, mat: THREE.Material, edge: THREE.LineBasicMaterial, _r = 0) {
  const g = new THREE.Group();
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  g.add(mesh);
  const lines = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)), edge);
  g.add(lines);
  return Object.assign(g, { mesh, lines });
}

/* ------------------------------------------------------------------ design */

function buildDesign(scene: THREE.Group, M: Mats) {
  const SLAB_H = 0.14;
  const win = slab(4.2, SLAB_H, 2.8, M.body, M.edge, 0.06);
  win.position.y = SLAB_H / 2;
  scene.add(win);

  // Title bar + window dots along the back edge.
  const bar = slab(4.2, 0.02, 0.3, M.chrome, M.edge, 0.01);
  bar.position.set(0, SLAB_H + 0.01, -1.25);
  scene.add(bar);
  [-1.88, -1.72, -1.56].forEach((x, i) => {
    const dot = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 0.08), i === 0 ? M.accent : M.chrome);
    dot.position.set(x, SLAB_H + 0.035, -1.25);
    scene.add(dot);
  });

  // Layout slots on the slab's top face: nav, hero, media, three cards.
  const TOP = SLAB_H + 0.02 + 0.04;
  const heroMat = new THREE.MeshBasicMaterial({ color: WHITE });
  const slots: { w: number; d: number; x: number; z: number; mat: THREE.Material }[] = [
    { w: 3.8, d: 0.16, x: 0, z: -0.88, mat: M.chrome },
    { w: 2.35, d: 1.0, x: -0.68, z: -0.2, mat: heroMat },
    { w: 1.3, d: 1.0, x: 1.25, z: -0.2, mat: M.chrome },
    { w: 1.17, d: 0.62, x: -1.31, z: 0.82, mat: M.frost },
    { w: 1.17, d: 0.62, x: 0, z: 0.82, mat: M.frost },
    { w: 1.17, d: 0.62, x: 1.31, z: 0.82, mat: M.frost },
  ];
  const tiles = slots.map((s, i) => {
    const t = slab(s.w, 0.08, s.d, s.mat, M.edge, 0.025);
    const home = new THREE.Vector3(s.x, TOP, s.z);
    // Moodboard pose: lifted, spread, tumbled.
    const away = new THREE.Vector3(
      s.x * 1.25 + (rand(i) - 0.5) * 1.6,
      1.5 + rand(i + 9) * 1.3,
      s.z * 1.2 + (rand(i + 3) - 0.5) * 1.2,
    );
    const rot = new THREE.Euler((rand(i + 5) - 0.5) * 1.1, (rand(i + 7) - 0.5) * 1.4, (rand(i + 11) - 0.5) * 0.9);
    scene.add(t);
    return { t, home, away, rot, phase: rand(i + 13) * Math.PI * 2 };
  });
  // Image hint on the media tile: a small lime square "sun", the card's lime
  // pixel while the page is still a moodboard.
  const sun = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.02, 0.36), M.lime);
  sun.position.set(0.24, 0.05, -0.16);
  tiles[2].t.add(sun);

  // Interface detail riding on the tiles: headline bars + a button on the hero,
  // a thumbnail and two text lines on each card. Ink-dark, so they read as
  // type once the hero turns lime.
  const ink = M.ink;
  const detail = (parent: THREE.Object3D, w: number, d: number, x: number, z: number, mat: THREE.Material = ink) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.018, d), mat);
    m.position.set(x, 0.049, z);
    parent.add(m);
  };
  detail(tiles[1].t, 1.35, 0.09, -0.35, -0.28, M.inkDark);
  detail(tiles[1].t, 0.95, 0.09, -0.55, -0.1, M.inkDark);
  detail(tiles[1].t, 0.42, 0.14, -0.78, 0.22, M.inkDark);
  [3, 4, 5].forEach((i) => {
    detail(tiles[i].t, 0.3, 0.3, -0.36, 0, M.chrome);
    detail(tiles[i].t, 0.55, 0.05, 0.17, -0.07);
    detail(tiles[i].t, 0.4, 0.05, 0.1, 0.06);
  });
  detail(tiles[0].t, 0.32, 0.06, -1.6, 0, M.accent);
  [0.6, 0.95, 1.3].forEach((x) => detail(tiles[0].t, 0.22, 0.04, x, 0));

  // Scan line (ink) that sweeps the slab as the build goes live; the hero
  // block turns lime behind it.
  const scan = new THREE.Mesh(
    new THREE.BoxGeometry(4.24, 0.01, 0.02),
    new THREE.MeshBasicMaterial({ color: '#15171a' }),
  );
  scan.position.y = SLAB_H + 0.13;
  scene.add(scan);

  // Phone carrying the same layout in miniature.
  const phone = new THREE.Group();
  const pBody = slab(0.95, 0.12, 1.8, M.body, M.edge, 0.08);
  pBody.position.y = 0.06;
  phone.add(pBody);
  const pTiles = [
    { w: 0.75, d: 0.5, z: -0.5, mat: heroMat },
    { w: 0.75, d: 0.34, z: 0.0, mat: M.chrome },
    { w: 0.75, d: 0.22, z: 0.36, mat: M.frost },
    { w: 0.75, d: 0.22, z: 0.64, mat: M.frost },
  ].map((s) => {
    const t = slab(s.w, 0.04, s.d, s.mat, M.edge, 0.015);
    t.position.set(0, 0.14, s.z);
    phone.add(t);
    return t;
  });
  scene.add(phone);

  const LOOP = 9.5;
  return (time: number) => {
    const t = time % LOOP;
    tiles.forEach((tile, i) => {
      const land = outBack(seg(t, 0.7 + i * 0.32, 1.6 + i * 0.32), 1.1);
      const lift = inOut(seg(t, 7.9 + i * 0.06, 8.9 + i * 0.06));
      const k = clamp01(land - lift);
      const bob = Math.sin(time * 1.3 + tile.phase) * 0.06 * (1 - k);
      tile.t.position.lerpVectors(tile.away, tile.home, k);
      tile.t.position.y += bob;
      tile.t.rotation.set(tile.rot.x * (1 - k), tile.rot.y * (1 - k), tile.rot.z * (1 - k));
    });

    // Go live: scan sweeps back→front, hero block turns lime behind it.
    const sweep = inOut(seg(t, 3.0, 3.9));
    scan.position.z = lerp(-1.4, 1.4, sweep);
    scan.visible = sweep > 0 && sweep < 1;
    const live = clamp01(inOut(seg(t, 3.35, 3.9)) - inOut(seg(t, 7.6, 8.2)));
    // Going live: the white hero block fills with the exact brand lime.
    heroMat.color.copy(WHITE).lerp(LIME, live);

    // Phone rides in from the right, holds, rides out.
    const pin = outQuint(seg(t, 4.1, 5.0));
    const pout = inOut(seg(t, 7.3, 8.0));
    phone.position.set(lerp(6.4, 3.0, pin) + pout * 3.4, 0, 0.95);
    phone.rotation.y = lerp(-0.5, 0, pin) + pout * -0.3;
    phone.visible = pin > 0.001 && pout < 0.999;   // parked off-frame otherwise
    pTiles.forEach((pt, i) => {
      const pop = outBack(seg(t, 4.6 + i * 0.12, 5.1 + i * 0.12), 1.6);
      pt.scale.setScalar(Math.max(0.0001, pop));
    });
  };
}

/* ------------------------------------------------------------------- brand */

function buildBrand(scene: THREE.Group, M: Mats) {
  const S = 2.6;
  const H = 0.1;

  // Plate 1 — foundation grid.
  const base = slab(S, H, S, M.body, M.edge, 0.05);
  const gridPts: number[] = [];
  const N = 8;
  for (let i = 1; i < N; i++) {
    const c = -S / 2 + (S * i) / N;
    gridPts.push(c, H / 2 + 0.002, -S / 2, c, H / 2 + 0.002, S / 2);
    gridPts.push(-S / 2, H / 2 + 0.002, c, S / 2, H / 2 + 0.002, c);
  }
  const gridGeo = new THREE.BufferGeometry();
  gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridPts, 3));
  base.add(new THREE.LineSegments(gridGeo, new THREE.LineBasicMaterial({ color: '#15171a', transparent: true, opacity: 0.22 })));
  scene.add(base);

  // Plate 2 — colour + type.
  const mid = slab(S, H, S, M.frost, M.edgeHi, 0.05);
  const swatchMats = [0, 1, 2, 3].map(() => M.chrome.clone());   // solid, so the palette reads
  const swatches = swatchMats.map((m, i) => {
    const sw = slab(0.42, 0.06, 0.42, m, M.edge, 0.03);
    sw.position.set(-0.84 + i * 0.56, H / 2 + 0.03, -0.62);
    mid.add(sw);
    return sw;
  });
  [0.95, 1.6, 1.25].forEach((w, i) => {
    const bar = slab(w, 0.03, 0.12, i === 0 ? M.chrome : M.ink, M.edge, 0.01);
    bar.position.set(-1.0 + w / 2, H / 2 + 0.015, 0.12 + i * 0.28);
    mid.add(bar);
  });
  scene.add(mid);

  // Plate 3 — a solid ink plate carrying the mark: four blocks around a white cross.
  const top = new THREE.Group();
  const glass = new THREE.Mesh(new THREE.BoxGeometry(S, H * 0.6, S), M.glass);
  top.add(glass);
  top.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(S, H * 0.6, S)), M.edgeHi));
  const mark = new THREE.Group();
  const blocks = [-1, 1].flatMap((sx) =>
    [-1, 1].map((sz) => {
      const b = slab(0.42, 0.42, 0.42, M.chrome, M.edge, 0.06);
      mark.add(b);
      return { b, sx, sz };
    }),
  );
  const crossA = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.07, 0.07), M.hi);
  const crossB = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 1.0), M.hi);
  crossA.position.y = crossB.position.y = 0.21;
  mark.add(crossA, crossB);
  mark.position.y = H * 0.3 + 0.21;
  top.add(mark);
  scene.add(top);

  // Explode dimension rail on the front-left corner.
  const railGeo = new THREE.BufferGeometry();
  railGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Array(18).fill(0), 3));
  const rail = new THREE.LineSegments(railGeo, M.edgeHi);
  scene.add(rail);

  // Scan plane that passes up through the stack each round.
  const scan = new THREE.Mesh(
    new THREE.BoxGeometry(S + 0.3, 0.008, S + 0.3),
    // No fill (no see-through plates): the scan reads as its outline alone.
    new THREE.MeshBasicMaterial({ color: WHITE, transparent: true, opacity: 0, depthWrite: false }),
  );
  const scanEdge = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(S + 0.3, 0.008, S + 0.3)),
    new THREE.LineBasicMaterial({ color: WHITE }),
  );
  scan.add(scanEdge);
  scene.add(scan);

  // Swatch palettes: each round moves the plate one step, P[r] → P[r+1] —
  // all ink → paper and ink → refined. No greys.
  const INK = new THREE.Color('#111316');
  const P = [
    [INK, INK, INK, INK],
    [WHITE, INK, WHITE, INK],
    [INK, WHITE, WHITE, INK],
    [INK, WHITE, WHITE, INK],
  ];
  const tmp = new THREE.Color();

  const LOOP = 10;
  const ROUND0 = 1.4;
  const ROUND = 1.9;
  return (time: number) => {
    const t = time % LOOP;
    const explode = clamp01(inOut(seg(t, 0.2, 1.3)) - outBack(seg(t, 7.3, 8.1), 1.4));
    const gap = lerp(0.0, 0.78, explode);
    base.position.y = H / 2;
    mid.position.y = H / 2 + H + gap;
    top.position.y = H / 2 + 2 * H + 2 * gap - H * 0.2;

    const r = Math.floor((t - ROUND0) / ROUND);
    const inRound = t >= ROUND0 && r < 3;
    const rp = inRound ? (t - ROUND0 - r * ROUND) / ROUND : 0;

    scan.visible = inRound && rp < 0.55;
    scan.position.y = lerp(-0.05, top.position.y + 0.5, inOut(seg(rp, 0, 0.55)));

    // Swatches change as the scan passes plate 2; the active one hops up.
    const reset = inOut(seg(t, 9.2, 9.9));
    swatchMats.forEach((m, i) => {
      if (t < ROUND0) tmp.copy(P[0][i]);
      else if (inRound) tmp.copy(P[r][i]).lerp(P[r + 1][i], inOut(seg(rp, 0.2, 0.45)));
      else tmp.copy(P[3][i]);
      tmp.lerp(P[0][i], reset);
      const limeness = clamp01((tmp.g - tmp.b - 0.5) * 2.5);
      m.color.copy(tmp).multiplyScalar(1 - limeness);
      // Whites keep their emissive floor (so they stay white); lime glows.
      m.emissive.copy(tmp).multiplyScalar(0.55 * (1 - limeness)).add(LIME.clone().multiplyScalar(limeness));
      const hop = inRound && i === (r + 1) % 4 ? Math.sin(Math.PI * seg(rp, 0.15, 0.5)) * 0.12 : 0;
      swatches[i].position.y = H / 2 + 0.03 + hop;
    });

    // Mark: a quarter turn per round (four-fold symmetric, so the loop seam is
    // invisible), and the blocks pull tighter with every iteration.
    const turn = t < ROUND0 ? 0 : inRound ? r + inOut(seg(rp, 0.45, 0.9)) : 3;
    mark.rotation.y = (Math.PI / 2) * turn;
    const tight = lerp(0.3, 0.232, (turn / 3) * (1 - reset));
    blocks.forEach(({ b, sx, sz }) => b.position.set(sx * tight, 0, sz * tight));

    // Press-together flash on the glass edge.
    const press = Math.sin(Math.PI * seg(t, 7.8, 8.5));
    (M.edgeHi as THREE.LineBasicMaterial).opacity = 0.55 + 0.45 * press;
    M.glass.opacity = 0.38 + 0.2 * press;

    // Dimension rail tracks the explode height.
    const x = -S / 2 - 0.28;
    const z = S / 2 + 0.28;
    const y0 = H;
    const y1 = top.position.y;
    const p = railGeo.attributes.position as THREE.BufferAttribute;
    p.setXYZ(0, x, y0, z); p.setXYZ(1, x, y1, z);
    p.setXYZ(2, x - 0.08, y0, z); p.setXYZ(3, x + 0.08, y0, z);
    p.setXYZ(4, x - 0.08, y1, z); p.setXYZ(5, x + 0.08, y1, z);
    p.needsUpdate = true;
    rail.visible = explode > 0.05;
  };
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
  // The photo panel is the card's one lime: the house sits on it like a print.
  const photo = slab(1.5, 0.02, 1.12, M.lime, M.edge, 0.01);
  photo.position.set(0, 0.025, -0.44);
  flyer.add(photo);
  const house = new THREE.Group();
  const walls = slab(0.62, 0.36, 0.44, M.body, M.edge, 0.02);
  walls.position.y = 0.18;
  house.add(walls);
  const top = roof(0.74, 0.28, 0.5, M.ink);
  top.position.y = 0.36;
  house.add(top);
  const door = slab(0.12, 0.2, 0.02, M.accent, M.edgeHi, 0.005);
  door.position.set(-0.12, 0.1, 0.225);
  house.add(door);
  [0.1, 0.23].forEach((x) => {
    const w = slab(0.1, 0.1, 0.02, M.inkDark, M.edge, 0.005);   // windows read dark on white walls
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
  line(0.34, 0.92, M.accent);   // open-house tag
  flyer.position.set(-0.95, 0.03, -0.1);
  scene.add(flyer);

  // Five social posts — dealt out of the flyer into a fan.
  const posts = [0, 1, 2, 3, 4].map((i) => {
    const g = new THREE.Group();
    g.add(slab(0.66, 0.03, 0.66, M.body, M.edge, 0.012));
    const img = slab(0.56, 0.015, 0.4, M.frost, M.edge, 0.006);
    img.position.set(0, 0.02, -0.08);
    g.add(img);
    const tag = slab(i === 0 ? 0.32 : 0.22, 0.012, 0.06, i === 0 ? (M.accent) : M.ink, M.edge, 0.004);
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

  // Vertical video on a phone, with a play mark and a progress bar.
  // Built lying flat (screen up), then stood upright facing the camera.
  const phone = new THREE.Group();
  const handset = new THREE.Group();
  handset.add(slab(0.66, 0.06, 1.2, M.body, M.edge, 0.06));
  const screen = slab(0.56, 0.01, 1.04, M.frost, M.edge, 0.02);
  screen.position.y = 0.035;
  handset.add(screen);
  const play = roof(0.2, 0.18, 0.02, M.hi);
  play.rotation.set(-Math.PI / 2, 0, -Math.PI / 2);
  play.position.set(-0.04, 0.05, -0.05);
  handset.add(play);
  const track = slab(0.46, 0.008, 0.025, M.ink, M.edge, 0.004);
  track.position.set(0, 0.045, 0.42);
  handset.add(track);
  const bar = new THREE.Mesh(new THREE.BoxGeometry(1, 0.012, 0.03), M.hi);
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

  // After: one quiet column — a soft photo, a large headline, one button.
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
  const cta = slab(0.95, 0.08, 0.24, M.accent, M.edgeHi, 0.1);
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
  const pBtn = slab(0.4, 0.03, 0.11, M.accent, M.edgeHi, 0.05);
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
  // Small card canvases: 1.5× on desktop retina is visually the same as 2×
  // with ~44% fewer pixels; phones go lower still.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.25 : 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;   // whites stay white, lime stays lime
  renderer.toneMappingExposure = 1.0;
  renderer.domElement.className = 'svc-scene-canvas';
  // Reading shader logs back stalls the main thread on every first draw.
  renderer.debug.checkShaderErrors = false;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight('#f2f6fa', '#1a1c20', 1.1));
  const key = new THREE.DirectionalLight('#ffffff', 1.9);
  key.position.set(3.5, 8, 4);
  scene.add(key);
  // Cool rim from front-left, low — its highlight lands on the slabs' side
  // faces (crisp edges), never flooding the flat tops.
  const rim = new THREE.DirectionalLight('#e6eeff', 0.8);
  rim.position.set(-5, 2, 6);
  scene.add(rim);

  const M = materials();
  const rig = new THREE.Group();
  scene.add(rig);
  const BUILD = { design: buildDesign, brand: buildBrand, listing: buildListing, practice: buildPractice };
  const update = BUILD[variant](rig, M);

  // Isometric orthographic camera.
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  const camBase = new THREE.Vector3(7, 6.2, 7);
  camera.position.copy(camBase);
  const FOCUS = {
    design: new THREE.Vector3(0.5, 0.85, 0),
    brand: new THREE.Vector3(0, 1.0, 0),
    listing: new THREE.Vector3(0.45, 0.45, -0.1),
    practice: new THREE.Vector3(0.55, 0.7, 0),
  };
  const focus = FOCUS[variant];
  camera.lookAt(focus);
  const VIEW = { design: 2.6, brand: 2.25, listing: 2.15, practice: 2.6 }[variant];   // half-height of the view in world units

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
    if (opts.reduced && compiled) render(0);
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

  const STILL = { design: 6.2, brand: 8.8, listing: 6.0, practice: 7.5 }[variant];   // a composed, fully-assembled moment
  let start = performance.now();
  let ready = false;
  let compiled = false;
  let disposed = false;
  const render = (now: number) => {
    const t = opts.reduced ? STILL : (now - start) / 1000;
    update(t);
    tilt.x += (tilt.tx - tilt.x) * 0.11;
    tilt.y += (tilt.ty - tilt.y) * 0.11;
    rig.rotation.y = tilt.x * 0.14 + (opts.reduced ? 0 : Math.sin(t * 0.35) * 0.04);
    rig.rotation.x = tilt.y * 0.05;
    renderer.render(scene, camera);
    if (!ready) {
      ready = true;
      opts.onReady();
    }
  };

  // The scenes are slow, deliberate builds: 30fps reads the same and halves
  // the GPU work of four canvases on one panel.
  const FRAME_MS = 1000 / 30;
  let raf = 0;
  let last = 0;
  let visible = false;
  let covered = false;
  let pausedAt = 0;
  const loop = (now: number) => {
    raf = 0;
    if (!visible || covered || document.hidden) {
      pausedAt = now;
      return;
    }
    if (now - last >= FRAME_MS - 2) {
      last = now;
      render(now);
    }
    raf = requestAnimationFrame(loop);
  };
  const kick = () => {
    if (opts.reduced || !compiled) return;
    if (visible && !covered && !document.hidden && !raf) {
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
  // Sticky panel: pause once the next panel has slid over it.
  const unwatch = watchCovered(host, (c) => {
    covered = c;
    kick();
  });
  document.addEventListener('visibilitychange', kick);
  // Shaders link off the main thread (KHR_parallel_shader_compile); the first
  // frame (and onReady) follows once they're ready, regardless of visibility.
  update(opts.reduced ? STILL : 0);
  renderer.compileAsync(scene, camera).then(() => {
    if (disposed) return;
    compiled = true;
    start = performance.now();
    render(start);
    kick();
  });

  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    unwatch();
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
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  };
}
