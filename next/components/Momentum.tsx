'use client';

import { useEffect } from 'react';
import { momentum } from '@/lib/momentum';

/**
 * Scroll momentum for the homepage: the whole page answers how fast, and
 * which way, it is being scrolled, then springs back to rest when the scroll
 * stops. Section headings split along their strip bands, the cards trail
 * behind with a little lag, the pixel edges stretch, the logo strip speeds up
 * or runs backwards, and the hero cube and globe spin with it.
 *
 * One spring runs only while there is momentum to show. It writes two custom
 * properties (`--vel` signed, `--spd` its size) onto the few elements that
 * use them, never onto the root, so each frame restyles only those subtrees;
 * the CSS in app/momentum.css turns them into transforms.
 */
const TARGETS = '.strip-stack, .px-edge, .svc, .product-card';
const SCALE = 2.2;     // px/ms that maps to ~0.76 of full momentum (tanh)
const STIFF = 0.12;    // spring per 60fps frame
const DAMP = 0.36;     // ≈0.5 damping ratio: a small overshoot as it settles
const MARQUEE_GAIN = 7;

export default function Momentum() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let targets: HTMLElement[] = [];
    let marquee: Animation | null = null;
    const collect = () => {
      targets = Array.from(document.querySelectorAll<HTMLElement>(TARGETS));
      marquee =
        document
          .querySelector('.marquee-track')
          ?.getAnimations()
          .find((a) => (a as CSSAnimation).animationName === 'marquee') ?? null;
    };

    let lastY = window.scrollY;
    let lastT = performance.now();
    let goal = 0;       // smoothed scroll velocity, normalised
    let x = 0;          // sprung value shown on the page
    let v = 0;
    let quietAt = 0;
    let raf = 0;
    let prev = 0;

    const write = (val: number) => {
      const s = val.toFixed(3);
      const a = Math.abs(val).toFixed(3);
      for (const el of targets) {
        el.style.setProperty('--vel', s);
        el.style.setProperty('--spd', a);
      }
      if (marquee) marquee.playbackRate = 1 + val * MARQUEE_GAIN;
      momentum.vel = val;
    };

    const frame = (now: number) => {
      raf = 0;
      const k = Math.min(3, (now - prev) / 16.67);   // frames elapsed at 60fps
      prev = now;
      // No scroll event lately: let the goal run down (a wheel's notches
      // arrive ~100ms apart, so a hard zero would make it flicker).
      if (now - quietAt > 50) goal *= Math.pow(0.84, k);
      if (Math.abs(goal) < 0.004) goal = 0;
      for (let i = 0; i < Math.round(k) || i < 1; i++) {
        v += (goal - x) * STIFF - v * DAMP;
        x += v;
      }
      if (goal === 0 && Math.abs(x) < 0.002 && Math.abs(v) < 0.002) {
        x = v = 0;
        write(0);
        return;
      }
      write(x);
      raf = requestAnimationFrame(frame);
    };

    const onScroll = () => {
      const t = performance.now();
      const y = window.scrollY;
      const dt = Math.max(1, t - lastT);
      const inst = Math.tanh((y - lastY) / dt / SCALE);
      // A long gap means a fresh gesture: don't average with stale motion.
      goal = dt > 120 ? inst : goal * 0.55 + inst * 0.45;
      lastY = y;
      lastT = t;
      quietAt = t;
      if (!raf) {
        collect();
        prev = t;
        raf = requestAnimationFrame(frame);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
      write(0);
    };
  }, []);
  return null;
}
