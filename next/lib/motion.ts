import type { Variants, Transition } from 'framer-motion';

export const easeOutCubic = [0.2, 0.8, 0.2, 1] as const;
export const easeOutQuart = [0.16, 1, 0.3, 1] as const;
export const easeOutExpo = [0.6, 0, 0.2, 1] as const;

export const heroLineVariants: Variants = {
  hidden: { y: '110%' },
  show: (i: number) => ({
    y: 0,
    transition: { duration: 0.8, delay: i * 0.12, ease: easeOutCubic },
  }),
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay, ease: easeOutCubic },
  }),
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: (delay: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.6, delay },
  }),
};

export const missionReveal: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: easeOutCubic },
  }),
};

export const cardHoverTransition: Transition = {
  duration: 0.25,
  ease: easeOutCubic,
};

// Boot overlay auto-hides at 1.5s — the progress bar fills just inside that.
export const bootProgressTransition: Transition = {
  duration: 1.4,
  ease: easeOutQuart,
};
