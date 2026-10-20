'use client';

import { useEffect, useRef } from 'react';
import '@/app/scenes.css';

/**
 * The qbix cube, drawn flat: 27 pieces in an axonometric view, each face one
 * tone of the light (top brightest, then the lit side, then the side away),
 * the seams between them showing. The six face centres are windows: a
 * shallow well in each, its floor the lime core. It gathers out of an exploded
 * view when it first shows, then a layer turns every few seconds, like a
 * puzzle cube, and it leans a little toward the pointer. Canvas 2D, drawn
 * only while something moves.
 */

type V3 = [number, number, number];
type M3 = number[]; // row-major 3×3

const I3: M3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];
const mul = (a: M3, b: M3): M3 => {
  const o = new Array(9).fill(0);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) o[r * 3 + c] = a[r * 3] * b[c] + a[r * 3 + 1] * b[3 + c] + a[r * 3 + 2] * b[6 + c];
  return o;
};
const apply = (m: M3, v: V3): V3 => [m[0] * v[0] + m[1] * v[1] + m[2] * v[2], m[3] * v[0] + m[4] * v[1] + m[5] * v[2], m[6] * v[0] + m[7] * v[1] + m[8] * v[2]];
const rotAxis = (axis: number, a: number): M3 => {
  const c = Math.cos(a), s = Math.sin(a);
  if (axis === 0) return [1, 0, 0, 0, c, -s, 0, s, c];
  if (axis === 1) return [c, 0, s, 0, 1, 0, -s, 0, c];
  return [c, -s, 0, s, c, 0, 0, 0, 1];
};
const round3 = (m: M3): M3 => m.map((x) => Math.round(x));
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

type Piece = { p: V3; R: M3; home: V3; core: boolean; window: boolean };

const GAP = 0.06;           // between pieces, as a share of a piece
const PITCH = 1 + GAP;      // centre to centre
const CORE = 0.34;          // the core's half size
const FRAME = 0.17;         // a window's frame, as a share of its face
const WELL = 0.34;          // how deep a window's well goes, as a share of a half piece

// the six faces of a piece: normal, and two axes along the face
const FACES: { n: V3; u: V3; v: V3 }[] = [
  { n: [1, 0, 0], u: [0, 1, 0], v: [0, 0, 1] },
  { n: [-1, 0, 0], u: [0, 0, 1], v: [0, 1, 0] },
  { n: [0, 1, 0], u: [0, 0, 1], v: [1, 0, 0] },
  { n: [0, -1, 0], u: [1, 0, 0], v: [0, 0, 1] },
  { n: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] },
  { n: [0, 0, -1], u: [0, 1, 0], v: [1, 0, 0] },
];

type Palette = { hi: [number, number, number]; lo: [number, number, number]; inside: string; limeHi: [number, number, number]; limeLo: [number, number, number] };
const PALETTES: Record<'dark' | 'paper', Palette> = {
  // white pieces in a studio light, on the black page
  dark: { hi: [250, 251, 248], lo: [128, 132, 127], inside: '#060708', limeHi: [208, 255, 72], limeLo: [140, 196, 0] },
  // ink pieces on paper
  paper: { hi: [92, 96, 102], lo: [12, 13, 15], inside: '#050506', limeHi: [208, 255, 72], limeLo: [140, 196, 0] },
};
const LIGHT = norm([-0.42, 1, 0.62]);

export default function IsoCube({
  className = '',
  label = 'The qbix cube: 27 pieces around a lime core, a layer turning now and then',
  lime = true,
}: {
  className?: string;
  label?: string;
  /** false where the screen's one lime is something else (a form's button): the wells are dark */
  lime?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia('(pointer: fine)').matches;
    const toneOf = () => ((canvas.closest<HTMLElement>('[data-tone]')?.dataset.tone === 'paper' ? 'paper' : 'dark') as 'dark' | 'paper');
    let pal = PALETTES[toneOf()];

    // the pieces, solved
    const pieces: Piece[] = [];
    for (let x = -1; x <= 1; x++)
      for (let y = -1; y <= 1; y++)
        for (let z = -1; z <= 1; z++) {
          const zeros = (x === 0 ? 1 : 0) + (y === 0 ? 1 : 0) + (z === 0 ? 1 : 0);
          pieces.push({ p: [x, y, z], R: I3, home: [x, y, z], core: zeros === 3, window: zeros === 2 });
        }

    /* sizing */
    let W = 0, H = 0, dpr = 1, scale = 1;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(1, r.width);
      H = Math.max(1, r.height);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      // the solved cube's outline in this view spans about 5.6 units across its widest
      scale = Math.min(W, H) / 5.9;
      dirty = true;
    };

    /* the view: a three-quarter view from above, leaning toward the pointer */
    let yaw = -0.62, pitch = 0.5;
    let lean = { x: 0, y: 0 }, leanS = { x: 0, y: 0 };
    let view: M3 = I3;
    const setView = () => {
      view = mul(rotAxis(0, pitch + leanS.y * 0.08), rotAxis(1, yaw + leanS.x * 0.14));
    };

    /* the motion: gathering, then turns */
    let gatherAt: number | null = null;
    let sawSplash = false;
    type Turn = { axis: number; layer: number; dir: number; start: number; dur: number };
    let turn: Turn | null = null;
    let nextTurnAt = 0;
    let lastTurn: Turn | null = null;
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

    const startTurn = (now: number) => {
      let axis = 0, layer = 0, dir = 1;
      for (let i = 0; i < 8; i++) {
        axis = Math.floor(rnd() * 3);
        layer = [-1, 0, 1][Math.floor(rnd() * 3)];
        dir = rnd() < 0.5 ? -1 : 1;
        // never just undo the last turn
        if (!lastTurn || !(lastTurn.axis === axis && lastTurn.layer === layer && lastTurn.dir === -dir)) break;
      }
      turn = { axis, layer, dir, start: now, dur: 780 };
    };
    const endTurn = (tr: Turn) => {
      const m = round3(rotAxis(tr.axis, (tr.dir * Math.PI) / 2));
      for (const pc of pieces) {
        if (pc.p[tr.axis] !== tr.layer) continue;
        pc.p = apply(m, pc.p).map((v) => Math.round(v)) as V3;
        pc.R = round3(mul(m, pc.R));
      }
      lastTurn = tr;
    };

    /* drawing */
    const col = (c: [number, number, number]) => `rgb(${c[0]},${c[1]},${c[2]})`;
    const shade = (n: V3, green = false) => {
      // how much light the face takes (its normal in the world, not the view)
      const b = clamp01(0.5 + 0.5 * dot(n, LIGHT));
      const k = Math.pow(b, 1.15);
      const [hi, lo] = green ? [pal.limeHi, pal.limeLo] : [pal.hi, pal.lo];
      return col([lo[0] + (hi[0] - lo[0]) * k, lo[1] + (hi[1] - lo[1]) * k, lo[2] + (hi[2] - lo[2]) * k]);
    };
    const project = (w: V3): [number, number, number] => {
      const v = apply(view, w);
      return [W / 2 + v[0] * scale, H / 2 + 0.06 * H - v[1] * scale, v[2]];
    };
    const poly = (pts: [number, number, number][]) => {
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(p[0] * dpr, p[1] * dpr) : ctx.moveTo(p[0] * dpr, p[1] * dpr)));
      ctx.closePath();
    };

    // a square face: centre c, its axes u and v (world, scaled to half its size)
    const corners = (c: V3, u: V3, v: V3, k = 1): [number, number, number][] => [
      project([c[0] + (u[0] + v[0]) * k, c[1] + (u[1] + v[1]) * k, c[2] + (u[2] + v[2]) * k]),
      project([c[0] + (u[0] - v[0]) * k, c[1] + (u[1] - v[1]) * k, c[2] + (u[2] - v[2]) * k]),
      project([c[0] + (-u[0] - v[0]) * k, c[1] + (-u[1] - v[1]) * k, c[2] + (-u[2] - v[2]) * k]),
      project([c[0] + (-u[0] + v[0]) * k, c[1] + (-u[1] + v[1]) * k, c[2] + (-u[2] + v[2]) * k]),
    ];
    const viewZ = (n: V3) => apply(view, n)[2];

    /** A piece: its centre, its rotation, its half size; the core is lime. */
    const drawBox = (c: V3, M: M3, h: number, green: boolean, windowN: V3 | null) => {
      for (const f of FACES) {
        const n = apply(M, f.n);
        if (viewZ(n) <= 0.0001) continue;
        const u = apply(M, f.u).map((x) => x * h) as V3;
        const v = apply(M, f.v).map((x) => x * h) as V3;
        const fc: V3 = [c[0] + n[0] * h, c[1] + n[1] * h, c[2] + n[2] * h];
        const outer = corners(fc, u, v);
        const isWindow = windowN && dot(n, windowN) > 0.9;
        if (!isWindow) {
          poly(outer);
          ctx.fillStyle = shade(n, green);
          ctx.fill();
          continue;
        }
        // a window: a shallow well in the face, its floor the lime core
        const k = 1 - FRAME * 2;
        const hole = corners(fc, u, v, k);
        const depth = WELL * h;
        const floorC: V3 = [fc[0] - n[0] * depth, fc[1] - n[1] * depth, fc[2] - n[2] * depth];
        const floor = corners(floorC, u, v, k);
        ctx.save();
        poly(hole);
        ctx.clip();
        poly(floor);
        ctx.fillStyle = lime ? shade(n, true) : pal.inside;
        ctx.fill();
        // the well's walls that face us
        for (let e = 0; e < 4; e++) {
          const a = hole[e], b = hole[(e + 1) % 4], b2 = floor[(e + 1) % 4], a2 = floor[e];
          // corners go +u+v, +u−v, −u−v, −u+v: edge 0 is the +u side, 1 the −v side, 2 the −u side, 3
          // the +v side; each wall faces into the well, away from its side
          const side: V3 = e === 0 ? u : e === 1 ? (v.map((x) => -x) as V3) : e === 2 ? (u.map((x) => -x) as V3) : v;
          const wn = norm(side.map((x) => -x) as V3);
          if (viewZ(wn) <= 0) continue;
          poly([a, b, b2, a2]);
          ctx.fillStyle = shade(wn);
          ctx.fill();
        }
        ctx.restore();
        // the frame
        ctx.beginPath();
        outer.forEach((p, i) => (i ? ctx.lineTo(p[0] * dpr, p[1] * dpr) : ctx.moveTo(p[0] * dpr, p[1] * dpr)));
        ctx.closePath();
        hole
          .slice()
          .reverse()
          .forEach((p, i) => (i ? ctx.lineTo(p[0] * dpr, p[1] * dpr) : ctx.moveTo(p[0] * dpr, p[1] * dpr)));
        ctx.closePath();
        ctx.fillStyle = shade(n);
        ctx.fill('evenodd');
      }
    };

    let dirty = true;
    const draw = (now: number) => {
      setView();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // gathering: each piece comes in from an exploded view, the farthest first
      const g = gatherAt === null ? 0 : reduced ? 1 : clamp01((now - gatherAt) / 1800);
      const tr = turn;
      const k = tr ? easeInOut(clamp01((now - tr.start) / tr.dur)) : 0;
      const turning = tr ? rotAxis(tr.axis, (tr.dir * Math.PI * k) / 2) : I3;

      type Item = { pc: Piece; c: V3; M: M3; depth: number; slab: number };
      const items: Item[] = pieces.map((pc) => {
        const moving = tr && pc.p[tr.axis] === tr.layer;
        const dist = Math.hypot(pc.home[0], pc.home[1], pc.home[2]);
        const gi = easeOut(clamp01((g - (1 - dist / 1.8) * 0.35) / 0.65));
        const spread = 1 + 0.75 * (1 - gi);
        let c: V3 = [pc.p[0] * PITCH * spread, pc.p[1] * PITCH * spread, pc.p[2] * PITCH * spread];
        let M = pc.R;
        if (moving) {
          c = apply(turning, c);
          M = mul(turning, M);
        }
        return { pc, c, M, depth: apply(view, c)[2], slab: tr ? pc.p[tr.axis] : 0 };
      });
      // far slabs first (across the turning layer's planes), then far pieces first
      const axisZ = tr ? apply(view, tr.axis === 0 ? [1, 0, 0] : tr.axis === 1 ? [0, 1, 0] : [0, 0, 1])[2] : 0;
      items.sort((a, b) => (tr ? (a.slab - b.slab) * Math.sign(axisZ || 1) : 0) || a.depth - b.depth);

      for (const it of items) {
        if (gatherAt === null) continue;
        if (it.pc.core) {
          drawBox(it.c, it.M, CORE, lime, null);
          continue;
        }
        // a window piece's outward face, in its own frame, faces where it sits when solved
        const wn = it.pc.window ? apply(it.M, it.pc.home) : null;
        drawBox(it.c, it.M, 0.5, false, wn);
      }
      dirty = false;
    };

    /* the loop: only while something moves */
    let raf = 0, visible = false;
    const loop = (now: number) => {
      raf = 0;
      if (!visible) return;
      // after the splash: once its halves have parted enough to see it gather
      const splashUp = (window as unknown as { __qbixSplashDone?: boolean }).__qbixSplashDone === false;
      if (splashUp) sawSplash = true;
      if (gatherAt === null && !splashUp) {
        gatherAt = now + (sawSplash ? 380 : 0);
        nextTurnAt = gatherAt + (reduced ? Infinity : 2400);
      }
      // the pointer lean, eased
      leanS.x += (lean.x - leanS.x) * 0.08;
      leanS.y += (lean.y - leanS.y) * 0.08;
      const leaning = Math.abs(lean.x - leanS.x) > 0.001 || Math.abs(lean.y - leanS.y) > 0.001;
      if (turn && now >= turn.start + turn.dur) {
        endTurn(turn);
        turn = null;
        nextTurnAt = now + 2400 + rnd() * 1400;
        dirty = true;
      }
      if (!turn && gatherAt !== null && !reduced && now >= nextTurnAt) startTurn(now);
      const gathering = gatherAt !== null && now - gatherAt < 1900;
      if (gatherAt !== null && now < gatherAt) dirty = true;
      if (dirty || leaning || turn || gathering) draw(now);
      raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      if (!raf && visible) raf = requestAnimationFrame(loop);
    };

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      kick();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) {
        pal = PALETTES[toneOf()];
        dirty = true;
        kick();
      }
    });
    io.observe(canvas);
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      lean = { x: (e.clientX / window.innerWidth) * 2 - 1, y: (e.clientY / window.innerHeight) * 2 - 1 };
      kick();
    };
    if (fine && !reduced) window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
    };
  }, [lime]);

  return <canvas ref={ref} className={`iso-cube ${className}`} role="img" aria-label={label} />;
}
