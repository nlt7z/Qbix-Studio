'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState, type CSSProperties } from 'react';

/**
 * The splash: the brand's own keyboard (public/qbix-keyboard.png, cut into
 * its four keys in public/splash): Q B I X rise out of the dark one after
 * another, then each is pressed once, like typing the name. Then the screen
 * opens: the two halves, with the keyboard cut along its middle, draw in a
 * little and part, top and bottom, onto the page. Plays once per session.
 */
const TYPE_MS = 1500;   // from the keys being ready to the screen opening
const WAIT_MS = 900;    // the longest we wait for the keys to load before going on without them
const EXIT_MS = 1000;
const SEEN_KEY = 'qbix.splashSeen';
const KEYS: { ch: string; w: number }[] = [
  { ch: 'q', w: 234 },
  { ch: 'b', w: 228 },
  { ch: 'i', w: 223 },
  { ch: 'x', w: 220 },
];
const KEY_H = 262;

// Each half of the screen carries its half of the keyboard. 'wait': the keys
// are still below their slots; 'typing': they rise and are pressed; 'still':
// reduced motion, at rest.
function Keyboard({ mode }: { mode: 'wait' | 'typing' | 'still' }) {
  return (
    <div className="loading-keys">
      {KEYS.map(({ ch, w }, i) => (
        <span
          key={ch}
          className={`loading-key${mode === 'wait' ? '' : ` is-${mode}`}`}
          style={{ '--r': `${i * 0.09}s`, '--d': `${0.62 + i * 0.15}s`, '--w': w } as CSSProperties}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="loading-keycap" src={`/splash/key-${ch}.webp`} alt="" width={w} height={KEY_H} draggable={false} decoding="async" />
        </span>
      ))}
    </div>
  );
}

export default function LoadingScreen() {
  // SSR + first render must match: assume not-seen, then check in effect.
  // If already seen this session, we'll skip straight to 'gone' on mount.
  const [phase, setPhase] = useState<'in' | 'out' | 'gone'>('in');
  const [typing, setTyping] = useState(false);
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

    const timers: number[] = [];
    let started = false;
    const exitDur = reduced ? 300 : EXIT_MS;
    // Type once the keys are there (or after a short wait without them), then open.
    const start = () => {
      if (started) return;
      started = true;
      setTyping(true);
      timers.push(
        window.setTimeout(() => {
          setPhase('out');
          w.__qbixSplashDone = true;
        }, reduced ? 600 : TYPE_MS),
        window.setTimeout(() => {
          setPhase('gone');
          document.body.style.overflow = '';
          try {
            sessionStorage.setItem(SEEN_KEY, '1');
          } catch {
            /* ignore */
          }
        }, (reduced ? 600 : TYPE_MS) + exitDur),
      );
    };
    const imgs = Array.from(document.querySelectorAll<HTMLImageElement>('.loading-keycap'));
    Promise.all(imgs.map((im) => (im.decode ? im.decode().catch(() => undefined) : Promise.resolve()))).then(start);
    timers.push(window.setTimeout(start, WAIT_MS));
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
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
  const mode = reduced ? 'still' : typing ? 'typing' : 'wait';

  return (
    <div className="loading-root" aria-hidden style={{ pointerEvents: exiting ? 'none' : 'auto' }}>
      <motion.div className="loading-half loading-half--top" initial={{ y: '0%' }} animate={half(-1)} transition={halfTransition}>
        <div className="loading-seam loading-seam--top">
          <Keyboard mode={mode} />
        </div>
      </motion.div>
      <motion.div className="loading-half loading-half--bottom" initial={{ y: '0%' }} animate={half(1)} transition={halfTransition}>
        <div className="loading-seam loading-seam--bottom">
          <Keyboard mode={mode} />
        </div>
      </motion.div>
    </div>
  );
}
