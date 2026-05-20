'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import GlassCube from '@/components/GlassCube';

/**
 * Hero right column: the proprietary cube totem. Capabilities are covered
 * by the "What we do" section below, so the hero owns positioning only.
 *
 * The cube auto-cycles its top-face label through 01 → 02 → 03 → 04 every
 * ~5.5s — so the cube reads as a *system* that names its four capabilities,
 * not a static logo.
 */
const LABELS = ['01', '02', '03', '04'] as const;

export default function CubeGrid() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const id = window.setInterval(() => {
      setIdx((i) => (i + 1) % LABELS.length);
    }, 5500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="hero-totem">
      <div style={{ position: 'relative' }}>
        <GlassCube label="" />
        {/* Overlay the label so we can cross-fade it without re-rendering the SVG */}
        <CubeLabel value={LABELS[idx]} />
      </div>
    </div>
  );
}

function CubeLabel({ value }: { value: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        pointerEvents: 'none',
        // Cube's top face label position (matches the y="78" in GlassCube)
        paddingTop: '24%',
      }}
      aria-hidden
    >
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
          animate={{ opacity: 0.78, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(11px, 1.05vw, 14px)',
            fontWeight: 600,
            letterSpacing: '0.12em',
            color: '#0F1A00',
            lineHeight: 1,
          }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
