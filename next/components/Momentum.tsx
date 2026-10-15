'use client';

import { useEffect } from 'react';
import { momentum } from '@/lib/momentum';

/**
 * Scroll momentum for the homepage: the whole page answers how fast, and
 * which way, it is being scrolled, then springs back to rest when the scroll
 * stops. The cards trail behind with a little lag, the pixel edges stretch,
 * the logo strip speeds up or runs backwards, and the hero cube spins with it.
 *
 * One spring runs only while there is momentum to show, and writes inline
 * transforms straight onto the few elements that move. No custom properties:
 * a variable inherits into every pixel below it, and each of those
 * carries a scroll-driven animation, so a per-frame variable made the browser
 * re-resolve hundreds of animations a frame (30fps scrolling). `transform`
 * composes with the individual translate / scale the choreography animates.
 */
const SCALE = 2.2;     // px/ms that maps to ~0.76 of full momentum (tanh)
const STIFF = 0.12;    // spring per 60fps frame
const DAMP = 0.36;     // ≈0.5 damping ratio: a small overshoot as it settles
const MARQUEE_GAIN = 7;

type Target = { el: HTMLElement; kind: 'edge' | 'card'; k: number };

const SVC_LAG = [0.45, 0.75, 1.05, 1.35];

export default function Momentum() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let targets: Target[] = [];
    let marquee: Animation | null = null;
    // Only what's on screen is written to; anything that scrolls away is put
    // back at rest once.
    const seen = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) seen.add(e.target);
        else {
          seen.delete(e.target);
          (e.target as HTMLElement).style.transform = '';
        }
      }
    });
    // Touch devices keep the free parts (marquee, cube and globe read the
    // shared value); the per-element transforms cost a phone ~30% more main
    // thread while scrolling, so they're desktop only.
    const lite = window.matchMedia('(pointer: coarse)').matches;
    const collect = () => {
      io.disconnect();
      seen.clear();
      targets = [];
      if (lite) {
        findMarquee();
        return;
      }
      document.querySelectorAll<HTMLElement>('.px-edge').forEach((el) => targets.push({ el, kind: 'edge', k: 1 }));
      document.querySelectorAll<HTMLElement>('.svc').forEach((el) => {
        const cell = el.closest('.svc-deck > *, .services-wrap > *');
        const i = cell ? Array.prototype.indexOf.call(cell.parentElement!.children, cell) : 0;
        targets.push({ el, kind: 'card', k: SVC_LAG[i] ?? 1 });
      });
      document.querySelectorAll<HTMLElement>('.product-card').forEach((el) => {
        targets.push({ el, kind: 'card', k: 0.45 + (Number(el.style.getPropertyValue('--k')) || 0) * 0.28 });
      });
      targets.forEach((t) => io.observe(t.el));
      findMarquee();
    };
    const findMarquee = () => {
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
      const rest = val === 0;
      for (const t of targets) {
        if (!rest && !seen.has(t.el)) continue;
        if (rest) t.el.style.transform = '';
        else if (t.kind === 'edge') t.el.style.transform = `scaleY(${(1 + Math.abs(val) * 1.6).toFixed(3)})`;
        else t.el.style.transform = `translateY(${(val * t.k * 30).toFixed(1)}px)`;
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
        // Gather the movers once (and again only if the page re-rendered them).
        if (!marquee || !targets.every((tg) => tg.el.isConnected)) collect();
        prev = t;
        raf = requestAnimationFrame(frame);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
      io.disconnect();
      write(0);
    };
  }, []);
  return null;
}
