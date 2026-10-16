'use client';

import { useEffect, useRef } from 'react';

/**
 * The site's pieces on a subpage (components/three/blockStory.ts,
 * mountBlockFigure): gathered out of loose blocks into a form when they first
 * show; `form` may name several, comma separated, which then play in turn on
 * a loop (the flyer, its posts, its video). Sways a little and tilts with the
 * pointer.
 */
export default function BlockFigure({
  form,
  tone = 'dark',
  label,
  className = '',
}: {
  form: string;
  tone?: 'dark' | 'paper';
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let dispose: (() => void) | undefined;
    let cancelled = false;
    (async () => {
      try {
        const { mountBlockFigure } = await import('@/components/three/blockStory');
        if (cancelled) return;
        dispose = mountBlockFigure(canvas, { form, tone, reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches });
        canvas.classList.add('is-ready');
      } catch (err) {
        console.warn('[figure] 3D unavailable:', err);
      }
    })();
    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [form, tone]);
  return <canvas ref={ref} className={`block-figure ${className}`} role="img" aria-label={label} />;
}
