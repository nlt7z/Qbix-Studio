/**
 * A scene's timeline: what each element of a drawing does, and when, written
 * like a motion designer's dope sheet and played by the scroll.
 *
 * Every element gets one track per CSS property it moves, spanning the whole
 * timeline, each move with its own easing however the scroll goes. Position,
 * scale, rotation and opacity are worked out here and written as inline
 * styles (a paused Web Animation on those would give every moving element its
 * own compositor layer, and a scrubbed page would pay to re-layer them all
 * each frame); clips, colours and sizes are paused Web Animations whose
 * currentTime is set. Only what changes between one time and the next is
 * touched. Time is in beats: a chapter with n states runs from 0 (nothing
 * drawn) to n (its last state), state k settled at beat k.
 */

export const E = {
  /** entrances: quick off the mark, a long settle (no overshoot) */
  out: 'cubic-bezier(0.16, 1, 0.3, 1)',
  /** a move from one place to another */
  move: 'cubic-bezier(0.65, 0, 0.35, 1)',
  /** a gentle move */
  soft: 'cubic-bezier(0.45, 0, 0.25, 1)',
  /** exits */
  in: 'cubic-bezier(0.5, 0, 0.75, 0)',
  lin: 'linear',
} as const;

export type Props = {
  /** translate, in the drawing's px */
  x?: number;
  y?: number;
  /** scale (both axes), or each */
  s?: number;
  sx?: number;
  sy?: number;
  /** rotate, degrees */
  r?: number;
  o?: number;
  /** a clip: inset(top right bottom left) in %, or any clip-path */
  clip?: [number, number, number, number] | string;
  bg?: string;
  color?: string;
  fill?: string;
  stroke?: string;
  /** stroke-dashoffset of a path drawn with pathLength="1" (1: none drawn, 0: all) */
  dash?: number;
  w?: number;
  h?: number;
};

type Channel = 'translate' | 'scale' | 'rotate' | 'opacity' | 'clipPath' | 'backgroundColor' | 'color' | 'fill' | 'stroke' | 'strokeDashoffset' | 'width' | 'height';
type State = { x: number; y: number; sx: number; sy: number; r: number; o: number; clip: string; bg: string; color: string; fill: string; stroke: string; dash: number; w: string; h: string };
type Seg = { t0: number; t1: number; to: Partial<State>; ease: string };

const CHANNELS: Record<Channel, (keyof State)[]> = {
  translate: ['x', 'y'],
  scale: ['sx', 'sy'],
  rotate: ['r'],
  opacity: ['o'],
  clipPath: ['clip'],
  backgroundColor: ['bg'],
  color: ['color'],
  fill: ['fill'],
  stroke: ['stroke'],
  strokeDashoffset: ['dash'],
  width: ['w'],
  height: ['h'],
};

const clipOf = (c: Props['clip']) => (typeof c === 'string' ? c : c ? `inset(${c[0]}% ${c[1]}% ${c[2]}% ${c[3]}%)` : undefined);

/** A CSS cubic-bezier as a function of progress (Newton's method, bisection to be safe). */
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const e = sx(t) - x, d = dx(t);
      if (Math.abs(e) < 1e-6 || Math.abs(d) < 1e-6) break;
      t -= e / d;
    }
    if (!(t >= 0 && t <= 1) || Math.abs(sx(t) - x) > 1e-4) {
      let a = 0, b = 1;
      t = x;
      for (let i = 0; i < 30; i++) {
        const v = sx(t);
        if (Math.abs(v - x) < 1e-6) break;
        if (v > x) b = t;
        else a = t;
        t = (a + b) / 2;
      }
    }
    return sy(t);
  };
}
const eases = new Map<string, (x: number) => number>();
function easing(css: string) {
  let f = eases.get(css);
  if (!f) {
    const m = /cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/.exec(css);
    f = m ? bezier(+m[1], +m[2], +m[3], +m[4]) : (x: number) => x;
    eases.set(css, f);
  }
  return f;
}

/** The properties written as inline styles: their numbers, and how they're written. */
const DIRECT: Partial<Record<Channel, { nums: (s: State) => number[]; css: (v: number[]) => string }>> = {
  translate: { nums: (s) => [s.x, s.y], css: (v) => `${v[0]}px ${v[1]}px` },
  scale: { nums: (s) => [s.sx, s.sy], css: (v) => `${v[0]} ${v[1]}` },
  rotate: { nums: (s) => [s.r], css: (v) => `${v[0]}deg` },
  opacity: { nums: (s) => [s.o], css: (v) => `${v[0]}` },
};
type Key = { t: number; v: number[]; ease: (x: number) => number };
type Direct = { el: ElementCSSInlineStyle; prop: string; css: (v: number[]) => string; keys: Key[]; moves: [number, number][]; was: string };
const round = (x: number) => Math.round(x * 1000) / 1000;
/** A track's numbers at time t: the last key at or before t, eased toward the next. */
function valueAt(keys: Key[], t: number) {
  let i = 0;
  for (let j = 1; j < keys.length && keys[j].t <= t; j++) i = j;
  const k = keys[i], n = keys[i + 1];
  if (!n || n.t <= k.t) return k.v;
  const p = k.ease(Math.min(1, Math.max(0, (t - k.t) / (n.t - k.t))));
  return k.v.map((v, m) => v + (n.v[m] - v) * p);
}

/** Props, as the state fields they set. */
function norm(p: Props): Partial<State> {
  const o: Partial<State> = {};
  if (p.x !== undefined) o.x = p.x;
  if (p.y !== undefined) o.y = p.y;
  if (p.s !== undefined) o.sx = o.sy = p.s;
  if (p.sx !== undefined) o.sx = p.sx;
  if (p.sy !== undefined) o.sy = p.sy;
  if (p.r !== undefined) o.r = p.r;
  if (p.o !== undefined) o.o = p.o;
  const clip = clipOf(p.clip);
  if (clip) o.clip = clip;
  if (p.bg !== undefined) o.bg = p.bg;
  if (p.color !== undefined) o.color = p.color;
  if (p.fill !== undefined) o.fill = p.fill;
  if (p.stroke !== undefined) o.stroke = p.stroke;
  if (p.dash !== undefined) o.dash = p.dash;
  if (p.w !== undefined) o.w = `${p.w}px`;
  if (p.h !== undefined) o.h = `${p.h}px`;
  return o;
}

function value(ch: Channel, s: State): string | number {
  switch (ch) {
    case 'translate': return `${s.x}px ${s.y}px`;
    case 'scale': return `${s.sx} ${s.sy}`;
    case 'rotate': return `${s.r}deg`;
    case 'opacity': return s.o;
    case 'clipPath': return s.clip;
    case 'backgroundColor': return s.bg;
    case 'color': return s.color;
    case 'fill': return s.fill;
    case 'stroke': return s.stroke;
    case 'strokeDashoffset': return s.dash;
    case 'width': return s.w;
    case 'height': return s.h;
  }
}

type Track = { el: Element; init: Partial<State>; segs: Seg[] };

export class Timeline {
  /** total length, in beats */
  readonly T: number;
  private tracks = new Map<Element, Track>();
  private calls: ((t: number) => void)[] = [];
  /** each animation with the stretches (beats) where its value changes */
  private anims: { a: Animation; moves: [number, number][] }[] = [];
  /** position, scale, rotation and opacity, written as inline styles */
  private direct: Direct[] = [];
  private last: number | null = null;

  constructor(T: number) {
    this.T = Math.max(0.001, T);
  }

  private track(el: Element | null | undefined): Track | null {
    if (!el) return null;
    let tr = this.tracks.get(el);
    if (!tr) {
      tr = { el, init: {}, segs: [] };
      this.tracks.set(el, tr);
    }
    return tr;
  }

  /** How the element starts (before anything moves it). */
  from(el: Element | null | undefined, p: Props) {
    const tr = this.track(el);
    if (tr) Object.assign(tr.init, norm(p));
    return this;
  }

  /** A move to `p`, from `at` for `dur` beats. */
  to(el: Element | null | undefined, p: Props, at: number, dur: number, ease: string = E.out) {
    const tr = this.track(el);
    if (tr) tr.segs.push({ t0: at, t1: at + Math.max(0, dur), to: norm(p), ease });
    return this;
  }

  /** A jump to `p` at `at`. */
  set(el: Element | null | undefined, p: Props, at: number) {
    return this.to(el, p, at, 0, E.lin);
  }

  /** The same move for several elements, `stagger` beats apart. */
  each(els: (Element | null | undefined)[], p: Props | ((i: number) => Props), at: number, dur: number, stagger: number, ease: string = E.out) {
    els.forEach((el, i) => this.to(el, typeof p === 'function' ? p(i) : p, at + i * stagger, dur, ease));
    return this;
  }

  /** Something else to do as the time changes (a counter, a film). */
  on(fn: (t: number) => void) {
    this.calls.push(fn);
    return this;
  }

  /**
   * Type a one-line element's text out, letter by letter, from `at` over
   * `dur`: its clip opens to each letter's right edge in turn. A caret, if
   * given, rides the edge while typing and blinks there after. Measured, so
   * call after the fonts are in.
   */
  type(el: HTMLElement | null | undefined, at: number, dur: number, caret?: HTMLElement | null) {
    if (!el) return this;
    const W = el.offsetWidth;
    if (!W) return this;
    // every letter of every text node in it (a line of code has its colours in spans)
    const nodes: Text[] = [];
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n = walk.nextNode(); n; n = walk.nextNode()) nodes.push(n as Text);
    const box = el.getBoundingClientRect();
    // the page may draw the scene zoomed: measure in the element's own px
    const zoom = box.width / W || 1;
    const range = document.createRange();
    const edges: number[] = [];
    for (const node of nodes) {
      const len = node.textContent?.length ?? 0;
      for (let i = 1; i <= len; i++) {
        if (node.textContent![i - 1] === ' ' && i < len) continue;   // a space shows with the next letter
        range.setStart(node, i - 1);
        range.setEnd(node, i);
        const r = range.getBoundingClientRect();
        edges.push(Math.min(W, Math.max(0, (r.right - box.left) / zoom)));
      }
    }
    if (!edges.length) return this;
    const tr = this.track(el)!;
    tr.init.clip = `inset(0% 100% 0% 0%)`;
    const n = edges.length;
    edges.forEach((e, i) => {
      const t = at + (dur * (i + 1)) / n;
      // each letter appears at once (a jump), as on a screen
      tr.segs.push({ t0: t, t1: t, to: { clip: `inset(0% ${(((W - e) / W) * 100).toFixed(3)}% 0% 0%)` }, ease: E.lin });
    });
    tr.segs.push({ t0: at + dur, t1: at + dur, to: { clip: 'inset(0% 0% 0% 0%)' }, ease: E.lin });
    if (caret) {
      const ct = this.track(caret)!;
      ct.init.x = 0;
      edges.forEach((e, i) => {
        const t = at + (dur * (i + 1)) / n;
        ct.segs.push({ t0: t, t1: t, to: { x: e }, ease: E.lin });
      });
    }
    return this;
  }

  /** Compile into paused animations (once), then seek to `t`. */
  build(t = 0) {
    const T = this.T;
    for (const tr of Array.from(this.tracks.values())) {
      const segs = tr.segs.slice().sort((a, b) => a.t0 - b.t0 || a.t1 - b.t1);
      const cs = getComputedStyle(tr.el);
      const base: State = {
        x: 0, y: 0, sx: 1, sy: 1, r: 0, o: 1,
        clip: 'inset(0% 0% 0% 0%)',
        bg: cs.backgroundColor, color: cs.color, fill: cs.fill, stroke: cs.stroke,
        dash: 0, w: cs.width, h: cs.height,
        ...tr.init,
      };
      // the channels this element uses
      const used = new Set<Channel>();
      const fields = new Set<keyof State>([...Object.keys(tr.init), ...segs.flatMap((s) => Object.keys(s.to))] as (keyof State)[]);
      (Object.keys(CHANNELS) as Channel[]).forEach((ch) => {
        if (CHANNELS[ch].some((f) => fields.has(f))) used.add(ch);
      });
      for (const ch of Array.from(used)) {
        const mine = segs.filter((s) => CHANNELS[ch].some((f) => f in s.to));
        const d = DIRECT[ch];
        if (d) {
          const cur: State = { ...base };
          const lin = easing('linear');
          const keys: Key[] = [{ t: 0, v: d.nums(cur), ease: lin }];
          const moves: [number, number][] = [];
          let last = 0;
          for (const s of mine) {
            const t0 = Math.min(T, Math.max(last, s.t0));
            const t1 = Math.min(T, Math.max(t0, s.t1));
            keys.push({ t: t0, v: d.nums(cur), ease: easing(s.ease) });
            Object.assign(cur, s.to);
            keys.push({ t: t1, v: d.nums(cur), ease: lin });
            moves.push([t0, t1]);
            last = t1;
          }
          this.direct.push({ el: tr.el as unknown as ElementCSSInlineStyle, prop: ch, css: d.css, keys, moves, was: '' });
          continue;
        }
        const cur: State = { ...base };
        const frames: Keyframe[] = [{ offset: 0, [ch]: value(ch, cur), easing: 'linear' }];
        const moves: [number, number][] = [];
        let last = 0;
        for (const s of mine) {
          const t0 = Math.min(T, Math.max(last, s.t0));
          const t1 = Math.min(T, Math.max(t0, s.t1));
          // hold till the move starts, then move with its own easing
          frames.push({ offset: t0 / T, [ch]: value(ch, cur), easing: s.ease });
          Object.assign(cur, s.to);
          frames.push({ offset: t1 / T, [ch]: value(ch, cur), easing: 'linear' });
          moves.push([t0, t1]);
          last = t1;
        }
        frames.push({ offset: 1, [ch]: value(ch, cur) });
        try {
          const a = tr.el.animate(frames, { duration: T * 1000, fill: 'both', easing: 'linear' });
          a.pause();
          this.anims.push({ a, moves });
        } catch (err) {
          console.warn('[scene] could not animate', ch, err);
        }
      }
    }
    this.seek(t);
    return this;
  }

  seek(t: number) {
    const tc = Math.min(this.T, Math.max(0, t));
    const ms = tc * 1000;
    // only what changes between the last time and this one: most things hold still most of the time
    const prev = this.last;
    const lo = prev === null ? -Infinity : Math.min(prev, tc), hi = prev === null ? Infinity : Math.max(prev, tc);
    for (const { a, moves } of this.anims) {
      if (prev !== null && !moves.some(([m0, m1]) => m0 <= hi && m1 >= lo)) continue;
      a.currentTime = ms;
    }
    for (const d of this.direct) {
      if (prev !== null && !d.moves.some(([m0, m1]) => m0 <= hi && m1 >= lo)) continue;
      const css = d.css(valueAt(d.keys, tc).map(round));
      if (css === d.was) continue;
      d.was = css;
      d.el.style.setProperty(d.prop, css);
    }
    this.last = tc;
    for (const fn of this.calls) fn(t);
  }

  dispose() {
    for (const { a } of this.anims) a.cancel();
    this.anims = [];
    this.direct = [];
    this.calls = [];
    this.tracks.clear();
  }
}
