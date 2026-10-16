'use client';

import { useEffect, useRef } from 'react';
import { useAudience } from '@/components/Audience';
import type { StoryHandle } from '@/components/three/blockStory';

/**
 * The story's one object, 27 pieces on a fixed, transparent canvas between
 * the chapters' backgrounds and their words (components/three/blockStory.ts).
 * Mounted once; an audience switch only re-reads the chapters. Without WebGL
 * the page is the same, minus the object.
 */
export default function BlockStage() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const handle = useRef<StoryHandle | null>(null);
  const { audience } = useAudience();

  useEffect(() => {
    const canvas = ref.current;
    const root = canvas?.closest<HTMLElement>('.story');
    if (!canvas || !root) return;
    let cancelled = false;
    (async () => {
      try {
        const { mountBlockStory } = await import('@/components/three/blockStory');
        if (cancelled) return;
        handle.current = mountBlockStory({
          canvas,
          root,
          reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
          fine: window.matchMedia('(pointer: fine)').matches,
          onReady: () => root.classList.add('has-stage'),
        });
      } catch (err) {
        console.warn('[story] 3D unavailable:', err);
      }
    })();
    return () => {
      cancelled = true;
      handle.current?.dispose();
      handle.current = null;
    };
  }, []);

  // A switch swaps the chapters in place; the stage just reads them again.
  useEffect(() => {
    handle.current?.refresh();
  }, [audience]);

  return <canvas ref={ref} className="story-canvas" aria-hidden />;
}
