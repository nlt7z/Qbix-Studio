'use client';

import { useEffect, useRef, type CSSProperties } from 'react';

/**
 * A paragraph read at the speed of the scroll: its words light, from a faint
 * tint to full ink, one after another as the reader scrolls through its
 * chapter, and the closing phrase is marked last (the highlighter's bar slides
 * across it, the same markup as Marker.tsx, but carried by this progress).
 * Scrolling back unlights them. One readable copy is kept for screen readers.
 *
 * Progress is one number from the scroll: on a wide screen, where the words
 * are pinned beside the scene, it runs through the chapter's pinned stretch;
 * on a phone, where they scroll, it runs as the paragraph passes up the
 * screen. Positions are measured on resize and after fonts load; the scroll
 * handler only compares numbers and toggles classes.
 */
export default function ShowcaseText({
  before,
  accent,
  after = '',
  className = '',
  markClass = '',
}: {
  before: string;
  accent: string;
  after?: string;
  className?: string;
  markClass?: string;
}) {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const words = before.split(/\s+/).filter(Boolean);

  useEffect(() => {
    const p = ref.current;
    const section = p?.closest<HTMLElement>('[data-chapter]');
    if (!p || !section) return;
    const spans = Array.from(p.querySelectorAll<HTMLElement>('.sc-w'));
    const mark = p.querySelector<HTMLElement>('.sc-mark');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      spans.forEach((s) => s.classList.add('on'));
      mark?.style.setProperty('--mark', '1');
      return;
    }
    const wide = window.matchMedia('(min-width: 900px) and (min-aspect-ratio: 1/1)');
    let a = 0, b = 1, lit = -1, raf = 0, last = -1;
    const measure = () => {
      const vh = window.innerHeight;
      if (wide.matches) {
        // the pinned stretch: from the chapter's top at two thirds of the screen to near the end of its run
        const top = section.getBoundingClientRect().top + window.scrollY;
        a = top - vh * 0.66;
        b = top + Math.max(vh * 0.5, (section.offsetHeight - vh) * 0.8);
      } else {
        const top = p.getBoundingClientRect().top + window.scrollY;
        a = top - vh * 0.85;
        b = top + p.offsetHeight - vh * 0.35;
      }
      last = -1;
      paint();
    };
    const ease = (x: number) => x * x * (3 - 2 * x);
    const paint = () => {
      raf = 0;
      const y = window.scrollY;
      if (y === last) return;
      last = y;
      const t = Math.min(1, Math.max(0, (y - a) / Math.max(1, b - a)));
      // the words in the first 80% of the run, then the mark
      const n = Math.round(Math.min(1, t / 0.8) * spans.length);
      if (n !== lit) {
        spans.forEach((s, i) => s.classList.toggle('on', i < n));
        lit = n;
      }
      mark?.style.setProperty('--mark', ease(Math.min(1, Math.max(0, (t - 0.8) / 0.2))).toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    wide.addEventListener('change', measure);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
      wide.removeEventListener('change', measure);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [before, accent]);

  return (
    <p ref={ref} className={`showcase ${className}`}>
      <span className="sr-only">
        {before} {accent}
        {after}
      </span>
      <span aria-hidden>
        {words.map((w, i) => (
          <span key={i}>
            <span className="sc-w">{w}</span>{' '}
          </span>
        ))}
        <span className={`marker sc-mark ${markClass}`} style={{ '--mark': 0 } as CSSProperties}>
          {accent}
          <span className="marker-bar">
            <span className="marker-in">{accent}</span>
          </span>
        </span>
        {after}
      </span>
    </p>
  );
}
