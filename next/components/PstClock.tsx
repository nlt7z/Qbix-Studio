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

  const hand = (deg: number, len: number, w: number, color: string) => (
    <line
      x1="12"
      y1="12"
      x2="12"
      y2={12 - len}
      stroke={color}
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
      <circle cx="12" cy="12" r="10.4" fill="none" stroke="currentColor" strokeOpacity="0.28" strokeWidth="1" />
      {/* 12 / 3 / 6 / 9 ticks */}
      {[0, 90, 180, 270].map((d) => (
        <line
          key={d}
          x1="12"
          y1="2.6"
          x2="12"
          y2="4"
          stroke="currentColor"
          strokeOpacity="0.4"
          strokeWidth="1"
          transform={`rotate(${d} 12 12)`}
        />
      ))}
      {hand(hourDeg, 4.6, 1.5, 'currentColor')}
      {hand(minDeg, 6.8, 1.2, 'currentColor')}
      {hand(secDeg, 7.4, 0.8, 'var(--signal)')}
      <circle cx="12" cy="12" r="1" fill="var(--signal)" />
    </svg>
  );
}
