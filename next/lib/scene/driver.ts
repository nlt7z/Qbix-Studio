import { createScroller, type Scroller } from '@/lib/smoothScroll';
import type { Timeline } from './timeline';

/**
 * Plays every scene on the page with the scroll, from one frame loop.
 *
 * A scene belongs to a chapter (the nearest `[data-chapter]` section). Its
 * timeline has `n` states (beats 1..n, beat 0 = nothing drawn yet). The
 * first state is drawn as the chapter comes up the screen (or, at the top of
 * a page, on load); the rest are spread over the chapter's pinned scroll,
 * each move in the middle of its stretch so every state holds a while. The
 * shown time chases the scroll's, so a flick of the wheel reads as one
 * motion, and scrolling back plays it backwards. The chapter gets the state
 * it's showing as `data-step` (0-based), and a `scene:step` event.
 */

type Entry = {
  section: HTMLElement;
  tl: Timeline;
  n: number;
  /** 'load': the first state draws itself when the page opens (a page's top) */
  intro: 'scroll' | 'load';
  shown: number;
  loadAt: number | null;
  step: number;
  seen: boolean;
  /** held at a time (for checking a scene frame by frame), or null */
  pinned: number | null;
};

const entries = new Set<Entry>();
let raf = 0;
let last = 0;
let scroller: Scroller | null = null;
let io: IntersectionObserver | null = null;
// asked once (and again if it changes), not every frame
let reducedQuery: MediaQueryList | null = null;
const reduced = () => {
  if (typeof window === 'undefined') return false;
  if (!reducedQuery) reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return reducedQuery.matches;
};
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
/** Phones and tall windows: the scene sits in a window over the words, which scroll on under it. */
export const tallLayout = () => window.innerWidth < 900 || window.innerWidth / window.innerHeight < 1;
const splashDone = () => (window as unknown as { __qbixSplashDone?: boolean }).__qbixSplashDone !== false;

/** Where the scroll has a chapter's scene, in beats (0..n). */
function target(e: Entry, now: number): number {
  const vh = window.innerHeight;
  const r = e.section.getBoundingClientRect();
  const tail = Number(e.section.dataset.tail ?? 0) * vh;
  let intro: number;
  if (e.intro === 'load') {
    if (e.loadAt === null) {
      if (!splashDone() || r.bottom < 0 || r.top > vh) return 0;
      e.loadAt = now;
    }
    intro = clamp01((now - e.loadAt) / 1700);
  } else {
    // drawn while the chapter's top comes from 85% down the screen to the top (to under the nav on a phone)
    const top = tallLayout() ? 80 : 0;
    intro = clamp01((vh * 0.85 - r.top) / (vh * 0.85 - top));
  }
  if (e.n < 2 || intro < 1) return intro;
  const tall = tallLayout();
  const run = tall ? r.height - vh * 0.75 : r.height - vh - tail;
  const p = clamp01((tall ? 80 - r.top : -r.top) / Math.max(1, run));
  const u = p * (e.n - 1);
  const i = Math.min(e.n - 2, Math.floor(u));
  return 1 + i + smooth(0.18, 0.82, u - i);
}

function frame(now: number) {
  raf = 0;
  scroller?.step(now);
  const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
  last = now;
  let busy = false;
  for (const e of Array.from(entries)) {
    if (!e.seen || e.pinned !== null) continue;
    const want = target(e, now);
    const was = e.shown;
    if (reduced()) {
      e.shown = want > 0 ? Math.max(1, Math.round(want)) : 0;
    } else {
      const next = e.shown + (want - e.shown) * (1 - Math.exp(-dt * 6.5));
      e.shown = Math.abs(want - next) < 0.0005 ? want : next;
    }
    if (e.shown !== was) e.tl.seek(e.shown);
    // (a hero drawing itself on load keeps the loop going from its first frame, scroll or not)
    if (e.shown !== want || (e.loadAt !== null && want < 1)) busy = true;
    const step = Math.max(0, Math.min(e.n - 1, Math.round(e.shown) - 1));
    if (step !== e.step) {
      e.step = step;
      e.section.setAttribute('data-step', String(step));
      e.section.dispatchEvent(new CustomEvent('scene:step', { detail: step }));
    }
  }
  // a scene waiting for the splash to lift checks again next frame
  if (busy || Array.from(entries).some((e) => e.seen && e.intro === 'load' && e.loadAt === null)) kick();
}

function kick() {
  if (!raf) raf = requestAnimationFrame(frame);
}
const onScroll = () => kick();

/** Add a scene to the page's loop; returns its removal. */
export function playScene(o: { section: HTMLElement; tl: Timeline; n: number; intro?: 'scroll' | 'load' }) {
  const e: Entry = { section: o.section, tl: o.tl, n: o.n, intro: o.intro ?? 'scroll', shown: 0, loadAt: null, step: -1, seen: false, pinned: null };
  // ?scenes in the address: window.__scene(section, t) holds a scene at a time, to check it frame by frame
  if (/[?&]scenes\b/.test(location.search)) {
    (window as unknown as { __scene?: (s: Element, t: number | null) => void }).__scene = (s, t) => {
      entries.forEach((en) => {
        if (en.section !== s) return;
        en.pinned = t;
        if (t === null) return;
        en.tl.seek(t);
        const step = Math.max(0, Math.min(en.n - 1, Math.round(t) - 1));
        en.section.setAttribute('data-step', String(step));
        en.section.dispatchEvent(new CustomEvent('scene:step', { detail: step }));
      });
      kick();
    };
  }
  if (!scroller && window.matchMedia('(pointer: fine)').matches && !reduced()) scroller = createScroller();
  if (!io) {
    io = new IntersectionObserver(
      (list) => {
        for (const it of list) entries.forEach((en) => {
          if (en.section === it.target) en.seen = it.isIntersecting;
        });
        kick();
      },
      { rootMargin: '25% 0px 25% 0px' },
    );
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }
  entries.add(e);
  io.observe(e.section);
  // where the page already is (a reload halfway down): drawn there at once
  e.shown = e.intro === 'load' ? 0 : target(e, performance.now());
  e.tl.seek(e.shown);
  last = performance.now();
  kick();
  return () => {
    entries.delete(e);
    io?.unobserve(e.section);
    e.tl.dispose();
    if (!entries.size) {
      scroller?.dispose();
      scroller = null;
      io?.disconnect();
      io = null;
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    }
  };
}
