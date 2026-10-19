'use client';

import { useEffect, useRef, type CSSProperties } from 'react';

/**
 * The lime highlighter: a bar slides across a key phrase, left to right, as
 * you scroll on once the phrase is up on the screen, and back if you scroll
 * back, so you see it move with you. The
 * bar is a clipped window holding an ink copy of the words that
 * counter-slides, so the type never moves and each letter turns ink exactly
 * as the lime reaches it. Near the end of a page, where there's no scroll
 * left to carry it the whole way, it finishes at the bottom of the page.
 *
 * The copy is aria-hidden and unselectable, so the phrase is read and copied
 * once. Keep phrases short: the line doesn't wrap.
 */

// Every marker on the page, moved by one scroll listener. A marker's bar is
// carried by the scroll from where the page was when the phrase came up past
// nine tenths of the screen (y0): a third of a screen more and it's whole.
// Measured from the scroll, not the phrase's place, so it also plays where the
// words are pinned while the page scrolls on.
const markers = new Map<HTMLElement, { y0: number | null }>();
let raf = 0;
const ease = (x: number) => x * x * (3 - 2 * x);
function paint() {
  raf = 0;
  const vh = window.innerHeight, y = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - vh;
  const range = vh * 0.32;
  markers.forEach((m, el) => {
    const r = el.getBoundingClientRect();
    if (m.y0 === null) {
      if (r.top > vh * 0.9 || r.bottom < 0) {
        el.style.setProperty('--mark', '0');
        return;
      }
      // already well on screen (a reload mid-page, or coming back down to it): drawn
      m.y0 = r.top < vh * 0.6 ? y - range : y;
    }
    // near the bottom of the page, it finishes where the page does
    const room = Math.max(1, Math.min(range, maxScroll - m.y0));
    const p = Math.min(1, Math.max(0, (y - m.y0) / room));
    el.style.setProperty('--mark', ease(p).toFixed(4));
  });
}
const request = () => {
  if (!raf) raf = requestAnimationFrame(paint);
};
const reset = () => {
  markers.forEach((m) => (m.y0 = null));
  request();
};

export default function Marker({
  children,
  className = '',
}: {
  children: string;
  className?: string;
  /** No longer used: the bar follows the scroll. */
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.setProperty('--mark', '1');
      return;
    }
    markers.set(el, { y0: null });
    if (markers.size === 1) {
      window.addEventListener('scroll', request, { passive: true });
      window.addEventListener('resize', reset);
    }
    request();
    return () => {
      markers.delete(el);
      if (!markers.size) {
        window.removeEventListener('scroll', request);
        window.removeEventListener('resize', reset);
      }
    };
  }, []);
  return (
    <span ref={ref} className={`marker ${className}`} style={{ '--mark': 0 } as CSSProperties}>
      {children}
      <span className="marker-bar" aria-hidden>
        <span className="marker-in">{children}</span>
      </span>
    </span>
  );
}
