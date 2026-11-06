'use client';

import { useEffect, useRef } from 'react';

/**
 * Water, in ink: particles carried along a current that meanders and slowly changes, each drawn as a long
 * brush stroke, full and dark at its head, thinning and paling to a dry tail, as 水墨 does. Four brushes: broad, soft washes
 * (blurred, faint), firm strokes, a few in dense ink, and hair lines; one stroke in lime. Most of it
 * runs in a river through the middle, and the edges fade into the paper (home.css .flow-art). The pointer is
 * a stone in the stream: the current parts round it and closes again behind it. It runs only while on
 * screen; with reduced motion it is a still of the current.
 */
type P = { hx: number; hy: number; x: number[]; y: number[]; life: number; brush: number; tick: number };
const TRAIL = 64; // points kept along a stroke, one every EVERY steps: a stroke ~300px long
const EVERY = 3;
// each brush: its share of the strokes, its width at the head, its ink, a blur (the wash bleeding); the
// last, lime, is one stroke only
const BRUSHES = [
  { share: 0.05, w: 30, ink: 'rgba(11, 12, 13, 0.03)', blur: 10 },
  { share: 0.22, w: 4.6, ink: 'rgba(11, 12, 13, 0.16)', blur: 0.6 },
  { share: 0.07, w: 3, ink: 'rgba(11, 12, 13, 0.76)', blur: 0 },
  { share: 0.66, w: 1.3, ink: 'rgba(11, 12, 13, 0.32)', blur: 0 },
  { share: 0, w: 2.6, ink: '#b8ff00', blur: 0 },
];
const LIME = BRUSHES.length - 1;
// as a brush: a stroke is drawn in eight pieces, head to tail, the head full and dark, each piece after it
// thinner and paler, the tail a dry trace
const PIECES = Array.from({ length: 8 }, (_, k) => {
  const f = k / 8;
  return [f, Math.min(1, f + 1 / 8 + 0.02), (1 - f) ** 1.7, Math.max(0.06, (1 - f) ** 1.4)];
});
const STONE = 90; // how far round the pointer the current parts

export default function FlowArt() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const x = c.getContext('2d')!;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    let d = 1;
    let ps: P[] = [];
    let t = Math.random() * 1000;
    let raf = 0;
    let seen = false;
    // the stone eases in and out, so the water doesn't jump when the pointer arrives or leaves
    const pt = { x: 0, y: 0, k: 0, on: false };

    const pick = () => {
      let r = Math.random();
      for (let i = 0; i < LIME; i++) if ((r -= BRUSHES[i].share) < 0) return i;
      return 3;
    };
    // a new stroke starts anywhere, a brush put to the paper, and grows from there
    const spawn = (brush = pick()): P => {
      const hx = Math.random() * w;
      // most of the water in a river through the middle, thinning to the banks
      const g = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
      const hy = h * (0.5 + g * 0.46);
      return { hx, hy, x: Array(TRAIL).fill(hx), y: Array(TRAIL).fill(hy), life: 500 + Math.random() * 700, brush, tick: 0 };
    };
    const size = () => {
      d = Math.min(2, devicePixelRatio || 1);
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = Math.round(w * d);
      c.height = Math.round(h * d);
      const n = Math.round(Math.min(900, (w * h) / 340));
      ps = Array.from({ length: n }, (_, i) => spawn(i ? pick() : LIME));
    };
    // the current: left to right in ripples, two trains of waves crossing (each line's phase set by its height,
    // so neighbouring lines weave), the whole slowly travelling; round the stone, it parts
    const dir = (px: number, py: number) => {
      let vx = 1;
      let vy =
        0.42 * Math.cos(px * 0.011 - t * 1.2 + py * 0.018) +
        0.22 * Math.cos(px * 0.023 + t * 0.8 - py * 0.031) +
        0.1 * Math.sin(py * 0.005 + t * 0.3);
      if (pt.k > 0.001) {
        const dx = px - pt.x;
        const dy = py - pt.y;
        const r = Math.hypot(dx, dy) || 1;
        if (r < STONE) {
          const k = (1 - r / STONE) ** 2 * 0.9 * pt.k;
          vx += (dx / r) * k;
          vy += (dy / r) * k;
        }
      }
      return Math.atan2(vy, vx);
    };
    const step = () => {
      t += 0.004;
      pt.k += ((pt.on ? 1 : 0) - pt.k) * 0.06;
      for (const p of ps) {
        const a = dir(p.hx, p.hy);
        const sp = 1.4 + Math.sin(p.hy * 0.008 + t) * 0.4;
        p.hx += Math.cos(a) * sp;
        p.hy += Math.sin(a) * sp;
        if (++p.tick % EVERY === 0) {
          p.x.unshift(p.hx);
          p.y.unshift(p.hy);
          p.x.length = TRAIL;
          p.y.length = TRAIL;
        }
        p.life -= 1;
        if (p.life < 0 || p.x[TRAIL - 1] > w + 30 || p.y[TRAIL - 1] < -40 || p.y[TRAIL - 1] > h + 40) Object.assign(p, spawn(p.brush));
      }
    };
    const draw = () => {
      x.setTransform(d, 0, 0, d, 0, 0);
      x.clearRect(0, 0, w, h);
      x.lineCap = 'round';
      x.lineJoin = 'round';
      BRUSHES.forEach((b, bi) => {
        x.strokeStyle = b.ink;
        x.filter = b.blur ? `blur(${b.blur}px)` : 'none';
        PIECES.forEach(([from, to, wk, ak]) => {
          const i0 = Math.floor(from * (TRAIL - 1));
          const i1 = Math.ceil(to * (TRAIL - 1));
          x.beginPath();
          for (const p of ps) {
            if (p.brush !== bi) continue;
            if (i0 === 0) {
              x.moveTo(p.hx, p.hy);
              x.lineTo(p.x[0], p.y[0]);
            } else x.moveTo(p.x[i0], p.y[i0]);
            for (let i = i0 + 1; i <= i1; i++) x.lineTo(p.x[i], p.y[i]);
          }
          x.lineWidth = b.w * wk;
          x.globalAlpha = ak;
          x.stroke();
        });
      });
      x.globalAlpha = 1;
      x.filter = 'none';
    };
    const frame = () => {
      raf = 0;
      if (!seen || document.hidden) return;
      step();
      draw();
      raf = requestAnimationFrame(frame);
    };
    const go = () => {
      if (!raf && seen && !reduced) raf = requestAnimationFrame(frame);
    };
    // a current already running when it's first seen
    const settle = () => {
      size();
      for (let i = 0; i < TRAIL * EVERY + 60; i++) step();
      draw();
    };
    settle();
    const io = new IntersectionObserver(([e]) => {
      seen = e.isIntersecting;
      go();
    });
    io.observe(c);
    let lastW = c.clientWidth;
    const ro = new ResizeObserver(() => {
      if (c.clientWidth === lastW) return;
      lastW = c.clientWidth;
      settle();
    });
    ro.observe(c);
    const onMove = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      pt.x = e.clientX - r.left;
      pt.y = e.clientY - r.top;
      pt.on = true;
    };
    const onLeave = () => (pt.on = false);
    c.addEventListener('pointermove', onMove);
    c.addEventListener('pointerleave', onLeave);
    document.addEventListener('visibilitychange', go);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      c.removeEventListener('pointermove', onMove);
      c.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', go);
    };
  }, []);
  return <canvas ref={ref} className="flow-art" aria-hidden="true" />;
}
