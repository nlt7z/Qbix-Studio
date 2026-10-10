'use client';

import { useEffect } from 'react';

/**
 * Sticky panels in `.stacked` pin at top:0 — fine for panels that fit one
 * screen, but a taller panel would pin with its bottom edge below the fold and
 * the next panel would slide over content nobody ever saw. For those, pin at
 * the bottom instead (top = viewport − height): the whole panel scrolls into
 * view first, then holds while the next one covers it.
 */
export default function StackFit() {
  useEffect(() => {
    const panels = Array.from(document.querySelectorAll<HTMLElement>('.stacked > section'));
    const fit = () => {
      const vh = window.innerHeight;
      for (const el of panels) {
        el.style.top = '';
        // Below the stacking breakpoint panels flow normally (some are
        // position:relative) — an offset there would shift them, not pin them.
        if (getComputedStyle(el).position !== 'sticky') continue;
        const over = el.offsetHeight - vh;
        if (over > 0) el.style.top = `${-over}px`;
      }
    };
    fit();
    const ro = new ResizeObserver(fit);
    panels.forEach((p) => ro.observe(p));
    window.addEventListener('resize', fit);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', fit);
    };
  }, []);

  return null;
}
