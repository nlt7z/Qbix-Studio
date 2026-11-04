'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotionSafe } from '@/components/useReducedMotionSafe';
import '@/app/strata-run.css';

/**
 * One Strata run on ridge.jpg (the image the How it works scene reads), as a player (Qbix Motion's
 * Step player). Five steps are five marks on a rail: the current one is a bar that fills while its
 * step runs, the rest are 14px blocks. Every mark has a left and a right edge, each its own spring
 * (k 300, c 30); changing step changes two slots and every edge eases to its new place, so the bar
 * slides on and the blocks between make way. The blocks the bar crossed hop one after another, and
 * the one it lands on answers last. Each mark is also a button that jumps to its step.
 *
 * It plays by itself the first time it's half in view; Play pauses and replays it. With reduced
 * motion it waits for Play, and the edges jump.
 */

type Step = { k: string; run: (p: number) => string; res: string };
const STEPS: Step[] = [
  { k: 'Read', run: (p) => `Reading ridge.jpg, ${Math.round(p * 100)}%`, res: '1488 × 2096' },
  { k: 'Color', run: (p) => `Pinning colors, ${Math.round(p * 4)} of 4`, res: '4 colors' },
  { k: 'Type', run: (p) => `Measuring type, ${Math.round(p * 2)} of 2 styles`, res: 'Eurostile, Geist' },
  { k: 'Components', run: (p) => `Drafting components, ${Math.round(p * 12)} of 12`, res: '12 components' },
  { k: 'Code', run: (p) => `Writing code, ${Math.round(p * 3)} of 3 exports`, res: 'CSS, Tailwind, React' },
];
const N = STEPS.length, DOT = 14, GAP = 8, STEP_MS = 1500, K = 300, C = 30;

type Spring = { x: number; v: number; t: number };
type Mark = { L: Spring; R: Spring; y: Spring; kick: number; kickV: number };
const sp = (x: number): Spring => ({ x, v: 0, t: x });

function Icon({ name }: { name: 'play' | 'pause' | 'replay' | 'check' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden>
      {name === 'play' && <path d="M6 3 20 12 6 21z" fill="currentColor" />}
      {name === 'pause' && (
        <>
          <rect x="6" y="4" width="4" height="16" fill="currentColor" stroke="none" />
          <rect x="14" y="4" width="4" height="16" fill="currentColor" stroke="none" />
        </>
      )}
      {name === 'replay' && (
        <>
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </>
      )}
      {name === 'check' && <path d="M20 6 9 17l-5-5" />}
    </svg>
  );
}

export default function StrataRun() {
  const root = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const marks = useRef<(HTMLButtonElement | null)[]>([]);
  const fills = useRef<(HTMLElement | null)[]>([]);
  const live = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotionSafe();
  const still = useRef(false);
  still.current = reduced;
  // what the words show; the run itself, frame by frame, is in `run`
  const [view, setView] = useState({ cur: 0, playing: false, finished: false });
  const run = useRef({
    cur: 0, prog: 0, playing: false, finished: false, first: true, played: false,
    marks: STEPS.map((): Mark => ({ L: sp(0), R: sp(DOT), y: sp(0), kick: -1, kickV: 0 })),
  });

  const show = useCallback(() => {
    const r = run.current;
    setView({ cur: r.cur, playing: r.playing, finished: r.finished });
  }, []);
  // the wake: the blocks the bar crossed stand up one after another, and the one it lands on answers last
  const wake = (from: number, to: number) => {
    const m = run.current.marks;
    for (let i = from; i < to; i++) { m[i].kick = (i - from) * 70 + 40; m[i].kickV = -150; }
    m[to].kick = (to - from) * 70 + 90;
    m[to].kickV = -210;
  };
  const go = (to: number) => {
    const r = run.current, from = r.cur;
    r.cur = to;
    r.prog = 0;
    if (to > from) wake(from, to);
  };
  const jump = (i: number) => {
    run.current.finished = false;
    go(i);
    show();
  };
  const press = () => {
    const r = run.current;
    r.played = true;
    if (r.finished) {
      r.finished = false;
      r.cur = 0;
      r.prog = 0;
      r.playing = true;
    } else r.playing = !r.playing;
    show();
  };

  useEffect(() => {
    const el = root.current, rl = rail.current;
    if (!el || !rl) return;
    const r = run.current;
    let raf = 0, prev = 0, seen = false;
    const ease = (s: Spring, dt: number) => {
      if (still.current) { s.x = s.t; s.v = 0; return; }
      s.v += (K * (s.t - s.x) - C * s.v) * dt;
      s.x += s.v * dt;
    };
    const frame = (now: number) => {
      const dt = Math.min(0.033, prev ? (now - prev) / 1000 : 0);
      prev = now;
      if (r.playing) {
        r.prog += (dt * 1000) / STEP_MS;
        if (r.prog >= 1) {
          if (r.cur < N - 1) go(r.cur + 1);
          else { r.prog = 1; r.playing = false; r.finished = true; wake(0, N - 1); }
          show();
        }
      }
      if (live.current) {
        live.current.textContent = r.finished ? 'All five steps done' : r.playing || r.prog > 0 ? STEPS[r.cur].run(r.prog) : 'Ready to run';
      }
      const BAR = Math.max(60, rl.clientWidth - (N - 1) * (DOT + GAP));
      let x = 0;
      r.marks.forEach((m, i) => {
        const w = !r.finished && i === r.cur ? BAR : DOT;
        m.L.t = x;
        m.R.t = x + w;
        x += w + GAP;
        if (r.first) { m.L.x = m.L.t; m.R.x = m.R.t; }
        ease(m.L, dt);
        ease(m.R, dt);
        if (m.kick >= 0) {
          m.kick -= dt * 1000;
          if (m.kick < 0) { if (!still.current) m.y.v = m.kickV; m.kick = -1; }
        }
        ease(m.y, dt);
        const b = marks.current[i], f = fills.current[i];
        if (b) {
          b.style.left = `${m.L.x.toFixed(2)}px`;
          b.style.width = `${Math.max(DOT * 0.6, m.R.x - m.L.x).toFixed(2)}px`;
          b.style.transform = `translateY(${m.y.x.toFixed(2)}px)`;
        }
        if (f) f.style.transform = `scaleX(${i === r.cur && !r.finished ? r.prog : 0})`;
      });
      r.first = false;
      raf = requestAnimationFrame(frame);
    };
    // runs only while it's on screen; plays by itself the first time it's half in view
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !raf) { prev = 0; raf = requestAnimationFrame(frame); }
        if (!e.isIntersecting && raf) { cancelAnimationFrame(raf); raf = 0; }
        if (e.intersectionRatio >= 0.5 && !seen) {
          seen = true;
          if (!still.current && !r.played) { r.played = true; r.playing = true; show(); }
        }
      },
      { threshold: [0, 0.5] },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [show]);

  const { cur, playing, finished } = view;
  return (
    <div ref={root} className="srun">
      <div className="srun-head">
        <div>
          <p className="srun-title">ridge.jpg</p>
          <p className="srun-meta">One image, five steps</p>
        </div>
        <button type="button" className="btn btn-primary srun-play" onClick={press}>
          <Icon name={finished ? 'replay' : playing ? 'pause' : 'play'} />
          {finished ? 'Replay' : playing ? 'Pause' : 'Play'}
        </button>
      </div>
      <div ref={rail} className="srun-rail">
        {STEPS.map((s, i) => (
          <button
            key={s.k}
            ref={(b) => { marks.current[i] = b; }}
            type="button"
            className={`srun-mark${finished || i < cur ? ' is-done' : ''}`}
            aria-label={`Step ${i + 1}: ${s.k}`}
            aria-current={!finished && i === cur ? 'step' : undefined}
            onClick={() => jump(i)}
          >
            <i ref={(f) => { fills.current[i] = f; }} />
          </button>
        ))}
      </div>
      <div className="srun-now">
        <p className="srun-big">{finished ? 'System ready' : STEPS[cur].k}</p>
        <p ref={live} className="srun-live" aria-live="off">Ready to run</p>
      </div>
      <ol className="srun-list">
        {STEPS.map((s, i) => {
          const done = finished || i < cur, on = !finished && i === cur;
          return (
            <li key={s.k} className={`srun-row${on ? ' is-on' : ''}${done ? ' is-done' : ''}`}>
              <span className="srun-ic">{done ? <Icon name="check" /> : <i className="srun-dot" />}</span>
              <span>{s.k}</span>
              <span className="srun-res">{done ? s.res : on && (playing || run.current.prog > 0) ? 'Running' : ''}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
