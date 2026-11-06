'use client';

import { useEffect, useState } from 'react';
import { SECTIONS, setVariant, usePicks } from '@/components/blocks/variants/store';

/** The 方案 panel, bottom left: each section and its five options; the one in view is named. */
export default function Panel() {
  const picks = usePicks();
  const [open, setOpen] = useState(true);
  useEffect(() => {
    if (matchMedia('(max-width: 699px)').matches) setOpen(false);
  }, []);
  const summary = SECTIONS.map((s) => picks[s.k] ?? 1).join(' ');
  return (
    <aside className="vp" aria-label="方案">
      <button type="button" className="vp-head" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <b>方案</b>
        <span className="vp-sum">{summary}</span>
        <svg viewBox="0 0 10 10" aria-hidden="true">
          <path d="M1.5 6.5 5 3l3.5 3.5" />
        </svg>
      </button>
      {open && (
        <div className="vp-body">
          {SECTIONS.map((s) => {
            const n = picks[s.k] ?? 1;
            return (
              <div key={s.k} className="vp-row">
                <span className="vp-k">{s.name}</span>
                <span className="vp-n" role="radiogroup" aria-label={s.name}>
                  {s.opts.map((o, i) => (
                    <button key={o} type="button" role="radio" aria-checked={n === i + 1} title={o} onClick={() => setVariant(s.k, i + 1)}>
                      {i + 1}
                    </button>
                  ))}
                </span>
                <span className="vp-o">{s.opts[n - 1]}</span>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}
