'use client';

import { useEffect } from 'react';
import { MotionGlobalConfig } from 'framer-motion';

/**
 * Fast scrolling never outruns the content. While the page is being flung
 * (smoothed scroll speed above FAST px/ms), framer-motion's global
 * `skipAnimations` is on: any entrance that triggers in that moment lands on
 * its end state at once instead of starting a 0.6–1.2 s reveal the visitor
 * has already scrolled past. Animations already running finish normally, and
 * at a normal reading pace every reveal plays in full. Scroll-scrubbed motion
 * (home-motion.css) is untouched: it is tied to position, so it always
 * completes when its stretch of page is reached.
 *
 * Also mirrors the state on <html data-fast-scroll> for CSS that wants it.
 */
const FAST = 2.4;     // px per ms ≈ 2400 px/s — a fling, not a read
const SETTLE_MS = 160;

export default function FastScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = document.documentElement;
    let lastY = window.scrollY;
    let lastT = performance.now();
    let speed = 0;
    let settle = 0;
    const set = (fast: boolean) => {
      if (MotionGlobalConfig.skipAnimations === fast) return;
      MotionGlobalConfig.skipAnimations = fast;
      root.toggleAttribute('data-fast-scroll', fast);
    };
    const onScroll = () => {
      const t = performance.now();
      const y = window.scrollY;
      const instant = Math.abs(y - lastY) / Math.max(1, t - lastT);
      speed = speed * 0.6 + instant * 0.4;
      lastY = y;
      lastT = t;
      set(speed > FAST);
      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        speed = 0;
        set(false);
      }, SETTLE_MS);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(settle);
      set(false);
    };
  }, []);
  return null;
}
