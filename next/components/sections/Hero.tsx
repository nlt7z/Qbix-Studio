'use client';

import Link from 'next/link';
import { useRef, type ReactNode } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useContactModal } from '@/components/ContactModalProvider';
import BrandText from '@/components/BrandText';
import SplitText from '@/components/SplitText';
import StudioGlobe from '@/components/hero/StudioGlobe';
import LogoMarquee from '@/components/hero/LogoMarquee';
import HeroCube from '@/components/HeroCube';

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

  // Scroll-driven centrepiece: as the hero scrolls past the viewport, the
  // object gets a parallax lift + tilt + slight fade. Bound to the hero's own
  // scroll progress so it works regardless of viewport height.
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const objYRaw = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const objScaleRaw = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const objOpacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 0.85, 0.45]);
  const objY = useSpring(objYRaw, { stiffness: 80, damping: 22, mass: 0.6 });
  const objScale = useSpring(objScaleRaw, { stiffness: 80, damping: 22, mass: 0.6 });

  return (
    <section ref={heroRef} className="hero hero--stage" id="top" data-nav-theme="dark">
      <div className="hero-stage hero-stage--v2">
        <div className="hero-copy">
          {/* Headline: one line, the lime phrase at its end. */}
          <h1 className="hero-title hero-title--xl hero-title--one">
            <span className="hero-line">
              <WordReveal text="We build the" baseDelay={0.18} step={0.06} />{' '}
              <span style={WORD_MASK_STYLE}>
                <motion.span
                  className="signal-bg"
                  style={{ display: 'inline-block' }}
                  initial={{ y: '115%' }}
                  animate={{ y: '0%' }}
                  transition={{ duration: 1.0, ease: EASE_OUT, delay: 0.42 }}
                >
                  coolest things.
                </motion.span>
              </span>
            </span>
          </h1>

          {/* Masked rise: the line slides up out of an invisible sleeve. */}
          <span className="hero-sub-mask">
            <motion.p
              className="hero-sub"
              style={{ margin: 0 }}
              initial={{ y: '110%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 0.85, ease: EASE_OUT, delay: 0.55 }}
            >
              <BrandText>
                Qbix never writes off a small idea. We&rsquo;re a sharp team that moves fast, from sketch
                to shipped product.
              </BrandText>
            </motion.p>
          </span>

          <motion.div
            className="hero-ctas"
            initial={{ opacity: 0, y: 26, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24, mass: 0.7, delay: 0.7 }}
          >
            <button type="button" className="btn btn-primary btn-lg split-cta" onClick={openContactModal}>
              <SplitText text="Tell us your idea" arrow />
            </button>
            <Link
              href="#products"
              className="btn btn-white btn-lg split-cta"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById('products');
                if (!el) return;
                const top = el.getBoundingClientRect().top + window.scrollY - 64;
                window.scrollTo({ top, behavior: 'smooth' });
                history.replaceState(null, '', '#products');
              }}
            >
              <SplitText text="Use our products" arrow />
            </Link>
          </motion.div>
        </div>

        {/* The cube, uncovered by a clip wipe rising from the floor of its
            frame; drifts up on scroll. */}
        <motion.div
          className="hero-visual"
          initial={reduceMotion ? false : { clipPath: 'inset(100% -20% 0% -20%)' }}
          animate={{ clipPath: 'inset(-20% -20% -20% -20%)' }}
          transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.35 }}
        >
          <motion.div style={{ y: objY, scale: objScale, opacity: objOpacity, willChange: 'transform, opacity' }}>
            <HeroCube />
          </motion.div>
        </motion.div>

        {/* The band: where and when the studio works, and where the team
            studied and worked. The hairline draws itself left to right. */}
        <div className="hero-band">
          <motion.span
            className="hero-meta-rule"
            aria-hidden
            initial={reduceMotion ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, ease: EASE_OUT, delay: 0.7 }}
          />
          <StudioGlobe />
          <LogoMarquee />
        </div>
      </div>
    </section>
  );
}
