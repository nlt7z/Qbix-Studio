'use client';

import { useEffect, useRef } from 'react';

/**
 * The 404's blocks: 4, 0, 4 and "Not built yet" drop onto the floor of the screen, and any of them
 * can be picked up and thrown (Qbix Motion's Physics 404). A small 2D rigid body engine: oriented
 * boxes, separating-axis contacts clipped to the touching edge, sequential impulses with friction
 * and warm starting; the pointer holds a block by the point it touched through a soft joint.
 * Blocks are flat, the top right corner cut like the site's buttons, in the white page's ink and sage;
 * the 0 is the screen's one lime. On a touch screen the page scrolls under a finger that misses the
 * blocks (the canvas is touch-action: pan-y); one that lands on a block holds it and the page stays.
 * With reduced motion they're settled before the first frame and stay still.
 */

type Spec = { t: string; k: 'd' | 'w'; fill: string; ink: string };
type Body = Spec & {
  id: number; x: number; y: number; a: number; vx: number; vy: number; w: number;
  hw: number; hh: number; m: number; im: number; iI: number; stat: boolean;
};
type Wall = Omit<Body, keyof Spec>;
type Solid = Body | Wall;
type V = [number, number];
type Contact = { p: V; depth: number; key: string; rA: V; rB: V; mn: number; mt: number; bias: number; bounce: number; Pn: number; Pt: number };
type Manifold = { A: Solid; B: Solid; n: V; pts: Contact[] };
type Joint = { b: Body; lx: number; ly: number; tx: number; ty: number };

// blocks.css: the near-black, the sage tiles, the sage a step down for the floor
const INK = '#0B0C0D';
const WHITE = '#FFFFFF';
const SAGE = '#EEF1E8';
const FLOOR = '#E3E8DA';
const SPEC: Spec[] = [
  { t: '4', k: 'd', fill: INK, ink: WHITE },
  { t: '0', k: 'd', fill: '#B8FF00', ink: INK },
  { t: '4', k: 'd', fill: SAGE, ink: INK },
  { t: 'Not', k: 'w', fill: SAGE, ink: INK },
  { t: 'built', k: 'w', fill: INK, ink: WHITE },
  { t: 'yet', k: 'w', fill: SAGE, ink: INK },
];
// contact: allowed overlap, position correction, friction, bounce (only above 120 px/s)
const SLOP = 0.6, BETA = 0.18, MU = 0.55, E = 0.12;

const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1];
const axes = (b: Solid): V => [Math.cos(b.a), Math.sin(b.a)];
function verts(b: Solid): V[] {
  const [c, s] = axes(b);
  return ([[-b.hw, -b.hh], [b.hw, -b.hh], [b.hw, b.hh], [-b.hw, b.hh]] as V[]).map(([x, y]) => [b.x + c * x - s * y, b.y + s * x + c * y]);
}
function norms(b: Solid): V[] {
  const [c, s] = axes(b);
  return [[s, -c], [c, s], [-s, c], [-c, -s]];
}
function maxSep(va: V[], na: V[], vb: V[]): [number, number] {
  let best = -1e9, bi = 0;
  for (let i = 0; i < 4; i++) {
    const n = na[i], v = va[i];
    let mn = 1e9;
    for (const p of vb) mn = Math.min(mn, n[0] * (p[0] - v[0]) + n[1] * (p[1] - v[1]));
    if (mn > best) { best = mn; bi = i; }
  }
  return [best, bi];
}
function clip(pts: V[], n: V, o: number): V[] {
  const out: V[] = [], d0 = dot(n, pts[0]) - o, d1 = dot(n, pts[1]) - o;
  if (d0 <= 0) out.push(pts[0]);
  if (d1 <= 0) out.push(pts[1]);
  if (d0 * d1 < 0) {
    const u = d0 / (d0 - d1);
    out.push([pts[0][0] + u * (pts[1][0] - pts[0][0]), pts[0][1] + u * (pts[1][1] - pts[0][1])]);
  }
  return out;
}
function collide(A: Solid, B: Solid): Manifold | null {
  const va = verts(A), vb = verts(B), na = norms(A), nb = norms(B);
  const [sa, fa] = maxSep(va, na, vb);
  if (sa > 0) return null;
  const [sb, fb] = maxSep(vb, nb, va);
  if (sb > 0) return null;
  const flip = sb > sa + 0.5;
  const [vr, vi, nr, ni, f] = flip ? [vb, va, nb, na, fb] : [va, vb, na, nb, fa];
  const n = nr[f], v1 = vr[f], v2 = vr[(f + 1) % 4];
  let ii = 0, md = 1e9;
  for (let i = 0; i < 4; i++) {
    const d = dot(ni[i], n);
    if (d < md) { md = d; ii = i; }
  }
  let pts: V[] = [vi[ii], vi[(ii + 1) % 4]];
  const tl = Math.hypot(v2[0] - v1[0], v2[1] - v1[1]), t: V = [(v2[0] - v1[0]) / tl, (v2[1] - v1[1]) / tl];
  pts = clip(pts, [-t[0], -t[1]], -dot(t, v1));
  if (pts.length < 2) return null;
  pts = clip(pts, t, dot(t, v2));
  if (pts.length < 2) return null;
  const front = dot(n, v1), out: Contact[] = [];
  pts.forEach((p, k) => {
    const sep = dot(n, p) - front;
    if (sep <= 0.5) {
      out.push({
        p: [p[0] - n[0] * sep * 0.5, p[1] - n[1] * sep * 0.5], depth: -sep,
        key: `${A.id}_${B.id}_${f}${flip ? 'f' : ''}_${ii}_${k}`,
        rA: [0, 0], rB: [0, 0], mn: 0, mt: 0, bias: 0, bounce: 0, Pn: 0, Pt: 0,
      });
    }
  });
  return out.length ? { A, B, n: flip ? [-n[0], -n[1]] : n, pts: out } : null;
}
const relv = (A: Solid, B: Solid, c: Contact): V => [
  B.vx - B.w * c.rB[1] - A.vx + A.w * c.rA[1],
  B.vy + B.w * c.rB[0] - A.vy - A.w * c.rA[0],
];
function apply(A: Solid, B: Solid, c: Contact, P: V) {
  A.vx -= P[0] * A.im; A.vy -= P[1] * A.im; A.w -= A.iI * (c.rA[0] * P[1] - c.rA[1] * P[0]);
  B.vx += P[0] * B.im; B.vy += P[1] * B.im; B.w += B.iI * (c.rB[0] * P[1] - c.rB[1] * P[0]);
}

export default function NotFoundBlocks({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const FONT = getComputedStyle(cv).fontFamily;
    let W = 0, H = 0, dpr = 1, G = 2200, TH = 100, OX = 0, OY = 0, idc = 0;
    let bodies: Body[] = [], walls: Wall[] = [];
    // bodies not dropped yet, each with the time (s) it drops at, on the world's own clock
    let pending: { b: Body; at: number }[] = [], clock = 0;
    let cache = new Map<string, V>(), asleep = false, still = 0, joint: Joint | null = null;

    const mkWall = (x: number, y: number, hw: number, hh: number): Wall => ({ id: idc++, x, y, a: 0, vx: 0, vy: 0, w: 0, hw, hh, m: 0, im: 0, iI: 0, stat: true });
    const mkBody = (s: Spec, x: number, y: number, hw: number, hh: number, a: number): Body => {
      const m = (hw * hh * 4) / 1000;
      return { ...s, id: idc++, x, y, a, vx: 0, vy: 200, w: 0, hw, hh, m, im: 1 / m, iI: 1 / ((m * ((2 * hw) ** 2 + (2 * hh) ** 2)) / 12), stat: false };
    };
    const blockH = () => Math.max(64, Math.min(W * 0.22, H * 0.27, 190));
    const wordW = (t: string) => {
      ctx.font = `${TH * 0.34}px ${FONT}`;
      return ctx.measureText(t).width;
    };
    // 4 0 4 land first, nearly upright; once they've settled each word drops onto one of them, so the
    // first look reads. A word that lands on a number still rocking, or on a corner, knocks it over.
    function spawn() {
      bodies = [];
      pending = [];
      clock = 0;
      TH = blockH();
      // the gap leaves room for the words, which are wider than their numbers, to land side by side
      const tw = TH * 0.8, gap = Math.min(TH * 0.36, (W - 3 * tw) / 4), x0 = W / 2 - (3 * tw + 2 * gap) / 2 + tw / 2;
      const tilt = (r: number) => (Math.random() - 0.5) * r;
      SPEC.forEach((s, i) => {
        const col = i % 3, x = x0 + col * (tw + gap);
        if (s.k === 'd') bodies.push(mkBody(s, x, -TH * (0.7 + col * 0.55), tw / 2, TH / 2, tilt(0.03)));
        else pending.push({ b: mkBody(s, x + tilt(TH * 0.06), -TH * 0.4, wordW(s.t) / 2 + TH * 0.16, TH * 0.2, tilt(0.02)), at: 1.1 + col * 0.18 });
      });
      asleep = false;
      still = 0;
    }
    const floorH = () => Math.min(22, H * 0.03);
    function resize() {
      const r = cv!.getBoundingClientRect();
      OX = r.left;
      OY = r.top;
      dpr = Math.min(2, devicePixelRatio || 1);
      const ow = W;
      W = r.width;
      H = r.height;
      cv!.width = Math.round(W * dpr);
      cv!.height = Math.round(H * dpr);
      G = 2200 * Math.max(0.7, Math.min(1.3, H / 700));
      walls = [mkWall(W / 2, H + 400 - floorH(), W * 2, 400), mkWall(-400, H / 2 - H, 400, H * 3), mkWall(W + 400, H / 2 - H, 400, H * 3)];
      if (ow && Math.abs(TH - blockH()) > TH * 0.15) spawn();
      else for (const b of bodies) { b.x = Math.max(b.hw, Math.min(W - b.hw, b.x)); b.y = Math.min(b.y, H - b.hh); }
      asleep = false;
      still = 0;
      if (reduce) settle();
      else start();
    }

    function step(dt: number) {
      clock += dt;
      while (pending.length && pending[0].at <= clock) bodies.push(pending.shift()!.b);
      const all: Solid[] = [...bodies, ...walls];
      for (const b of bodies) { b.vy += G * dt; b.vx *= 0.9995; b.vy *= 0.9995; b.w *= 0.995; }
      const man: Manifold[] = [];
      for (let i = 0; i < all.length; i++) {
        for (let j = i + 1; j < all.length; j++) {
          const A = all[i], B = all[j];
          if (A.stat && B.stat) continue;
          if (!A.stat && !B.stat && Math.hypot(A.x - B.x, A.y - B.y) > Math.hypot(A.hw, A.hh) + Math.hypot(B.hw, B.hh)) continue;
          const m = collide(A, B);
          if (m) man.push(m);
        }
      }
      for (const { A, B, n, pts } of man) {
        const t: V = [-n[1], n[0]];
        for (const c of pts) {
          c.rA = [c.p[0] - A.x, c.p[1] - A.y];
          c.rB = [c.p[0] - B.x, c.p[1] - B.y];
          const rnA = c.rA[0] * n[1] - c.rA[1] * n[0], rnB = c.rB[0] * n[1] - c.rB[1] * n[0];
          c.mn = 1 / (A.im + B.im + A.iI * rnA * rnA + B.iI * rnB * rnB);
          const rtA = c.rA[0] * t[1] - c.rA[1] * t[0], rtB = c.rB[0] * t[1] - c.rB[1] * t[0];
          c.mt = 1 / (A.im + B.im + A.iI * rtA * rtA + B.iI * rtB * rtB);
          c.bias = (BETA / dt) * Math.max(0, c.depth - SLOP);
          const vn = dot(relv(A, B, c), n);
          c.bounce = vn < -120 ? -E * vn : 0;
          const old = cache.get(c.key);
          c.Pn = old ? old[0] : 0;
          c.Pt = old ? old[1] : 0;
          apply(A, B, c, [n[0] * c.Pn + t[0] * c.Pt, n[1] * c.Pn + t[1] * c.Pt]);
        }
      }
      for (let it = 0; it < 10; it++) {
        for (const { A, B, n, pts } of man) {
          const t: V = [-n[1], n[0]];
          for (const c of pts) {
            const vn = dot(relv(A, B, c), n);
            const p0 = c.Pn;
            c.Pn = Math.max(p0 + c.mn * (-vn + c.bias + c.bounce), 0);
            const dPn = c.Pn - p0;
            apply(A, B, c, [n[0] * dPn, n[1] * dPn]);
            const vt = dot(relv(A, B, c), t), mx = MU * c.Pn, q0 = c.Pt;
            c.Pt = Math.max(-mx, Math.min(mx, q0 - c.mt * vt));
            const dPt = c.Pt - q0;
            apply(A, B, c, [t[0] * dPt, t[1] * dPt]);
          }
        }
        if (joint) solveJoint(joint, dt);
      }
      const next = new Map<string, V>();
      for (const m of man) for (const c of m.pts) next.set(c.key, [c.Pn, c.Pt]);
      cache = next;
      for (const b of bodies) {
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.a += b.w * dt;
        if (b.y < -H * 3) { b.y = -TH; b.vy = 0; }
      }
    }
    // the held point is pulled 30% of the way to the pointer each step, no faster than 4200 px/s
    function solveJoint(j: Joint, dt: number) {
      const b = j.b, [c, s] = axes(b), r: V = [c * j.lx - s * j.ly, s * j.lx + c * j.ly], p: V = [b.x + r[0], b.y + r[1]];
      const vd: V = [((j.tx - p[0]) * 0.3) / dt, ((j.ty - p[1]) * 0.3) / dt], sp = Math.hypot(vd[0], vd[1]), cap = 4200;
      if (sp > cap) { vd[0] *= cap / sp; vd[1] *= cap / sp; }
      const vp: V = [b.vx - b.w * r[1], b.vy + b.w * r[0]];
      const k11 = b.im + b.iI * r[1] * r[1], k12 = -b.iI * r[0] * r[1], k22 = b.im + b.iI * r[0] * r[0], det = k11 * k22 - k12 * k12;
      const dvx = (vd[0] - vp[0]) * 0.5, dvy = (vd[1] - vp[1]) * 0.5, Px = (k22 * dvx - k12 * dvy) / det, Py = (-k12 * dvx + k11 * dvy) / det;
      b.vx += Px * b.im;
      b.vy += Py * b.im;
      b.w += b.iI * (r[0] * Py - r[1] * Px);
      b.w *= 0.97;
    }
    function settle() {
      for (let i = 0; i < 900 && !asleep; i++) {
        step(1 / 120);
        let mx = 0;
        for (const b of bodies) mx = Math.max(mx, Math.hypot(b.vx, b.vy));
        if (mx < 5 && i > 200 && !pending.length) asleep = true;
      }
      draw();
    }

    function draw() {
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, W, H);
      ctx!.fillStyle = FLOOR;
      ctx!.fillRect(0, H - floorH(), W, floorH());
      for (const b of bodies) {
        ctx!.save();
        ctx!.translate(b.x, b.y);
        ctx!.rotate(b.a);
        const cut = Math.min(18, Math.min(b.hw, b.hh) * 0.5);
        ctx!.fillStyle = b.fill;
        ctx!.beginPath();
        ctx!.moveTo(-b.hw, -b.hh);
        ctx!.lineTo(b.hw - cut, -b.hh);
        ctx!.lineTo(b.hw, -b.hh + cut);
        ctx!.lineTo(b.hw, b.hh);
        ctx!.lineTo(-b.hw, b.hh);
        ctx!.closePath();
        ctx!.fill();
        ctx!.fillStyle = b.ink;
        ctx!.textAlign = 'center';
        ctx!.textBaseline = 'middle';
        ctx!.font = `${b.k === 'd' ? TH * 0.54 : TH * 0.34}px ${FONT}`;
        ctx!.fillText(b.t, 0, TH * 0.02);
        ctx!.restore();
      }
    }

    let last = performance.now(), raf = 0;
    function frame(now: number) {
      raf = 0;
      if (document.hidden) return;
      const dt = Math.min(1 / 30, (now - last) / 1000);
      last = now;
      if (!asleep) {
        for (let i = 0; i < 3; i++) step(dt / 3);
        let mx = 0;
        for (const b of bodies) mx = Math.max(mx, Math.hypot(b.vx, b.vy) + Math.abs(b.w) * 40);
        if (mx < 9 && !joint && !pending.length) {
          still += dt;
          if (still > 0.6) {
            asleep = true;
            for (const b of bodies) b.vx = b.vy = b.w = 0;
          }
        } else still = 0;
      }
      draw();
      // once everything is still the loop stops; a grab, a resize or the fonts start it again
      if (!asleep) raf = requestAnimationFrame(frame);
    }
    function start() {
      if (reduce || raf || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    // pick a block up by the point you touched
    function hit(x: number, y: number) {
      for (let i = bodies.length - 1; i >= 0; i--) {
        const b = bodies[i], [c, s] = axes(b), dx = x - b.x, dy = y - b.y, lx = c * dx + s * dy, ly = -s * dx + c * dy;
        if (Math.abs(lx) <= b.hw + 4 && Math.abs(ly) <= b.hh + 4) return { b, lx, ly };
      }
      return null;
    }
    const at = (e: PointerEvent): V => [e.clientX - OX, e.clientY - OY];
    const onDown = (e: PointerEvent) => {
      if (reduce) return;
      const [x, y] = at(e), h = hit(x, y);
      if (!h) return;
      joint = { b: h.b, lx: h.lx, ly: h.ly, tx: x, ty: y };
      asleep = false;
      still = 0;
      bodies.splice(bodies.indexOf(h.b), 1);
      bodies.push(h.b);
      cv.setPointerCapture(e.pointerId);
      start();
    };
    const onMove = (e: PointerEvent) => {
      const [x, y] = at(e);
      if (joint) { joint.tx = x; joint.ty = y; }
      if (!reduce) cv.style.cursor = joint ? 'grabbing' : hit(x, y) ? 'grab' : '';
    };
    const onUp = () => { joint = null; };
    // a finger on a block keeps the page from scrolling under it (only a cancelled touchstart can)
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!reduce && t && hit(t.clientX - OX, t.clientY - OY)) e.preventDefault();
    };
    const onScroll = () => {
      const r = cv.getBoundingClientRect();
      OX = r.left;
      OY = r.top;
    };

    cv.addEventListener('pointerdown', onDown);
    cv.addEventListener('pointermove', onMove);
    cv.addEventListener('pointerup', onUp);
    cv.addEventListener('pointercancel', onUp);
    cv.addEventListener('touchstart', onTouch, { passive: false });
    document.addEventListener('visibilitychange', start);
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', onScroll, { passive: true });

    resize();
    spawn();
    // Eurostile may land after the first frame: the words are measured again in it.
    let gone = false;
    document.fonts?.ready.then(() => {
      if (gone) return;
      for (const b of [...bodies, ...pending.map((p) => p.b)]) {
        if (b.k !== 'w') continue;
        b.hw = wordW(b.t) / 2 + TH * 0.16;
        b.iI = 1 / ((b.m * ((2 * b.hw) ** 2 + (2 * b.hh) ** 2)) / 12);
      }
      asleep = false;
      still = 0;
      if (reduce) settle();
      else start();
    });
    if (reduce) settle();
    else start();

    return () => {
      gone = true;
      if (raf) cancelAnimationFrame(raf);
      cv.removeEventListener('pointerdown', onDown);
      cv.removeEventListener('pointermove', onMove);
      cv.removeEventListener('pointerup', onUp);
      cv.removeEventListener('pointercancel', onUp);
      cv.removeEventListener('touchstart', onTouch);
      document.removeEventListener('visibilitychange', start);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return <canvas ref={ref} className={className} aria-label="404, as blocks you can throw" />;
}
