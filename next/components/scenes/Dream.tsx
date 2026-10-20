'use client';

import '@/app/scenes-dream.css';
import Scene from '@/components/scene/Scene';
import { A, T, Lock } from '@/components/scene/kit';
import { BidTable } from '@/components/scenes/BidKing';
import { E } from '@/lib/scene/timeline';

/**
 * About: imagination, then reality.
 * 1 · ideas, said one by one as square chat bubbles of frosted glass (each
 *     grows out of its tail's point), a little stacked, so each new one
 *     frosts the corner of the one before; one is still being typed; the lime
 *     one is a thought ("what if…?"), its trail of squares first;
 * 2 · the window rises with the real thing in it and the other ideas are
 *     pulled down into it, frosted as they pass behind its glass bar; the
 *     thought's trail goes in, and it travels up out of the window and then
 *     tucks its edge under the bar's corner: pinned, the lime glowing through
 *     the glass. The thing it became: Bid King's table, drawn (for AI teams),
 *     or the practice's calm homepage, whose lamp is turned on once it's
 *     pinned (for business).
 * The ideas float inside the window's span, so each falls straight into it;
 * the lime one moves only once they are gone, so nothing crosses its way.
 */

type Side = 'l' | 'r';
/**
 * An idea: its words ('' while it's still being typed), the side its tail is
 * on, where it floats (x: its left edge for a tail on the left, its right edge
 * for one on the right; y: its top), and how far it's pulled down.
 */
type Idea = { s: string; side: Side; x: number; y: number; fall: number };
type Copy = { lime: [string, string]; at: { x: number; y: number }; ideas: Idea[] };

// the window, in state 2: its body is 646 × 353, under a 36px glass bar
const WIN = { x: 36, y: 132, w: 648, h: 391 };
// the lime one, pinned: at PINNED of its size, sticking out TUCK_X left of the window, its edge TUCK_Y under the bar
const PINNED = 0.8;
const TUCK_X = 16;
const TUCK_Y = 12;
// a bubble's tail: a right-angled point under its corner
const TAIL = 12;

// each new idea lands on the corner of the one before it, and the reply being typed on the lime
// one's (the glass frosts what's under it); the top left is left open for where the lime one pins.
// x: the left edge for a tail on the left, the right edge for one on the right
const AI: Copy = {
  lime: ['what if poker had', 'an AI that bluffs?'],
  at: { x: 196, y: 186 },
  ideas: [
    { s: 'a voice you can edit', side: 'l', x: 200, y: 40, fall: 150 },
    { s: 'moodboard in, system out', side: 'r', x: 645, y: 76, fall: 120 },
    { s: '', side: 'r', x: 516, y: 278, fall: 12 },
    { s: 'hints during an interview', side: 'r', x: 660, y: 352, fall: 40 },
    { s: 'flyers in 48 hours', side: 'l', x: 96, y: 410, fall: 30 },
    { s: 'a calmer clinic site', side: 'r', x: 466, y: 444, fall: 14 },
  ],
};

const BIZ: Copy = {
  lime: ['a site as calm', 'as my office?'],
  at: { x: 196, y: 186 },
  ideas: [
    { s: 'flyers ready in 48 hours', side: 'l', x: 168, y: 40, fall: 150 },
    { s: 'my listing, on Instagram', side: 'r', x: 628, y: 76, fall: 120 },
    { s: '', side: 'r', x: 468, y: 278, fall: 12 },
    { s: 'a site that books for me', side: 'r', x: 660, y: 352, fall: 40 },
    { s: 'a menu that talks back', side: 'l', x: 96, y: 410, fall: 30 },
    { s: 'a calmer waiting room', side: 'r', x: 552, y: 444, fall: 14 },
  ],
};

/** A bubble's edge: a square box, a right-angled point under one bottom corner (h: the box, without the point). */
function bubbleEdge(w: number, h: number, side: Side) {
  const L = side === 'l';
  const X = (x: number) => (L ? x : w - x);
  // on the half pixel, so the 1px line sits on the edge
  const pts: [number, number][] = [
    [0.5, 0.5],
    [w - 0.5, 0.5],
    [w - 0.5, h - 0.5],
    [TAIL, h - 0.5],
    [0.5, h + TAIL - 1],
  ];
  return 'M ' + pts.map(([x, y]) => `${Math.round(X(x) * 100) / 100} ${y}`).join(' L ') + ' Z';
}

function Bubble({ k, idea }: { k: string; idea: Idea }) {
  const pos = idea.side === 'l' ? { left: idea.x } : { left: 'auto', right: 720 - idea.x };
  return (
    <div data-k={k} className={`a dream-bub dream-bub--${idea.side}`} style={{ top: idea.y, ...pos }}>
      {/* the frosted pane, cut to the bubble's shape; its edge drawn over it */}
      <i className="glass dream-bub-glass" />
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

  return (
    <Scene
      n={2}
      w={720}
      h={560}
      label={
        biz
          ? 'Ideas as chat bubbles, one of them lime: a site as calm as my office? Then a window rises, the other ideas are pulled down into it, and the lime one pins to its corner over the calm counseling homepage it became'
          : 'Ideas as chat bubbles, one of them lime: what if poker had an AI that bluffs? Then a window rises, the other ideas are pulled down into it, and the lime one pins to its corner over Bid King, the blind auction game it became'
      }
      build={(q, tl) => {
        /* the bubbles' edges, sized to their words */
        const ideas = q.all('idea.');
        ideas.forEach((el, i) => {
          const w = el.offsetWidth, h = el.offsetHeight;
          const svg = el.querySelector('svg');
          svg?.setAttribute('width', String(w));
          svg?.setAttribute('height', String(h));
          svg?.querySelector('path')?.setAttribute('d', bubbleEdge(w, h - TAIL, C.ideas[i].side));
        });
        const lime = q('lime');
        const body = q('lime.body');
        const lh = body?.offsetHeight ?? 104;

        /* 0 → 1: the ideas, one by one from the top (as each comes up the screen), each out of its
           tail's point; the lime one last, its trail first */
        const ARRIVE = [0.18, 0.28, 0.4, 0.52, 0.62, 0.72];
        ideas.forEach((el, i) => {
          tl.from(el, { s: 0 }).to(el, { s: 1 }, ARRIVE[i], 0.16, E.out);
        });
        tl.from(q('lime.c1'), { s: 0 }).to(q('lime.c1'), { s: 1 }, 0.79, 0.06, E.out);
        tl.from(q('lime.c0'), { s: 0 }).to(q('lime.c0'), { s: 1 }, 0.83, 0.06, E.out);
        tl.from(body, { s: 0 }).to(body, { s: 1 }, 0.86, 0.12, E.out);

        /* 1 → 2: the window rises (from under the drawing's foot), the real thing in it; the ideas are
           pulled down into it, frosted behind its bar, then gone behind the page */
        const win = q('win');
        tl.from(win, { y: 560 - WIN.y }).to(win, { y: 0 }, 1.04, 0.38, E.move);
        // the reply being typed first (it lets go of the lime one's corner), then the lowest first (the
        // window reaches them first), drawn in a little toward its middle as they go
        ideas.forEach((el, i) => {
          const typing = !C.ideas[i].s;
          const at = typing ? 1.02 : 1.04 + (ideas.length - 1 - i) * 0.035;
          const cx = el.offsetLeft + el.offsetWidth / 2;
          tl.to(el, { y: C.ideas[i].fall, x: Math.round((WIN.x + WIN.w / 2 - cx) * 0.1), s: 0.9 }, at, typing ? 0.1 : 0.24, E.in);
          tl.set(el, { o: 0 }, 1.5);
        });
        // the thought's trail goes in as the window passes under it
        tl.to(q('lime.c1'), { s: 0 }, 1.2, 0.04, E.in).to(q('lime.c0'), { s: 0 }, 1.22, 0.04, E.in);
        // it travels up out of the window, set to its pinned size; then (passed under the window) it tucks
        // its edge under the bar's corner
        const X1 = WIN.x - TUCK_X - C.at.x, Y0 = -(C.at.y + lh);
        tl.to(lime, { x: X1, y: WIN.y - 4 + Y0 }, 1.44, 0.2, E.move);
        tl.to(body, { s: PINNED }, 1.44, 0.2, E.move);
        tl.to(lime, { y: WIN.y + TUCK_Y + Y0 }, 1.67, 0.1, E.out);
        // its stacking, changed only while nothing overlaps it: under the ideas (the reply's glass frosts its
        // corner), over the window while it travels, under the window's bar once tucked
        if (lime) tl.on((t) => {
          const z = t >= 1.14 && t < 1.655 ? '4' : '1';
          if (lime.style.zIndex !== z) lime.style.zIndex = z;
        });

        /* pinned: the lamp in the practice's room is turned on */
        if (biz) tl.from(q('pg.light'), { clip: [0, 0, 100, 0] }).to(q('pg.light'), { clip: [0, 0, 0, 0] }, 1.79, 0.12, E.out);
      }}
    >
      {/* --- the ideas (under the window: they're pulled down into it) --- */}
      {C.ideas.map((idea, i) => (
        <Bubble key={i} k={`idea.${i}`} idea={idea} />
      ))}

      {/* --- the window, and what's in it: it rises inside a mask (not a clip, so its glass bar frosts
          what's behind it: the ideas falling in, the lime one's edge) --- */}
      <div className="a dream-mask">
        <A k="win" x={WIN.x} y={WIN.y} w={WIN.w} h={WIN.h} c="win dream-win">
          <div className="win-bar glass dream-bar">
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
            <div className="win-body dream-page">
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
              <A x={352} y={66} w={268} h={262} c="sunk dream-room">
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
            <div className="win-body dream-bid-body">
              {/* the screen's lime is the idea pinned over it: the table's bid is chalk */}
              <div className="dream-bid">
                <BidTable k="dream.bid" lime={false} />
              </div>
            </div>
          )}
        </A>
      </div>

      {/* --- the lime one: a thought (its trail of squares), then pinned under the window's corner --- */}
      <div data-k="lime" className="a dream-lime" style={{ left: C.at.x, top: C.at.y }}>
        <span data-k="lime.c1" className="dream-trail" style={{ left: -32, top: 'calc(100% + 24px)', width: 8, height: 8 }} />
        <span data-k="lime.c0" className="dream-trail" style={{ left: -18, top: 'calc(100% + 6px)', width: 14, height: 14 }} />
        <span data-k="lime.body" className="dream-lime-body notch">
          <span className="dream-lime-txt">
            {C.lime[0]}
            <br />
            {C.lime[1]}
          </span>
        </span>
      </div>
    </Scene>
  );
}
