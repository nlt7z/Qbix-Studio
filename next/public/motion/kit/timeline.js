/* QBIX MOTION — the scene timeline, compiled from the site's lib/scene/timeline.ts (unchanged). window.QMTimeline = { Timeline, E } */
"use strict";
var QMTimeline = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var timeline_exports = {};
  __export(timeline_exports, {
    E: () => E,
    Timeline: () => Timeline
  });
  const E = {
    /** entrances: quick off the mark, a long settle (no overshoot) */
    out: "cubic-bezier(0.16, 1, 0.3, 1)",
    /** a move from one place to another */
    move: "cubic-bezier(0.65, 0, 0.35, 1)",
    /** a gentle move */
    soft: "cubic-bezier(0.45, 0, 0.25, 1)",
    /** exits */
    in: "cubic-bezier(0.5, 0, 0.75, 0)",
    lin: "linear"
  };
  const CHANNELS = {
    translate: ["x", "y"],
    scale: ["sx", "sy"],
    rotate: ["r"],
    opacity: ["o"],
    clipPath: ["clip"],
    backgroundColor: ["bg"],
    color: ["color"],
    fill: ["fill"],
    stroke: ["stroke"],
    strokeDashoffset: ["dash"],
    width: ["w"],
    height: ["h"]
  };
  const clipOf = (c) => typeof c === "string" ? c.replace(/\s+round\s+[^)]*/, "") : c ? `inset(${c[0]}% ${c[1]}% ${c[2]}% ${c[3]}%)` : void 0;
  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = (t) => ((ax * t + bx) * t + cx) * t;
    const sy = (t) => ((ay * t + by) * t + cy) * t;
    const dx = (t) => (3 * ax * t + 2 * bx) * t + cx;
    return (x) => {
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
  const eases = /* @__PURE__ */ new Map();
  function easing(css) {
    let f = eases.get(css);
    if (!f) {
      const m = /cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/.exec(css);
      f = m ? bezier(+m[1], +m[2], +m[3], +m[4]) : (x) => x;
      eases.set(css, f);
    }
    return f;
  }
  const DIRECT = {
    translate: { nums: (s) => [s.x, s.y], css: (v) => `${v[0]}px ${v[1]}px` },
    scale: { nums: (s) => [s.sx, s.sy], css: (v) => `${v[0]} ${v[1]}` },
    rotate: { nums: (s) => [s.r], css: (v) => `${v[0]}deg` },
    opacity: { nums: (s) => [s.o], css: (v) => `${v[0]}` }
  };
  const round = (x) => Math.round(x * 1e3) / 1e3;
  function valueAt(keys, t) {
    let i = 0;
    for (let j = 1; j < keys.length && keys[j].t <= t; j++) i = j;
    const k = keys[i], n = keys[i + 1];
    if (!n || n.t <= k.t) return k.v;
    const p = k.ease(Math.min(1, Math.max(0, (t - k.t) / (n.t - k.t))));
    return k.v.map((v, m) => v + (n.v[m] - v) * p);
  }
  function norm(p) {
    const o = {};
    if (p.x !== void 0) o.x = p.x;
    if (p.y !== void 0) o.y = p.y;
    if (p.s !== void 0) o.sx = o.sy = p.s;
    if (p.sx !== void 0) o.sx = p.sx;
    if (p.sy !== void 0) o.sy = p.sy;
    if (p.r !== void 0) o.r = p.r;
    if (p.o !== void 0) o.o = p.o;
    const clip = clipOf(p.clip);
    if (clip) o.clip = clip;
    if (p.bg !== void 0) o.bg = p.bg;
    if (p.color !== void 0) o.color = p.color;
    if (p.fill !== void 0) o.fill = p.fill;
    if (p.stroke !== void 0) o.stroke = p.stroke;
    if (p.dash !== void 0) o.dash = p.dash;
    if (p.w !== void 0) o.w = `${p.w}px`;
    if (p.h !== void 0) o.h = `${p.h}px`;
    return o;
  }
  function value(ch, s) {
    switch (ch) {
      case "translate":
        return `${s.x}px ${s.y}px`;
      case "scale":
        return `${s.sx} ${s.sy}`;
      case "rotate":
        return `${s.r}deg`;
      case "opacity":
        return s.o;
      case "clipPath":
        return s.clip;
      case "backgroundColor":
        return s.bg;
      case "color":
        return s.color;
      case "fill":
        return s.fill;
      case "stroke":
        return s.stroke;
      case "strokeDashoffset":
        return s.dash;
      case "width":
        return s.w;
      case "height":
        return s.h;
    }
  }
  class Timeline {
    /** total length, in beats */
    T;
    tracks = /* @__PURE__ */ new Map();
    calls = [];
    /** each animation with the stretches (beats) where its value changes */
    anims = [];
    /** position, scale, rotation and opacity, written as inline styles */
    direct = [];
    last = null;
    constructor(T) {
      this.T = Math.max(1e-3, T);
    }
    track(el) {
      if (!el) return null;
      let tr = this.tracks.get(el);
      if (!tr) {
        tr = { el, init: {}, segs: [] };
        this.tracks.set(el, tr);
      }
      return tr;
    }
    /** How the element starts (before anything moves it). */
    from(el, p) {
      const tr = this.track(el);
      if (tr) Object.assign(tr.init, norm(p));
      return this;
    }
    /** A move to `p`, from `at` for `dur` beats. */
    to(el, p, at, dur, ease = E.out) {
      const tr = this.track(el);
      if (tr) tr.segs.push({ t0: at, t1: at + Math.max(0, dur), to: norm(p), ease });
      return this;
    }
    /** A jump to `p` at `at`. */
    set(el, p, at) {
      return this.to(el, p, at, 0, E.lin);
    }
    /** The same move for several elements, `stagger` beats apart. */
    each(els, p, at, dur, stagger, ease = E.out) {
      els.forEach((el, i) => this.to(el, typeof p === "function" ? p(i) : p, at + i * stagger, dur, ease));
      return this;
    }
    /** Something else to do as the time changes (a counter, a film). */
    on(fn) {
      this.calls.push(fn);
      return this;
    }
    /**
     * Type a one-line element's text out, letter by letter, from `at` over
     * `dur`: its clip opens to each letter's right edge in turn. A caret, if
     * given, rides the edge while typing and blinks there after. Measured, so
     * call after the fonts are in.
     */
    type(el, at, dur, caret) {
      if (!el) return this;
      const W = el.offsetWidth;
      if (!W) return this;
      const nodes = [];
      const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let n2 = walk.nextNode(); n2; n2 = walk.nextNode()) nodes.push(n2);
      const box = el.getBoundingClientRect();
      const zoom = box.width / W || 1;
      const range = document.createRange();
      const edges = [];
      for (const node of nodes) {
        const len = node.textContent?.length ?? 0;
        for (let i = 1; i <= len; i++) {
          if (node.textContent[i - 1] === " " && i < len) continue;
          range.setStart(node, i - 1);
          range.setEnd(node, i);
          const r = range.getBoundingClientRect();
          edges.push(Math.min(W, Math.max(0, (r.right - box.left) / zoom)));
        }
      }
      if (!edges.length) return this;
      const tr = this.track(el);
      tr.init.clip = `inset(0% 100% 0% 0%)`;
      const n = edges.length;
      edges.forEach((e, i) => {
        const t = at + dur * (i + 1) / n;
        tr.segs.push({ t0: t, t1: t, to: { clip: `inset(0% ${((W - e) / W * 100).toFixed(3)}% 0% 0%)` }, ease: E.lin });
      });
      tr.segs.push({ t0: at + dur, t1: at + dur, to: { clip: "inset(0% 0% 0% 0%)" }, ease: E.lin });
      if (caret) {
        const ct = this.track(caret);
        ct.init.x = 0;
        edges.forEach((e, i) => {
          const t = at + dur * (i + 1) / n;
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
        const base = {
          x: 0,
          y: 0,
          sx: 1,
          sy: 1,
          r: 0,
          o: 1,
          clip: "inset(0% 0% 0% 0%)",
          bg: cs.backgroundColor,
          color: cs.color,
          fill: cs.fill,
          stroke: cs.stroke,
          dash: 0,
          w: cs.width,
          h: cs.height,
          ...tr.init
        };
        const used = /* @__PURE__ */ new Set();
        const fields = /* @__PURE__ */ new Set([...Object.keys(tr.init), ...segs.flatMap((s) => Object.keys(s.to))]);
        Object.keys(CHANNELS).forEach((ch) => {
          if (CHANNELS[ch].some((f) => fields.has(f))) used.add(ch);
        });
        for (const ch of Array.from(used)) {
          const mine = segs.filter((s) => CHANNELS[ch].some((f) => f in s.to));
          const d = DIRECT[ch];
          if (d) {
            const cur2 = { ...base };
            const lin = easing("linear");
            const keys = [{ t: 0, v: d.nums(cur2), ease: lin }];
            const moves2 = [];
            let last2 = 0;
            for (const s of mine) {
              const t0 = Math.min(T, Math.max(last2, s.t0));
              const t1 = Math.min(T, Math.max(t0, s.t1));
              keys.push({ t: t0, v: d.nums(cur2), ease: easing(s.ease) });
              Object.assign(cur2, s.to);
              keys.push({ t: t1, v: d.nums(cur2), ease: lin });
              moves2.push([t0, t1]);
              last2 = t1;
            }
            this.direct.push({ el: tr.el, prop: ch, css: d.css, keys, moves: moves2, was: "" });
            continue;
          }
          const cur = { ...base };
          const frames = [{ offset: 0, [ch]: value(ch, cur), easing: "linear" }];
          const moves = [];
          let last = 0;
          for (const s of mine) {
            const t0 = Math.min(T, Math.max(last, s.t0));
            const t1 = Math.min(T, Math.max(t0, s.t1));
            frames.push({ offset: t0 / T, [ch]: value(ch, cur), easing: s.ease });
            Object.assign(cur, s.to);
            frames.push({ offset: t1 / T, [ch]: value(ch, cur), easing: "linear" });
            moves.push([t0, t1]);
            last = t1;
          }
          frames.push({ offset: 1, [ch]: value(ch, cur) });
          try {
            const a = tr.el.animate(frames, { duration: T * 1e3, fill: "both", easing: "linear" });
            a.pause();
            this.anims.push({ a, moves });
          } catch (err) {
            console.warn("[scene] could not animate", ch, err);
          }
        }
      }
      this.seek(t);
      return this;
    }
    seek(t) {
      const tc = Math.min(this.T, Math.max(0, t));
      const ms = tc * 1e3;
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
  return __toCommonJS(timeline_exports);
})();
