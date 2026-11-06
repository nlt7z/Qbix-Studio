'use client';

import { useEffect, useRef } from 'react';

/** Strata's own film in a plain window, the window a link to it. It plays, muted and looped, only while
 * the window is in view; with reduced motion the still stays. */
export default function Film() {
  const box = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = box.current;
    const v = el?.querySelector('video');
    if (!el || !v || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    v.muted = true;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <a className="film" href="https://stratadesign.app" target="_blank" rel="noopener noreferrer" aria-label="Open Strata at stratadesign.app" data-up="">
      <span className="film-bar" aria-hidden="true">
        <span className="film-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="film-addr">stratadesign.app</span>
        <span className="film-go">
          <b>Live</b> ↗︎
        </span>
      </span>
      <span className="film-box" ref={box}>
        <video src="/previews/strata.mp4" poster="/previews/strata.jpg" muted loop playsInline preload="none" />
      </span>
    </a>
  );
}
