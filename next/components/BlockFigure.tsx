'use client';

import { useEffect, useRef } from 'react';

/**
 * The site's blocks standing still on a subpage: one arrangement, gathered
 * out of loose blocks when it first shows, swaying a little and tilting with
 * the pointer (components/three/blockStory.ts, mountBlockFigure). `inner`
 * makes it alternate between two arrangements while it's on screen.
 */
export default function BlockFigure({
  form,
  inner,
  tone = 'dark',
  label,
  className = '',
}: {
  form: string;
  inner?: string;
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
        dispose = mountBlockFigure(canvas, { form, inner, tone, reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches });
        canvas.classList.add('is-ready');
      } catch (err) {
        console.warn('[figure] 3D unavailable:', err);
      }
    })();
    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [form, inner, tone]);
  return <canvas ref={ref} className={`block-figure ${className}`} role="img" aria-label={label} />;
}
