'use client';

import { useEffect, useRef, type CSSProperties } from 'react';

/**
 * The lime highlighter: a bar slides across a key phrase, left to right, once
 * the phrase is well on screen. The bar is a clipped window holding an ink
 * copy of the words that counter-slides, so the type never moves and each
 * letter turns ink exactly as the lime reaches it. Time-based (not scrubbed),
 * so it always plays in full, even at the very end of a page where there's no
 * scroll left to drive it.
 *
 * The copy is aria-hidden and unselectable, so the phrase is read and copied
 * once. Keep phrases short: the line doesn't wrap.
 */
export default function Marker({
  children,
  className = '',
  delay,
}: {
  children: string;
  className?: string;
  /** Seconds to wait once on screen (e.g. for a heading's own reveal to finish). */
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        el.classList.add('is-in');
        io.disconnect();
      },
      // Above the bottom eighth of the screen, so it plays where it's read.
      { threshold: 0.6, rootMargin: '0px 0px -12% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <span
      ref={ref}
      className={`marker ${className}`}
      style={delay === undefined ? undefined : ({ '--marker-delay': `${delay}s` } as CSSProperties)}
    >
      {children}
      <span className="marker-bar" aria-hidden>
        <span className="marker-in">{children}</span>
      </span>
    </span>
  );
}
