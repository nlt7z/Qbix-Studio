'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { logTemplates, type LogTemplate } from '@/lib/data';

type Entry = LogTemplate & { id: number; time: string };

function nowHM() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const MAX = 8;

export default function LogFeed() {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    const isLite = typeof document !== 'undefined' && document.body.classList.contains('perf-lite');
    let i = 0;
    const seed = () => {
      const initial: Entry[] = [];
      for (let k = 0; k < 4; k++) {
        const t = logTemplates[i++ % logTemplates.length];
        initial.unshift({ ...t, id: Date.now() + k, time: nowHM() });
      }
      setEntries(initial);
    };
    seed();
    if (isLite) return;
    const id = setInterval(() => {
      const t = logTemplates[i++ % logTemplates.length];
      setEntries((prev) => [{ ...t, id: Date.now(), time: nowHM() }, ...prev].slice(0, MAX));
    }, 4200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="log-feed">
      <AnimatePresence initial={false}>
        {entries.map((e) => {
          const lvlTxt = e.lvl === 'ok' ? 'OK' : e.lvl === 'warn' ? '!!' : 'ER';
          return (
            <motion.div
              key={e.id}
              className="log-entry"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <span className="t">[{e.time}]</span>
              <span className={`lvl ${e.lvl === 'ok' ? '' : e.lvl}`}>{lvlTxt}</span>
              <span dangerouslySetInnerHTML={{ __html: e.msg }} />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
