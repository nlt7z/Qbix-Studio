'use client';

import { useEffect, useRef } from 'react';

/**
 * A figure whose numbers count up from 0 once `play` turns on ("$5,000", "1 to 3 weeks"), the words around them
 * left as they are. Written as the final text first, so it reads right before and without the count.
 */
export default function Count({ text, play }: { text: string; play: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !play || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const parts = text.split(/(\d[\d,]*)/);
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / 1100);
      const e = 1 - Math.pow(1 - k, 4);
      el.textContent = parts.map((p, i) => (i % 2 ? Math.round(Number(p.replace(/,/g, '')) * e).toLocaleString('en-US') : p)).join('');
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      el.textContent = text;
    };
  }, [play, text]);
  return <span ref={ref}>{text}</span>;
}
