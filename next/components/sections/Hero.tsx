'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRef, type ReactNode } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useContactModal } from '@/components/ContactModalProvider';
import BrandText from '@/components/BrandText';

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

  // Grid background retreats as the hero scrolls past — "system fades back".
  const gridOpacity = useTransform(scrollYProgress, [0, 0.7, 1], [0.4, 0.1, 0]);

  return (
    <section ref={heroRef} className="hero" id="top">
      <motion.div
        className="hero-grid-bg"
        aria-hidden
        style={{ opacity: gridOpacity }}
      />

      <div className="container hero-inner">
        <div>
          <motion.div
            className="hero-eyebrow"
            initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
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
              className="line"
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
            <motion.span
              className="line italic signal-bg"
              style={{ display: 'block' }}
              initial={{ opacity: 0, y: 28, filter: 'blur(14px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{
                duration: 1.05,
                ease: EASE_SPRING,
                delay: 1.0,
              }}
            >
              taste, craft, logic.
            </motion.span>
          </h1>

          <motion.p
            className="hero-sub"
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
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
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.92 }}
          >
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={openContactModal}
            >
              Start a project
              <span className="arrow">→</span>
            </button>
            <Link href="#work" className="btn btn-secondary btn-lg">
              View work
            </Link>
          </motion.div>
        </div>

        <motion.div
          className="hero-cube-figure"
          initial={{ opacity: 0, filter: 'blur(20px)', scale: 0.96 }}
          animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
          transition={{ duration: 1.6, ease: EASE_OUT, delay: 0.25 }}
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
