'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Hero 3D cube (glass, see three/heroCube.ts). The scene is light enough to
 * mount straight away; the canvas is uncovered by a clip wipe once its first
 * frame is drawn. The still render is only fetched if WebGL is unavailable.
 */
export default function HeroCube() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading');
  const reduced = useReducedMotion() ?? false;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let dispose: (() => void) | undefined;
    let cancelled = false;
    (async () => {
      try {
        const { mountHeroCube } = await import('@/components/three/heroCube');
        if (cancelled) return;
        dispose = mountHeroCube(host, { reduced, onReady: () => !cancelled && setState('ready') });
      } catch (err) {
        console.warn('[HeroCube] 3D unavailable, showing the still:', err);
        if (!cancelled) setState('failed');
      }
    })();
    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [reduced]);

  return (
    <div className="hero-cube">
      {state === 'failed' && (
        <Image src="/qbix-cube.png" alt="" width={560} height={592} className="hero-cube-still" />
      )}
      <div
        ref={hostRef}
        className={`hero-cube-stage${state === 'ready' ? ' is-ready' : ''}`}
        role="img"
        aria-label="The Qbix cube in glass, twisting layer by layer around a lime core"
      />
    </div>
  );
}
