'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Hero 3D cube (eight material studies, see three/heroCube.ts). The scene is
 * light enough to mount straight away; the canvas is uncovered by a clip wipe
 * once its first frame is drawn. The label under it names each material as
 * the cube presents it (written straight to the DOM, no re-render). The still
 * render is only fetched if WebGL is unavailable.
 */
export default function HeroCube() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);
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
        dispose = mountHeroCube(host, {
          reduced,
          onReady: () => !cancelled && setState('ready'),
          onLabel: (text) => {
            const el = labelRef.current;
            if (!el) return;
            if (text) el.textContent = text;
            el.classList.toggle('is-on', Boolean(text));
          },
        });
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
        aria-label="The Qbix cube: eight material studies around a lime core, twisting layer by layer"
      />
      <span ref={labelRef} className="hero-cube-label mono" aria-hidden />
    </div>
  );
}
