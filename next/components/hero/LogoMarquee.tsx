import type { CSSProperties } from 'react';
import { LOGOS } from '@/components/TrustLogos';
import { SCHOOL_LOGOS } from '@/components/hero/schoolLogos';

/**
 * Where the team studied and worked — company and school marks in one
 * looping strip. Pure CSS (compositor translate), two copies for a seamless
 * loop; hovering holds it, reduced motion shows a static wrapped row.
 */

type Item = { kind: 'logo' | 'school'; name: string; viewBox: string; d: string; transform?: string };

// Wordmarks carry their own cap height, so each school gets a height that
// sets its letters level with the company glyphs.
const SCHOOL_H: Record<string, number> = {
  'University of Washington': 23,
  'Pratt Institute': 21,
  'Northwestern University': 20,
};

// Interleave so schools and companies alternate along the strip.
const ITEMS: Item[] = (() => {
  const logos: Item[] = LOGOS.map((l) => ({ kind: 'logo', ...l }));
  const schools: Item[] = SCHOOL_LOGOS.map((l) => ({ kind: 'school', ...l }));
  const out: Item[] = [];
  const max = Math.max(logos.length, schools.length);
  for (let i = 0; i < max; i++) {
    if (logos[i]) out.push(logos[i]);
    if (i % 2 === 0 && schools[i / 2]) out.push(schools[i / 2]);
  }
  return out;
})();

function Row({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul className="marquee-row" aria-hidden={hidden || undefined}>
      {ITEMS.map((it) => (
        <li
          key={it.name}
          className={`marquee-item marquee-item--${it.kind}`}
          style={it.kind === 'school' ? ({ '--h': `${SCHOOL_H[it.name] ?? 22}px` } as CSSProperties) : undefined}
        >
          <svg viewBox={it.viewBox} fill="currentColor" role="img" aria-label={it.name}>
            <path d={it.d} transform={it.transform} />
          </svg>
        </li>
      ))}
    </ul>
  );
}

export default function LogoMarquee() {
  return (
    <div className="marquee-block">
      <span className="marquee-label mono">Studied and worked at</span>
      <div className="marquee">
        <div className="marquee-track">
          <Row />
          <Row hidden />
        </div>
      </div>
    </div>
  );
}
