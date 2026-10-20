'use client';

import Scene from '@/components/scene/Scene';
import { A, T, Cursor, Headphones, Lock, Check, Play } from '@/components/scene/kit';
import { E } from '@/lib/scene/timeline';

/**
 * Design service: the launch of "hush", a pair of headphones.
 * 1 · its moodboard, block by block;
 * 2 · what isn't used folds away, the window opens, and the three pieces it
 *     keeps go to their places on the site (the headline draft set larger,
 *     the lime swatch dragged into the button, the picture to the hero),
 *     the rest of the page around them, the code written beside it;
 * 3 · published: the address becomes hush.audio, it's live, and the phone
 *     has it too.
 * One lime at a time: the swatch on the board, the button it becomes; the
 * Live tag and the rest stay ink and paper.
 * The board is laid out so each kept piece is near where it goes: nothing
 * crosses on its way.
 */

// the site: where the hero picture sits, the headline (set 44/30 of the draft), the button
const HERO = { x: 312, y: 116 };
const HL = { x: 24, y: 132, k: 44 / 30 };
const BUY = { x: 24, y: 292, w: 150, h: 38 };
// the board: the picture, the headline draft, the lime swatch (the button starts there, cropped to a square)
const PIC = { x: 456, y: 40 };
const DRAFT = { x: 18, y: 40 + 24 };
const SW = { x: 16 + 3 * 54, y: 186 + 16, s: 38 };
// the code editor
const ED = { x: 412, y: 288, w: 308, h: 240 };
// a reveal ends on a clip past the box, so its shadow shows
const OPEN = (r: number) => `inset(-64px -64px -64px -64px round ${r}px)`;

const CODE: [string, string][] = [
  ['tag', '<section class="hero">'],
  ['tag', '  <h1>Silence, tuned to you.</h1>'],
  ['tag', '  <a class="buy" href="/order">'],
  ['txt', '    Pre-order · $249</a>'],
  ['tag', '</section>'],
  ['', ''],
  ['sel', '.buy {'],
  ['prop', '  background: var(--lime);'],
  ['prop', '  border-radius: 99px;'],
  ['sel', '}'],
];

/** A line of code, coloured: tags and punctuation dim, names mid, values and words bright. */
function Code({ kind, s }: { kind: string; s: string }) {
  if (kind === 'tag') {
    const parts: { c: string; s: string }[] = [];
    // <tag, attr="value", >, and the words between
    const re = /(<\/?[a-z0-9]+)|( [a-z-]+=)("[^"]*")|(>)/g;
    let at = 0;
    for (let m = re.exec(s); m; m = re.exec(s)) {
      if (m.index > at) parts.push({ c: '', s: s.slice(at, m.index) });
      if (m[1]) parts.push({ c: 'c-tag', s: m[1] });
      if (m[2]) parts.push({ c: 'c-attr', s: m[2] }, { c: 'c-str', s: m[3] });
      if (m[4]) parts.push({ c: 'c-tag', s: m[4] });
      at = re.lastIndex;
    }
    if (at < s.length) parts.push({ c: '', s: s.slice(at) });
    return (
      <>
        {parts.map((p, i) => (
          <span key={i} className={p.c || undefined}>
            {p.s}
          </span>
        ))}
      </>
    );
  }
  if (kind === 'prop') {
    const [k, v] = s.split(':');
    return (
      <>
        <span className="c-prop">{k}:</span>
        <span>{v}</span>
      </>
    );
  }
  if (kind === 'sel') return <span className="c-sel">{s}</span>;
  return <span>{s}</span>;
}

// the board's blocks, in the order they come in
const BOARD = ['mb.f', 'mb.b', 'mb.a', 'mb.d', 'mb.e', 'mb.c', 'mb.g', 'mb.h'];

export default function Hush() {
  return (
    <Scene
      n={3}
      label="A moodboard for hush, a pair of headphones, becomes its website while the code is written beside it; then the site goes live at hush.audio, on a phone too"
      build={(q, tl) => {
        const buy = q('buy');
        const cur = q('cursor');
        const square = (top: number) => `inset(${top}px ${BUY.w - SW.s}px 0px 0px round 6px)`;

        /* 0 → 1: the board, block by block */
        tl.type(q('mb.title'), 0.02, 0.2);
        tl.from(q('mb.count'), { clip: [0, 0, 0, 100] }).to(q('mb.count'), { clip: [0, 0, 0, 0] }, 0.08, 0.2);
        BOARD.forEach((b, i) => {
          const at = 0.08 + i * 0.065;
          tl.from(q(b), { clip: 'inset(100% 0% 0% 0% round 6px)' }).to(q(b), { clip: 'inset(0% 0% 0% 0% round 6px)' }, at, 0.32);
          tl.from(q(`${b}.cap`), { clip: [0, 100, 0, 0] }).to(q(`${b}.cap`), { clip: [0, 0, 0, 0] }, at + 0.12, 0.24);
        });
        // the draft's words are written into their block
        tl.from(q('hl'), { clip: [0, 100, 0, 0] }).to(q('hl'), { clip: [0, 0, 0, 0] }, 0.2, 0.3);
        // the lime swatch is the button, cropped to a square on the board (its corners are its clip's); it comes in with its block
        tl.from(buy, { x: SW.x - BUY.x, y: SW.y - BUY.y, clip: square(SW.s) }).to(buy, { clip: square(0) }, 0.08 + 3 * 0.065 + 0.06, 0.24);
        tl.from(q('buy.label'), { o: 0 });

        /* 1 → 2: into the site */
        // the pointer comes for the lime and picks it up
        tl.from(cur, { x: 330, y: 520, o: 0 });
        tl.to(cur, { o: 1 }, 1.0, 0.03, E.lin)
          .to(cur, { x: SW.x + 18, y: SW.y + 18 }, 1.0, 0.16, E.move)
          .to(cur, { s: 0.86 }, 1.16, 0.03, E.lin);
        tl.to(buy, { s: 1.1 }, 1.16, 0.05, E.out);
        // what isn't used folds away, block by block
        const gone = ['mb.b', 'mb.d', 'mb.e', 'mb.c', 'mb.g', 'mb.h', 'mb.f'];
        gone.forEach((g, i) => tl.to(q(g), { y: -6, clip: 'inset(0% 0% 100% 0% round 6px)' }, 1.18 + i * 0.018, 0.1, E.in));
        BOARD.forEach((b, i) => tl.to(q(`${b}.cap`), { clip: [0, 100, 0, 0] }, 1.16 + i * 0.012, 0.07, E.in));
        tl.to(q('mb.title'), { clip: [0, 100, 0, 0] }, 1.16, 0.07, E.in).to(q('mb.count'), { clip: [0, 0, 0, 100] }, 1.16, 0.07, E.in);
        // the window opens under what's kept
        tl.from(q('win'), { clip: 'inset(0% 0% 100% 0% round 12px)' }).to(q('win'), { clip: OPEN(12) }, 1.36, 0.16, E.out);
        // the three pieces go to their places: the headline (set larger), the lime, the picture
        tl.to(q('hl'), { x: HL.x - DRAFT.x, y: HL.y - DRAFT.y, s: HL.k }, 1.42, 0.22, E.move);
        tl.to(cur, { x: BUY.x + 18, y: BUY.y + 18 }, 1.44, 0.22, E.move);
        tl.to(buy, { x: 0, y: 0 }, 1.44, 0.22, E.move);
        tl.to(q('mb.a'), { x: HERO.x - PIC.x, y: HERO.y - PIC.y }, 1.46, 0.22, E.move);
        tl.to(q('mb.a.frame'), { o: 0 }, 1.62, 0.05, E.lin);
        // dropped: the lime opens into the button
        tl.to(cur, { s: 1 }, 1.66, 0.03, E.lin).to(cur, { x: 300, y: 470 }, 1.7, 0.2, E.soft);
        tl.to(buy, { s: 1 }, 1.66, 0.04, E.out).to(buy, { clip: 'inset(0px 0px 0px 0px round 19px)' }, 1.68, 0.12, E.out);
        tl.to(q('buy.label'), { o: 1 }, 1.74, 0.04, E.lin);
        // the rest of the page comes in around them
        ['logo', 'nav', 'sub1', 'sub2', 'listen', 'f1', 'f2', 'f3'].forEach((k, i) => {
          tl.from(q(k), { clip: [0, 100, 0, 0] }).to(q(k), { clip: [0, 0, 0, 0] }, 1.6 + i * 0.028, 0.16, E.out);
        });
        // the code, written beside it as soon as its window is in
        const ed = q('ed');
        tl.from(ed, { x: 24, clip: 'inset(0% 0% 0% 100% round 10px)' }).to(ed, { x: 0, clip: OPEN(10) }, 1.72, 0.1, E.out);
        const lines = q.all('code.');
        const total = CODE.reduce((n, [, c]) => n + Math.max(1, c.length), 0);
        let at = 1.76;
        lines.forEach((el, i) => {
          const d = (0.2 * Math.max(1, CODE[i][1].length)) / total;
          tl.type(el, at, d);
          at += d;
        });
        tl.from(q('ed.caret'), { o: 0 }).to(q('ed.caret'), { o: 1 }, 1.96, 0.01, E.lin);

        /* 2 → 3: published, live */
        tl.to(cur, { x: ED.x + ED.w - 44, y: ED.y + 12 }, 2.0, 0.12, E.move)
          .to(cur, { s: 0.86 }, 2.12, 0.03, E.lin)
          .to(cur, { s: 1 }, 2.15, 0.03, E.lin)
          .to(cur, { x: 742, y: 560, o: 0 }, 2.26, 0.16, E.in);
        tl.from(q('ed.pub'), { bg: '#f4f5f2' }).to(q('ed.pub'), { bg: 'rgba(244, 245, 242, 0.55)' }, 2.12, 0.02, E.lin);
        tl.from(q('ed.bar'), { sx: 0 }).to(q('ed.bar'), { sx: 1 }, 2.14, 0.1, E.soft);
        tl.to(ed, { x: 24, clip: 'inset(0% 0% 0% 100% round 10px)' }, 2.24, 0.14, E.in);
        // the address: selected, then hush.audio typed in, behind a lock
        tl.from(q('url.sel'), { sx: 0 }).to(q('url.sel'), { sx: 1 }, 2.28, 0.05, E.soft);
        tl.to(q('url.old'), { o: 0 }, 2.35, 0.01, E.lin).to(q('url.sel'), { o: 0 }, 2.35, 0.01, E.lin);
        tl.from(q('url.lock'), { o: 0 }).to(q('url.lock'), { o: 1 }, 2.36, 0.01, E.lin);
        tl.type(q('url.new'), 2.36, 0.14);
        tl.from(q('live'), { clip: [0, 100, 0, 0] }).to(q('live'), { clip: [0, 0, 0, 0] }, 2.52, 0.08, E.out);
        // and the phone has it too
        tl.from(q('phone'), { y: 90, clip: 'inset(0% 0% 100% 0% round 30px)' }).to(q('phone'), { y: 0, clip: OPEN(30) }, 2.42, 0.28, E.out);
        tl.from(q('toast'), { y: 14, clip: 'inset(100% 0% 0% 0% round 8px)' }).to(q('toast'), { y: 0, clip: 'inset(0% 0% 0% 0% round 8px)' }, 2.64, 0.14, E.out);
      }}
    >
      {/* --- the site's window (its words and parts are laid over it, so the board's pieces can fly in) --- */}
      <A k="win" x={0} y={34} w={600} h={438} r={12} c="win">
        <div className="win-bar">
          <span className="win-dots" aria-hidden>
            <i />
            <i />
            <i />
          </span>
          <span className="win-url hush-url">
            <span data-k="url.sel" className="hush-url-sel" />
            <span data-k="url.old" className="hush-url-old">
              localhost:3000
            </span>
            <span className="hush-url-new">
              <span data-k="url.lock" className="hush-lock">
                <Lock />
              </span>
              <span data-k="url.new">hush.audio</span>
            </span>
          </span>
          <span data-k="live" className="live hush-live">
            Live
          </span>
        </div>
      </A>
      <T k="logo" x={24} y={86} c="f-head hush-logo">
        hush
      </T>
      <A k="nav" x={318} y={89} c="hush-nav">
        <span>Sound</span>
        <span>Design</span>
        <span>Support</span>
        <span>Bag (0)</span>
      </A>
      <T k="sub1" x={24} y={236} c="hush-sub">
        Noise cancelling that learns the room
      </T>
      <T k="sub2" x={24} y={255} c="hush-sub">
        you’re in. Forty hours a charge.
      </T>
      <A k="listen" x={190} y={302} c="hush-listen">
        <Play size={9} /> Listen
      </A>
      {[
        ['ANC', 'Learns the room'],
        ['Battery', '40 hours'],
        ['Weight', '248 g'],
      ].map(([k, v], i) => (
        <A key={k} k={`f${i + 1}`} x={24 + i * 188} y={372} w={176} h={64} r={8} c="sunk hush-feat">
          <span className="f-label">{k}</span>
          <span>{v}</span>
        </A>
      ))}

      {/* --- the board: left, what becomes the page's words; right, its picture --- */}
      <T k="mb.title" x={0} y={8} c="f-label">
        hush / moodboard
      </T>
      <T k="mb.count" x={0} y={8} c="f-label" style={{ left: 'auto', right: 0 }}>
        8 blocks
      </T>
      {/* the headline draft (its words are laid over it: set larger, they are the site's headline) */}
      <A k="mb.f" x={0} y={40} w={264} h={110} c="blk" />
      <T k="mb.f.cap" x={0} y={158} c="cap">
        Headline, draft 3
      </T>
      {/* the palette (the lime is laid over it: it becomes the button) */}
      <A k="mb.d" x={0} y={186} w={264} h={98} c="blk hush-pal">
        {[
          ['#121417', 'Ink'],
          ['#3b3f45', 'Graphite'],
          ['#e9eae6', 'Chalk'],
          ['', 'Lime'],
        ].map(([hex, name], i) => (
          <span key={name} className="hush-sw" style={{ left: 16 + i * 54 }}>
            <i style={hex ? { background: hex } : { boxShadow: 'none' }} />
            <b>{name}</b>
          </span>
        ))}
      </A>
      <T k="mb.d.cap" x={0} y={292} c="cap">
        Palette
      </T>
      <A k="mb.g" x={0} y={320} w={264} h={136} c="blk hush-ctl">
        <span className="pill pill--ink hush-ctl-pill">Pre-order</span>
        <span className="hush-toggle">
          <i />
        </span>
        <span className="hush-slider">
          <i />
        </span>
      </A>
      <T k="mb.g.cap" x={0} y={464} c="cap">
        Controls
      </T>
      <A k="mb.b" x={280} y={40} w={160} h={150} c="blk hush-type">
        <span className="f-head hush-aa">Aa</span>
        <span className="hush-type-rows">
          <span>
            Eurostile <i>display</i>
          </span>
          <span>
            Geist <i>text</i>
          </span>
        </span>
      </A>
      <T k="mb.b.cap" x={280} y={198} c="cap">
        Type
      </T>
      <A k="mb.e" x={280} y={226} w={160} h={98} c="blk hush-voice">
        quiet, warm,
        <br />a little bold.
      </A>
      <T k="mb.e.cap" x={280} y={332} c="cap">
        Voice
      </T>
      <A k="mb.h" x={280} y={360} w={160} h={96} c="blk hush-note">
        <span className="f-label">Launch</span>
        <span className="f-head">May 2026</span>
      </A>
      <T k="mb.h.cap" x={280} y={464} c="cap">
        Date
      </T>
      {/* the picture: it becomes the site's hero */}
      <A k="mb.a" x={PIC.x} y={PIC.y} w={264} h={232} r={6} c="sunk hush-pic">
        <span data-k="mb.a.frame" className="hush-frame" />
        <Headphones size={168} />
      </A>
      <T k="mb.a.cap" x={PIC.x} y={280} c="cap">
        Hush One, side view
      </T>
      <A k="mb.c" x={PIC.x} y={316} w={264} h={140} c="blk hush-rings">
        <svg width="264" height="140" viewBox="0 0 264 140" aria-hidden>
          {[8, 18, 30, 44, 60, 78, 98].map((r, i) => (
            <circle key={r} cx="132" cy="70" r={r} fill="none" stroke="currentColor" strokeOpacity={1 - i * 0.13} strokeWidth="1.25" />
          ))}
          <circle cx="132" cy="70" r="2.5" fill="currentColor" />
        </svg>
      </A>
      <T k="mb.c.cap" x={PIC.x} y={464} c="cap">
        Silence, drawn
      </T>

      {/* the headline draft's words */}
      <A k="hl" x={DRAFT.x} y={DRAFT.y} c="f-head hush-hl">
        Silence,
        <br />
        tuned to you.
      </A>
      {/* the lime swatch, that becomes the button */}
      <A k="buy" x={BUY.x} y={BUY.y} w={BUY.w} h={BUY.h} r={0} c="pill pill--lime hush-buy">
        <span data-k="buy.label">Pre-order · $249</span>
      </A>

      {/* --- the code --- */}
      <A k="ed" x={ED.x} y={ED.y} w={ED.w} h={ED.h} r={10} c="hush-ed">
        <div className="hush-ed-bar">
          <span className="is-on">index.html</span>
          <span>hush.css</span>
          <span data-k="ed.pub" className="hush-pub">
            Publish
          </span>
          <i data-k="ed.bar" className="hush-ed-progress" />
        </div>
        <div className="hush-ed-body f-mono">
          {CODE.map(([kind, s], i) => (
            <div key={i} className="hush-ed-line">
              <span className="hush-ln">{i + 1}</span>
              <span data-k={`code.${String(i).padStart(2, '0')}`} className="hush-code">
                {s ? <Code kind={kind} s={s} /> : ' '}
              </span>
              {i === CODE.length - 1 && (
                <span data-k="ed.caret" className="hush-caret">
                  <i />
                </span>
              )}
            </div>
          ))}
        </div>
      </A>

      {/* --- live: the phone and the deploy note --- */}
      <A k="phone" x={544} y={140} w={176} h={364} r={30} c="phone">
        <div className="phone-screen hush-m">
          <div className="phone-status">
            <span>9:41</span>
            <i className="phone-island" />
            <span className="phone-bars" aria-hidden>
              <i />
              <i />
              <i />
            </span>
          </div>
          <span className="f-head hush-m-logo">hush</span>
          <span className="f-head hush-m-h1">
            Silence,
            <br />
            tuned to you.
          </span>
          <span className="sunk hush-m-pic">
            <Headphones size={92} />
          </span>
          <span className="hush-m-sub">Noise cancelling that learns the room you’re in.</span>
          <span className="hush-m-feats">
            <span className="sunk">
              <i className="f-label">ANC</i>
              Learns the room
            </span>
            <span className="sunk">
              <i className="f-label">Battery</i>
              40 hours
            </span>
          </span>
        </div>
      </A>
      <A k="toast" x={24} y={490} w={252} h={38} r={8} c="hush-toast">
        <Check size={12} /> <span>Deployed to hush.audio</span> <i>41 s</i>
      </A>

      <Cursor />
    </Scene>
  );
}
