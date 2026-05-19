'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import CubeGrid from '@/components/CubeGrid';
import CubeGlyph from '@/components/CubeGlyph';
import ContactModal from '@/components/ContactModal';

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const EASE_SPRING = [0.34, 1.4, 0.46, 1] as const;

/**
 * Per-word reveal. Each word fades + rises + de-blurs on its own micro-spring
 * so the headline reads as a writing rhythm, not a single block.
 */
function WordReveal({
  text,
  baseDelay = 0,
  step = 0.055,
  className,
  children,
}: {
  text?: string;
  baseDelay?: number;
  step?: number;
  className?: string;
  children?: ReactNode;
}) {
  const words = text ? text.split(' ') : [];
  return (
    <span className={className}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          style={{ display: 'inline-block', whiteSpace: 'pre' }}
          initial={{ opacity: 0, y: 28, filter: 'blur(14px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{
            duration: 0.95,
            ease: EASE_SPRING,
            delay: baseDelay + i * step,
          }}
        >
          {w}
          {i < words.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
      {children}
    </span>
  );
}

export default function Hero() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section className="hero" id="top">
      <div className="hero-grid-bg" aria-hidden />

      <div className="container hero-inner">
        <div>
          <motion.div
            className="hero-eyebrow"
            initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.55, ease: EASE_OUT }}
          >
            <span className="eyebrow">
              <CubeGlyph lit size={14} />
              <span className="brand-q">Q</span>bix Studio
            </span>
          </motion.div>

          <h1 className="hero-title">
            <WordReveal
              className="line"
              text="Building with AI is table stakes."
              baseDelay={0.18}
              step={0.06}
            />
            <span className="line italic">
              <WordReveal
                text="We hold the line on"
                baseDelay={0.62}
                step={0.06}
              />
              <motion.span
                className="signal-bg"
                style={{ display: 'inline-block', whiteSpace: 'pre' }}
                initial={{ opacity: 0, y: 28, filter: 'blur(14px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{
                  duration: 1.05,
                  ease: EASE_SPRING,
                  delay: 0.62 + 4 * 0.06,
                }}
              >
                {' '}taste, craft, logic.
              </motion.span>
            </span>
          </h1>

          <motion.p
            className="hero-sub"
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.6, ease: EASE_OUT, delay: 1.55 }}
          >
            An AI-native product and software studio. Strategy, interface, and the
            AI itself — built by the team that designs it.
          </motion.p>

          <motion.div
            className="hero-ctas"
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.5, ease: EASE_OUT, delay: 1.85 }}
          >
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => setModalOpen(true)}
            >
              Make it real
              <span className="arrow">→</span>
            </button>
            <Link href="#work" className="btn btn-secondary btn-lg">
              View work
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, filter: 'blur(20px)', scale: 0.96 }}
          animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
          transition={{ duration: 1.6, ease: EASE_OUT, delay: 0.25 }}
        >
          <CubeGrid />
        </motion.div>
      </div>

      <ContactModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </section>
  );
}
