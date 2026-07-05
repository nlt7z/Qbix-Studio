'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRef, type ReactNode } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useContactModal } from '@/components/ContactModalProvider';
import BrandText from '@/components/BrandText';
import SplitText from '@/components/SplitText';

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

// Mask slot for the headline words — see Words in Reveal.tsx for the
// descender padding trick.
const WORD_MASK_STYLE = {
  display: 'inline-block',
  overflow: 'hidden',
  verticalAlign: 'bottom',
  paddingBottom: '0.14em',
  marginBottom: '-0.14em',
} as const;

/**
 * Masked per-word reveal. Each word slides up out of an invisible sleeve on
 * its own beat, so the headline is uncovered line by line rather than fading.
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
        <span key={i} style={WORD_MASK_STYLE}>
          <motion.span
            style={{ display: 'inline-block', whiteSpace: 'pre' }}
            initial={{ y: '115%' }}
            animate={{ y: '0%' }}
            transition={{
              duration: 0.9,
              ease: EASE_OUT,
              delay: baseDelay + i * step,
            }}
          >
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
      {children}
    </span>
  );
}

export default function Hero() {
  const { open: openContactModal } = useContactModal();
  const heroRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();

  // Scroll-driven cube: as the hero scrolls past the viewport, the cube
  // image gets a parallax lift + tilt + slight fade. Bound to the hero's
  // own scroll progress so it works regardless of viewport height.
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const cubeYRaw = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const cubeRotRaw = useTransform(scrollYProgress, [0, 1], [0, -8]);
  const cubeScaleRaw = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const cubeOpacityRaw = useTransform(scrollYProgress, [0, 0.7, 1], [1, 0.85, 0.45]);
  const cubeY = useSpring(cubeYRaw, { stiffness: 80, damping: 22, mass: 0.6 });
  const cubeRot = useSpring(cubeRotRaw, { stiffness: 80, damping: 22, mass: 0.6 });
  const cubeScale = useSpring(cubeScaleRaw, { stiffness: 80, damping: 22, mass: 0.6 });

  return (
    <section ref={heroRef} className="hero" id="top" data-nav-theme="dark">
      <div className="container hero-inner">
        <div>
          <motion.div
            className="hero-eyebrow"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE_OUT }}
          >
            <span className="eyebrow">
              <Image
                src="/qbix-keyboard.png"
                alt="Qbix"
                width={96}
                height={28}
                priority
                className="eyebrow-keyboard"
              />
            </span>
          </motion.div>

          <h1 className="hero-title">
            <WordReveal
              className="line line-lead"
              text="Building with AI is table stakes."
              baseDelay={0.18}
              step={0.06}
            />
            <WordReveal
              className="line italic"
              text="We hold the line on"
              baseDelay={0.62}
              step={0.06}
            />
            <span className="line" style={{ ...WORD_MASK_STYLE, display: 'block' }}>
              <motion.span
                className="italic signal-bg"
                style={{ display: 'inline-block' }}
                initial={{ y: '115%' }}
                animate={{ y: '0%' }}
                transition={{
                  duration: 1.0,
                  ease: EASE_OUT,
                  delay: 1.0,
                }}
              >
                taste, craft, logic.
              </motion.span>
            </span>
          </h1>

          <motion.p
            className="hero-sub"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.7 }}
          >
            <BrandText>
              Qbix Studio is an AI-native product and software studio. Strategy,
              interface, and the AI itself — built by the team that designs it.
            </BrandText>
          </motion.p>

          <motion.p
            className="hero-trust"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.82 }}
          >
            <span className="hero-trust-dot" aria-hidden />
            Seattle · AI-native product studio · decade-deep across product, brand, and AI
          </motion.p>

          <motion.div
            className="hero-ctas"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.92 }}
          >
            <button
              type="button"
              className="btn btn-primary btn-lg split-cta"
              onClick={openContactModal}
            >
              <SplitText text="Start a project" arrow />
            </button>
            <Link href="#work" className="btn btn-secondary btn-lg split-cta">
              <SplitText text="View work" arrow />
            </Link>
          </motion.div>
        </div>

        <motion.div
          className="hero-cube-figure"
          initial={{ opacity: 0, y: 60, scale: 0.9, rotate: 3 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
          transition={{ duration: 1.4, ease: EASE_OUT, delay: 0.25 }}
        >
          {/* Scroll-scrubbed inner wrapper — the entrance animation lives
              on the parent; this child carries the ongoing scroll motion. */}
          <motion.div
            style={{
              y: cubeY,
              rotate: cubeRot,
              scale: cubeScale,
              opacity: cubeOpacityRaw,
              willChange: 'transform, opacity',
            }}
          >
            {/* Ambient float — the totem hovers, never settling. A slow
                vertical bob with a gentle sway, offset so the two cycles
                drift in and out of phase rather than ticking like a metronome. */}
            <motion.div
              animate={
                reduceMotion
                  ? undefined
                  : { y: [0, -14, 0], rotate: [0, 1.6, 0, -1.6, 0] }
              }
              transition={{
                y: { duration: 6, ease: 'easeInOut', repeat: Infinity },
                rotate: { duration: 9, ease: 'easeInOut', repeat: Infinity },
              }}
              style={{ willChange: 'transform' }}
            >
              <Image
                src="/qbix-cube.png"
                alt="Qbix cube totem"
                width={520}
                height={560}
                priority
                className="hero-cube-img"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
