'use client';

import Link from 'next/link';
import { useEffect, useRef, type ReactNode } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useContactModal } from '@/components/ContactModalProvider';
import BrandText from '@/components/BrandText';
import SplitText from '@/components/SplitText';
import StudioTime from '@/components/hero/StudioTime';
import LogoMarquee from '@/components/hero/LogoMarquee';
import HeroCube from '@/components/HeroCube';
import { useAudience, type Audience } from '@/components/Audience';
import { smoothScrollToId } from '@/components/TopNav';

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

type Action = 'contact' | 'products' | 'services';

/** What the hero says to each audience. Business copy follows the offer-page
 *  rules: no dashes, plain words. */
const COPY: Record<Audience, { line1: string; line2: string; lede: [ReactNode, ReactNode]; ctas: [string, Action][] }> = {
  ai: {
    line1: 'We build the',
    line2: 'coolest things.',
    lede: [<BrandText key="a">Qbix never writes off a small idea.</BrandText>, 'We’re a sharp team that moves fast, from sketch to shipped product.'],
    ctas: [['Tell us your idea', 'contact'], ['Use our products', 'products']],
  },
  business: {
    line1: 'Look as good',
    line2: 'as your work.',
    lede: ['Fixed-price design for local businesses, ready in days.', 'A listing kit for real estate agents and a calm website for solo practices.'],
    ctas: [['See the offers', 'services'], ['Tell us what you need', 'contact']],
  },
};

/** The audience switch: two segments, a solid block slides to the chosen one. */
function AudienceSwitch() {
  const { audience, setAudience } = useAudience();
  const OPTIONS: [Audience, string][] = [['ai', 'For AI teams'], ['business', 'For local business']];
  return (
    <motion.div
      className="aud-switch mono"
      role="radiogroup"
      aria-label="Who this page is for"
      initial={{ clipPath: 'inset(0 100% 0 0)' }}
      animate={{ clipPath: 'inset(0 0% 0 0)' }}
      transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.1 }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault();
          setAudience(audience === 'ai' ? 'business' : 'ai');
        }
      }}
    >
      {OPTIONS.map(([a, label]) => (
        <button
          key={a}
          type="button"
          role="radio"
          aria-checked={audience === a}
          tabIndex={audience === a ? 0 : -1}
          className={`aud-opt${audience === a ? ' is-on' : ''}`}
          onClick={() => setAudience(a)}
        >
          {audience === a && (
            <motion.span layoutId="aud-pill" className="aud-pill" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />
          )}
          <span className="aud-label">{label}</span>
        </button>
      ))}
    </motion.div>
  );
}

export default function Hero() {
  const { open: openContactModal } = useContactModal();
  const { audience } = useAudience();
  const heroRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();
  // Entrance delays are for the first paint; a switch re-runs them quickly.
  const firstPaint = useRef(true);
  useEffect(() => {
    firstPaint.current = false;
  }, []);
  const d = (load: number, swap: number) => (firstPaint.current ? load : swap);
  const copy = COPY[audience];
  const run = (action: Action) => {
    if (action === 'contact') openContactModal();
    else smoothScrollToId(action);
  };

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
          <AudienceSwitch />

          {/* Headline: two lines, the second set apart. Keyed by audience, so a
              switch slides the new words up out of their masks. */}
          <h1 key={`h-${audience}`} className="hero-title hero-title--xl">
            <WordReveal className="hero-line" text={copy.line1} baseDelay={d(0.18, 0.02)} step={0.06} />{' '}
            <span className="hero-line">
              <span style={WORD_MASK_STYLE}>
                <motion.span
                  className="signal-bg"
                  style={{ display: 'inline-block' }}
                  initial={{ y: '115%' }}
                  animate={{ y: '0%' }}
                  transition={{ duration: 1.0, ease: EASE_OUT, delay: d(0.42, 0.14) }}
                >
                  {copy.line2}
                </motion.span>
              </span>
            </span>
          </h1>

          {/* Masked rise: the lines slide up out of an invisible sleeve. */}
          <span className="hero-sub-mask">
            <motion.p
              key={`l-${audience}`}
              className="hero-sub"
              style={{ margin: 0 }}
              initial={{ y: '110%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 0.85, ease: EASE_OUT, delay: d(0.55, 0.2) }}
            >
              {/* Two lines: the promise, then who we are / what we offer. */}
              {copy.lede[0]}
              <br />
              {copy.lede[1]}
            </motion.p>
          </span>

          <motion.div
            key={`c-${audience}`}
            className="hero-ctas"
            initial={{ opacity: 0, y: 26, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24, mass: 0.7, delay: d(0.7, 0.26) }}
          >
            {copy.ctas.map(([label, action], i) => (
              <Link
                key={label}
                href={action === 'contact' ? '/start' : `#${action}`}
                className={`btn ${i === 0 ? 'btn-primary' : 'btn-white'} btn-lg split-cta`}
                onClick={(e) => {
                  e.preventDefault();
                  run(action);
                }}
              >
                <SplitText text={label} arrow />
              </Link>
            ))}
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
          <StudioTime />
          <LogoMarquee />
        </div>
      </div>
    </section>
  );
}
