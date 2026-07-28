'use client';

import { useEffect, useState } from 'react';

type T = { h: number; m: number; s: number };

/** Current wall-clock time in Pacific (America/Los_Angeles), DST-aware. */
function pstNow(): T {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date());
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? '0');
  let h = get('hour');
  if (h === 24) h = 0; // some engines emit 24 at midnight
  return { h, m: get('minute'), s: get('second') };
}

/**
 * A tiny live analog clock ticking in Pacific time — the studio's local hour,
 * shown beside the "PST" label in the hero trust line. Renders a neutral face
 * on the server and starts ticking once mounted, so there's no hydration jump.
 */
export default function PstClock({ size = 18 }: { size?: number }) {
  const [t, setT] = useState<T | null>(null);

  useEffect(() => {
    setT(pstNow());
    const id = window.setInterval(() => setT(pstNow()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const { h, m, s } = t ?? { h: 10, m: 8, s: 0 };
  const secDeg = s * 6;
  const minDeg = m * 6 + s * 0.1;
  const hourDeg = (h % 12) * 30 + m * 0.5;

  const hand = (deg: number, len: number, w: number, opacity = 1) => (
    <line
      x1="12"
      y1="12"
      x2="12"
      y2={12 - len}
      stroke="currentColor"
      strokeOpacity={opacity}
      strokeWidth={w}
      strokeLinecap="round"
      transform={`rotate(${deg} 12 12)`}
    />
  );

  return (
    <svg
      className="pst-clock"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-label="Current time in Seattle (Pacific)"
    >
      {/* Bezel — two concentric rings for a little instrument depth */}
      <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeOpacity="0.26" strokeWidth="0.7" />
      <circle cx="12" cy="12" r="9.9" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.6" />

      {/* 60 minute ticks; every fifth (the hours) reads longer + brighter */}
      {Array.from({ length: 60 }, (_, i) => {
        const major = i % 5 === 0;
        return (
          <line
            key={i}
            x1="12"
            y1="2.3"
            x2="12"
            y2={major ? 3.9 : 3.0}
            stroke="currentColor"
            strokeOpacity={major ? 0.55 : 0.22}
            strokeWidth={major ? 0.9 : 0.45}
            strokeLinecap="round"
            transform={`rotate(${i * 6} 12 12)`}
          />
        );
      })}

      {/* Hands — hour, minute, and a thin second hand with a counterweight tail */}
      {hand(hourDeg, 4.4, 1.4, 0.95)}
      {hand(minDeg, 6.4, 1.0, 0.95)}
      <line
        x1="12"
        y1="13.9"
        x2="12"
        y2={12 - 7.0}
        stroke="currentColor"
        strokeOpacity="0.8"
        strokeWidth="0.5"
        strokeLinecap="round"
        transform={`rotate(${secDeg} 12 12)`}
      />

      {/* Live core — fluorescent lime hub with a soft bloom */}
      <circle cx="12" cy="12" r="2" fill="var(--signal)" opacity="0.22" />
      <circle cx="12" cy="12" r="1.05" fill="var(--signal)" />
      <circle cx="12" cy="12" r="0.4" fill="var(--signal-dark)" />
    </svg>
  );
}
