'use client';

import { useEffect, useRef } from 'react';

/**
 * The qbix wordmark (public/qbix-wordmark.svg, its four letters apart) as the
 * floor of the page: as wide as the page, and sunk, so the bottom edge of the
 * screen cuts the q's tail. Each letter leans up toward the pointer on its own
 * spring, the nearest most. Letter centres are in the drawing's own units, so
 * nothing is measured per frame; the loop runs only while a spring moves.
 */
const W = 918;
const CUT = 242; // where the screen's edge cuts the letters (the baseline is at 264, the q's tail runs to 342)
const LETTERS: { d: string; x: number }[] = [
  { x: 94, d: 'M131.5 230H93.5A60.5 60.5 0 1 1 154 169.5V342H187V169.5A93.5 93.5 0 1 0 93.5 263H131.5Z' },
  { x: 374, d: 'M280.5 0H313.5V169.5A60.5 60.5 0 1 0 374 109H337.5V76H374A93.5 93.5 0 1 1 280.5 169.5Z' },
  { x: 600, d: 'M583.5 0H616.5V34H583.5ZM583.5 77H616.5V264H583.5Z' },
  {
    x: 814,
    d: 'M709.5 77H752L810.01 143.99A40.5 40.5 0 0 1 810.01 197.01L752 264H709.5L790.47 170.5ZM875.5 77H918L853.92 151H847A16.5 16.5 0 0 1 830.5 134.5V128.96ZM875.5 264H918L853.92 190H847A16.5 16.5 0 0 0 830.5 206.5V212.04Z',
  },
];

export default function FloorMark() {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const paths = Array.from(svg.querySelectorAll<SVGPathElement>('path'));
    const y = LETTERS.map(() => 0), v = LETTERS.map(() => 0), target = LETTERS.map(() => 0);
    let left = 0, scale = 1, raf = 0, prev = 0;
    const measure = () => {
      const r = svg.getBoundingClientRect();
      left = r.left;
      scale = W / Math.max(1, r.width);
    };
    const step = (now: number) => {
      const dt = Math.min(0.032, (now - (prev || now)) / 1000) || 0.016;
      prev = now;
      let busy = false;
      paths.forEach((p, i) => {
        v[i] += (180 * (target[i] - y[i]) - 14 * v[i]) * dt;
        y[i] += v[i] * dt;
        if (Math.abs(v[i]) > 0.3 || Math.abs(target[i] - y[i]) > 0.3) busy = true;
        // in the drawing's own units
        p.style.translate = Math.abs(y[i]) < 0.05 ? '' : `0 ${y[i].toFixed(2)}px`;
      });
      raf = busy ? requestAnimationFrame(step) : 0;
      if (!busy) prev = 0;
    };
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(step);
    };
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX - left) * scale;
      LETTERS.forEach((l, i) => {
        const k = Math.max(0, 1 - Math.abs(x - l.x) / 300);
        target[i] = -k * k * 46;
      });
      wake();
    };
    const onLeave = () => {
      target.fill(0);
      wake();
    };
    const zone = svg.closest('footer') ?? svg;
    zone.addEventListener('pointerenter', measure);
    zone.addEventListener('pointermove', onMove as EventListener);
    zone.addEventListener('pointerleave', onLeave);
    window.addEventListener('resize', measure);
    measure();
    return () => {
      zone.removeEventListener('pointerenter', measure);
      zone.removeEventListener('pointermove', onMove as EventListener);
      zone.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('resize', measure);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <svg ref={ref} className="floor-mark" viewBox={`0 0 ${W} ${CUT}`} preserveAspectRatio="xMidYMin meet" role="img" aria-label="qbix">
      {LETTERS.map((l) => (
        <path key={l.x} d={l.d} />
      ))}
    </svg>
  );
}
