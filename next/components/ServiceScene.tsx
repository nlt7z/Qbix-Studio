'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { SceneVariant } from '@/components/three/serviceScenes';

/**
 * Service-card 3D scene. three.js is fetched only once the card is near the
 * viewport, and the SVG blueprint (`fallback`) holds the frame until the first
 * 3D frame is drawn — then the canvas is uncovered by a clip wipe. If WebGL
 * is unavailable the SVG simply stays.
 */
export default function ServiceScene({ variant, fallback }: { variant: SceneVariant; fallback: ReactNode }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
  const reduced = useReducedMotion() ?? false;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let dispose: (() => void) | undefined;
    let cancelled = false;

    const start = async () => {
      try {
        const { mountServiceScene } = await import('@/components/three/serviceScenes');
        if (cancelled) return;
        dispose = mountServiceScene(host, variant, {
          reduced,
          pointerTarget: host.closest<HTMLElement>('.svc'),
          onReady: () => !cancelled && setReady(true),
        });
      } catch {
        /* no WebGL — the SVG stays */
      }
    };

    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        start();
      },
      { rootMargin: '600px 0px' },
    );
    io.observe(host);

    return () => {
      cancelled = true;
      io.disconnect();
      dispose?.();
    };
  }, [variant, reduced]);

  return (
    <>
      {!ready && fallback}
      <div ref={hostRef} className={`svc-scene${ready ? ' is-ready' : ''}`} aria-hidden />
    </>
  );
}
