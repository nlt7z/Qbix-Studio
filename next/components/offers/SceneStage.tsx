'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useReducedMotion, type MotionValue } from 'framer-motion';

// Each scene is its own chunk, fetched only when its stage nears the viewport.
const SCENES = {
  kit: () => import('@/components/three/kitScene').then((m) => m.mountKitScene),
  strata: () => import('@/components/three/strataScene').then((m) => m.mountStrataScene),
};
export type SceneName = keyof typeof SCENES;
type Mode = 'hero' | 'tour';

/**
 * A three.js scene on an offer or product page (the listing kit, Strata).
 * three.js loads only when the stage nears the viewport; the canvas is
 * uncovered by a wipe once its first frame is drawn. Without WebGL the
 * `fallback` stays.
 */
export default function SceneStage({
  scene,
  mode,
  progress,
  fallback,
  labels,
  className = '',
}: {
  scene: SceneName;
  mode: Mode;
  progress?: MotionValue<number>;
  fallback?: ReactNode;
  /** Blueprint labels pinned to the flyer, the posts and the phone. */
  labels?: string[];
  className?: string;
}) {
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const built = useRef(false);   // the load sequence plays once per page view
  const reduced = useReducedMotion() ?? false;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let dispose: (() => void) | undefined;
    let cancelled = false;
    let mounting = false;
    // Phones keep only stages near the viewport alive (each is a WebGL context).
    const recycle = window.matchMedia('(pointer: coarse)').matches;

    const start = async () => {
      if (dispose || mounting) return;
      mounting = true;
      try {
        const mount = await SCENES[scene]();
        if (cancelled) return;
        const d = await mount(host, {
          mode,
          reduced,
          getProgress: progress ? () => progress.get() : undefined,
          intro: !built.current,
          onAnchors: labels
            ? (pts, shown) => {
                pts.forEach((p, i) => {
                  const el = labelRefs.current[i];
                  if (!el) return;
                  el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`;
                  el.classList.toggle('is-on', shown > 0.5);
                });
              }
            : undefined,
          onReady: () => {
            built.current = true;
            if (!cancelled) setReady(true);
          },
        });
        if (cancelled) d();
        else dispose = d;
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        mounting = false;
      }
    };
    const stop = () => {
      dispose?.();
      dispose = undefined;
      setReady(false);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) start();
        else if (recycle) stop();
      },
      { rootMargin: '400px 0px' },
    );
    io.observe(host);
    return () => {
      cancelled = true;
      io.disconnect();
      dispose?.();
    };
  }, [scene, mode, progress, reduced, labels]);

  return (
    <div className={`kit-stage kit-stage--${mode} scene-${scene}${ready ? ' is-ready' : ''}${failed ? ' is-failed' : ''} ${className}`}>
      {failed && fallback}
      <div ref={hostRef} className="kit-stage-host" aria-hidden />
      {labels && ready && (
        <div className="kit-labels" aria-hidden>
          {labels.map((l, i) => (
            <span key={l} ref={(el) => { labelRefs.current[i] = el; }} className={`kit-label kit-label--${i}`}>
              <span>{l}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
