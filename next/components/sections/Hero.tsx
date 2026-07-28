'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useContactModal } from '@/components/ContactModalProvider';
import BrandText from '@/components/BrandText';
import SplitText from '@/components/SplitText';
import PstClock from '@/components/PstClock';
import { LOGOS } from '@/components/TrustLogos';

/**
 * "Previously at…" — cycles the team's prior-company marks one at a time,
 * each sliding up out of the slot as the next rides in.
 */
function CyclingLogos() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % LOGOS.length), 1800);
    return () => window.clearInterval(id);
  }, [reduce]);
  const l = LOGOS[i];
  return (
    <span className="hg-logo-slot" aria-label={`Previously at ${l.name}`}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.svg
          key={l.name}
          viewBox={l.viewBox}
          fill="currentColor"
          role="img"
          aria-hidden
          initial={reduce ? false : { y: '75%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { y: '-75%', opacity: 0 }}
          transition={{ duration: 0.42, ease: EASE_OUT }}
        >
          <path d={l.d} />
        </motion.svg>
      </AnimatePresence>
    </span>
  );
}

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

// The rotating centrepiece — the studio rendered as objects you can hold. The
// keyboard render is reserved for the eyebrow lockup, so it stays out of the set.
// Only transparent-background renders belong here — qbix-fan.png and
// brand-cubes.png ship with a baked dark backdrop that the mask would expose
// as a black box, so they're left out.
const BRAND_OBJECTS = [
  { src: '/qbix-cube.png', alt: 'Qbix cube totem' },
  { src: '/qbix-square.png', alt: 'Qbix square totem' },
  { src: '/qbix-turntable.png', alt: 'Qbix turntable totem' },
];
const ROTATE_MS = 2600;

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

/**
 * Brand-object rotator — the hero centrepiece. Cycles through the studio's
 * rendered totems; each swap is a structural mask slide (the outgoing object
 * rides up out of the frame while the next rides in from below), never a blur
 * or crossfade. Ambient float + scroll parallax are applied by the parent.
 */
function BrandObjectRotator() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(
      () => setIndex((n) => (n + 1) % BRAND_OBJECTS.length),
      ROTATE_MS,
    );
    return () => window.clearInterval(id);
  }, [reduce]);

  const go = (n: number) => setIndex(((n % BRAND_OBJECTS.length) + BRAND_OBJECTS.length) % BRAND_OBJECTS.length);

  if (reduce) {
    return (
      <div className="hero-object-stage" aria-hidden>
        <div className="hero-object-mask">
          <Image
            src={BRAND_OBJECTS[0].src}
            alt={BRAND_OBJECTS[0].alt}
            width={520}
            height={560}
            priority
            className="hero-object-img"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="hero-object-stage">
      <div className="hero-object-mask" aria-hidden>
        <AnimatePresence initial={false}>
          <motion.div
            key={index}
            className="hero-object-layer"
            initial={{ x: '104%' }}
            animate={{ x: '0%' }}
            exit={{ x: '-104%' }}
            transition={{ duration: 0.72, ease: EASE_OUT }}
          >
            <Image
              src={BRAND_OBJECTS[index].src}
              alt={BRAND_OBJECTS[index].alt}
              width={520}
              height={560}
              priority={index === 0}
              className="hero-object-img"
            />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="hero-object-dots" role="tablist" aria-label="Brand objects">
        {BRAND_OBJECTS.map((o, n) => (
          <button
            key={o.src}
            type="button"
            role="tab"
            aria-selected={n === index}
            aria-label={`Show ${o.alt}`}
            className={`hero-object-dot${n === index ? ' is-active' : ''}`}
            onClick={() => go(n)}
          />
        ))}
      </div>
    </div>
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
  const objRotRaw = useTransform(scrollYProgress, [0, 1], [0, -8]);
  const objScaleRaw = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const objOpacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 0.85, 0.45]);
  const objY = useSpring(objYRaw, { stiffness: 80, damping: 22, mass: 0.6 });
  const objRot = useSpring(objRotRaw, { stiffness: 80, damping: 22, mass: 0.6 });
  const objScale = useSpring(objScaleRaw, { stiffness: 80, damping: 22, mass: 0.6 });

  return (
    <section ref={heroRef} className="hero" id="top" data-nav-theme="dark">
      <div className="container hero-inner">
        {/* LEFT — copy */}
        <div className="hero-copy">
          <h1 className="hero-title">
            <WordReveal text="We build the" baseDelay={0.18} step={0.06} />{' '}
            <span style={{ ...WORD_MASK_STYLE }}>
              <motion.span
                className="italic signal-bg"
                style={{ display: 'inline-block' }}
                initial={{ y: '115%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 1.0, ease: EASE_OUT, delay: 0.5 }}
              >
                coolest things.
              </motion.span>
            </span>
          </h1>

          <motion.p
            className="hero-sub"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.55 }}
          >
            <BrandText>
              Qbix never writes off a small idea. We have a sharp team and we move
              fast, so we can understand what you want and push it from sketch to
              product.
            </BrandText>
          </motion.p>

          <motion.div
            className="hero-ctas"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.68 }}
          >
            <button
              type="button"
              className="btn btn-primary btn-lg split-cta"
              onClick={openContactModal}
            >
              <SplitText text="Tell us your idea" arrow />
            </button>
            <Link href="#products" className="btn btn-white btn-lg split-cta">
              <SplitText text="Use our products" arrow />
            </Link>
          </motion.div>
        </div>

        {/* RIGHT — a four-cell grid: object · clock · logos · credibility */}
        <motion.div
          className="hero-side"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.3 }}
        >
          <div className="hero-grid">
            <div className="hg-row hg-top">
              {/* top-left (largest) — the switching brand object */}
              <div className="hg-cell hg-image">
                <motion.div
                  style={{ y: objY, rotate: objRot, scale: objScale, opacity: objOpacity, willChange: 'transform, opacity' }}
                >
                  <motion.div
                    animate={reduceMotion ? undefined : { y: [0, -10, 0], rotate: [0, 1.2, 0, -1.2, 0] }}
                    transition={{
                      y: { duration: 6, ease: 'easeInOut', repeat: Infinity },
                      rotate: { duration: 9, ease: 'easeInOut', repeat: Infinity },
                    }}
                    style={{ willChange: 'transform' }}
                  >
                    <BrandObjectRotator />
                  </motion.div>
                </motion.div>
              </div>

              {/* top-right — live clock */}
              <div className="hg-cell hg-clock">
                <PstClock size={72} />
                <span className="hg-clock-label">PST</span>
              </div>
            </div>

            <div className="hg-row hg-bottom">
              {/* bottom-left — "previously at" cycling marks */}
              <div className="hg-cell hg-logos">
                <span className="hg-logos-label">Previously</span>
                <CyclingLogos />
              </div>

              {/* bottom-right — credibility line */}
              <div className="hg-cell hg-text">
                <p>Ten years across product, brand, and AI</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
