'use client';

import { useEffect, useState } from 'react';

/**
 * Where the studio works and what time it is there: Seattle and the San
 * Francisco Bay Area, on Pacific time, ticking each second. Renders a neutral
 * placeholder on the server and starts once mounted (no hydration jump).
 */

const PLACES = ['Seattle, WA', 'San Francisco Bay Area'];
const TZ = 'America/Los_Angeles';

// Building a DateTimeFormat costs far more than using one; make it once.
let fmt: Intl.DateTimeFormat | null = null;
const clockFormat = () =>
  (fmt ??= new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true, timeZoneName: 'short',
  }));

function useStudioTime() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  if (!now) return null;
  const parts = clockFormat().formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return { hm: `${get('hour')}:${get('minute')}`, s: get('second'), ampm: get('dayPeriod'), zone: get('timeZoneName') };
}

/** Laid out like the marquee beside it: a small label over one line of the same height. */
export default function StudioTime() {
  const time = useStudioTime();
  return (
    <div className="studio">
      <span className="studio-label mono">{PLACES.join(' · ')}</span>
      <span className="studio-time" role="timer" aria-label={time ? `Studio time ${time.hm} ${time.ampm} ${time.zone}` : 'Studio time'}>
        <span className="studio-hm">{time ? time.hm : '--:--'}</span>
        <span className="studio-s">{time ? `:${time.s}` : ''}</span>
        <span className="studio-ampm mono">{time ? `${time.ampm} ${time.zone}` : ''}</span>
      </span>
    </div>
  );
}
