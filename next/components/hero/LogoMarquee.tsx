import { LOGOS } from '@/components/TrustLogos';

/**
 * Where the team studied and worked — company marks and school names in one
 * looping strip. Pure CSS (compositor translate), two copies for a seamless
 * loop; hovering holds it, reduced motion shows a static wrapped row.
 */

const SCHOOLS = ['University of Washington', 'Pratt Institute', 'Northwestern University'];

type Item = { kind: 'logo'; name: string; viewBox: string; d: string } | { kind: 'school'; name: string };

// Interleave so schools and companies alternate along the strip.
const ITEMS: Item[] = (() => {
  const logos: Item[] = LOGOS.map((l) => ({ kind: 'logo', ...l }));
  const schools: Item[] = SCHOOLS.map((name) => ({ kind: 'school', name }));
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
        <li key={it.name} className={`marquee-item marquee-item--${it.kind}`}>
          {it.kind === 'logo' ? (
            <svg viewBox={it.viewBox} fill="currentColor" role="img" aria-label={it.name}>
              <path d={it.d} />
            </svg>
          ) : (
            <span>{it.name}</span>
          )}
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
