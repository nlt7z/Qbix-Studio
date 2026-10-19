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

/** The audience switch, under the words: who it's for on either side of a
 *  track whose square knob slides to the chosen side (eased, no bounce).
 *  Either name, or the track, switches; arrow keys too. */
export function AudienceSwitch({ delay = 0 }: { delay?: number }) {
  const { audience, setAudience } = useAudience();
  const ai = audience === 'ai';
  const flip = () => setAudience(ai ? 'business' : 'ai');
  return (
    <span className="aud-mask">
      <motion.span
        className="aud-switch"
        role="radiogroup"
        aria-label="Who this page is for"
        data-on={audience}
        initial={{ y: '110%' }}
        animate={{ y: '0%' }}
        transition={{ duration: 0.85, ease: EASE_OUT, delay }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            flip();
          }
        }}
      >
        <button type="button" role="radio" aria-checked={ai} tabIndex={ai ? 0 : -1} className={`aud-name${ai ? ' is-on' : ''}`} onClick={() => setAudience('ai')}>
          For AI teams
        </button>
        <span className="aud-track" aria-hidden onClick={flip}>
          <span className="aud-knob" />
        </span>
        <button type="button" role="radio" aria-checked={!ai} tabIndex={ai ? -1 : 0} className={`aud-name${ai ? '' : ' is-on'}`} onClick={() => setAudience('business')}>
          For local business
        </button>
      </motion.span>
    </span>
  );
}

/**
 * The story's first chapter: the headline, the lede, the switch between the
 * two audiences, and the studio band. The object (the cube, gathering out of loose blocks) is drawn
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

          <AudienceSwitch delay={d(0.7, 0)} />
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
