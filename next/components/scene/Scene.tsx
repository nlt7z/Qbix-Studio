'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { Timeline } from '@/lib/scene/timeline';
import { playScene } from '@/lib/scene/driver';
import '@/app/scenes.css';

/**
 * Scenes waiting to be built, one per idle moment after the page loads (a
 * scene coming near the screen is built at once instead), so neither the
 * load nor the scroll pays for all of them together.
 */
const idle: (() => void)[] = [];
let pumping = false;
function pump() {
  const next = idle.shift();
  if (!next) {
    pumping = false;
    return;
  }
  next();
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
  if (w.requestIdleCallback) w.requestIdleCallback(pump, { timeout: 1500 });
  else window.setTimeout(pump, 120);
}
function whenIdle(fn: () => void) {
  idle.push(fn);
  if (pumping) return;
  pumping = true;
  window.setTimeout(pump, 600);
}

/** The scene's elements by name (`data-k`). */
export type Pick = {
  (k: string): HTMLElement | null;
  all: (prefix: string) => HTMLElement[];
};

/**
 * A flat, drawn scene: the markup is laid out once at its own size (w × h,
 * in its own px), zoomed to fit the box it's put in, and played by the page's
 * scroll (lib/scene/driver.ts) through the timeline `build` writes. Elements
 * the timeline moves are named with `data-k`. Hidden until its timeline is
 * built, so nothing flashes in its final place first.
 */
export default function Scene({
  n,
  w = 720,
  h = 540,
  intro = 'scroll',
  label,
  build,
  className = '',
  children,
}: {
  /** how many states it has */
  n: number;
  w?: number;
  h?: number;
  intro?: 'scroll' | 'load';
  label: string;
  build: (q: Pick, tl: Timeline) => void;
  className?: string;
  children: ReactNode;
}) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const scnRef = useRef<HTMLDivElement | null>(null);
  const buildRef = useRef(build);
  buildRef.current = build;

  useEffect(() => {
    const box = boxRef.current, scn = scnRef.current;
    const section = box?.closest<HTMLElement>('[data-chapter]');
    if (!box || !scn || !section) return;

    // zoomed to fit its box (zoom, not a transform, so hairlines and type stay sharp)
    const fit = () => {
      const k = Math.min(box.clientWidth / w, box.clientHeight / h);
      if (k > 0) scn.style.setProperty('zoom', String(Math.round(k * 1000) / 1000));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);

    // Built (its timeline measured and compiled) once it's within a couple of
    // screens, so a page's scenes don't all build at once while it loads.
    let stop: (() => void) | null = null;
    let cancelled = false;
    const build = () => {
      if (cancelled || stop) return;
      const q = ((k: string) => scn.querySelector<HTMLElement>(`[data-k="${k}"]`)) as Pick;
      q.all = (prefix: string) => Array.from(scn.querySelectorAll<HTMLElement>(`[data-k^="${prefix}"]`));
      const tl = new Timeline(n);
      try {
        buildRef.current(q, tl);
        tl.build(0);
      } catch (err) {
        console.warn('[scene] could not build', err);
      }
      stop = playScene({ section, tl, n, intro });
      scn.classList.add('is-ready');
    };
    const near = new IntersectionObserver(
      (list) => {
        if (!list.some((e) => e.isIntersecting)) return;
        near.disconnect();
        document.fonts.ready.then(build);
      },
      { rootMargin: '200% 0px 200% 0px' },
    );
    near.observe(section);
    document.fonts.ready.then(() => whenIdle(build));
    return () => {
      cancelled = true;
      near.disconnect();
      ro.disconnect();
      stop?.();
    };
  }, [n, w, h, intro]);

  return (
    <div ref={boxRef} className={`scn-box ${className}`} role="img" aria-label={label}>
      <div ref={scnRef} className="scn" style={{ width: w, height: h } as CSSProperties} aria-hidden>
        {children}
      </div>
    </div>
  );
}
