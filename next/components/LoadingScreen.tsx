'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState, type CSSProperties } from 'react';

/**
 * The splash: four keycaps, q b i x, in a little keyboard plate. They rise
 * out of their wells one after another, then each is pressed once, like
 * typing the name; the third key is the lime. Then the screen opens: the
 * two halves, with the keyboard cut along its middle, draw in a little and
 * part, top and bottom, onto the page. Plays once per session.
 */
const HOLD_MS = 1700;
const EXIT_MS = 1000;
const SEEN_KEY = 'qbix.splashSeen';
const KEYS = ['q', 'b', 'i', 'x'];

// The caps are drawn in CSS (globals.css, "the splash"): a dished top with its
// legend, and skirts on three sides, narrower at the top like a real cap. Each
// half of the screen carries its half of the keyboard.
function Keyboard({ reduced }: { reduced: boolean }) {
  return (
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
  );
}

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
  // Opening: a small draw-in toward the seam, then the halves part (no fade).
  const half = (dir: 1 | -1) =>
    exiting ? (reduced ? { opacity: 0 } : { y: ['0%', `${-dir * 1.6}%`, `${dir * 100}%`] }) : { y: '0%' };
  const halfTransition = reduced
    ? { duration: 0.3 }
    : { duration: EXIT_MS / 1000, times: [0, 0.16, 1], ease: [[0.3, 0, 0.6, 1], [0.7, 0, 0.12, 1]] as [number, number, number, number][] };

  return (
    <div className="loading-root" aria-hidden style={{ pointerEvents: exiting ? 'none' : 'auto' }}>
      <motion.div className="loading-half loading-half--top" initial={{ y: '0%' }} animate={half(-1)} transition={halfTransition}>
        <div className="loading-seam loading-seam--top">
          <Keyboard reduced={!!reduced} />
        </div>
      </motion.div>
      <motion.div className="loading-half loading-half--bottom" initial={{ y: '0%' }} animate={half(1)} transition={halfTransition}>
        <div className="loading-seam loading-seam--bottom">
          <Keyboard reduced={!!reduced} />
        </div>
      </motion.div>
    </div>
  );
}
