'use client';

import { useEffect, useRef, useState } from 'react';

const FMT = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Los_Angeles',
  hour12: false,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

/** Pacific wall-clock time, DST-aware. */
function pacific() {
  const parts = FMT.formatToParts(new Date());
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? '0');
  const h = get('hour') % 24;
  return { h, m: get('minute'), s: get('second') };
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Studio time — a large instrument dial plus a big digital readout of the
 * studio's local (Pacific) time. The second hand sweeps continuously on
 * requestAnimationFrame (hands are moved via refs, so React only re-renders
 * the digits once a second). Reduced motion: hands step once a second.
 */
export default function StudioClock() {
  const hourRef = useRef<SVGGElement | null>(null);
  const minRef = useRef<SVGGElement | null>(null);
  const secRef = useRef<SVGGElement | null>(null);
  const [now, setNow] = useState<{ h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let lastS = -1;
    let base = pacific();
    let baseAt = performance.now();

    const place = (sec: number) => {
      const { h, m } = base;
      const totalSec = h * 3600 + m * 60 + sec;
      secRef.current?.setAttribute('transform', `rotate(${(sec % 60) * 6} 50 50)`);
      minRef.current?.setAttribute('transform', `rotate(${(totalSec / 10) % 360} 50 50)`);
      hourRef.current?.setAttribute('transform', `rotate(${(totalSec / 120) % 360} 50 50)`);
    };

    const frame = () => {
      const elapsed = (performance.now() - baseAt) / 1000;
      if (elapsed >= 1) {
        base = pacific();
        baseAt = performance.now();
      }
      const sec = base.s + (reduce ? 0 : Math.min(0.999, (performance.now() - baseAt) / 1000));
      place(sec);
      if (base.s !== lastS) {
        lastS = base.s;
        setNow({ ...base });
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  const h12 = now ? ((now.h + 11) % 12) + 1 : null;
  const ampm = now ? (now.h < 12 ? 'AM' : 'PM') : '';

  return (
    <div className="sclock" role="timer" aria-label={now ? `Studio time ${h12}:${pad(now.m)} ${ampm} Pacific` : 'Studio time'}>
      <svg className="sclock-dial" viewBox="0 0 100 100" aria-hidden>
        <circle cx="50" cy="50" r="48.5" fill="none" stroke="currentColor" strokeOpacity="0.28" strokeWidth="1" />
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.8" />
        {Array.from({ length: 60 }, (_, i) => {
          const hour = i % 5 === 0;
          return (
            <line
              key={i}
              x1="50"
              y1={hour ? 7 : 7.5}
              x2="50"
              y2={hour ? 15 : 10.5}
              stroke="currentColor"
              strokeOpacity={hour ? 0.75 : 0.26}
              strokeWidth={hour ? 1.8 : 0.7}
              transform={`rotate(${i * 6} 50 50)`}
            />
          );
        })}
        {[
          ['12', 50, 25],
          ['3', 76, 53.5],
          ['6', 50, 81],
          ['9', 24, 53.5],
        ].map(([n, x, y]) => (
          <text key={n} x={x} y={y} textAnchor="middle" className="sclock-num">
            {n}
          </text>
        ))}
        <g ref={hourRef}>
          <rect x="47.9" y="27" width="4.2" height="26" fill="currentColor" />
        </g>
        <g ref={minRef}>
          <rect x="48.6" y="12" width="2.8" height="41" fill="currentColor" />
        </g>
        <g ref={secRef}>
          <rect x="49.5" y="9" width="1" height="53" fill="currentColor" opacity="0.85" />
        </g>
        {/* live core */}
        <rect x="46.5" y="46.5" width="7" height="7" fill="var(--signal)" />
        <rect x="48.8" y="48.8" width="2.4" height="2.4" fill="var(--signal-dark)" />
      </svg>
      <div className="sclock-read">
        <span className="sclock-label mono">Studio time</span>
        <span className="sclock-time">
          <span className="sclock-hm">{now ? `${h12}:${pad(now.m)}` : '--:--'}</span>
          <span className="sclock-s">{now ? `:${pad(now.s)}` : ''}</span>
          <span className="sclock-ampm mono">{ampm}</span>
        </span>
      </div>
    </div>
  );
}
