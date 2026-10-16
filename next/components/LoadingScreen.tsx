'use client';

import { motion, useReducedMotion } from 'framer-motion';
// The caps are drawn in CSS (globals.css, "the splash"): a dished top with its
// legend, and the skirts on three sides, narrower at the top like a real cap.
import { useEffect, useState, type CSSProperties } from 'react';

/**
 * The splash: four keycaps, q b i x, in a little keyboard plate. They rise
 * out of their wells one after another, then each is pressed once, like
 * typing the name: the cap sinks into the plate and springs back. The third
 * key is the lime. Then the screen parts top and bottom to show the page.
 * Plays once per session.
 */
const HOLD_MS = 1650;
const EXIT_MS = 900;
const SPLIT_EASE = [0.85, 0, 0.15, 1] as const;
const SEEN_KEY = 'qbix.splashSeen';
const KEYS = ['q', 'b', 'i', 'x'];

export default function LoadingScreen() {
  // SSR + first render must match: assume not-seen, then check in effect.
  // If already seen this session, we'll skip straight to 'gone' on mount.
  const [phase, setPhase] = useState<'in' | 'out' | 'gone'>('in');
  const reduced = useReducedMotion();

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === '1';
    } catch {
      /* private mode / disabled — fall through and play splash */
    }
    const w = window as unknown as { __qbixSplashDone?: boolean };
    if (seen) {
      w.__qbixSplashDone = true;
      setPhase('gone');
      return;
    }
    // The homepage story waits for this before its blocks gather.
    w.__qbixSplashDone = false;

    document.body.style.overflow = 'hidden';
    const exitDur = reduced ? 300 : EXIT_MS;
    const startExit = window.setTimeout(() => {
      setPhase('out');
      w.__qbixSplashDone = true;
    }, HOLD_MS);
    const unmount = window.setTimeout(() => {
      setPhase('gone');
      document.body.style.overflow = '';
      try {
        sessionStorage.setItem(SEEN_KEY, '1');
      } catch {
        /* ignore */
      }
    }, HOLD_MS + exitDur);
    return () => {
      window.clearTimeout(startExit);
      window.clearTimeout(unmount);
      document.body.style.overflow = '';
    };
  }, [reduced]);

  if (phase === 'gone') return null;

  const exiting = phase === 'out';
  const half = (dir: 1 | -1) => (exiting ? (reduced ? { opacity: 0 } : { y: `${dir * 100}%` }) : { y: 0 });
  const halfTransition = reduced ? { duration: 0.3 } : { duration: EXIT_MS / 1000, ease: SPLIT_EASE };

  return (
    <div className="loading-root" aria-hidden style={{ pointerEvents: exiting ? 'none' : 'auto' }}>
      <motion.div className="loading-half loading-half--top" initial={{ y: 0 }} animate={half(-1)} transition={halfTransition} />
      <motion.div className="loading-half loading-half--bottom" initial={{ y: 0 }} animate={half(1)} transition={halfTransition} />

      <motion.div
        className="loading-center"
        animate={exiting ? { scale: 0.92 } : { scale: 1 }}
        transition={{ duration: 0.5, ease: SPLIT_EASE }}
      >
        <div className="loading-keys">
          {KEYS.map((ch, i) => (
            <span
              key={ch}
              className={`loading-key${i === 2 ? ' is-lime' : ''}${reduced ? '' : ' is-typing'}`}
              style={{ '--r': `${0.06 + i * 0.09}s`, '--d': `${0.72 + i * 0.15}s` } as CSSProperties}
            >
              <span className="loading-cap">
                <span className="loading-cap-top">{ch}</span>
              </span>
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
