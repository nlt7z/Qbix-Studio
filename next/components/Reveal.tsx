'use client';

import { motion, useReducedMotion, type Variants, type Transition } from 'framer-motion';
import { type ComponentProps, type ElementType, type ReactNode } from 'react';

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const EASE_BACK = [0.22, 1.2, 0.36, 1] as const;

export type RevealSpeed = 'snap' | 'fast' | 'base' | 'slow' | 'cinematic';
/**
 * Gesture vocabulary — one of three motion *meanings*:
 *   rise   : default y-offset rise + fade (entrance grammar)
 *   media  : clip-path wipe — the frame uncovers top-to-bottom (work media reveal)
 *   tilt   : random small rotate + y-offset (brand objects, props-on-table)
 */
export type RevealGesture = 'rise' | 'media' | 'tilt';

type SpeedSpec = { duration: number; y: number };

const SPEEDS: Record<RevealSpeed, SpeedSpec> = {
  snap:      { duration: 0.45, y: 12 },
  fast:      { duration: 0.6,  y: 20 },
  base:      { duration: 0.85, y: 32 },
  slow:      { duration: 1.15, y: 44 },
  cinematic: { duration: 1.5,  y: 56 },
};

function gestureFor(
  gesture: RevealGesture,
  yPx: number,
  index: number,
) {
  switch (gesture) {
    case 'media':
      // The frame stays put; its content is uncovered by a wipe, like a
      // print being pulled out of a sleeve.
      return {
        hidden: {
          clipPath: 'inset(0% 0% 100% 0%)',
          y: yPx * 0.5,
        },
        show: {
          clipPath: 'inset(0% 0% 0% 0%)',
          y: 0,
        },
      };
    case 'tilt': {
      // Alternate rotation direction by index for an organic "props on a table" feel.
      const dir = index % 2 === 0 ? 1 : -1;
      const rot = (0.6 + (index % 3) * 0.4) * dir;
      return {
        hidden: {
          opacity: 0,
          y: yPx * 0.7,
          rotate: rot * 2.2,
        },
        show: {
          opacity: 1,
          y: 0,
          rotate: 0,
        },
      };
    }
    case 'rise':
    default:
      return {
        hidden: {
          opacity: 0,
          y: yPx,
        },
        show: {
          opacity: 1,
          y: 0,
        },
      };
  }
}

function easeFor(gesture: RevealGesture, ease: 'out' | 'back') {
  // Wipes read best on a pure decelerating curve — overshoot would fold
  // the clip mask back on itself.
  if (gesture === 'media') return EASE_OUT;
  if (gesture === 'tilt') return EASE_BACK;
  return ease === 'back' ? EASE_BACK : EASE_OUT;
}

type CommonProps = {
  speed?: RevealSpeed;
  delay?: number;
  y?: number;
  once?: boolean;
  margin?: string;
  ease?: 'out' | 'back';
  gesture?: RevealGesture;
  index?: number;
  children: ReactNode;
};

type RevealProps<E extends ElementType = 'div'> = CommonProps & {
  as?: E;
} & Omit<ComponentProps<E>, keyof CommonProps | 'as'>;

export function Reveal<E extends ElementType = 'div'>({
  as,
  speed = 'base',
  delay = 0,
  y,
  once = true,
  margin = '-10% 0px -10% 0px',
  ease = 'out',
  gesture = 'rise',
  index = 0,
  children,
  ...rest
}: RevealProps<E>) {
  const reduced = useReducedMotion();
  const spec = SPEEDS[speed];
  const yPx = y ?? spec.y;
  const easing = easeFor(gesture, ease);
  const variants = gestureFor(gesture, yPx, index);

  const Tag = as ? (motion as any)[as as string] : motion.div;

  if (reduced) {
    const PlainTag = (as ?? 'div') as ElementType;
    return <PlainTag {...(rest as any)}>{children}</PlainTag>;
  }

  const transition: Transition = {
    duration: spec.duration,
    ease: easing,
    delay,
  };

  return (
    <Tag
      initial={variants.hidden}
      whileInView={variants.show}
      viewport={{ once, margin }}
      transition={transition}
      {...rest}
    >
      {children}
    </Tag>
  );
}

type WordsProps<E extends ElementType = 'span'> = {
  as?: E;
  text: string;
  speed?: RevealSpeed;
  delay?: number;
  step?: number;
  once?: boolean;
  margin?: string;
} & Omit<ComponentProps<E>, 'as' | 'children'>;

// Mask slot: each word sits in an overflow-hidden sleeve and slides up out
// of it. The padding/negative-margin pair keeps descenders (g, p, y) from
// being clipped by the sleeve while it animates.
const WORD_MASK_STYLE = {
  display: 'inline-block',
  overflow: 'hidden',
  verticalAlign: 'bottom',
  paddingBottom: '0.14em',
  marginBottom: '-0.14em',
} as const;

/**
 * Scroll-triggered masked word reveal — headlines slide up from behind an
 * invisible mask, word by word, so they are *uncovered* rather than faded.
 */
export function Words<E extends ElementType = 'span'>({
  as,
  text,
  speed = 'base',
  delay = 0,
  step = 0.05,
  once = true,
  margin = '-10% 0px -10% 0px',
  ...rest
}: WordsProps<E>) {
  const reduced = useReducedMotion();
  const spec = SPEEDS[speed];

  if (reduced) {
    const PlainTag = (as ?? 'span') as ElementType;
    return <PlainTag {...(rest as any)}>{text}</PlainTag>;
  }

  const Tag = as ? (motion as any)[as as string] : motion.span;
  const words = text.split(' ');

  return (
    <Tag
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: step, delayChildren: delay } },
      }}
      {...rest}
    >
      {words.map((w, i) => (
        <span key={i} style={WORD_MASK_STYLE}>
          <motion.span
            style={{ display: 'inline-block', whiteSpace: 'pre' }}
            variants={{
              hidden: { y: '115%' },
              show: {
                y: '0%',
                transition: { duration: spec.duration, ease: EASE_OUT },
              },
            }}
          >
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

type WipeProps<E extends ElementType = 'div'> = {
  as?: E;
  /** Solid color of the sweeping bar. Defaults to the signal lime. */
  color?: string;
  delay?: number;
  /** Line index — staggers lines 0.15s apart like consecutive wipes. */
  index?: number;
  duration?: number;
  once?: boolean;
  margin?: string;
  children: ReactNode;
} & Omit<ComponentProps<E>, 'as' | 'children'>;

/**
 * Wipe — highlight-bar text reveal. The block is clipped shut from the
 * right and opens left→right; a solid signal bar rides inside the same
 * clip and collapses toward the right edge halfway through, so what reads
 * is a bar of color sweeping across and handing off to the content it
 * uncovers. Pure structural motion — no fade, no blur.
 */
export function Wipe<E extends ElementType = 'div'>({
  as,
  color = 'var(--signal)',
  delay = 0,
  index = 0,
  duration = 0.6,
  once = true,
  margin = '-10% 0px -10% 0px',
  children,
  ...rest
}: WipeProps<E>) {
  const reduced = useReducedMotion();

  if (reduced) {
    const PlainTag = (as ?? 'div') as ElementType;
    return <PlainTag {...(rest as any)}>{children}</PlainTag>;
  }

  const Tag = as ? (motion as any)[as as string] : motion.div;
  const at = delay + index * 0.15;
  const { style, ...attrs } = rest as { style?: React.CSSProperties };

  return (
    <Tag
      initial={{ clipPath: 'inset(0 100% 0 0)' }}
      whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
      viewport={{ once, margin }}
      transition={{ duration, ease: EASE_OUT, delay: at }}
      style={{ position: 'relative', ...style }}
      {...attrs}
    >
      {children}
      <motion.span
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: color,
          transformOrigin: 'right center',
          zIndex: 5,
          pointerEvents: 'none',
        }}
        initial={{ scaleX: 1 }}
        whileInView={{ scaleX: 0 }}
        viewport={{ once, margin }}
        transition={{ duration, ease: 'easeInOut', delay: at + duration / 2 }}
      />
    </Tag>
  );
}

// Deterministic pseudo-random in [0, 1) — same value on server and client,
// so the scattered start positions never cause a hydration mismatch.
function seeded(i: number, salt: number) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

type ScatterProps<E extends ElementType = 'span'> = {
  as?: E;
  text: string;
  /** Substring rendered with the lime .signal-bg treatment */
  highlight?: string;
  speed?: RevealSpeed;
  delay?: number;
  step?: number;
  once?: boolean;
  margin?: string;
} & Omit<ComponentProps<E>, 'as' | 'children'>;

/**
 * Scatter-assemble reveal. Every character starts flung out of place —
 * offset, rotated, shrunk, invisible — and swirls back into the sentence
 * one character after another. Reserved for the testimonial quote.
 */
export function Scatter<E extends ElementType = 'span'>({
  as,
  text,
  highlight,
  speed = 'fast',
  delay = 0,
  step = 0.012,
  once = true,
  margin = '-10% 0px -10% 0px',
  ...rest
}: ScatterProps<E>) {
  const reduced = useReducedMotion();
  const spec = SPEEDS[speed];

  const hlStart = highlight ? text.indexOf(highlight) : -1;
  const hlEnd = hlStart >= 0 ? hlStart + (highlight as string).length : -1;

  if (reduced) {
    const PlainTag = (as ?? 'span') as ElementType;
    return (
      <PlainTag {...(rest as any)}>
        {hlStart >= 0 ? (
          <>
            {text.slice(0, hlStart)}
            <span className="signal-bg">{highlight}</span>
            {text.slice(hlEnd)}
          </>
        ) : (
          text
        )}
      </PlainTag>
    );
  }

  const Tag = as ? (motion as any)[as as string] : motion.span;
  const words = text.split(' ');

  let charIndex = 0;
  return (
    <Tag
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: step, delayChildren: delay } },
      }}
      {...rest}
    >
      {words.map((w, wi) => (
        <span
          key={wi}
          style={{ display: 'inline-block', whiteSpace: 'pre' }}
        >
          {(wi < words.length - 1 ? `${w} ` : w).split('').map((ch) => {
            const i = charIndex++;
            const inHighlight = i >= hlStart && i < hlEnd;
            return (
              <motion.span
                key={i}
                className={inHighlight ? 'signal-bg' : undefined}
                style={{ display: 'inline-block', whiteSpace: 'pre' }}
                variants={{
                  hidden: {
                    opacity: 0,
                    x: (seeded(i, 1) - 0.5) * 60,
                    y: (seeded(i, 2) - 0.5) * 110,
                    rotate: (seeded(i, 3) - 0.5) * 80,
                    scale: 0.4,
                  },
                  show: {
                    opacity: 1,
                    x: 0,
                    y: 0,
                    rotate: 0,
                    scale: 1,
                    transition: { duration: spec.duration, ease: EASE_OUT },
                  },
                }}
              >
                {ch}
              </motion.span>
            );
          })}
        </span>
      ))}
    </Tag>
  );
}

type StaggerProps<E extends ElementType = 'div'> = {
  as?: E;
  stagger?: number;
  delayChildren?: number;
  once?: boolean;
  margin?: string;
  children: ReactNode;
} & Omit<ComponentProps<E>, 'as' | 'children'>;

const STAGGER_PARENT: Variants = {
  hidden: {},
  show: (custom: { stagger: number; delayChildren: number }) => ({
    transition: {
      staggerChildren: custom.stagger,
      delayChildren: custom.delayChildren,
    },
  }),
};

export function Stagger<E extends ElementType = 'div'>({
  as,
  stagger = 0.08,
  delayChildren = 0,
  once = true,
  margin = '-10% 0px -10% 0px',
  children,
  ...rest
}: StaggerProps<E>) {
  const reduced = useReducedMotion();
  const Tag = as ? (motion as any)[as as string] : motion.div;

  if (reduced) {
    const PlainTag = (as ?? 'div') as ElementType;
    return <PlainTag {...(rest as any)}>{children}</PlainTag>;
  }

  return (
    <Tag
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin }}
      variants={STAGGER_PARENT}
      custom={{ stagger, delayChildren }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

type RevealItemProps<E extends ElementType = 'div'> = {
  as?: E;
  speed?: RevealSpeed;
  y?: number;
  ease?: 'out' | 'back';
  gesture?: RevealGesture;
  index?: number;
  children: ReactNode;
} & Omit<ComponentProps<E>, 'as' | 'children'>;

export function RevealItem<E extends ElementType = 'div'>({
  as,
  speed = 'base',
  y,
  ease = 'out',
  gesture = 'rise',
  index = 0,
  children,
  ...rest
}: RevealItemProps<E>) {
  const reduced = useReducedMotion();
  const spec = SPEEDS[speed];
  const yPx = y ?? spec.y;
  const easing = easeFor(gesture, ease);
  const variants = gestureFor(gesture, yPx, index);

  const Tag = as ? (motion as any)[as as string] : motion.div;

  if (reduced) {
    const PlainTag = (as ?? 'div') as ElementType;
    return <PlainTag {...(rest as any)}>{children}</PlainTag>;
  }

  const itemVariants: Variants = {
    hidden: variants.hidden,
    show: {
      ...variants.show,
      transition: { duration: spec.duration, ease: easing },
    },
  };

  return (
    <Tag variants={itemVariants} {...rest}>
      {children}
    </Tag>
  );
}
