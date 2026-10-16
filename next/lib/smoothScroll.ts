/**
 * The homepage's scrolling with a mouse or trackpad: the wheel and the keys
 * move a target, and the page follows it, eased, one step a frame. Owning the
 * scroll is what lets the story hold the page still while a scene plays
 * (`holdY`: the page eases to a stop there) without fighting the browser, so
 * nothing on the page is ever pulled back against the wheel. Scrollbars,
 * find-in-page, touch and anything else that scrolls the page natively are
 * simply followed.
 */
export type Scroller = {
  /** The page may not scroll down past this while it's set (it eases to a stop there). */
  holdY: number | null;
  /** Advance one frame (idempotent per timestamp, so the story can drive it before it reads the page). */
  step: (now: number) => void;
  /** An eased jump (a nav link, back to top); holds don't apply. */
  scrollTo: (y: number) => void;
  dispose: () => void;
};

type Win = Window & { __qbixScroller?: Scroller };

const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/** Scroll the page to y: through the homepage's scroller when it has one, else natively. */
export function smoothScrollTo(y: number) {
  const s = (window as Win).__qbixScroller;
  if (s) s.scrollTo(y);
  else window.scrollTo({ top: y, behavior: 'smooth' });
}

// Would this wheel scroll something inside the page (a scrolling box) rather than the page?
function scrollsInside(target: EventTarget | null, dy: number) {
  for (let n = target instanceof Element ? target : null; n && n !== document.body && n !== document.documentElement; n = n.parentElement) {
    if (n.scrollHeight <= n.clientHeight + 1) continue;
    if (!/(auto|scroll)/.test(getComputedStyle(n).overflowY)) continue;
    if (dy > 0 ? n.scrollTop + n.clientHeight < n.scrollHeight - 1 : n.scrollTop > 0) return true;
  }
  return false;
}

export function createScroller(): Scroller {
  const html = document.documentElement;
  const prevBehavior = html.style.scrollBehavior;
  html.style.scrollBehavior = 'auto';   // our scrollTo calls are the easing; CSS smoothing would fight them

  let current = window.scrollY;
  let target = current;
  let applied = current;   // what we last set, to tell our scrolls from anyone else's
  let last = performance.now();
  let lastStep = -1;
  let raf = 0;
  let tween: { from: number; to: number; t0: number; dur: number } | null = null;

  const max = () => Math.max(0, html.scrollHeight - window.innerHeight);
  const locked = () => document.body.style.overflow === 'hidden' || html.style.overflow === 'hidden';
  const clampTarget = () => {
    target = Math.min(max(), Math.max(0, target));
    const h = S.holdY;
    if (h != null && !tween && current <= h + 1 && target > h) target = h;
  };
  const kick = () => {
    if (!raf) raf = requestAnimationFrame(loop);
  };
  function loop(now: number) {
    raf = 0;
    step(now);
    if (tween || Math.abs(target - current) > 0.3) raf = requestAnimationFrame(loop);
  }
  function step(now: number) {
    if (now === lastStep) return;
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
    last = now;
    lastStep = now;
    if (locked()) {
      current = target = applied = window.scrollY;
      tween = null;
      return;
    }
    if (tween) {
      const k = Math.min(1, (now - tween.t0) / tween.dur);
      current = tween.from + (tween.to - tween.from) * easeInOut(k);
      target = current;
      if (k >= 1) tween = null;
    } else {
      clampTarget();
      current += (target - current) * (1 - Math.exp(-dt * 11));
      if (Math.abs(target - current) < 0.3) current = target;
    }
    if (Math.abs(window.scrollY - current) >= 0.5) window.scrollTo(0, current);
    applied = window.scrollY;
  }
  function scrollTo(y: number) {
    const to = Math.min(max(), Math.max(0, y));
    const dur = Math.min(1400, Math.max(650, Math.abs(to - current) / 2.4));
    tween = { from: current, to, t0: performance.now(), dur };
    kick();
  }

  const onWheel = (e: WheelEvent) => {
    if (e.defaultPrevented || e.ctrlKey || locked()) return;
    if (scrollsInside(e.target, e.deltaY)) return;
    e.preventDefault();
    tween = null;
    let d = e.deltaY;
    if (e.deltaMode === 1) d *= 16;
    else if (e.deltaMode === 2) d *= window.innerHeight;
    target += d;
    clampTarget();
    kick();
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || locked()) return;
    const el = e.target as HTMLElement | null;
    if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(el.tagName))) return;
    const vh = window.innerHeight;
    let d = 0;
    switch (e.key) {
      case 'ArrowDown': d = 110; break;
      case 'ArrowUp': d = -110; break;
      case 'PageDown': d = vh * 0.85; break;
      case 'PageUp': d = -vh * 0.85; break;
      case ' ': d = (e.shiftKey ? -1 : 1) * vh * 0.85; break;
      case 'Home': e.preventDefault(); scrollTo(0); return;
      case 'End': e.preventDefault(); scrollTo(max()); return;
      default: return;
    }
    e.preventDefault();
    tween = null;
    target += d;
    clampTarget();
    kick();
  };
  // A scroll we didn't make (the scrollbar, find in page, a hash jump): follow it.
  const onScroll = () => {
    if (tween) return;
    if (Math.abs(window.scrollY - applied) > 2) {
      current = target = applied = window.scrollY;
    }
  };
  const onResize = () => {
    clampTarget();
  };
  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('keydown', onKey);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);

  function dispose() {
    if (raf) cancelAnimationFrame(raf);
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    html.style.scrollBehavior = prevBehavior;
    if ((window as Win).__qbixScroller === S) delete (window as Win).__qbixScroller;
  }

  const S: Scroller = { holdY: null, step, scrollTo, dispose };
  (window as Win).__qbixScroller = S;
  return S;
}
