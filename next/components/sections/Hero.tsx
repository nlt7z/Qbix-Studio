'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useContactModal } from '@/components/ContactModalProvider';
import BrandText from '@/components/BrandText';
import SplitText from '@/components/SplitText';

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
      <div className="container hero-inner hero-centered">
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
              transition={{ duration: 1.0, ease: EASE_OUT, delay: 1.0 }}
            >
              taste, craft, logic.
            </motion.span>
          </span>
        </h1>

        {/* The switching centrepiece. */}
        <motion.div
          className="hero-object-figure"
          initial={{ opacity: 0, y: 48, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: EASE_OUT, delay: 0.35 }}
        >
          <motion.div
            style={{ y: objY, rotate: objRot, scale: objScale, opacity: objOpacity, willChange: 'transform, opacity' }}
          >
            <motion.div
              animate={reduceMotion ? undefined : { y: [0, -12, 0], rotate: [0, 1.4, 0, -1.4, 0] }}
              transition={{
                y: { duration: 6, ease: 'easeInOut', repeat: Infinity },
                rotate: { duration: 9, ease: 'easeInOut', repeat: Infinity },
              }}
              style={{ willChange: 'transform' }}
            >
              <BrandObjectRotator />
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.p
          className="hero-sub"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.7 }}
        >
          <BrandText>
            Qbix is an AI-native product and software team. Strategy,
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
    </section>
  );
}
