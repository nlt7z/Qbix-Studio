'use client';

import { useEffect, useRef } from 'react';
import { useAudience } from '@/components/Audience';
import type { StoryHandle } from '@/components/three/voxelStory';

/**
 * The story's one 3D object: a fixed, transparent canvas between the
 * chapters' backgrounds and their words (see components/three/voxelStory.ts).
 * Mounted once; an audience switch only re-reads the chapters. Without
 * WebGL2 the page is the same, minus the object.
 */
export default function VoxelStage() {
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
        const { mountVoxelStory } = await import('@/components/three/voxelStory');
        if (cancelled) return;
        handle.current = mountVoxelStory({
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
