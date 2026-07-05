'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

const HOLD_MS = 1400;
const EXIT_MS = 900;
const SPLIT_EASE = [0.85, 0, 0.15, 1] as const;
const SOFT_EASE = [0.16, 1, 0.3, 1] as const;
const SEEN_KEY = 'qbix.splashSeen';

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
    if (seen) {
      setPhase('gone');
      return;
    }

    document.body.style.overflow = 'hidden';
    const exitDur = reduced ? 300 : EXIT_MS;
    const startExit = window.setTimeout(() => setPhase('out'), HOLD_MS);
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

  return (
    <div
      className="loading-root"
      aria-hidden
      style={{ pointerEvents: exiting ? 'none' : 'auto' }}
    >
      <motion.div
        className="loading-half loading-half--top"
        initial={{ y: 0 }}
        animate={
          exiting
            ? reduced
              ? { opacity: 0 }
              : { y: '-100%' }
            : { y: 0 }
        }
        transition={
          reduced
            ? { duration: 0.3 }
            : { duration: EXIT_MS / 1000, ease: SPLIT_EASE }
        }
      />
      <motion.div
        className="loading-half loading-half--bottom"
        initial={{ y: 0 }}
        animate={
          exiting
            ? reduced
              ? { opacity: 0 }
              : { y: '100%' }
            : { y: 0 }
        }
        transition={
          reduced
            ? { duration: 0.3 }
            : { duration: EXIT_MS / 1000, ease: SPLIT_EASE }
        }
      />

      <div className="loading-center">
        <motion.img
          src="/qbix-keyboard.png"
          alt=""
          aria-hidden
          className="loading-logo"
          initial={{ opacity: 0, scale: 0.85, y: 18 }}
          animate={
            exiting
              ? { opacity: 0, scale: 1.08, y: -12 }
              : { opacity: 1, scale: 1, y: 0 }
          }
          transition={
            exiting
              ? { duration: 0.45, ease: 'easeIn' }
              : { duration: 0.75, ease: SOFT_EASE, delay: 0.05 }
          }
          draggable={false}
        />
      </div>
    </div>
  );
}
