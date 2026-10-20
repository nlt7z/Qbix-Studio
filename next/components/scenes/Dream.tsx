'use client';

import '@/app/scenes-dream.css';
import { useEffect, useRef } from 'react';
import Scene from '@/components/scene/Scene';
import { A, T, Lock } from '@/components/scene/kit';
import { E } from '@/lib/scene/timeline';

/**
 * About: imagination, then reality.
 * 1 · ideas, said one by one as chat bubbles (each grows out of its tail's
 *     corner), one still being typed, and the lime one: a thought ("what
 *     if…?"), its trail of circles first;
 * 2 · the window rises with the real thing in it, and the other ideas are
 *     pulled down into it, behind its edge; the thought's trail goes in, and it
 *     travels to the window's top-left corner and pins there, its corner
 *     sharpening to a point, like a comment on the thing it became. Pinned,
 *     the thing comes alive: AI Bidding's own film plays (for AI teams), or the
 *     lamp in the practice's calm room is turned on (for business).
 * The ideas float inside the window's span, so each falls straight down into
 * it, and the lime one's way to the corner is clear by the time it goes.
 */
type Side = 'l' | 'r';
/**
 * An idea: its words ('' while it's still being typed), the side its tail is
 * on, where it floats (x: its left edge for a tail on the left, its right edge
 * for one on the right; y: its top), and how far it's pulled down.
 */
type Idea = { s: string; side: Side; x: number; y: number; fall: number };
type Copy = { lime: [string, string]; at: { x: number; y: number }; ideas: Idea[] };

// the window, in state 2: its body (646 × 353, under a 36px bar) is the film's shape, 960 × 524
const WIN = { x: 36, y: 132, w: 648, h: 391 };
// the lime bubble's point, on the window's corner (just inside its rounding), and its size there
const PIN = 4;
const PINNED = 0.8;

const AI: Copy = {
  lime: ['what if poker had', 'an AI that bluffs?'],
  at: { x: 196, y: 186 },
  ideas: [
    { s: 'a voice you can edit', side: 'l', x: 56, y: 50, fall: 150 },
    { s: 'moodboard in, system out', side: 'r', x: 664, y: 114, fall: 112 },
    { s: '', side: 'r', x: 636, y: 214, fall: 64 },
    { s: 'hints during an interview', side: 'r', x: 640, y: 326, fall: 56 },
    { s: 'flyers in 48 hours', side: 'l', x: 88, y: 390, fall: 44 },
    { s: 'a calmer clinic site', side: 'r', x: 600, y: 456, fall: 14 },
  ],
};

const BIZ: Copy = {
  lime: ['a site as calm', 'as my office?'],
  at: { x: 196, y: 186 },
  ideas: [
    { s: 'flyers ready in 48 hours', side: 'l', x: 56, y: 50, fall: 150 },
    { s: 'my listing, on Instagram', side: 'r', x: 664, y: 114, fall: 112 },
    { s: '', side: 'r', x: 636, y: 214, fall: 64 },
    { s: 'a site that books for me', side: 'r', x: 640, y: 326, fall: 56 },
    { s: 'a menu that talks back', side: 'l', x: 88, y: 390, fall: 44 },
    { s: 'a calmer waiting room', side: 'r', x: 600, y: 456, fall: 14 },
  ],
};

/** A bubble's outline, its tail and all: a rounded box, an iMessage-like hook at one bottom corner. */
function bubblePath(w: number, h: number, side: Side) {
  const R = Math.min(18, h / 2);
  const L = side === 'l';
  const f = (n: number) => Math.round(n * 100) / 100;
  const p = (x: number, y: number) => `${f(L ? x : w - x)} ${f(y)}`;
  const sw = L ? 1 : 0;   // mirrored, the outline runs the other way round
  return [
    `M ${p(R, 0)}`,
    `H ${f(L ? w - R : R)}`,
    `A ${R} ${R} 0 0 ${sw} ${p(w, R)}`,
    `V ${f(h - R)}`,
    `A ${R} ${R} 0 0 ${sw} ${p(w - R, h)}`,
    `H ${f(L ? 16 : w - 16)}`,
    // the underside rises into a small notch, then drops out to the tip
    `C ${p(11, h)} ${p(7.6, h - 2.1)} ${p(5.4, h - 3.1)}`,
    `C ${p(3.6, h - 1.4)} ${p(-1, h + 0.1)} ${p(-5.6, h)}`,
    // the hook's outer edge, back up the side
    `C ${p(-2.2, h - 2.2)} ${p(0, h - 6.2)} ${p(0, h - 12)}`,
    `V ${f(R)}`,
    `A ${R} ${R} 0 0 ${sw} ${p(R, 0)}`,
    'Z',
  ].join(' ');
}

function Bubble({ k, idea }: { k: string; idea: Idea }) {
  const pos = idea.side === 'l' ? { left: idea.x } : { left: 'auto', right: 720 - idea.x };
  return (
    <div data-k={k} className={`a dream-bub dream-bub--${idea.side}`} style={{ top: idea.y, ...pos }}>
      <svg className="dream-bub-svg" aria-hidden>
        <path />
      </svg>
      {idea.s ? (
        <span className="dream-bub-txt">{idea.s}</span>
      ) : (
        <span className="dream-dots" aria-hidden>
          <i />
          <i />
          <i />
        </span>
      )}
    </div>
  );
}

/**
 * The calm room in the practice's picture, flat: a floor, a rug, a landscape on the wall, a floor
 * lamp, an armchair (its parts parted by gaps of the wall's colour), a plant. The lamp's light is
 * its own layer (it's turned on when the idea is pinned).
 */
function Room() {
  const ink = '#121417';
  return (
    <svg width="268" height="262" viewBox="0 0 268 262" aria-hidden>
      <rect x="0" y="206" width="268" height="56" fill={ink} fillOpacity="0.045" />
      <rect x="0" y="206" width="268" height="1" fill={ink} fillOpacity="0.12" />
      <ellipse cx="128" cy="229" rx="94" ry="8" fill={ink} fillOpacity="0.07" />
      <rect x="97" y="44" width="66" height="50" fill="#fff" stroke={ink} strokeWidth="2" />
      <path d="M100 87 L115 74 L125 81 L139 67 L160 86 L160 91 L100 91 Z" fill={ink} fillOpacity="0.16" />
      <path d="M213 60 L235 60 L242 86 L206 86 Z" fill={ink} />
      <rect x="223" y="86" width="2" height="124" fill={ink} />
      <rect x="213" y="208" width="22" height="4" rx="1" fill={ink} />
      <g style={{ stroke: 'var(--sunk)', strokeWidth: 2.5 }}>
        <path d="M84 122 Q84 104 102 104 L158 104 Q176 104 176 122 L176 176 L84 176 Z" fill={ink} stroke="none" />
        <rect x="86" y="166" width="88" height="30" rx="9" fill={ink} />
        <rect x="66" y="144" width="28" height="58" rx="13" fill={ink} />
        <rect x="166" y="144" width="28" height="58" rx="13" fill={ink} />
      </g>
      <rect x="72" y="200" width="116" height="7" rx="2" fill={ink} />
      <path d="M80 206 L86 206 L84 217 L81 217 Z" fill={ink} />
      <path d="M174 206 L180 206 L179 217 L176 217 Z" fill={ink} />
      <path d="M36 152 C 30 126 32 102 38 80 C 44 102 46 126 42 152 Z" fill={ink} />
      <path d="M43 154 C 46 130 52 114 62 100 C 62 122 56 140 49 156 Z" fill={ink} fillOpacity="0.8" />
      <path d="M33 154 C 26 136 20 124 12 114 C 18 134 22 146 28 158 Z" fill={ink} fillOpacity="0.8" />
      <path d="M24 156 L56 156 L52 208 L28 208 Z" fill={ink} />
    </svg>
  );
}

export default function Dream({ biz = false }: { biz?: boolean }) {
  const C = biz ? BIZ : AI;
  const film = useRef<HTMLVideoElement | null>(null);
  // the film plays only while state 2 is showing and the scene is on screen
  const play = useRef({ t: 0, seen: false, started: false, sync: () => {} });

  useEffect(() => {
    const v = film.current;
    if (!v) return;
    v.muted = true;
    const p = play.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    p.sync = () => {
      const want = p.t >= 1.8 && p.seen && !document.hidden && !reduced.matches;
      if (want && v.paused) {
        // from the frame the poster shows
        if (!p.started) {
          p.started = true;
          try {
            v.currentTime = 1;
          } catch {}
        }
        v.play().catch(() => {});
      } else if (!want && !v.paused) v.pause();
    };
    const io = new IntersectionObserver(([e]) => {
      p.seen = e.isIntersecting;
      p.sync();
    }, { threshold: 0.25 });
    io.observe(v);
    const onVis = () => p.sync();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      v.pause();
    };
  }, []);

  return (
    <Scene
      n={2}
      w={720}
      h={560}
      label={
        biz
          ? 'Ideas as chat bubbles, one of them lime: a site as calm as my office? Then a window rises, the other ideas are pulled down into it, and the lime one pins to its corner over the calm counseling homepage it became'
          : 'Ideas as chat bubbles, one of them lime: what if poker had an AI that bluffs? Then a window rises, the other ideas are pulled down into it, and the lime one pins to its corner over the film of AI Bidding, the game it became'
      }
      build={(q, tl) => {
        /* the bubbles' outlines, sized to their words */
        const ideas = q.all('idea.');
        ideas.forEach((el, i) => {
          const w = el.offsetWidth, h = el.offsetHeight;
          const svg = el.querySelector('svg');
          svg?.setAttribute('width', String(w));
          svg?.setAttribute('height', String(h));
          svg?.querySelector('path')?.setAttribute('d', bubblePath(w, h, C.ideas[i].side));
        });
        const lime = q('lime');
        const body = q('lime.body');
        const lh = body?.offsetHeight ?? 84;

        /* 0 → 1: the ideas, one by one from the top (as each comes up the screen), each out of its
           tail's corner; the lime one last, its trail first */
        const ARRIVE = [0.18, 0.28, 0.4, 0.52, 0.62, 0.72];
        ideas.forEach((el, i) => {
          tl.from(el, { s: 0 }).to(el, { s: 1 }, ARRIVE[i], 0.16, E.out);
        });
        tl.from(q('lime.c1'), { s: 0 }).to(q('lime.c1'), { s: 1 }, 0.79, 0.06, E.out);
        tl.from(q('lime.c0'), { s: 0 }).to(q('lime.c0'), { s: 1 }, 0.83, 0.06, E.out);
        tl.from(body, { s: 0 }).to(body, { s: 1 }, 0.86, 0.12, E.out);

        /* 1 → 2: the window rises, the real thing in it; the ideas are pulled down into it */
        const win = q('win');
        tl.from(win, { y: WIN.h, clip: `inset(0px 0px ${WIN.h}px 0px round 12px)` })
          .to(win, { y: 0, clip: 'inset(0px 0px 0px 0px round 12px)' }, 1.06, 0.36, E.move);
        // the lowest first (the window's edge reaches them first), drawn in a little toward its middle as they go
        ideas.forEach((el, i) => {
          const at = 1.04 + (ideas.length - 1 - i) * 0.035;
          const cx = el.offsetLeft + el.offsetWidth / 2;
          tl.to(el, { y: C.ideas[i].fall, x: Math.round((WIN.x + WIN.w / 2 - cx) * 0.1), s: 0.9 }, at, 0.24, E.in);
          tl.set(el, { o: 0 }, 1.5);
        });
        // the thought's trail goes in as the window's edge passes under it; then it travels to the window's corner, where it pins
        tl.to(q('lime.c1'), { s: 0 }, 1.2, 0.04, E.in).to(q('lime.c0'), { s: 0 }, 1.22, 0.04, E.in);
        tl.to(lime, { x: WIN.x + PIN - C.at.x, y: WIN.y + PIN - lh - C.at.y }, 1.46, 0.28, E.move);
        tl.to(body, { s: PINNED }, 1.46, 0.28, E.move);
        tl.from(q('lime.corner'), { s: 0 }).to(q('lime.corner'), { s: 1 }, 1.73, 0.05, E.out);

        /* pinned: the thing it became comes alive (the film plays; the lamp in the room is turned on) */
        if (!biz) {
          tl.on((t) => {
            play.current.t = t;
            play.current.sync();
          });
        } else {
          tl.from(q('pg.light'), { clip: [0, 0, 100, 0] }).to(q('pg.light'), { clip: [0, 0, 0, 0] }, 1.8, 0.12, E.out);
        }
      }}
    >
      {/* --- the ideas (under the window: they're pulled down into it) --- */}
      {C.ideas.map((idea, i) => (
        <Bubble key={i} k={`idea.${i}`} idea={idea} />
      ))}

      {/* --- the window, and what's in it --- */}
      <A k="win" x={WIN.x} y={WIN.y} w={WIN.w} h={WIN.h} r={12} c="win dream-win">
        <div className="win-bar">
          <span className="win-dots" aria-hidden>
            <i />
            <i />
            <i />
          </span>
          {biz ? (
            <span className="win-url dream-url">
              <Lock />
              <span className="win-addr">willowcounseling.com</span>
            </span>
          ) : (
            <span className="dream-title">AI Bidding</span>
          )}
        </div>
        {biz ? (
          <div className="win-body">
            <T x={26} y={19} c="dream-logo">
              Willow Counseling
            </T>
            <A y={21} c="dream-nav" style={{ left: 'auto', right: 26 }}>
              <span>Home</span>
              <span>About</span>
              <span>Specialties</span>
              <span>Fees</span>
              <span>Contact</span>
            </A>
            <T x={26} y={72} c="dream-eye">
              Dana Reyes, LMFT
            </T>
            <T x={26} y={94} c="dream-serif dream-h1">
              A calm place
            </T>
            <T x={26} y={138} c="dream-serif dream-h1">
              to begin.
            </T>
            <T x={26} y={198} c="dream-sub">
              Individual and couples therapy,
            </T>
            <T x={26} y={218} c="dream-sub">
              in Portland and online.
            </T>
            <A x={26} y={256} c="pill pill--ink dream-book">
              Book a free consultation
            </A>
            <A x={352} y={66} w={268} h={262} r={10} c="sunk dream-room">
              {/* the lamp's light (turned on when the idea is pinned), under the room */}
              <A k="pg.light" x={197} y={86} w={54} h={84}>
                <svg width="54" height="84" viewBox="0 0 54 84" aria-hidden>
                  <path d="M11 0 L43 0 L54 84 L0 84 Z" fill="#fff" fillOpacity="0.8" />
                </svg>
              </A>
              <Room />
            </A>
          </div>
        ) : (
          <div className="win-body dream-film-body">
            <video ref={film} className="dream-film" src="/bidking-present.mp4" poster="/scenes/dream-bid.jpg" muted loop playsInline preload="metadata" />
          </div>
        )}
      </A>

      {/* --- the lime one: a thought, then a comment pinned to the window's corner --- */}
      <div data-k="lime" className="a dream-lime" style={{ left: C.at.x, top: C.at.y }}>
        <span data-k="lime.c1" className="dream-trail" style={{ left: -30, top: 'calc(100% + 26px)', width: 10, height: 10 }} />
        <span data-k="lime.c0" className="dream-trail" style={{ left: -16, top: 'calc(100% + 4px)', width: 18, height: 18 }} />
        <span data-k="lime.body" className="dream-lime-body">
          <span className="dream-lime-txt">
            {C.lime[0]}
            <br />
            {C.lime[1]}
          </span>
          <i data-k="lime.corner" className="dream-corner" />
        </span>
      </div>
    </Scene>
  );
}
