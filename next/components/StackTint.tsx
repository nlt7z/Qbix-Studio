'use client';

import { useEffect } from 'react';

/**
 * Per-panel base colours for the stacked landing.
 *
 * Each stacked section has its own identifiable centre colour — all extremely
 * dark, near-black, but carrying a faint hue so the sections read as distinct.
 * As a panel rises to cover the one beneath it, its background interpolates
 * FROM the previous panel's colour TO its own, keyed to its own entry progress
 * (top edge crossing the viewport). So neighbours converge right at the seam
 * (no hard colour edge) yet each panel settles on its own tone once it fully
 * covers — distinct centres, smooth transitions. Order matches the DOM:
 * hero · services · products · about · footer.
 */
// Electric-lime arc — pure lime hue (blue channel ~0, like #B8FF00 darkened),
// so the tint reads as the brand's electric green, not a murky forest green.
// Deepest at Products (the lab work), easing back toward the ends.
const CENTERS = [
  '#0E1400', // hero — dark lime-black
  '#1B2600', // services — electric lime, clearly lit
  '#2B3C00', // products — peak electric lime (ties to #B8FF00)
  '#1B2600', // about — electric lime
];

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(from: string, to: string, t: number): string {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

// Smooth the crossfade so the colour eases rather than tracking scroll linearly.
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export default function StackTint() {
  useEffect(() => {
    const panels = Array.from(
      document.querySelectorAll<HTMLElement>('.stacked > section, .stacked > footer'),
    );
    if (!panels.length) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight || 1;
      panels.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        // 0 = top edge at viewport bottom (about to cover); 1 = pinned at top.
        const p = Math.min(1, Math.max(0, 1 - rect.top / vh));
        const from = CENTERS[Math.max(0, i - 1)] ?? CENTERS[0];
        const to = CENTERS[Math.min(i, CENTERS.length - 1)];
        el.style.backgroundColor = mix(from, to, easeInOut(p));
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
      panels.forEach((el) => {
        el.style.removeProperty('background-color');
      });
    };
  }, []);

  return null;
}
