'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import CubeGrid from '@/components/CubeGrid';
import CubeGlyph from '@/components/CubeGlyph';
import ContactModal from '@/components/ContactModal';

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

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
            <motion.span
              className="line"
              initial={{ opacity: 0, y: 36, filter: 'blur(22px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.25, ease: EASE_OUT, delay: 0.18 }}
            >
              Building with AI is table stakes.
            </motion.span>
            <motion.span
              className="line italic"
              initial={{ opacity: 0, y: 44, filter: 'blur(26px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.45, ease: EASE_OUT, delay: 0.36 }}
            >
              We hold the line on{' '}
              <span className="signal-bg">taste, craft, logic.</span>
            </motion.span>
          </h1>

          <motion.p
            className="hero-sub"
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.9 }}
          >
            An AI-native product and software studio. Strategy, interface, and the
            AI itself — built by the team that designs it.
          </motion.p>

          <motion.div
            className="hero-ctas"
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.5, ease: EASE_OUT, delay: 1.1 }}
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
