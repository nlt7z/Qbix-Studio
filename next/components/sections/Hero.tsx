'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import CubeGrid from '@/components/CubeGrid';

const ease = [0.16, 1, 0.3, 1] as const;

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-grid-bg" aria-hidden />

      <div className="container hero-inner">
        <div>
          <motion.div
            className="hero-eyebrow"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease }}
          >
            <span className="eyebrow">
              <span className="signal-dot" />
              <span className="brand-q">Q</span>bix Studio · est. 2026
            </span>
            <span className="mono">Seattle · NY</span>
          </motion.div>

          <h1 className="hero-title">
            <motion.span
              className="line"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, ease, delay: 0.05 }}
            >
              AI products,
            </motion.span>
            <motion.span
              className="line"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, ease, delay: 0.12 }}
            >
              designed from idea
            </motion.span>
            <motion.span
              className="line"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, ease, delay: 0.18 }}
            >
              to interface to{' '}
              <span className="signal-bg">launch.</span>
            </motion.span>
          </h1>

          <motion.p
            className="hero-sub"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease, delay: 0.26 }}
          >
            <span className="brand-q">Q</span>bix Studio is an AI-native product design and software studio creating UX/UI
            systems, web and mobile products, strategic prototypes, and proprietary AI tools.
          </motion.p>

          <motion.div
            className="hero-ctas"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease, delay: 0.32 }}
          >
            <Link href="#contact" className="btn btn-primary btn-lg">
              Start a project
              <span className="arrow">→</span>
            </Link>
            <Link href="#work" className="btn btn-secondary btn-lg">
              View work
            </Link>
          </motion.div>
        </div>

        <CubeGrid />
      </div>
    </section>
  );
}
