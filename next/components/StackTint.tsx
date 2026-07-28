'use client';

import { useEffect } from 'react';
import { useScroll, useTransform, useMotionValueEvent } from 'framer-motion';

/**
 * Drives one continuous base colour for the whole stacked page.
 *
 * As you scroll top → bottom, `--stack-bg` interpolates along a gentle gray arc
 * (darkest → charcoal → darkest). Every stacked panel paints with this single
 * evolving colour, so the page tone shifts *continuously* rather than in hard
 * steps — while each opaque panel still covers the one beneath it as it lifts.
 * Renders nothing; just a scroll listener writing a CSS variable on :root.
 */
export default function StackTint() {
  const { scrollYProgress } = useScroll();
  const color = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 0.75, 1],
    ['#08090A', '#0F1116', '#16181D', '#0F1116', '#08090A'],
  );

  useEffect(() => {
    document.documentElement.style.setProperty('--stack-bg', '#08090A');
    return () => {
      document.documentElement.style.removeProperty('--stack-bg');
    };
  }, []);

  useMotionValueEvent(color, 'change', (v) => {
    document.documentElement.style.setProperty('--stack-bg', v);
  });

  return null;
}
