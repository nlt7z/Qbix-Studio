'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { whenIdle } from '@/components/whenIdle';
import { useReducedMotionSafe } from '@/components/useReducedMotionSafe';
import BeforeAfter from './BeforeAfter';

/**
 * Practice hero: the copy stays put while scrolling rebuilds the sample site
 * in 3D beside it — the 2019 page is taken apart, the calm one set down, the
 * window stands up and narrows into a phone. With reduced motion, or without
 * WebGL, it falls back to the drag-to-compare slider.
 */
export default function RebuildHero({ children }: { children: ReactNode }) {
  const track = useRef<HTMLDivElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: track, offset: ['start start', 'end end'] });
  const rail = useTransform(scrollYProgress, [0, 0.74], [0, 1], { clamp: true });
  const cue = useTransform(scrollYProgress, [0, 0.04], ['0%', '110%']);
  const reduced = useReducedMotionSafe();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const flat = reduced || failed;

  useEffect(() => {
    const host = hostRef.current;
    if (!host || flat) return;
    let dispose: (() => void) | undefined;
    let cancelled = false;
    let mounting = false;
    const recycle = window.matchMedia('(pointer: coarse)').matches;
    const start = async () => {
      if (dispose || mounting) return;
      mounting = true;
      try {
        const { mountRebuildScene } = await import('@/components/three/rebuildScene');
        if (cancelled) return;
        const d = await mountRebuildScene(host, {
          reduced: false,
          getProgress: () => scrollYProgress.get(),
          onReady: () => !cancelled && setReady(true),
        });
        if (cancelled) d();
        else dispose = d;
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        mounting = false;
      }
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) whenIdle(start);
        else if (recycle) {
          dispose?.();
          dispose = undefined;
          setReady(false);
        }
      },
      { rootMargin: '400px 0px' },
    );
    io.observe(host);
    return () => {
      cancelled = true;
      io.disconnect();
      dispose?.();
    };
  }, [flat, scrollYProgress]);

  if (flat) {
    return (
      <section className="pw-hero" data-nav-theme="light">
        <div className="container pw-narrow">{children}</div>
        <div className="container pw-compare">
          <BeforeAfter />
        </div>
      </section>
    );
  }

  return (
    <section className="pw-hero pw-rebuild" data-nav-theme="light">
      <div className="container pw-rebuild-grid">
        <div className="pw-rebuild-copy">
          <div>{children}</div>
        </div>
        <div ref={track} className="pw-rebuild-track">
          <div className="pw-rebuild-pin">
            <div ref={hostRef} className={`pw-stage-host${ready ? ' is-ready' : ''}`} aria-hidden />
            <div className="pw-rebuild-foot">
              <div className="pw-rail mono" aria-hidden>
                <span>Before</span>
                <span className="pw-rail-line">
                  <motion.span className="pw-rail-fill" style={{ scaleX: rail }} />
                </span>
                <span>After</span>
              </div>
              <p className="pw-sample">Sample redesign of an invented practice.</p>
            </div>
            <span className="pw-cue mono" aria-hidden>
              <motion.span style={{ y: cue }}>Scroll to rebuild ↓</motion.span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
