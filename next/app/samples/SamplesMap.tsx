'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { SAMPLE_GROUPS, SAMPLES_LEDE, TOWN_AT, type Sample } from '@/lib/samples';

/**
 * The samples on a map: Washington, Oregon and California drawn in dots on the dark, a lime square on each
 * town we've made something for, the studio in white. The block holds while the scroll flies from the
 * whole coast to each region in turn and back; at each region its samples are listed beside the map,
 * playing, each opening its own page. The outline is simplified on purpose; a new town only needs its place
 * in lib/samples.ts (TOWN_AT) and a region below that takes it in.
 */
const ALL = SAMPLE_GROUPS.flatMap((g) => g.samples);

// Washington, Oregon and California as one outline (longitude, latitude), simplified
const OUTLINE: [number, number][] = [
  [-124.7, 48.4], [-123.2, 48.2], [-123.0, 49.0], [-117.03, 49.0], [-117.03, 46.0], [-116.9, 45.9], [-117.2, 44.3],
  [-117.0, 42.0], [-120.0, 42.0], [-120.0, 39.0], [-114.6, 35.0], [-114.7, 32.7], [-117.1, 32.5], [-117.3, 33.2],
  [-118.4, 33.8], [-119.0, 34.1], [-120.6, 34.6], [-121.9, 36.6], [-122.5, 37.7], [-123.0, 38.3], [-123.8, 39.8],
  [-124.4, 40.4], [-124.2, 41.9], [-124.5, 42.8], [-124.0, 44.6], [-123.9, 46.2], [-124.1, 46.9], [-124.7, 48.4],
];
const K = 100;
const C = Math.cos((41 * Math.PI) / 180);
const proj = ([lat, lon]: [number, number]): [number, number] => [(lon + 125) * C * K, (49.2 - lat) * K];

type Box = [x: number, y: number, w: number, h: number];
const WHOLE: Box = [-60, -40, 960, 1780];
const REGIONS: { name: string; towns: string[]; box: Box }[] = [
  { name: 'Puget Sound', towns: ['Gig Harbor', 'Woodinville', 'Lake Tapps', 'Eatonville', 'Deming'], box: [110, 10, 200, 260] },
  { name: 'Eastern Washington', towns: ['Spokane', 'Cheney'], box: [470, 70, 200, 190] },
  { name: 'Oregon', towns: ['Columbia River Gorge', 'Mt. Hood', 'Oregon City', 'Winston'], box: [50, 320, 300, 330] },
  { name: 'Northern California', towns: ['Novato', 'Sacramento', 'Grass Valley'], box: [110, 950, 260, 220] },
  { name: 'Southern California', towns: ['Fresno', 'Altadena', 'Menifee'], box: [330, 1190, 330, 400] },
];
const STOPS: Box[] = [WHOLE, ...REGIONS.map((r) => r.box), WHOLE];
const TOWNS = Array.from(new Set(ALL.map((s) => s.town)));
const STUDIO = proj([47.61, -122.33]);

const and = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

function Card({ s, still }: { s: Sample; still: boolean }) {
  return (
    <Link className="smap-card" href={`/samples/${s.slug}`}>
      <span className="smap-media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/samples/${s.slug}/thumb.webp`} alt="" width={540} height={960} />
        {!still && <video src={`/samples/${s.slug}/preview.mp4`} poster={`/samples/${s.slug}/thumb.webp`} muted loop playsInline autoPlay preload="none" />}
      </span>
      <span className="smap-t">
        <b>{s.name}</b>
        <span>
          {s.town} · {s.line}
        </span>
      </span>
    </Link>
  );
}

export default function SamplesMap({ jump }: { jump: { href: string; title: string; n: number }[] }) {
  const sec = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const pins = useRef<(HTMLSpanElement | null)[]>([]);
  const hero = useRef<HTMLDivElement>(null);
  const [stop, setStop] = useState(0);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const s = sec.current, st = stage.current, canvas = cv.current;
    const ctx = canvas?.getContext('2d');
    if (!s || !st || !canvas || !ctx) return;
    setStill(matchMedia('(prefers-reduced-motion: reduce)').matches);

    // the land as dots, once, in map units
    const poly = OUTLINE.map(([lon, lat]) => proj([lat, lon]));
    const inside = (x: number, y: number) => {
      let c = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const [xi, yi] = poly[i], [xj, yj] = poly[j];
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
      }
      return c;
    };
    const dots: [number, number][] = [];
    for (let y = 0; y < 1700; y += 14) for (let x = 0; x < 900; x += 14) if (inside(x, y)) dots.push([x, y]);
    const at = [...TOWNS.map((t) => proj(TOWN_AT[t] ?? [47.6, -122.3])), STUDIO];

    let W = 0, H = 0, dpr = 1, raf = 0, shown = -1;
    const size = () => {
      W = st.clientWidth;
      H = st.clientHeight;
      dpr = Math.min(2, devicePixelRatio || 1);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
    };
    // where the camera looks for a box: the room left of the list (on a phone, the top of the screen);
    // the opening keeps the left for its words
    const cam = (b: Box, k: number) => {
      const phone = W < 860;
      const right = !phone && k > 0 ? Math.min(440, W * 0.4) + 48 : 0;
      const left = !phone && k === 0 ? W * 0.42 : 0;
      // on a phone the opening's words take the top, the map sits under them; after, the map is on top
      const top = phone && k === 0 ? H * 0.46 : 64 + 24;
      const room = W - right - left - 48;
      const hh = (phone && k > 0 ? H * 0.52 : H) - top - 24;
      const sc = Math.min(room / b[2], hh / b[3]);
      return { s: sc, x: left + 24 + room / 2 - (b[0] + b[2] / 2) * sc, y: top + hh / 2 - (b[1] + b[3] / 2) * sc };
    };
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const draw = () => {
      raf = 0;
      const r = s.getBoundingClientRect();
      if (r.bottom < -H || r.top > innerHeight * 1.5) return;
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, s.offsetHeight - innerHeight)));
      const n = STOPS.length - 1;
      const f = p * n;
      const i = Math.min(n - 1, Math.floor(f));
      const t = f - i;
      // hold at each stop, then travel to the next
      const e = ease(Math.min(1, Math.max(0, (t - 0.4) / 0.6)));
      const a = cam(STOPS[i], i), b = cam(STOPS[i + 1], i + 1);
      const c = { s: a.s + (b.s - a.s) * e, x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e };
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.26)';
      const d = Math.max(1.8, Math.min(3.2, 2.4 * c.s));
      for (const [x, y] of dots) {
        const sx = c.x + x * c.s, sy = c.y + y * c.s;
        if (sx < -4 || sy < -4 || sx > W + 4 || sy > H + 4) continue;
        ctx.fillRect(sx - d / 2, sy - d / 2, d, d);
      }
      at.forEach(([x, y], k) => {
        const el = pins.current[k];
        if (!el) return;
        el.style.transform = `translate(${c.x + x * c.s}px, ${c.y + y * c.s}px)`;
        // names only once the map is close enough to read them; the studio always
        if (c.s > 0.9 || k === at.length - 1) el.dataset.named = '';
        else delete el.dataset.named;
      });
      if (hero.current) hero.current.style.visibility = p < 0.06 ? 'visible' : 'hidden';
      const now = t < 0.55 ? i : i + 1;
      if (now !== shown) {
        shown = now;
        setStop(now);
      }
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };
    const onResize = () => {
      size();
      kick();
    };
    size();
    draw();
    addEventListener('scroll', kick, { passive: true });
    addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('scroll', kick);
      removeEventListener('resize', onResize);
    };
  }, []);

  const region = stop > 0 && stop <= REGIONS.length ? REGIONS[stop - 1] : null;
  const here = region ? ALL.filter((s) => region.towns.includes(s.town)) : [];
  const end = stop === STOPS.length - 1;

  return (
    <section ref={sec} className="block smap" data-tone="black" id="top" style={{ '--len': `${STOPS.length * 90}svh` } as CSSProperties} aria-label="Samples on a map">
      <div ref={stage} className="smap-stage">
        <canvas ref={cv} className="smap-cv" aria-hidden="true" />
        <div className="smap-pins" aria-hidden="true">
          {[...TOWNS, 'Qbix, Seattle'].map((t, k) => (
            <span
              key={t}
              ref={(x) => {
                pins.current[k] = x;
              }}
              className={`smap-pin${k === TOWNS.length ? ' studio' : ''}`}
            >
              <i />
              <span>{t}</span>
            </span>
          ))}
        </div>
        <div ref={hero} className="smap-hero">
          <p className="kicker">Samples</p>
          <h1 className="h1">Made for real places.</h1>
          <p className="lede">
            {SAMPLES_LEDE} {ALL.length} businesses in {TOWNS.length} towns, across Washington, Oregon and California.
          </p>
        </div>
        {(region || end) && (
          <div className="smap-panel" key={stop}>
            {region ? (
              <>
                <p className="smap-k">
                  {here.length} {here.length === 1 ? 'sample' : 'samples'}
                </p>
                <h2 className="smap-h">{region.name}</h2>
                <p className="smap-sub">{and(region.towns)}</p>
                <div className="smap-cards">
                  {here.map((s) => (
                    <Card key={s.slug} s={s} still={still} />
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2 className="smap-h">
                  {ALL.length} businesses, {TOWNS.length} towns, 3 states.
                </h2>
                <p className="smap-sub">Every one below, by the kind of business.</p>
                <ul className="smap-jump">
                  {jump.map((j) => (
                    <li key={j.href}>
                      <a href={j.href}>
                        {j.title}
                        <span>{j.n}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
