'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

const HOLD_MS = 1400;
const SPLIT_EASE = [0.85, 0, 0.15, 1] as const;
const SOFT_EASE = [0.16, 1, 0.3, 1] as const;

export default function LoadingScreen() {
  const [showing, setShowing] = useState(true);
  const reduced = useReducedMotion();

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => setShowing(false), HOLD_MS);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    if (showing) return;
    document.body.style.overflow = '';
  }, [showing]);

  return (
    <AnimatePresence>
      {showing && (
        <motion.div
          className="loading-root"
          aria-hidden
          initial={false}
          exit={{ pointerEvents: 'none' }}
          transition={{ duration: 0 }}
        >
          <motion.div
            className="loading-half loading-half--top"
            initial={{ y: 0 }}
            exit={
              reduced
                ? { opacity: 0, transition: { duration: 0.3 } }
                : { y: '-100%', transition: { duration: 0.9, ease: SPLIT_EASE } }
            }
          />
          <motion.div
            className="loading-half loading-half--bottom"
            initial={{ y: 0 }}
            exit={
              reduced
                ? { opacity: 0, transition: { duration: 0.3 } }
                : { y: '100%', transition: { duration: 0.9, ease: SPLIT_EASE } }
            }
          />

          <div className="loading-center">
            <motion.img
              src="/qbix-keyboard.png"
              alt=""
              aria-hidden
              className="loading-logo"
              initial={{ opacity: 0, scale: 0.9, filter: 'blur(18px)' }}
              animate={{
                opacity: 1,
                scale: 1,
                filter: 'blur(0px)',
                transition: { duration: 0.75, ease: SOFT_EASE, delay: 0.05 },
              }}
              exit={{
                opacity: 0,
                scale: 1.08,
                filter: 'blur(10px)',
                transition: { duration: 0.45, ease: 'easeIn' },
              }}
              draggable={false}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
