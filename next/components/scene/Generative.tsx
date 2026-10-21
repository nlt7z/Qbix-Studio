'use client';

import { useEffect, useRef } from 'react';
import { noise3 } from '@/lib/noise';
import { scrolling } from '@/lib/scene/quiet';

/**
 * Generative drawings on canvas, beside Flow (components/scene/Flow.tsx):
 * Contours (a topographic map of a noise field), Ridges (lines lifted into
 * peaks, each hiding the ones behind it), Rings (ripples spreading from
 * something that stands in the picture) and Halftone (a photograph as a field
 * of dots). Colours are 'r, g, b'. Each is drawn at its own device pixels (the
 * scene's zoom included) or at `density`, the first time it comes on the
 * screen; those that move are redrawn at a few frames a second while they're
 * on the screen, the tab is open and the page isn't being scrolled, and are a
 * still for reduced motion.
 */

type Paint = (g: CanvasRenderingContext2D, W: number, H: number, k: number, t: number) => void;
type ArtOpts = { moves?: boolean; fps?: number; density?: number };

function useArt(paint: Paint, { moves = false, fps = 24, density }: ArtOpts) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const paintRef = useRef(paint);
  paintRef.current = paint;
  // a redraw asked for from outside (a picture it paints has loaded)
  const again = useRef<() => void>(() => {});

  useEffect(() => {
    const cv = ref.current;
    const g = cv?.getContext('2d');
    if (!cv || !g) return;
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const live = moves && !calm;
    const t0 = performance.now();
    let W = 0, H = 0, k = 1, seen = false, raf = 0, last = -1e9, stale = true;
    const loop = (now: number) => {
      raf = 0;
      if (!seen || document.hidden || !W) return;
      if (stale || (live && now - last >= 1000 / fps - 2 && !scrolling())) {
        last = now;
        stale = false;
        paintRef.current(g, W, H, k, live ? (now - t0) / 1000 : 0);
      }
      if (live) raf = requestAnimationFrame(loop);
    };
    const wake = () => {
      if (!raf && seen) raf = requestAnimationFrame(loop);
    };
    again.current = () => {
      stale = true;
      wake();
    };
    const size = (w: number, h: number) => {
      if (w < 2 || h < 2 || (w === W && h === H)) return;
      W = cv.width = w;
      H = cv.height = h;
      k = W / Math.max(1, cv.clientWidth);
      stale = true;
      wake();
    };
    const ro = new ResizeObserver(([e]) => {
      const d = e.devicePixelContentBoxSize?.[0];
      if (density) size(Math.round(e.contentRect.width * density), Math.round(e.contentRect.height * density));
      else if (d) size(d.inlineSize, d.blockSize);
      else size(Math.round(e.contentRect.width * devicePixelRatio), Math.round(e.contentRect.height * devicePixelRatio));
    });
    try {
      ro.observe(cv, { box: 'device-pixel-content-box' });
    } catch {
      ro.observe(cv);
    }
    const io = new IntersectionObserver(([e]) => {
      seen = e.isIntersecting;
      wake();
    });
    io.observe(cv);
    document.addEventListener('visibilitychange', wake);
    return () => {
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', wake);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [moves, fps, density]);

  return { ref, again };
}

const ground = (g: CanvasRenderingContext2D, W: number, H: number, c?: string) => {
  if (c) {
    g.fillStyle = `rgb(${c})`;
    g.fillRect(0, 0, W, H);
  } else g.clearRect(0, 0, W, H);
};

/* --- Contours: a topographic map of a slowly changing noise field ---------------
   The field is sampled on a grid and each level traced by marching squares;
   every fourth level is an index contour, drawn heavier. */
export function Contours({
  className = '',
  seed = 3,
  ink = '18, 20, 23',
  bg,
  alpha = 0.5,
  levels = 14,
  scale = 140,
  speed = 0.04,
  moves = false,
  fps = 18,
  density,
}: {
  className?: string;
  seed?: number;
  ink?: string;
  bg?: string;
  alpha?: number;
  levels?: number;
  /** the size of the hills, in css px */
  scale?: number;
  speed?: number;
  moves?: boolean;
  fps?: number;
  density?: number;
}) {
  const n = useRef(noise3(seed)).current;
  const { ref } = useArt(
    (g, W, H, k, t) => {
      ground(g, W, H, bg);
      const cell = Math.max(6, Math.round(12 * k));
      const cols = Math.ceil(W / cell) + 1, rows = Math.ceil(H / cell) + 1;
      const f = new Float32Array(cols * rows);
      const fq = 1 / (scale * k);
      const z = t * speed;
      for (let j = 0; j < rows; j++)
        for (let i = 0; i < cols; i++) {
          const x = i * cell * fq, y = j * cell * fq;
          f[j * cols + i] = n(x, y, z) * 0.72 + n(x * 2.3 + 11, y * 2.3, z * 1.4) * 0.28;
        }
      const v0 = -0.9, dv = 1.8 / levels;
      const paths = Array.from({ length: levels }, () => new Path2D());
      for (let j = 0; j < rows - 1; j++)
        for (let i = 0; i < cols - 1; i++) {
          const a = f[j * cols + i], b = f[j * cols + i + 1], c = f[(j + 1) * cols + i + 1], d = f[(j + 1) * cols + i];
          const lo = Math.min(a, b, c, d), hi = Math.max(a, b, c, d);
          const l0 = Math.max(0, Math.ceil((lo - v0) / dv - 0.5)), l1 = Math.min(levels - 1, Math.floor((hi - v0) / dv - 0.5));
          const x0 = i * cell, y0 = j * cell;
          for (let l = l0; l <= l1; l++) {
            const v = v0 + (l + 0.5) * dv;
            const idx = (a > v ? 8 : 0) | (b > v ? 4 : 0) | (c > v ? 2 : 0) | (d > v ? 1 : 0);
            if (idx === 0 || idx === 15) continue;
            const T = () => [x0 + (cell * (v - a)) / (b - a), y0];
            const R = () => [x0 + cell, y0 + (cell * (v - b)) / (c - b)];
            const B = () => [x0 + (cell * (v - d)) / (c - d), y0 + cell];
            const L = () => [x0, y0 + (cell * (v - a)) / (d - a)];
            const seg = (p: number[], q: number[]) => {
              paths[l].moveTo(p[0], p[1]);
              paths[l].lineTo(q[0], q[1]);
            };
            switch (idx) {
              case 1: case 14: seg(L(), B()); break;
              case 2: case 13: seg(B(), R()); break;
              case 3: case 12: seg(L(), R()); break;
              case 4: case 11: seg(T(), R()); break;
              case 6: case 9: seg(T(), B()); break;
              case 7: case 8: seg(T(), L()); break;
              case 5: seg(T(), L()); seg(B(), R()); break;
              case 10: seg(T(), R()); seg(L(), B()); break;
            }
          }
        }
      g.lineJoin = 'round';
      paths.forEach((p, l) => {
        const index = l % 4 === 2;
        g.strokeStyle = `rgba(${ink}, ${index ? alpha : alpha * 0.55})`;
        g.lineWidth = Math.max(1, k * (index ? 1.25 : 0.8));
        g.stroke(p);
      });
    },
    { moves, fps, density },
  );
  return <canvas ref={ref} className={`gen ${className}`} aria-hidden />;
}

/* --- Ridges: lines lifted into peaks, each in front hiding those behind -------- */
export function Ridges({
  className = '',
  seed = 7,
  ink = '184, 255, 0',
  bg = '11, 12, 14',
  alpha = 0.95,
  lines = 26,
  amp = 0.34,
  center = 0.5,
  spread = 0.2,
  speed = 0.18,
  moves = false,
  fps = 24,
  density,
}: {
  className?: string;
  seed?: number;
  ink?: string;
  bg?: string;
  alpha?: number;
  lines?: number;
  /** how tall the peaks are, as a share of the height */
  amp?: number;
  /** where across the peaks rise (0 left, 1 right), and how wide they spread */
  center?: number;
  spread?: number;
  speed?: number;
  moves?: boolean;
  fps?: number;
  density?: number;
}) {
  const n = useRef(noise3(seed)).current;
  const { ref } = useArt(
    (g, W, H, k, t) => {
      ground(g, W, H, bg);
      const top = H * (0.1 + amp * 0.6), bottom = H * 0.92;
      const gap = (bottom - top) / Math.max(1, lines - 1);
      const A = H * amp;
      const step = Math.max(3, Math.round(5 * k));
      g.lineWidth = Math.max(1, 1.1 * k);
      g.lineJoin = 'round';
      g.strokeStyle = `rgba(${ink}, ${alpha})`;
      g.fillStyle = `rgb(${bg})`;
      const xs = Math.ceil(W / step) + 2;
      const ys = new Float32Array(xs);
      const line = () => {
        g.moveTo(0, ys[0]);
        for (let j = 1; j < xs; j++) g.lineTo(j * step, ys[j]);
      };
      for (let i = 0; i < lines; i++) {
        const y0 = top + i * gap;
        for (let j = 0; j < xs; j++) {
          const x = j * step;
          const env = Math.exp(-Math.pow((x / W - center) / spread, 2));
          const big = Math.max(0, n(x / (90 * k), i * 0.31, t * speed));
          const fine = n(x / (16 * k), i * 0.9 + 40, t * speed * 1.6) * 0.18;
          ys[j] = y0 - A * env * (big * big * 1.6 + Math.max(0, fine) * 0.6) - A * 0.02 * fine;
        }
        // the hill under the line hides the lines behind it (they sit higher: only the hill can cover them)
        g.beginPath();
        line();
        g.lineTo(W + step, y0 + 2);
        g.lineTo(0, y0 + 2);
        g.closePath();
        g.fill();
        g.beginPath();
        line();
        g.stroke();
      }
    },
    { moves, fps, density },
  );
  return <canvas ref={ref} className={`gen ${className}`} aria-hidden />;
}

/* --- Rings: ripples spreading out from the middle of `around` ------------------
   Each ring is a circle bent a little by the noise (more the further out it
   is), born at the inner radius and fading as it spreads; every fourth one is
   drawn heavier. On a transparent canvas, so it lies over its chapter. */
export function Rings({
  className = '',
  seed = 5,
  ink = '12, 19, 0',
  alpha = 0.3,
  around,
  gap = 46,
  inner = 150,
  speed = 0.22,
  moves = false,
  fps = 24,
}: {
  className?: string;
  seed?: number;
  ink?: string;
  alpha?: number;
  /** the selector, in the same chapter frame, of what the rings spread from (default: the canvas's middle) */
  around?: string;
  /** css px between rings, and the radius they're born at */
  gap?: number;
  inner?: number;
  /** rings a second */
  speed?: number;
  moves?: boolean;
  fps?: number;
}) {
  const n = useRef(noise3(seed)).current;
  const { ref } = useArt(
    (g, W, H, k, t) => {
      g.clearRect(0, 0, W, H);
      // the middle: of what it spreads from, in the canvas's pixels
      let cx = W / 2, cy = H / 2;
      const el = around ? g.canvas.closest('.ch-frame')?.querySelector(around) : null;
      if (el) {
        const c = g.canvas.getBoundingClientRect(), r = el.getBoundingClientRect();
        if (c.width) {
          cx = ((r.left + r.width / 2 - c.left) * W) / c.width;
          cy = ((r.top + r.height / 2 - c.top) * H) / c.height;
        }
      }
      const G = gap * k, R0 = inner * k;
      const far = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy));
      const R1 = Math.min(far, R0 + G * 16);
      const phase = (t * speed) % 1;
      const count = Math.ceil((R1 - R0) / G) + 1;
      const seg = 160;
      g.lineJoin = 'round';
      for (let i = 0; i < count; i++) {
        const base = R0 + (i + phase) * G;
        if (base > R1) break;
        const u = (base - R0) / (R1 - R0);
        // born, then fading as it spreads
        const a = alpha * Math.min(1, (base - R0) / G) * Math.pow(1 - u, 1.6);
        if (a < 0.01) continue;
        const ring = Math.floor(i - Math.floor(t * speed));
        const heavy = ((ring % 4) + 4) % 4 === 0;
        const warp = (6 + base * 0.05) * k;
        g.beginPath();
        for (let j = 0; j <= seg; j++) {
          const th = (j / seg) * Math.PI * 2;
          const c = Math.cos(th), s = Math.sin(th);
          const r = base + warp * n(c * 1.3, s * 1.3, base / (420 * k) + t * 0.05);
          if (j) g.lineTo(cx + c * r, cy + s * r);
          else g.moveTo(cx + c * r, cy + s * r);
        }
        g.closePath();
        g.strokeStyle = `rgba(${ink}, ${heavy ? a : a * 0.6})`;
        g.lineWidth = Math.max(1, k * (heavy ? 1.3 : 0.85));
        g.stroke();
      }
    },
    { moves, fps },
  );
  return <canvas ref={ref} className={`gen ${className}`} aria-hidden />;
}

/* --- Halftone: a photograph as dots, each as big as the light where it stands --- */
export function Halftone({
  className = '',
  src,
  ink = '184, 255, 0',
  bg = '18, 20, 23',
  cell = 4.5,
  pos = [0.5, 0.5],
  gamma = 1.2,
  moves = false,
  fps = 20,
}: {
  className?: string;
  src: string;
  ink?: string;
  bg?: string;
  /** the dots' pitch, in css px */
  cell?: number;
  /** the picture's crop: which part of it stays in view, as object-position */
  pos?: [number, number];
  gamma?: number;
  moves?: boolean;
  fps?: number;
}) {
  const img = useRef<HTMLImageElement | null>(null);
  const grid = useRef<{ W: number; H: number; cols: number; rows: number; lum: Float32Array } | null>(null);
  const { ref, again } = useArt(
    (g, W, H, k, t) => {
      ground(g, W, H, bg);
      const im = img.current;
      if (!im || !im.complete || !im.naturalWidth) return;
      const c = cell * k;
      const cols = Math.ceil(W / c), rows = Math.ceil(H / c);
      let gr = grid.current;
      if (!gr || gr.W !== W || gr.H !== H) {
        // the picture, cropped to cover, read at one pixel a dot
        const off = document.createElement('canvas');
        off.width = cols;
        off.height = rows;
        const o = off.getContext('2d', { willReadFrequently: true })!;
        const s = Math.max(cols / im.naturalWidth, rows / im.naturalHeight);
        const dw = im.naturalWidth * s, dh = im.naturalHeight * s;
        o.drawImage(im, (cols - dw) * pos[0], (rows - dh) * pos[1], dw, dh);
        const px = o.getImageData(0, 0, cols, rows).data;
        const lum = new Float32Array(cols * rows);
        for (let i = 0; i < cols * rows; i++) lum[i] = (0.2126 * px[i * 4] + 0.7152 * px[i * 4 + 1] + 0.0722 * px[i * 4 + 2]) / 255;
        gr = grid.current = { W, H, cols, rows, lum };
      }
      g.fillStyle = `rgb(${ink})`;
      g.beginPath();
      for (let j = 0; j < rows; j++)
        for (let i = 0; i < cols; i++) {
          const l = Math.pow(gr.lum[j * cols + i], gamma);
          const wave = moves ? 1 + 0.16 * Math.sin((i + j) * 0.42 - t * 1.8) : 1;
          const r = (c / 2) * Math.min(1, Math.sqrt(l) * wave) * 0.96;
          if (r < 0.35 * k) continue;
          const x = (i + 0.5) * c, y = (j + 0.5) * c;
          g.moveTo(x + r, y);
          g.arc(x, y, r, 0, Math.PI * 2);
        }
      g.fill();
    },
    { moves, fps },
  );
  useEffect(() => {
    const im = new Image();
    im.decoding = 'async';
    im.onload = () => {
      img.current = im;
      grid.current = null;
      again.current();
    };
    im.src = src;
    return () => {
      im.onload = null;
    };
  }, [src, again]);
  return <canvas ref={ref} className={`gen ${className}`} aria-hidden />;
}
