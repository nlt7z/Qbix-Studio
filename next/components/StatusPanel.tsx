'use client';

import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useRef } from 'react';
import LogFeed from './LogFeed';

function Counter({ target, suffix = '', className = '' }: { target: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => String(Math.floor(v)).padStart(2, '0') + suffix);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, target, { duration: 0.9 + Math.random() * 0.4, ease: [0.2, 0.8, 0.2, 1] });
    return controls.stop;
  }, [inView, target, mv]);

  return <motion.span ref={ref} className={`v ${className}`}>{display}</motion.span>;
}

export default function StatusPanel() {
  return (
    <aside className="status-panel">
      <div className="panel-block">
        <div className="panel-label">System status</div>
        <div className="stat-row"><span className="k">Active projects</span><Counter target={4} className="signal" /></div>
        <div className="stat-row"><span className="k">Playable</span><Counter target={1} /></div>
        <div className="stat-row"><span className="k">In development</span><Counter target={3} /></div>
        <div className="stat-row"><span className="k">Signal strength</span><Counter target={78} suffix="%" className="signal" /></div>
      </div>

      <div className="panel-block">
        <div className="panel-label">Founders</div>
        <div className="stat-row"><span className="k">Founders</span><Counter target={2} /></div>
        <div className="stat-row"><span className="k">Collaborators</span><Counter target={6} /></div>
        <div className="stat-row">
          <span className="k">Origin</span>
          <span className="v" style={{ fontSize: 13, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--dust)' }}>CLASSIFIED</span>
        </div>
      </div>

      <div className="panel-block">
        <div className="panel-label">Log feed</div>
        <LogFeed />
      </div>
    </aside>
  );
}
