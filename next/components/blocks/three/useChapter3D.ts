import { useEffect, type RefObject } from 'react';
import { chapterProgress, type Stage } from '@/components/blocks/three/stage';

export type Built = { S: Stage; update: (p: number, lean: number) => void };

/**
 * Plays a chapter's 3D by the scroll (its chapter's progress, 0..1) and leans it toward the pointer
 * (lean, -0.5..0.5, a mouse only), drawing a frame only while either is still moving and the stage is on
 * screen. `build` makes the stage once its faces are loaded.
 */
export function useChapter3D(ref: RefObject<HTMLElement>, build: (host: HTMLElement) => Promise<Built>) {
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let alive = true;
    let built: Built | null = null;
    let raf = 0;
    let seen = false;
    let p = 0;
    let lean = 0;
    let leanTo = 0;
    const frame = () => {
      raf = 0;
      if (!built) return;
      const to = chapterProgress(host);
      p = reduced ? to : p + (to - p) * 0.16;
      lean = reduced ? leanTo : lean + (leanTo - lean) * 0.1;
      built.update(p, lean);
      built.S.render();
      if (Math.abs(to - p) > 0.0004 || Math.abs(leanTo - lean) > 0.0004) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (seen && !raf) raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([e]) => {
      seen = e.isIntersecting;
      kick();
    });
    io.observe(host);
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = host.getBoundingClientRect();
      leanTo = Math.min(0.5, Math.max(-0.5, (e.clientX - r.left) / r.width - 0.5));
      kick();
    };
    const onLeave = () => {
      leanTo = 0;
      kick();
    };
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerleave', onLeave);
    addEventListener('scroll', kick, { passive: true });
    build(host).then((b) => {
      if (!alive) return b.S.dispose();
      built = b;
      p = chapterProgress(host);
      b.update(p, 0);
      b.S.render();
    });
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
      removeEventListener('scroll', kick);
      built?.S.dispose();
    };
  }, [ref, build]);
}
