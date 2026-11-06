'use client';

import { useEffect, useRef } from 'react';
import { DESK, drawDesk, loadFaces } from '@/components/blocks/art/forma';

/**
 * The top of Forma's site (art/forma.ts), drawn into its box at the box's own pixel size: the hero card's
 * picture for the design service. Cropped from the left, the claim first.
 */
export default function FormaShot() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    let faces: Awaited<ReturnType<typeof loadFaces>> | null = null;
    const draw = () => {
      if (!faces) return;
      const w = c.clientWidth;
      const h = c.clientHeight;
      if (!w || !h) return;
      const d = Math.min(2, devicePixelRatio || 1);
      c.width = Math.round(w * d);
      c.height = Math.round(h * d);
      const x = c.getContext('2d')!;
      // the page's first screen (its bar to under the lamp) as tall as the box
      const s = (h / 760) * d;
      x.setTransform(s, 0, 0, s, 0, 0);
      x.translate(-24, 0);
      drawDesk(x, faces);
    };
    loadFaces().then((f) => {
      faces = f;
      draw();
    });
    const ro = new ResizeObserver(draw);
    ro.observe(c);
    return () => ro.disconnect();
  }, []);
  return <canvas ref={ref} className="art-canvas" width={DESK.w} height={760} />;
}
