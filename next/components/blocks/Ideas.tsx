'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { BidArt, StrataArt } from '@/components/blocks/art/ProductArt';

/**
 * The ideas we've been brought, running in rows under our story: each row drifts its own way, faster while the
 * page is scrolled. Pointing at one stops its row and shows, by the pointer, the thing it became (the
 * products drawn, the local work as it was made). Only what is live.
 */
type Idea = { t: string; became: string; img?: string; vid?: string; art?: ReactNode; lime?: boolean };
const IDEAS: Idea[] = [
  { t: 'what if you bid on boxes no one can see into?', became: 'AI Bidding', art: <BidArt />, lime: true },
  { t: 'moodboard in, system out', became: 'Strata', art: <StrataArt /> },
  { t: 'flyers in 48 hours', became: 'Listing Launch Kit', img: '/samples/justin-allen/thumb.webp', vid: '/samples/justin-allen/preview.mp4' },
  { t: 'a calmer clinic site', became: 'Practice Website Refresh', img: '/motion/thumbs/practice-story.jpg' },
  { t: 'my listing, on Instagram', became: 'A listing, cut for Reels', img: '/samples/chris-conroy/thumb.webp', vid: '/samples/chris-conroy/preview.mp4' },
];
const ROWS = [
  [0, 1, 2, 3, 4],
  [3, 4, 0, 2, 1],
  [2, 1, 4, 0, 3],
];

export default function Ideas() {
  const box = useRef<HTMLDivElement>(null);
  const rows = useRef<(HTMLDivElement | null)[]>([]);
  const [hot, setHot] = useState<Idea | null>(null);
  const [pt, setPt] = useState({ x: 0, y: 0 });
  const held = useRef<number>(-1);

  useEffect(() => {
    const el = box.current;
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const x = ROWS.map((_, i) => (i % 2 ? -200 : 0));
    let speed = 0;
    let lastY = scrollY;
    let seen = false;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      seen = e.isIntersecting;
      if (seen && !raf) raf = requestAnimationFrame(loop);
    });
    io.observe(el);
    const onScroll = () => {
      speed = Math.min(14, speed + Math.abs(scrollY - lastY) * 0.06);
      lastY = scrollY;
    };
    const loop = () => {
      raf = 0;
      if (!seen) return;
      speed *= 0.93;
      rows.current.forEach((r, i) => {
        if (!r || held.current === i) return;
        x[i] -= (0.45 + speed) * (i % 2 ? -1 : 1);
        const w = r.scrollWidth / 3; // three copies of the row: wrap by one
        if (x[i] < -w) x[i] += w;
        if (x[i] > 0) x[i] -= w;
        r.style.transform = `translateX(${x[i]}px)`;
      });
      raf = requestAnimationFrame(loop);
    };
    addEventListener('scroll', onScroll, { passive: true });
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div
      ref={box}
      className="ideas"
      onPointerMove={(e) => {
        const b = e.currentTarget.getBoundingClientRect();
        setPt({ x: e.clientX - b.left, y: e.clientY - b.top });
      }}
      onPointerLeave={() => {
        setHot(null);
        held.current = -1;
      }}
    >
      {ROWS.map((row, i) => (
        <div
          key={i}
          ref={(r) => {
            rows.current[i] = r;
          }}
          className="ideas-row"
          aria-hidden={i > 0 ? true : undefined}
        >
          {[0, 1, 2].flatMap((copy) =>
            row.map((k) => (
              <span
                key={`${copy}-${k}`}
                className={`idea${IDEAS[k].lime ? ' lime' : ''}`}
                onPointerEnter={() => {
                  setHot(IDEAS[k]);
                  held.current = i;
                }}
                onPointerLeave={() => {
                  setHot(null);
                  held.current = -1;
                }}
              >
                {IDEAS[k].t}
              </span>
            )),
          )}
        </div>
      ))}
      {hot && (
        <span className="ideas-peek" aria-hidden="true" style={{ transform: `translate(${pt.x + 18}px, ${pt.y + 18}px)` }}>
          {hot.art ? (
            <span className="ideas-art">{hot.art}</span>
          ) : hot.vid ? (
            <video key={hot.vid} src={hot.vid} poster={hot.img} muted loop playsInline autoPlay />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={hot.img} alt="" />
          )}
          <span>{hot.became}</span>
        </span>
      )}
    </div>
  );
}
