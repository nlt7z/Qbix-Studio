'use client';

import { useEffect, useRef } from 'react';

/**
 * Footer sign-off — the qbix wordmark set in square pixels, the same module
 * as the pixel edges: the mark is rasterised onto a square grid, cells inside
 * the letters print full, cells on an edge print smaller by how much of them
 * the letter covers (a square halftone edge). It sits on the page's left
 * edge. As it scrolls in, the squares pop in left to right once; then the
 * canvas is still (Canvas 2D, no loop, no WebGL).
 */

// The nav logotype (public/qbix-wordmark.svg), so the sign-off is the same mark.
const MARK = 'M131.5 230H93.5A60.5 60.5 0 1 1 154 169.5V342H187V169.5A93.5 93.5 0 1 0 93.5 263H131.5ZM280.5 0H313.5V169.5A60.5 60.5 0 1 0 374 109H337.5V76H374A93.5 93.5 0 1 1 280.5 169.5ZM583.5 0H616.5V34H583.5ZM583.5 77H616.5V264H583.5ZM709.5 77H752L810.01 143.99A40.5 40.5 0 0 1 810.01 197.01L752 264H709.5L790.47 170.5ZM875.5 77H918L853.92 151H847A16.5 16.5 0 0 1 830.5 134.5V128.96ZM875.5 264H918L853.92 190H847A16.5 16.5 0 0 0 830.5 206.5V212.04Z';
const VB_W = 918;
const VB_H = 342;
const INK = '#f4f5f2';

type Cell = { x: number; y: number; s: number; t: number };

export default function FooterMark() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'footer-mark-canvas';
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    host.appendChild(canvas);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mark = new Path2D(MARK);

    let cells: Cell[] = [];
    let dpr = 1;
    let shown = reduce;   // reveal played (or skipped)

    const layout = () => {
      const r = host.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));

      // Left edge of the page's content column, so the mark lines up with it.
      const col = host.closest('footer')?.querySelector<HTMLElement>('.container');
      let x0 = 16;
      if (col) {
        const cs = getComputedStyle(col);
        x0 = col.getBoundingClientRect().left + parseFloat(cs.paddingLeft) - r.left;
      }
      const markH = r.height * 0.84;
      const scale = markH / VB_H;
      const markW = VB_W * scale;
      const cell = Math.max(4, Math.round(markH / 22));
      const y0 = (r.height - markH) / 2;

      // Rasterise at 4x4 samples per cell and read back the coverage.
      const SS = 4;
      const cols = Math.ceil(markW / cell);
      const rows = Math.ceil(markH / cell);
      const off = document.createElement('canvas');
      off.width = cols * SS;
      off.height = rows * SS;
      const o = off.getContext('2d', { willReadFrequently: true })!;
      const k = (scale * SS) / cell;
      o.setTransform(k, 0, 0, k, 0, 0);
      o.fill(mark);
      const px = o.getImageData(0, 0, off.width, off.height).data;

      cells = [];
      for (let cy = 0; cy < rows; cy++) {
        for (let cx = 0; cx < cols; cx++) {
          let a = 0;
          for (let sy = 0; sy < SS; sy++) {
            for (let sx = 0; sx < SS; sx++) a += px[((cy * SS + sy) * off.width + cx * SS + sx) * 4 + 3];
          }
          const cover = a / (255 * SS * SS);
          if (cover < 0.12) continue;
          // Full cells print at 86% of the pitch (the gap keeps them pixels);
          // edge cells shrink with their coverage.
          const s = cell * 0.86 * (cover > 0.92 ? 1 : 0.35 + 0.65 * Math.sqrt(cover));
          const jitter = Math.sin(cx * 12.9898 + cy * 78.233) * 43758.5453;
          cells.push({ x: x0 + cx * cell + (cell - s) / 2, y: y0 + cy * cell + (cell - s) / 2, s, t: (cx / cols) * 0.62 + (jitter - Math.floor(jitter)) * 0.18 });
        }
      }
    };

    // p: 0 → 1 over the reveal; each square pops in on its own beat.
    const draw = (p: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = INK;
      for (const c of cells) {
        const k = Math.min(1, Math.max(0, (p - c.t) / 0.2));
        if (k <= 0) continue;
        const e = 1 - Math.pow(1 - k, 3);
        const s = c.s * e;
        ctx.fillRect(c.x + (c.s - s) / 2, c.y + (c.s - s) / 2, s, s);
      }
    };

    let raf = 0;
    const play = () => {
      const t0 = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / 1100);
        draw(p);
        raf = p < 1 ? requestAnimationFrame(step) : 0;
      };
      raf = requestAnimationFrame(step);
    };

    layout();
    draw(shown ? 1 : 0);
    const ro = new ResizeObserver(() => {
      layout();
      if (!raf) draw(shown ? 1 : 0);
    });
    ro.observe(host);
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || shown) return;
        shown = true;
        io.disconnect();
        play();
      },
      { threshold: 0.4 },
    );
    io.observe(host);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.remove();
    };
  }, []);

  return <div ref={hostRef} className="footer-stage" role="img" aria-label="qbix" />;
}
