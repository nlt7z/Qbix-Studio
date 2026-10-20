'use client';

import { useEffect, useRef } from 'react';

type P = { x: number; y: number; life: number };

/**
 * Generative art: particles carried by a slow field of currents, each drawing
 * a fine line where it goes while the old lines fade, so the picture is the
 * paths they take. Lime on ink by default (colours as 'r, g, b'). Drawn at the
 * canvas's own device pixels, the scene's zoom included; it moves only while
 * it's on the screen and the tab is open, and for reduced motion it's a still,
 * the field already drawn out.
 */
export default function Flow({
  className = '',
  count = 520,
  seed = 7,
  ground = '11, 12, 14',
  ink = '184, 255, 0',
  speed = 1,
  scale = 1,
  alpha = 0.78,
  density,
}: {
  className?: string;
  count?: number;
  seed?: number;
  ground?: string;
  ink?: string;
  speed?: number;
  /** the size of the currents: above 1, wider */
  scale?: number;
  /** how strong each line is drawn */
  alpha?: number;
  /** canvas pixels per css pixel, for a big soft one (default: the device's) */
  density?: number;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const cv = ref.current;
    const g = cv?.getContext('2d', { alpha: false });
    if (!cv || !g) return;
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let s = seed;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    let W = 0, H = 0, k = 1, t = 0;
    const ps: P[] = Array.from({ length: count }, () => ({ x: 0, y: 0, life: 0 }));
    const spawn = (p: P) => {
      p.x = rnd() * W;
      p.y = rnd() * H;
      p.life = 50 + rnd() * 160;
    };
    // the currents: an angle at each point (in the drawing's px), turning slowly with time
    const angle = (x: number, y: number) => {
      const u = x / k / scale, v = y / k / scale;
      return Math.sin(u * 0.011 + t * 0.35) * 1.5 + Math.cos(v * 0.013 - t * 0.25) * 1.3 + Math.sin((u + v) * 0.0045 + 1.3) * 2.4;
    };
    const fade = `rgba(${ground}, 0.06)`;
    const line = `rgba(${ink}, ${alpha})`;
    const step = () => {
      t += 0.004 * speed;
      g.fillStyle = fade;
      g.fillRect(0, 0, W, H);
      g.strokeStyle = line;
      g.lineWidth = Math.max(1, k * 0.9);
      g.beginPath();
      const v = 1.15 * k * speed;
      for (const p of ps) {
        const a = angle(p.x, p.y);
        const nx = p.x + Math.cos(a) * v, ny = p.y + Math.sin(a) * v;
        g.moveTo(p.x, p.y);
        g.lineTo(nx, ny);
        p.x = nx;
        p.y = ny;
        if (--p.life <= 0 || nx < 0 || ny < 0 || nx > W || ny > H) spawn(p);
      }
      g.stroke();
    };
    const fresh = () => {
      g.fillStyle = `rgb(${ground})`;
      g.fillRect(0, 0, W, H);
      ps.forEach(spawn);
      for (let i = 0; i < 180; i++) step();
    };

    const size = (w: number, h: number) => {
      if (w < 2 || h < 2 || (w === W && h === H)) return;
      W = cv.width = w;
      H = cv.height = h;
      k = W / Math.max(1, cv.clientWidth);
      fresh();
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

    let raf = 0, seen = false;
    const loop = () => {
      raf = 0;
      if (!seen || document.hidden || calm || !W) return;
      step();
      raf = requestAnimationFrame(loop);
    };
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
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
  }, [count, seed, ground, ink, speed, scale, alpha, density]);

  return <canvas ref={ref} className={`flow ${className}`} aria-hidden />;
}
