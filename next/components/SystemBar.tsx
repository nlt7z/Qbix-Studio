'use client';

import { useEffect, useState } from 'react';

function formatTime(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function SystemBar() {
  const [time, setTime] = useState('--:--:--');

  useEffect(() => {
    const tick = () => setTime(formatTime(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="system-bar">
      <div className="sb-item brand">
        qbix<span className="slash">//</span>&nbsp;OS
      </div>
      <div className="sb-item">BUILD 0.7.13</div>
      <div className="sb-item">
        SECTOR <span style={{ color: 'var(--off)' }}>UNKNOWN</span>
      </div>
      <div className="sb-spacer" />
      <div className="sb-item">
        SIGNAL <span style={{ color: 'var(--signal)' }}>78%</span>
      </div>
      <div className="sb-item">{time}</div>
      <div className="sb-item" style={{ borderRight: 'none', color: 'var(--white)' }}>
        <span className="sb-dot" />
        ONLINE
      </div>
    </header>
  );
}
