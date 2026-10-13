'use client';

import { useEffect, type RefObject } from 'react';
import { watchCovered } from '@/components/three/covered';

/**
 * Drives the muted, looping preview videos. A video may play only while it is
 * on screen, not covered by the next stacked panel, the tab is visible and the
 * page is at rest (scrolling holds it on its current frame; it picks up again
 * a moment after the scroll settles). Of the videos that may play, only ONE
 * does: the one under the pointer, else the one most in view.
 *
 * Why: with two previews decoding at once, Chrome drops the whole stacked
 * page to the videos' 30 fps and keeps it there, even after they pause, so
 * every scroll on the homepage stuttered. One video at a time keeps 60.
 */

type Player = {
  v: HTMLVideoElement;
  order: number;
  ratio: number;
  covered: boolean;
  hovered: boolean;
};

const players = new Set<Player>();
let scrolling = false;
let settle = 0;
let seq = 0;

function arbitrate() {
  let best: Player | null = null;
  if (!scrolling && !document.hidden) {
    players.forEach((p) => {
      if (p.ratio <= 0.1 || p.covered) return;
      if (
        !best ||
        (p.hovered && !best.hovered) ||
        (p.hovered === best.hovered && (p.ratio > best.ratio + 0.01 || (Math.abs(p.ratio - best.ratio) <= 0.01 && p.order < best.order)))
      ) {
        best = p;
      }
    });
  }
  players.forEach((p) => {
    if (p === best) {
      if (p.v.paused) p.v.play().catch(() => {});
    } else if (!p.v.paused) {
      p.v.pause();
    }
  });
}

const onScroll = () => {
  if (!scrolling) {
    scrolling = true;
    arbitrate();
  }
  window.clearTimeout(settle);
  settle = window.setTimeout(() => {
    scrolling = false;
    arbitrate();
  }, 220);
};

export function useQuietPlayback(ref: RefObject<HTMLVideoElement | null>, active = true) {
  useEffect(() => {
    const v = ref.current;
    if (!v || !active) return;
    const p: Player = { v, order: seq++, ratio: 0, covered: false, hovered: false };
    if (players.size === 0) {
      window.addEventListener('scroll', onScroll, { passive: true });
      document.addEventListener('visibilitychange', arbitrate);
    }
    players.add(p);

    const io = new IntersectionObserver(
      ([e]) => {
        p.ratio = e.isIntersecting ? e.intersectionRatio : 0;
        arbitrate();
      },
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    );
    io.observe(v);
    const stopCovered = watchCovered(v, (c) => {
      p.covered = c;
      arbitrate();
    });
    const card = v.closest<HTMLElement>('.product-card') ?? v.parentElement;
    const enter = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      p.hovered = true;
      arbitrate();
    };
    const leave = () => {
      p.hovered = false;
      arbitrate();
    };
    card?.addEventListener('pointerenter', enter);
    card?.addEventListener('pointerleave', leave);

    return () => {
      io.disconnect();
      stopCovered();
      card?.removeEventListener('pointerenter', enter);
      card?.removeEventListener('pointerleave', leave);
      players.delete(p);
      v.pause();
      if (players.size === 0) {
        window.removeEventListener('scroll', onScroll);
        document.removeEventListener('visibilitychange', arbitrate);
        window.clearTimeout(settle);
        scrolling = false;
      } else {
        arbitrate();
      }
    };
  }, [ref, active]);
}
