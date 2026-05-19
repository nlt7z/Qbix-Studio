'use client';

import { motion, useReducedMotion, type Variants, type Transition } from 'framer-motion';
import { type ComponentProps, type ElementType, type ReactNode } from 'react';

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const EASE_BACK = [0.22, 1.2, 0.36, 1] as const;

export type RevealSpeed = 'snap' | 'fast' | 'base' | 'slow' | 'cinematic';

type SpeedSpec = { duration: number; y: number; blur: number };

const SPEEDS: Record<RevealSpeed, SpeedSpec> = {
  snap:      { duration: 0.45, y: 8,  blur: 4  },
  fast:      { duration: 0.6,  y: 14, blur: 8  },
  base:      { duration: 0.85, y: 22, blur: 12 },
  slow:      { duration: 1.15, y: 32, blur: 18 },
  cinematic: { duration: 1.5,  y: 44, blur: 26 },
};

type CommonProps = {
  speed?: RevealSpeed;
  delay?: number;
  y?: number;
  blur?: number;
  once?: boolean;
  margin?: string;
  ease?: 'out' | 'back';
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
  children,
  ...rest
}: RevealProps<E>) {
  const reduced = useReducedMotion();
  const spec = SPEEDS[speed];
  const yPx = y ?? spec.y;
  const blurPx = blur ?? spec.blur;
  const easing = ease === 'back' ? EASE_BACK : EASE_OUT;

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
      initial={{ opacity: 0, y: yPx, filter: `blur(${blurPx}px)` }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once, margin }}
      transition={transition}
      {...rest}
    >
      {children}
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
  children: ReactNode;
} & Omit<ComponentProps<E>, 'as' | 'children'>;

export function RevealItem<E extends ElementType = 'div'>({
  as,
  speed = 'base',
  y,
  blur,
  ease = 'out',
  children,
  ...rest
}: RevealItemProps<E>) {
  const reduced = useReducedMotion();
  const spec = SPEEDS[speed];
  const yPx = y ?? spec.y;
  const blurPx = blur ?? spec.blur;
  const easing = ease === 'back' ? EASE_BACK : EASE_OUT;

  const Tag = (motion as any)[as as string] ?? motion.div;

  if (reduced) {
    const PlainTag = (as ?? 'div') as ElementType;
    return <PlainTag {...(rest as any)}>{children}</PlainTag>;
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: yPx, filter: `blur(${blurPx}px)` },
    show: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: spec.duration, ease: easing },
    },
  };

  return (
    <Tag variants={itemVariants} {...rest}>
      {children}
    </Tag>
  );
}
