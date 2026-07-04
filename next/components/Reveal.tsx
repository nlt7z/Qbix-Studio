'use client';

import { motion, useReducedMotion, type Variants, type Transition } from 'framer-motion';
import { type ComponentProps, type ElementType, type ReactNode } from 'react';

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const EASE_BACK = [0.22, 1.2, 0.36, 1] as const;
const EASE_SPRING = [0.34, 1.4, 0.46, 1] as const;

export type RevealSpeed = 'snap' | 'fast' | 'base' | 'slow' | 'cinematic';
/**
 * Gesture vocabulary — one of three motion *meanings*:
 *   rise   : default fade + y-offset + blur (entrance grammar)
 *   media  : scale-from-95 + 0.5° x-skew + blur (project/work media reveal)
 *   tilt   : random small rotate + y-offset (brand objects, props-on-table)
 */
export type RevealGesture = 'rise' | 'media' | 'tilt';

type SpeedSpec = { duration: number; y: number; blur: number };

const SPEEDS: Record<RevealSpeed, SpeedSpec> = {
  snap:      { duration: 0.45, y: 8,  blur: 4  },
  fast:      { duration: 0.6,  y: 14, blur: 8  },
  base:      { duration: 0.85, y: 22, blur: 12 },
  slow:      { duration: 1.15, y: 32, blur: 18 },
  cinematic: { duration: 1.5,  y: 44, blur: 26 },
};

function gestureFor(
  gesture: RevealGesture,
  yPx: number,
  blurPx: number,
  index: number,
) {
  switch (gesture) {
    case 'media':
      return {
        hidden: {
          opacity: 0,
          y: yPx * 0.45,
          scale: 0.96,
          skewX: '0.5deg',
          filter: `blur(${blurPx}px)`,
        },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          skewX: '0deg',
          filter: 'blur(0px)',
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
          rotate: rot * 1.6,
          filter: `blur(${blurPx}px)`,
        },
        show: {
          opacity: 1,
          y: 0,
          rotate: 0,
          filter: 'blur(0px)',
        },
      };
    }
    case 'rise':
    default:
      return {
        hidden: {
          opacity: 0,
          y: yPx,
          filter: `blur(${blurPx}px)`,
        },
        show: {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
        },
      };
  }
}

function easeFor(gesture: RevealGesture, ease: 'out' | 'back') {
  if (gesture === 'media') return EASE_SPRING;
  if (gesture === 'tilt') return EASE_BACK;
  return ease === 'back' ? EASE_BACK : EASE_OUT;
}

type CommonProps = {
  speed?: RevealSpeed;
  delay?: number;
  y?: number;
  blur?: number;
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
  blur,
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
  const blurPx = blur ?? spec.blur;
  const easing = easeFor(gesture, ease);
  const variants = gestureFor(gesture, yPx, blurPx, index);

  const Tag = (motion as any)[as as string] ?? motion.div;

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

/**
 * Scroll-triggered per-word reveal — the whileInView counterpart of the
 * hero's WordReveal. Each word rises + de-blurs on its own beat so section
 * headlines read as a writing rhythm when they enter the viewport.
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

  const Tag = (motion as any)[as as string] ?? motion.span;
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
        <motion.span
          key={i}
          style={{ display: 'inline-block', whiteSpace: 'pre' }}
          variants={{
            hidden: {
              opacity: 0,
              y: spec.y,
              filter: `blur(${spec.blur}px)`,
            },
            show: {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              transition: { duration: spec.duration, ease: EASE_SPRING },
            },
          }}
        >
          {w}
          {i < words.length - 1 ? ' ' : ''}
        </motion.span>
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
  const Tag = (motion as any)[as as string] ?? motion.div;

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
  blur?: number;
  ease?: 'out' | 'back';
  gesture?: RevealGesture;
  index?: number;
  children: ReactNode;
} & Omit<ComponentProps<E>, 'as' | 'children'>;

export function RevealItem<E extends ElementType = 'div'>({
  as,
  speed = 'base',
  y,
  blur,
  ease = 'out',
  gesture = 'rise',
  index = 0,
  children,
  ...rest
}: RevealItemProps<E>) {
  const reduced = useReducedMotion();
  const spec = SPEEDS[speed];
  const yPx = y ?? spec.y;
  const blurPx = blur ?? spec.blur;
  const easing = easeFor(gesture, ease);
  const variants = gestureFor(gesture, yPx, blurPx, index);

  const Tag = (motion as any)[as as string] ?? motion.div;

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
