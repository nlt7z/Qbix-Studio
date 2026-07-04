'use client';

import { useEffect } from 'react';

export default function Overlays() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lowCpu = (navigator.hardwareConcurrency || 8) <= 6;
    const dataSaver =
      'connection' in navigator &&
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    const isMobile = window.matchMedia('(max-width: 900px)').matches;
    const lowMemory =
      'deviceMemory' in navigator &&
      ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) <= 4;
    if (prefersReducedMotion || lowCpu || dataSaver || isMobile || lowMemory) {
      document.body.classList.add('perf-lite');
    }

    // Adaptive fallback: if rAF cadence drops below ~45fps for ~1s, downgrade.
    let frames = 0;
    let start = performance.now();
    let rafId = 0;
    const sample = (t: number) => {
      frames++;
      if (t - start >= 1000) {
        if (frames < 45 && !document.body.classList.contains('perf-lite')) {
          document.body.classList.add('perf-lite');
        }
        return;
      }
      rafId = requestAnimationFrame(sample);
    };
    rafId = requestAnimationFrame(sample);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <>
      <div className="noise" />
      <div className="scanlines" />
      <div className="vignette" />
    </>
  );
}
