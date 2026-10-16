'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import BrandText from '@/components/BrandText';
import StudioTime from '@/components/hero/StudioTime';
import LogoMarquee from '@/components/hero/LogoMarquee';
import { useAudience, type Audience } from '@/components/Audience';

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

/** What the hero says to each audience. Business copy follows the offer-page
 *  rules: no dashes, plain words. The hero has no buttons of its own: its
 *  emphasis is the switch and the cube; the action is the nav's. */
const COPY: Record<Audience, { line1: string; line2: string; lede: [ReactNode, ReactNode] }> = {
  ai: {
    line1: 'We build the',
    line2: 'coolest things.',
    lede: [<BrandText key="a">Qbix never writes off a small idea.</BrandText>, 'We’re a sharp team that moves fast, from sketch to shipped product.'],
  },
  business: {
    line1: 'Look as good',
    line2: 'as your work.',
    lede: ['Fixed-price design for local businesses, ready in days.', 'A listing kit for real estate agents and a calm website for solo practices.'],
  },
};

/** The audience switch: two large options, each naming who it's for and what
 *  they'll find; a solid block slides to the chosen one (eased, no bounce). */
const OPTIONS: [Audience, string, string][] = [
  ['ai', 'For AI teams', 'Design, brand and our products'],
  ['business', 'For local business', 'Fixed-price kits, ready in days'],
];
export function AudienceSwitch() {
  const { audience, setAudience } = useAudience();
  return (
    <motion.div
      className="aud-switch"
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
      {OPTIONS.map(([a, label, hint]) => (
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
            <motion.span layoutId="aud-pill" className="aud-pill" transition={{ duration: 0.42, ease: EASE_OUT }} />
          )}
          <span className="aud-label">{label}</span>
          <span className="aud-hint">{hint}</span>
        </button>
      ))}
    </motion.div>
  );
}

/**
 * The story's first chapter: the switch, the headline, the lede, and the
 * studio band. The object (the cube, gathering out of loose blocks) is drawn
 * beside it by the story's stage, sized to these words; this section only
 * says which side it stands on.
 */
export default function Hero() {
  const { audience } = useAudience();
  // Entrance delays are for the first paint; a switch re-runs them quickly.
  const firstPaint = useRef(true);
  useEffect(() => {
    firstPaint.current = false;
  }, []);
  const d = (load: number, swap: number) => (firstPaint.current ? load : swap);
  const copy = COPY[audience];

  return (
    <section
      id="top"
      className="ch ch--hero"
      data-chapter
      data-forms="cube"
      data-side="right"
      data-tone="dark"
      data-nav-theme="dark"
      style={{ '--h': '150vh' } as CSSProperties}
    >
      <div className="ch-frame">
        <div className="ch-copy hero-copy">
          <AudienceSwitch />

          {/* Headline: two lines. Keyed by audience, so a switch slides the
              new words up out of their masks. */}
          <h1 key={`h-${audience}`} className="hero-title hero-title--xl">
            <WordReveal className="hero-line" text={copy.line1} baseDelay={d(0.18, 0.02)} step={0.06} />{' '}
            <span className="hero-line">
              <span style={WORD_MASK_STYLE}>
                <motion.span
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

          <span className="hero-sub-mask">
            <motion.p
              key={`l-${audience}`}
              className="hero-sub"
              style={{ margin: 0 }}
              initial={{ y: '110%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 0.85, ease: EASE_OUT, delay: d(0.55, 0.2) }}
            >
              {copy.lede[0]}
              <br />
              {copy.lede[1]}
            </motion.p>
          </span>
        </div>

        {/* Where and when the studio works, and where the team studied and worked: two columns, each a label over one line. */}
        <div className="ch-band hero-band">
          <StudioTime />
          <LogoMarquee />
        </div>
        <div className="ch-window" aria-hidden />
      </div>
    </section>
  );
}
