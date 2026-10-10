'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Footer sign-off stage — "qbix" behind reeded glass (see three/footerMark.ts).
 * The shader module loads when the footer nears the viewport. Without WebGL the
 * stage falls back to the plain word in the headline face.
 */
export default function FooterMark() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<'idle' | 'ready' | 'failed'>('idle');
  const reduced = useReducedMotion() ?? false;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let dispose: (() => void) | undefined;
    let cancelled = false;
    const io = new IntersectionObserver(
      async ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        try {
          const { mountFooterMark } = await import('@/components/three/footerMark');
          if (cancelled) return;
          dispose = mountFooterMark(host, { reduced, onReady: () => !cancelled && setState('ready') });
        } catch (err) {
          console.warn('[FooterMark] 3D unavailable:', err);
          if (!cancelled) setState('failed');
        }
      },
      { rootMargin: '500px 0px' },
    );
    io.observe(host);
    return () => {
      cancelled = true;
      io.disconnect();
      dispose?.();
    };
  }, [reduced]);

  return (
    <div className="footer-stage" role="img" aria-label="qbix">
      <div ref={hostRef} className={`footer-stage-gl${state === 'ready' ? ' is-ready' : ''}`} />
      {state === 'failed' && <span className="footer-stage-fallback">qbix</span>}
    </div>
  );
}
