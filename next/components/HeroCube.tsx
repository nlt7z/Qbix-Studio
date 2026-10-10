'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Hero 3D cube. The cube render (qbix-cube.png — the same object) holds the
 * frame as the first paint; three.js loads straight away and, once the first
 * 3D frame is drawn, the canvas is uncovered by a clip wipe. No WebGL → the
 * still image simply stays.
 */
export default function HeroCube() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
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
        dispose = mountHeroCube(host, { reduced, onReady: () => !cancelled && setReady(true) });
      } catch (err) {
        console.warn('[HeroCube] 3D unavailable, keeping the still:', err);
      }
    })();
    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [reduced]);

  return (
    <div className="hero-cube">
      {!ready && (
        <Image
          src="/qbix-cube.png"
          alt=""
          width={560}
          height={592}
          priority
          className="hero-cube-still"
        />
      )}
      <div
        ref={hostRef}
        className={`hero-cube-stage${ready ? ' is-ready' : ''}`}
        role="img"
        aria-label="The Qbix cube — eight material studies, twisting layer by layer"
      />
    </div>
  );
}
