'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import StartProjectForm from '@/components/StartProjectForm';
import { useReducedMotionSafe } from '@/components/useReducedMotionSafe';
import { whenIdle } from '@/components/whenIdle';
import type { BriefDraft } from '@/components/three/briefScene';

const EMPTY: BriefDraft = { name: false, email: false, company: false, types: [], budget: -1, timeline: -1, brief: 0, status: 'idle' };
const PARTS = 7;
const filled = (d: BriefDraft) =>
  [d.name, d.email, d.company, d.types.length > 0, d.budget >= 0, d.timeline >= 0, d.brief > 0].filter(Boolean).length;

/**
 * The /start form beside a 3D brief that builds itself as the form is
 * filled in (components/three/briefScene.ts). Without WebGL the form simply
 * takes the full width.
 */
export default function StartStudio() {
  const draft = useRef<BriefDraft>(EMPTY);
  const redraw = useRef<(() => void) | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [count, setCount] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const reduced = useReducedMotionSafe();

  const onDraft = useCallback((d: BriefDraft) => {
    draft.current = d;
    setCount(filled(d));
    redraw.current?.();
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let dispose: (() => void) | undefined;
    let cancelled = false;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || dispose) return;
        io.disconnect();
        whenIdle(mount);
      },
      { rootMargin: '300px 0px' },
    );
    const mount = async () => {
      try {
        const { mountBriefScene } = await import('@/components/three/briefScene');
        if (cancelled) return;
        const s = await mountBriefScene(host, {
          reduced,
          getDraft: () => draft.current,
          onReady: () => !cancelled && setReady(true),
        });
        if (cancelled) s.dispose();
        else {
          dispose = s.dispose;
          redraw.current = s.redraw;
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    };
    io.observe(host);
    return () => {
      cancelled = true;
      io.disconnect();
      redraw.current = null;
      dispose?.();
    };
  }, [reduced]);

  return (
    <div className={`container start-studio${failed ? ' is-flat' : ''}`}>
      <div className="start-studio-stage">
        <div className="start-stage-pin">
          <div ref={hostRef} className={`start-stage-host${ready ? ' is-ready' : ''}`} aria-hidden />
          <div className="start-stage-hud mono" aria-hidden>
            <span>Your brief</span>
            <span className="start-stage-meter">
              <i style={{ transform: `scaleX(${count / PARTS})` }} />
            </span>
            <span>
              {count} / {PARTS}
            </span>
          </div>
        </div>
      </div>
      <div className="start-studio-form">
        <StartProjectForm onDraft={onDraft} />
      </div>
    </div>
  );
}
