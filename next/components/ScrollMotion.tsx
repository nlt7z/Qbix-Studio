import type { CSSProperties } from 'react';

/**
 * Markup for the homepage scroll choreography. All the motion lives in
 * app/home-motion.css as CSS scroll-driven animations (compositor-only
 * transforms, no per-frame JS); these components only lay out the pieces.
 * Without scroll-timeline support, or with reduced motion, everything renders
 * at rest.
 */

const COLS = 24;
const ROWS = 3;
// Deterministic jitter so server and client render the same pattern.
const jitter = (c: number, r: number) => {
  const x = Math.sin(c * 12.9898 + r * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * PixelEdge — the leading edge of a rising panel, broken into square pixels
 * that grow in as the panel slides up (a halftone takeover, in Qbix cubes).
 * The row against the panel fills solid; the rows above settle into a
 * dither, and the pixels that don't stay flash once on the way.
 */
export function PixelEdge() {
  const cells = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const j = jitter(c, r);
      const depth = ROWS - 1 - r;                 // 0 = the row touching the panel
      const stays = depth === 0 || (depth === 1 ? j < 0.6 : j < 0.24);
      const at = depth * 12 + j * 26;             // where in the panel's entry it starts, %
      cells.push(
        <i
          key={`${r}-${c}`}
          className={stays ? undefined : 'px-flash'}
          style={{ '--a': at.toFixed(1) } as CSSProperties}
        />,
      );
    }
  }
  return (
    <div className="px-edge" aria-hidden>
      {cells}
    </div>
  );
}
