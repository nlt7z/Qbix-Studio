'use client';

import { useEffect, useState } from 'react';

/** The time in Seattle, ticking each second (footer option 5). */
export default function Clock() {
  const [now, setNow] = useState('');
  useEffect(() => {
    const f = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', minute: '2-digit', second: '2-digit' });
    const tick = () => setNow(f.format(new Date()));
    tick();
    const t = window.setInterval(tick, 1000);
    return () => window.clearInterval(t);
  }, []);
  return <span className="clock">{now || ' '}</span>;
}
