'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { bootProgressTransition } from '@/lib/motion';

const SKIP_KEY = 'qbix_boot_seen';

const bootMessages = [
  '> initializing studio_os..',
  '> loading module: <span class="ok">control_deck</span>',
  '> loading module: <span class="ok">mission_archive</span>',
  '> decoding signal channel: <span class="warn">partial</span>',
  '> access <span class="ok">granted</span>',
];

export default function BootSequence() {
  const [visible, setVisible] = useState<boolean | null>(null);
  const [linesShown, setLinesShown] = useState(0);
  const [logoShown, setLogoShown] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(SKIP_KEY)) {
      setVisible(false);
      return;
    }
    setVisible(true);
    bootMessages.forEach((_, i) => {
      setTimeout(() => setLinesShown((n) => Math.max(n, i + 1)), 80 + i * 180);
    });
    const logoT = setTimeout(() => setLogoShown(true), 900);
    const hideT = setTimeout(() => {
      sessionStorage.setItem(SKIP_KEY, '1');
      setVisible(false);
    }, 1500);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sessionStorage.setItem(SKIP_KEY, '1');
        setVisible(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(logoT);
      clearTimeout(hideT);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  if (visible === null) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="boot"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div className="boot-frame">
            <span className="boot-corner-tl" />
            <span className="boot-corner-br" />
            <div className="boot-lines">
              {bootMessages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: i < linesShown ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                  dangerouslySetInnerHTML={{ __html: msg }}
                />
              ))}
            </div>
            <motion.div
              className="boot-logo"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: logoShown ? 1 : 0, y: logoShown ? 0 : 4 }}
              transition={{ duration: 0.3 }}
            >
              qbix<span className="slash">//</span>
            </motion.div>
            <div className="boot-progress">
              <motion.div
                style={{ position: 'absolute', inset: 0, background: 'var(--signal)' }}
                initial={{ scaleX: 0, transformOrigin: 'left' }}
                animate={{ scaleX: 1 }}
                transition={bootProgressTransition}
              />
            </div>
            <div className="boot-skip">ESC TO SKIP</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
