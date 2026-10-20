'use client';

import '@/app/scenes-practice.css';
import type { CSSProperties, ReactNode } from 'react';
import Scene from '@/components/scene/Scene';
import { A, T, Cursor, Lock } from '@/components/scene/kit';
import { E, type Timeline } from '@/lib/scene/timeline';

/**
 * Practice Website Refresh: Willow Counseling, an invented sample practice
 * (Dana Reyes, LMFT, therapy in Portland and online), and its calm homepage.
 * The site, its phone and its room are drawn once, at the site's own size;
 * the three scenes use the same drawings (the tour and the hero zoom the site
 * down, so its type stays type).
 *
 * PracticeStory (the business homepage, dark):
 * 1 · a short questionnaire, typed field by field, a photo of the office
 *     beside it, Send in lime;
 * 2 · sent: the card's labels and lines fold away, its header becomes a
 *     browser's bar, and the answers settle into the homepage they make (the
 *     name is the logo, the photo the picture, the specialties and sessions
 *     the details below); the feel ("Calm, warm, no jargon") is rewritten as
 *     the headline; then the rest of the page comes in around them;
 * 3 · live: the draft address is replaced by willowcounseling.com behind a
 *     lock, Live, and the window steps aside for its phone.
 * The card is laid out over the site so every answer is near where it goes
 * and nothing crosses on its way.
 *
 * PracticeTourScene (the practice page, paper): the homepage window stays put
 * while each thing you get comes out beside it and folds away for the next:
 * its four other pages, the phone, the booking button clicked open, the
 * Google result, the owner card, the how-to video, thirty days of fixes.
 *
 * PracticeHero (the practice page's top, paper): the homepage draws itself on
 * load, its address is typed in, it's live, and its phone rises beside it.
 *
 * One lime per state, and never two on screen at once (the site's own button
 * is ink, like the About scene's): the story's Send, then "calm" marked in
 * the headline (the feel answer, set into its voice), then Live; the tour's
 * Home tab, the phone's secure address, the booking way picked, the search
 * words matched, You, the video's progress, today; the hero's Live.
 */

/* ---------------------------------------------------------------------------
   The site, at its own size (600 × 430)
--------------------------------------------------------------------------- */

const SW = 600;
const SH = 430;
const S = {
  logo: { x: 28, y: 53 },
  nav: { r: 28, y: 56 },
  eye: { x: 28, y: 106 },
  h1a: { x: 28, y: 122 },
  h1b: { x: 28, y: 166 },
  sub1: { x: 28, y: 224 },
  sub2: { x: 28, y: 244 },
  btn: { x: 28, y: 280, w: 196, h: 40 },
  pic: { x: 316, y: 102, w: 256, h: 220 },
  rule: { y: 350 },
  k1: { x: 28, y: 368 },
  v1: { x: 28, y: 386 },
  k2: { x: 316, y: 368 },
  v2: { x: 316, y: 386 },
};
const URL_W = 276;
const SEL_W = 198;
/** a clip that shows all of a window and its shadow */
const OPEN = 'inset(-40px -40px -72px -40px round 12px)';
const SHUT = 'inset(0% 0% 100% 0% round 12px)';
const PH = { w: 190, h: 392 };
const PH_OPEN = 'inset(-40px -40px -72px -40px round 30px)';
const PH_SHUT = 'inset(0% 0% 100% 0% round 30px)';

/**
 * The office, flat: a reading lamp and an armchair on the left, a window on
 * the right with its plant, the light it lets in falling across the floor.
 * (256 × 220; the chair is on the left, so a phone laid over the picture's
 * right side never hides it.)
 */
function Room({ vb = '0 0 256 220' }: { vb?: string }) {
  const ink = (a: number) => `rgba(18,20,23,${a})`;
  return (
    <svg className="prc-room" viewBox={vb} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect x="-40" y="-40" width="336" height="300" fill="#fff" />
      <rect x="-40" y="-40" width="336" height="200" fill={ink(0.055)} />
      <rect x="-40" y="160" width="336" height="100" fill={ink(0.1)} />
      {/* the window, and its light on the floor */}
      <path d="M170 160 H228 L190 220 H114 Z" fill="#fff" fillOpacity="0.85" />
      <rect x="168" y="26" width="64" height="108" fill={ink(0.16)} />
      <rect x="172" y="30" width="56" height="100" fill="#fff" />
      <rect x="198.5" y="30" width="3" height="100" fill={ink(0.16)} />
      <rect x="172" y="78.5" width="56" height="3" fill={ink(0.16)} />
      <rect x="164" y="134" width="72" height="5" fill={ink(0.22)} />
      {/* the lamp's light on the wall */}
      <path d="M13 78 H45 L66 160 H-8 Z" fill="#fff" fillOpacity="0.55" />
      {/* the rug */}
      <ellipse cx="104" cy="201" rx="76" ry="9" fill={ink(0.12)} />
      {/* the plant, under the window */}
      <g fill={ink(0.7)}>
        <ellipse cx="222" cy="134" rx="5" ry="21" />
        <ellipse cx="212" cy="146" rx="5" ry="17" transform="rotate(-26 212 146)" />
        <ellipse cx="232" cy="146" rx="5" ry="17" transform="rotate(26 232 146)" />
        <ellipse cx="207" cy="160" rx="4.5" ry="12" transform="rotate(-54 207 160)" />
        <ellipse cx="237" cy="160" rx="4.5" ry="12" transform="rotate(54 237 160)" />
      </g>
      <path d="M210 167 H234 L231 193 H213 Z" fill={ink(0.88)} />
      {/* the armchair, a cushion on it */}
      <path d="M68 186 L64 200 M138 186 L142 200" stroke={ink(0.9)} strokeWidth="3" strokeLinecap="round" />
      <path d="M72 98 a12 12 0 0 1 12 -12 h38 a12 12 0 0 1 12 12 v54 h-62 Z" fill={ink(0.82)} />
      <rect x="66" y="144" width="74" height="26" rx="6" fill={ink(0.74)} />
      <rect x="58" y="120" width="18" height="66" rx="8" fill={ink(0.92)} />
      <rect x="130" y="120" width="18" height="66" rx="8" fill={ink(0.92)} />
      <rect x="92" y="114" width="26" height="24" rx="6" fill="#fff" fillOpacity="0.9" transform="rotate(8 105 126)" />
      {/* the lamp */}
      <path d="M29 196 V78" stroke={ink(0.9)} strokeWidth="2" />
      <rect x="19" y="194" width="20" height="4" rx="2" fill={ink(0.9)} />
      <path d="M15 54 H43 L48 78 H10 Z" fill={ink(0.88)} />
    </svg>
  );
}

/** The window's bar: three dots, the address (a draft one first, if `draft`) and its tag. */
function Bar({ draft, live = true }: { draft?: boolean; live?: boolean }) {
  return (
    <>
      <A k="bar.dots" x={14} y={13} c="prc-dots">
        <i />
        <i />
        <i />
      </A>
      <A k="url" x={(SW - URL_W) / 2} y={7} w={URL_W} h={22} r={6} c="prc-url">
        {draft && <span data-k="url.sel" className="prc-url-sel" style={{ width: SEL_W, marginLeft: -SEL_W / 2 }} />}
        {draft && (
          <span data-k="url.old" className="prc-url-old">
            willow-counseling.squarespace.com
          </span>
        )}
        <span className="prc-url-new">
          <span data-k="url.lock" className="prc-lock">
            <Lock />
          </span>
          <span data-k="url.new">willowcounseling.com</span>
        </span>
      </A>
      {draft && (
        <A k="tag.draft" y={8} c="prc-tag" style={{ left: 'auto', right: 12 }}>
          Draft
        </A>
      )}
      {live && (
        <A k="live" y={8} c="live" style={{ left: 'auto', right: 12 }}>
          Live
        </A>
      )}
      <A k="bar.line" x={0} y={36} w={SW} h={1} c="prc-barline" />
    </>
  );
}

/** The homepage's parts, named `s.*`, in the site's own px. */
function SiteParts() {
  return (
    <>
      <T k="s.logo" x={S.logo.x} y={S.logo.y} c="prc-logo prc-o">
        Willow Counseling
      </T>
      <A k="s.nav" y={S.nav.y} c="prc-nav" style={{ left: 'auto', right: S.nav.r }}>
        <span className="prc-on prc-nav-on">
          <i data-k="s.home" className="prc-lime" />
          Home
        </span>
        <span>About</span>
        <span>Specialties</span>
        <span>Fees</span>
        <span>Contact</span>
      </A>
      <T k="s.eye" x={S.eye.x} y={S.eye.y} c="prc-eye">
        Dana Reyes, LMFT
      </T>
      <span data-k="s.h1a" className="a t prc-serif prc-h1" style={{ left: S.h1a.x, top: S.h1a.y }}>
        A{' '}
        <span className="prc-on prc-word">
          <i data-k="s.mk" className="prc-lime" />
          calm
        </span>{' '}
        place
      </span>
      <T k="s.h1b" x={S.h1b.x} y={S.h1b.y} c="prc-serif prc-h1">
        to begin.
      </T>
      <T k="s.sub1" x={S.sub1.x} y={S.sub1.y} c="prc-sub">
        Individual and couples therapy,
      </T>
      <T k="s.sub2" x={S.sub2.x} y={S.sub2.y} c="prc-sub">
        in Portland and online.
      </T>
      <A k="s.btn" x={S.btn.x} y={S.btn.y} w={S.btn.w} h={S.btn.h} r={20} c="prc-btn">
        Book a free consultation
      </A>
      <A k="s.pic" x={S.pic.x} y={S.pic.y} w={S.pic.w} h={S.pic.h} r={8} c="prc-pic prc-o">
        <Room />
      </A>
      <A k="s.rule" x={28} y={S.rule.y} w={SW - 56} h={1} c="prc-rule" />
      <T k="s.k1" x={S.k1.x} y={S.k1.y} c="prc-k">
        Specialties
      </T>
      <T k="s.v1" x={S.v1.x} y={S.v1.y} c="prc-v prc-o">
        Anxiety, couples, life changes
      </T>
      <T k="s.k2" x={S.k2.x} y={S.k2.y} c="prc-k">
        Sessions
      </T>
      <T k="s.v2" x={S.v2.x} y={S.v2.y} c="prc-v prc-o">
        In person · Online
      </T>
    </>
  );
}

/** The site in its window, at (x, y), drawn at `z` of its size. */
function SiteWindow({ k = 'site', x, y, z, draft, live, children }: { k?: string; x: number; y: number; z: number; draft?: boolean; live?: boolean; children?: ReactNode }) {
  return (
    <A k={k} x={x} y={y} w={SW * z} h={SH * z} c="prc-light">
      {/* drawn smaller, its smallest words are set larger, so none is under 10.5 px as drawn */}
      <div className="prc-zoom" style={{ zoom: z, width: SW, height: SH, '--up': 1 / z } as CSSProperties}>
        <A x={0} y={0} w={SW} h={SH} c="prc-frame" />
        <Bar draft={draft} live={live} />
        <SiteParts />
        {children}
      </div>
    </A>
  );
}

/** The phone, with the same homepage on it. */
function PhoneSite({ k = 'phone', x, y }: { k?: string; x: number; y: number }) {
  return (
    <A k={k} x={x} y={y} w={PH.w} h={PH.h} r={30} c="phone prc-light">
      <div className="phone-screen prc-m">
        <div className="phone-status">
          <span>9:41</span>
          <i className="phone-island" />
          <span className="phone-bars" aria-hidden>
            <i />
            <i />
            <i />
          </span>
        </div>
        <div className="prc-m-head">
          <span className="prc-m-logo">Willow Counseling</span>
          <span className="prc-m-menu">
            <i />
            <i />
          </span>
        </div>
        <span className="prc-m-eye">Dana Reyes, LMFT</span>
        <span className="prc-serif prc-m-h1">
          A calm place
          <br />
          to begin.
        </span>
        <span className="prc-m-sub">Individual and couples therapy, in Portland and online.</span>
        <span className="prc-m-btn">Book a free consultation</span>
        <span className="prc-m-pic">
          <Room vb="0 46 256 157" />
        </span>
        <span className="prc-m-addr">
          <i data-k="ph.lime" className="prc-lime" />
          <Lock /> willowcounseling.com
        </span>
      </div>
    </A>
  );
}

/* ---------------------------------------------------------------------------
   Helpers
--------------------------------------------------------------------------- */

/**
 * Timeline.type, for an element drawn scaled by `k` (from its top-left): the
 * same letter-by-letter clip, its caret riding the scaled edge. (The kit's
 * caret moves by the element's own px, which are k times smaller here.)
 */
function typeK(tl: Timeline, el: HTMLElement | null, at: number, dur: number, caret: HTMLElement | null, k: number) {
  if (!el) return;
  const W = el.offsetWidth;
  if (!W) return;
  const nodes: Text[] = [];
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let n = walk.nextNode(); n; n = walk.nextNode()) nodes.push(n as Text);
  const box = el.getBoundingClientRect();
  const zoom = box.width / W || 1;
  const range = document.createRange();
  const edges: number[] = [];
  for (const node of nodes) {
    const s = node.textContent ?? '';
    for (let i = 1; i <= s.length; i++) {
      if (s[i - 1] === ' ' && i < s.length) continue;
      range.setStart(node, i - 1);
      range.setEnd(node, i);
      const r = range.getBoundingClientRect();
      edges.push(Math.min(W, Math.max(0, (r.right - box.left) / zoom)));
    }
  }
  if (!edges.length) return;
  tl.from(el, { clip: 'inset(0% 100% 0% 0%)' });
  if (caret) tl.from(caret, { x: 0 });
  edges.forEach((e, i) => {
    const t = at + (dur * (i + 1)) / edges.length;
    tl.to(el, { clip: `inset(0% ${(((W - e) / W) * 100).toFixed(3)}% 0% 0%)` }, t, 0, E.lin);
    if (caret) tl.to(caret, { x: e * k }, t, 0, E.lin);
  });
  tl.to(el, { clip: 'inset(0% 0% 0% 0%)' }, at + dur, 0, E.lin);
}

/** Wipe a line in from its left. */
function wipe(tl: Timeline, el: HTMLElement | null, at: number, dur = 0.16, ease: string = E.out) {
  tl.from(el, { clip: [0, 100, 0, 0] }).to(el, { clip: [0, 0, 0, 0] }, at, dur, ease);
}

/* ---------------------------------------------------------------------------
   PracticeStory: a questionnaire becomes the homepage, which goes live
--------------------------------------------------------------------------- */

/** the card (then the window) in the scene; it steps left by STEP for the phone */
const G = { x: 60, y: 65 };
const STEP = 60;
/** the questionnaire, laid over the site: label tops, answer tops, underlines */
const F = {
  lab: [56, 126, 196, 266],
  ans: [76, 146, 216, 286],
  und: [106, 176, 246, 316],
  pic: { x: 332, y: 76, k: 240 / 256 },
  rule: 346,
  send: { x: 440, y: 368, w: 132, h: 38 },
};
const LABELS = ['Practice name', 'How should it feel?', 'Specialties', 'Sessions'];
const K_LOGO = 19 / 15.5;
const K_V = 19 / 14;

export function PracticeStory() {
  return (
    <Scene
      n={3}
      w={720}
      h={560}
      label="A short questionnaire about a counseling practice is typed in; its answers become the practice's calm homepage; then the homepage goes live at willowcounseling.com, with its phone"
      build={(q, tl) => {
        const cur = q('cursor');
        const grp = q('grp');

        /* 0 → 1: the questionnaire: the blank form, then each answer typed in */
        tl.from(q('frame'), { clip: SHUT }).to(q('frame'), { clip: OPEN }, 0.02, 0.3, E.out);
        wipe(tl, q('f.head'), 0.08, 0.2);
        tl.from(q('bar.line'), { sx: 0 }).to(q('bar.line'), { sx: 1 }, 0.06, 0.26, E.out);
        [0, 1, 2, 3].forEach((i) => {
          wipe(tl, q(`f.l${i}`), 0.12 + i * 0.035, 0.14);
          tl.from(q(`f.u${i}`), { sx: 0 }).to(q(`f.u${i}`), { sx: 1 }, 0.14 + i * 0.035, 0.22, E.out);
        });
        wipe(tl, q('f.lp'), 0.14, 0.14);
        // the answers that become the site start where they're typed, set at the form's size
        tl.from(q('s.logo'), { x: 0, y: F.ans[0] - S.logo.y, s: K_LOGO });
        tl.from(q('s.v1'), { x: 28 - S.v1.x, y: F.ans[2] - S.v1.y, s: K_V });
        tl.from(q('s.v2'), { x: 28 - S.v2.x, y: F.ans[3] - S.v2.y, s: K_V });
        const ans = [q('s.logo'), q('a.feel'), q('s.v1'), q('s.v2')];
        const ks = [K_LOGO, 1, K_V, K_V];
        const carets = q.all('cr.');
        let at = 0.26;
        ans.forEach((el, i) => {
          const d = 0.0045 * (el?.textContent?.length ?? 10);
          tl.from(carets[i], { o: 0 }).to(carets[i], { o: 1 }, at - 0.01, 0.01, E.lin);
          typeK(tl, el, at, d, carets[i], ks[i]);
          if (i < 3) tl.to(carets[i], { o: 0 }, at + d + 0.01, 0.01, E.lin);
          at += d + 0.015;
        });
        // the photo of the office, uploaded beside them
        tl.from(q('s.pic'), { x: F.pic.x - S.pic.x, y: F.pic.y - S.pic.y, s: F.pic.k, clip: 'inset(100% 0% 0% 0% round 8px)' }).to(
          q('s.pic'),
          { clip: 'inset(0% 0% 0% 0% round 8px)' },
          0.4,
          0.28,
          E.out,
        );
        wipe(tl, q('f.cap'), 0.6, 0.14);
        // and Send
        tl.from(q('f.rule'), { sx: 0 }).to(q('f.rule'), { sx: 1 }, 0.66, 0.24, E.out);
        wipe(tl, q('f.count'), 0.72, 0.16);
        tl.from(q('f.send'), { clip: 'inset(0% 100% 0% 0% round 19px)' }).to(q('f.send'), { clip: 'inset(0% 0% 0% 0% round 19px)' }, 0.76, 0.18, E.out);

        /* 1 → 2: sent; the card becomes the homepage */
        const send = { x: G.x + F.send.x + F.send.w / 2 - 8, y: G.y + F.send.y + F.send.h / 2 - 6 };
        tl.from(cur, { x: 640, y: 540, o: 0 });
        tl.to(cur, { o: 1 }, 1.0, 0.03, E.lin)
          .to(cur, { x: send.x, y: send.y }, 1.0, 0.16, E.soft)
          .to(cur, { s: 0.86 }, 1.16, 0.03, E.lin)
          .to(cur, { s: 1 }, 1.19, 0.03, E.lin)
          .to(cur, { x: 700, y: 560 }, 1.24, 0.16, E.in)
          .to(cur, { o: 0 }, 1.37, 0.03, E.lin);
        tl.to(q('f.send'), { s: 0.96 }, 1.16, 0.03, E.out).to(q('f.send'), { s: 1 }, 1.19, 0.04, E.out);
        tl.to(carets[3], { o: 0 }, 1.17, 0.01, E.lin);
        // what was the form folds away: the send, its labels and lines, the header
        tl.to(q('f.send'), { clip: 'inset(0% 0% 0% 100% round 19px)' }, 1.24, 0.1, E.in);
        tl.to(q('f.count'), { clip: [0, 0, 0, 100] }, 1.22, 0.08, E.in);
        tl.to(q('f.rule'), { sx: 0 }, 1.22, 0.12, E.in);
        [0, 1, 2, 3].forEach((i) => {
          tl.to(q(`f.l${i}`), { clip: [0, 0, 100, 0] }, 1.22 + i * 0.015, 0.08, E.in);
          tl.to(q(`f.u${i}`), { sx: 0 }, 1.22 + i * 0.015, 0.1, E.in);
        });
        tl.to(q('f.lp'), { clip: [0, 0, 100, 0] }, 1.22, 0.08, E.in);
        tl.to(q('f.cap'), { clip: [0, 0, 100, 0] }, 1.24, 0.08, E.in);
        tl.to(q('f.head'), { clip: [0, 0, 100, 0] }, 1.24, 0.1, E.in);
        // the header becomes a browser's bar, with the draft's address
        ['bar.dots', 'url', 'tag.draft'].forEach((k, i) => wipe(tl, q(k), 1.32 + i * 0.03, 0.16));
        // the answers settle into their places
        tl.to(q('s.logo'), { x: 0, y: 0, s: 1 }, 1.36, 0.3, E.soft);
        tl.to(q('s.pic'), { x: 0, y: 0, s: 1 }, 1.38, 0.3, E.soft);
        tl.to(q('s.v2'), { x: 0, y: 0, s: 1 }, 1.4, 0.3, E.soft);
        tl.to(q('s.v1'), { x: 0, y: 0, s: 1 }, 1.47, 0.3, E.soft);
        // the feel, rewritten as the headline
        tl.to(q('a.feel'), { clip: [0, 100, 0, 0] }, 1.5, 0.07, E.in);
        tl.from(q('s.c1'), { o: 0 }).to(q('s.c1'), { o: 1 }, 1.56, 0.01, E.lin).to(q('s.c1'), { o: 0 }, 1.71, 0.01, E.lin);
        tl.type(q('s.h1a'), 1.57, 0.12, q('s.c1'));
        tl.from(q('s.c2'), { o: 0 }).to(q('s.c2'), { o: 1 }, 1.71, 0.01, E.lin).to(q('s.c2'), { o: 0 }, 1.86, 0.01, E.lin);
        tl.type(q('s.h1b'), 1.72, 0.09, q('s.c2'));
        // the rest of the page, around them
        wipe(tl, q('s.nav'), 1.64, 0.2);
        wipe(tl, q('s.eye'), 1.58, 0.16);
        wipe(tl, q('s.sub1'), 1.8, 0.16);
        wipe(tl, q('s.sub2'), 1.83, 0.16);
        tl.from(q('s.btn'), { clip: 'inset(0% 100% 0% 0% round 20px)' }).to(q('s.btn'), { clip: 'inset(0% 0% 0% 0% round 20px)' }, 1.84, 0.14, E.out);
        tl.from(q('s.rule'), { sx: 0 }).to(q('s.rule'), { sx: 1 }, 1.76, 0.18, E.out);
        wipe(tl, q('s.k1'), 1.8, 0.14);
        wipe(tl, q('s.k2'), 1.76, 0.14);
        // its one lime: "calm", the answer set into the headline's voice
        tl.from(q('s.mk'), { sx: 0 }).to(q('s.mk'), { sx: 1 }, 1.88, 0.1, E.soft).to(q('s.mk'), { sx: 0 }, 2.0, 0.06, E.in);

        /* 2 → 3: live, on its own address, and on a phone */
        tl.from(q('url.sel'), { sx: 0 }).to(q('url.sel'), { sx: 1 }, 2.02, 0.08, E.soft);
        tl.to(q('url.old'), { o: 0 }, 2.12, 0.01, E.lin).to(q('url.sel'), { o: 0 }, 2.12, 0.01, E.lin);
        tl.from(q('url.lock'), { o: 0 }).to(q('url.lock'), { o: 1 }, 2.12, 0.01, E.lin);
        tl.type(q('url.new'), 2.13, 0.16);
        tl.to(q('tag.draft'), { clip: [0, 0, 0, 100] }, 2.3, 0.05, E.in);
        wipe(tl, q('live'), 2.35, 0.08);
        tl.to(grp, { x: -STEP }, 2.4, 0.32, E.soft);
        tl.from(q('phone'), { y: 90, clip: PH_SHUT }).to(q('phone'), { y: 0, clip: PH_OPEN }, 2.5, 0.36, E.out);
      }}
    >
      <A k="grp" x={G.x} y={G.y} w={SW} h={SH} c="prc-light">
        <A k="frame" x={0} y={0} w={SW} h={SH} c="prc-frame" />
        {/* the questionnaire's header; then the browser's bar in its place */}
        <A k="f.head" x={0} y={0} w={SW} h={36} c="prc-fhead">
          <b>About your practice</b>
          <span>4 questions · 15 min</span>
        </A>
        <Bar draft />
        {LABELS.map((s, i) => (
          <T key={s} k={`f.l${i}`} x={28} y={F.lab[i]} c="prc-fl">
            {s}
          </T>
        ))}
        {F.und.map((y, i) => (
          <A key={y} k={`f.u${i}`} x={28} y={y} w={272} h={1} c="prc-u" />
        ))}
        <T k="f.lp" x={F.pic.x} y={F.lab[0]} c="prc-fl">
          A photo of your office
        </T>
        <T k="f.cap" x={F.pic.x} y={F.pic.y + S.pic.h * F.pic.k + 8} c="prc-cap">
          office.jpg
        </T>
        <A k="f.rule" x={0} y={F.rule} w={SW} h={1} c="prc-barline" style={{ transformOrigin: 'left center' }} />
        <T k="f.count" x={28} y={F.send.y + 11} c="prc-fl">
          4 of 4 answered
        </T>
        <A k="f.send" x={F.send.x} y={F.send.y} w={F.send.w} h={F.send.h} r={19} c="prc-send">
          Send answers
        </A>
        {/* the site (the name, the photo, the specialties and sessions are the answers) */}
        <SiteParts />
        <T k="a.feel" x={28} y={F.ans[1]} c="prc-ans">
          Calm, warm, no jargon
        </T>
        {F.ans.map((y, i) => (
          <A key={y} k={`cr.${i}`} x={28} y={y + 1} w={2} h={21} c="caret prc-caret">
            <i />
          </A>
        ))}
        <A k="s.c1" x={S.h1a.x + 1} y={S.h1a.y + 7} w={2} h={32} c="caret prc-caret">
          <i />
        </A>
        <A k="s.c2" x={S.h1b.x + 1} y={S.h1b.y + 7} w={2} h={32} c="caret prc-caret">
          <i />
        </A>
      </A>
      <PhoneSite x={522} y={150} />
      <Cursor />
    </Scene>
  );
}

/* ---------------------------------------------------------------------------
   PracticeTourScene: what you get, beside the homepage
--------------------------------------------------------------------------- */

const TZ = 0.86;
const TA = { x: 0, y: 100 };
/** a point of the site, in the tour's px */
const tp = (x: number, y: number) => ({ x: TA.x + x * TZ, y: TA.y + y * TZ });

const PAGES = [
  { path: '/about', t: 'About', d: 'Hi, I’m Dana.' },
  { path: '/specialties', t: 'Specialties', d: 'Anxiety, couples, life changes' },
  { path: '/fees', t: 'Fees and Insurance', d: 'Sliding scale available' },
  { path: '/contact', t: 'Contact', d: 'Call, email, or book online' },
];
/** where each thing comes out, beside the site */
const PG = { x: 496, y: TA.y + 1, w: 220, h: 86, gap: 8 };
const PH_AT = { x: 488, y: 150 };
const BK = { x: 24, y: 388, w: 356 };
const GG = { x: 240, y: 176, w: 468, h: 286 };
const OWN = { x: 404, y: 200, w: 304 };
const VID = { x: 240, y: 176, w: 468, h: 330 };
const CAL = { x: 404, y: 176, w: 304 };
/** the calendar: launch day is the 1st; fixes made on these days; today */
const FIXES = [3, 8, 12, 16];
const TODAY = 19;

/** Small line icons, drawn at 16 px. */
const Ico = {
  phone: (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="ico">
      <path d="M5.2 2.5h-1.6a1.1 1.1 0 0 0-1.1 1.2c.4 5.1 4.6 9.3 9.7 9.7a1.1 1.1 0 0 0 1.2-1.1v-1.6l-2.6-1.2-1.4 1.4a7.6 7.6 0 0 1-3.3-3.3l1.4-1.4z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  ),
  mail: (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="ico">
      <rect x="2" y="3.5" width="12" height="9" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2.6 4.4 8 8.6l5.4-4.2" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  ),
  cal: (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="ico">
      <rect x="2" y="3" width="12" height="11" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 6.5h12M5.5 1.8v2.4M10.5 1.8v2.4" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  ),
  search: (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="ico">
      <circle cx="7" cy="7" r="4.6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="m10.4 10.4 3.4 3.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  arrow: (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden className="ico">
      <path d="M2 6h8M7 3l3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

/** A check that draws itself (stroke dash), at 12 px. */
function Tick({ k }: { k?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden className="ico">
      <path data-k={k} d="M2.5 6.4 L5 8.8 L9.6 3.4" pathLength={1} strokeDasharray="1 2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** a mm:ss clock */
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export function PracticeTourScene() {
  return (
    <Scene
      n={7}
      w={720}
      h={600}
      label="A calm practice homepage, and what comes with it: its four other pages, the phone, the booking button, the Google result, the owner, the how-to video, thirty days of fixes"
      build={(q, tl) => {
        const cur = q('cursor');
        const open = (el: HTMLElement | null, at: number, dur = 0.26) => tl.from(el, { clip: SHUT }).to(el, { clip: OPEN }, at, dur, E.out);
        const fold = (el: HTMLElement | null, at: number, dur = 0.12) => tl.to(el, { clip: SHUT }, at, dur, E.in);

        /* 0 → 1: the homepage, and its four other pages come out from behind it */
        open(q('site'), 0.04, 0.32);
        tl.from(q('s.home'), { sx: 0 }).to(q('s.home'), { sx: 1 }, 0.36, 0.1, E.soft).to(q('s.home'), { sx: 0 }, 1.02, 0.06, E.in);
        q.all('pg.').forEach((el, i) => {
          tl.from(el, { x: -(PG.w - 4), o: 0 }).set(el, { o: 1 }, 0.36);
          tl.to(el, { x: 0 }, 0.4 + i * 0.07, 0.32, E.out);
          tl.to(el, { x: -(PG.w - 4) }, 1.02 + (3 - i) * 0.03, 0.16, E.in);
          tl.set(el, { o: 0 }, 1.3);
        });

        /* 1 → 2: works on every phone */
        tl.from(q('phone'), { y: 90, clip: PH_SHUT }).to(q('phone'), { y: 0, clip: PH_OPEN }, 1.24, 0.4, E.out);
        tl.from(q('ph.lime'), { sx: 0 }).to(q('ph.lime'), { sx: 1 }, 1.62, 0.1, E.soft).to(q('ph.lime'), { sx: 0 }, 2.0, 0.06, E.in);

        /* 2 → 3: one clear next step: the button (on the phone too), clicked, opens the ways to book */
        // the pointer rests on the button's right end, clear of its words
        const btn = tp(S.btn.x + S.btn.w - 13, S.btn.y + S.btn.h / 2);
        tl.from(cur, { x: 300, y: 640, o: 0 });
        tl.to(cur, { o: 1 }, 2.06, 0.03, E.lin)
          .to(cur, { x: btn.x - 4, y: btn.y - 4 }, 2.06, 0.28, E.soft)
          .to(cur, { s: 0.86 }, 2.4, 0.03, E.lin)
          .to(cur, { s: 1 }, 2.43, 0.03, E.lin);
        tl.from(q('bk.ring'), { dash: 1.1 }).to(q('bk.ring'), { dash: 0 }, 2.22, 0.18, E.soft);
        tl.to(q('s.btn'), { s: 0.96 }, 2.4, 0.03, E.out).to(q('s.btn'), { s: 1 }, 2.43, 0.05, E.out);
        open(q('bk'), 2.46, 0.26);
        q.all('bk.l').forEach((el, i) =>
          tl.from(el, { clip: 'inset(0% 100% 0% 0%)' }).to(el, { clip: 'inset(0px -12px 0px -12px)' }, 2.56 + i * 0.05, 0.16, E.out),
        );
        const pick = { x: BK.x + 186, y: BK.y + 150 };
        tl.to(cur, { x: pick.x, y: pick.y }, 2.74, 0.14, E.soft).to(cur, { s: 0.86 }, 2.88, 0.03, E.lin).to(cur, { s: 1 }, 2.91, 0.03, E.lin);
        tl.from(q('bk.sel'), { sx: 0 }).to(q('bk.sel'), { sx: 1 }, 2.9, 0.08, E.out);

        /* 3 → 4: found on Google */
        fold(q('bk'), 3.02);
        tl.to(q('bk.ring'), { dash: -1.1 }, 3.02, 0.12, E.in);
        tl.to(cur, { x: 300, y: 640 }, 3.02, 0.16, E.in).to(cur, { o: 0 }, 3.15, 0.03, E.lin);
        tl.to(q('phone'), { y: 40, clip: 'inset(100% 0% 0% 0% round 30px)' }, 3.04, 0.14, E.in);
        open(q('gg'), 3.16, 0.26);
        tl.from(q('gg.caret'), { o: 0 }).to(q('gg.caret'), { o: 1 }, 3.3, 0.01, E.lin);
        tl.type(q('gg.q'), 3.32, 0.16, q('gg.caret'));
        ['gg.src', 'gg.t', 'gg.d1', 'gg.d2', 'gg.links'].forEach((k, i) => wipe(tl, q(k), 3.52 + i * 0.045, 0.18));
        tl.from(q('gg.mk'), { sx: 0 }).to(q('gg.mk'), { sx: 1 }, 3.8, 0.12, E.soft);

        /* 4 → 5: you own it */
        fold(q('gg'), 4.02);
        open(q('own'), 4.14, 0.26);
        q.all('own.r').forEach((el, i) => wipe(tl, el, 4.26 + i * 0.05, 0.18));
        tl.from(q('own.you'), { clip: 'inset(0% 100% 0% 0% round 15px)' }).to(q('own.you'), { clip: 'inset(0% 0% 0% 0% round 15px)' }, 4.4, 0.14, E.out);

        /* 5 → 6: a short how-to video: the text edited in it */
        fold(q('own'), 5.02);
        open(q('vid'), 5.14, 0.26);
        const vcur = q('vid.cur');
        tl.from(vcur, { x: 300, y: 200 });
        tl.to(vcur, { x: 0, y: 0 }, 5.36, 0.18, E.soft)
          .to(vcur, { s: 0.86 }, 5.55, 0.02, E.lin)
          .to(vcur, { s: 1 }, 5.57, 0.02, E.lin)
          .to(vcur, { s: 0.86 }, 5.59, 0.02, E.lin)
          .to(vcur, { s: 1 }, 5.61, 0.02, E.lin)
          .to(vcur, { x: 120, y: 70 }, 5.64, 0.2, E.soft);
        tl.from(q('vid.sel'), { o: 0 }).set(q('vid.sel'), { o: 1 }, 5.6).set(q('vid.sel'), { o: 0 }, 5.66);
        tl.set(q('vid.old'), { o: 0 }, 5.66);
        tl.from(q('vid.caret'), { o: 0 }).set(q('vid.caret'), { o: 1 }, 5.66);
        tl.type(q('vid.new'), 5.66, 0.1, q('vid.caret'));
        tl.from(q('vid.bar'), { sx: 0.3 }).to(q('vid.bar'), { sx: 0.52 }, 5.3, 0.6, E.lin);
        const time = q('vid.time');
        let shown = '';
        tl.on((t) => {
          const u = Math.min(1, Math.max(0, (t - 5.3) / 0.6));
          const s = clock(150 * (0.3 + 0.22 * u)) + ' / 2:30';
          if (time && s !== shown) time.textContent = shown = s;
        });

        /* 6 → 7: thirty days of small fixes */
        fold(q('vid'), 6.02);
        open(q('cal'), 6.14, 0.26);
        q.all('cal.r').forEach((el, i) => wipe(tl, el, 6.26 + i * 0.04, 0.16));
        q.all('cal.c').forEach((el, i) => tl.from(el, { dash: 1.1 }).to(el, { dash: 0 }, 6.5 + i * 0.07, 0.1, E.soft));
        tl.from(q('cal.today'), { bg: 'rgba(18, 20, 23, 0.045)' }).to(q('cal.today'), { bg: '#b8ff00' }, 6.8, 0.04, E.lin);
        tl.from(q('cal.todayn'), { color: 'rgba(18, 20, 23, 0.6)' }).to(q('cal.todayn'), { color: '#0c1300' }, 6.8, 0.04, E.lin);
        wipe(tl, q('cal.foot'), 6.82, 0.14);
      }}
    >
      {PAGES.map((p, i) => (
        <A key={p.t} k={`pg.${i}`} x={PG.x} y={PG.y + i * (PG.h + PG.gap)} w={PG.w} h={PG.h} r={10} c="prc-card prc-pg prc-light">
          <span className="prc-pg-path">willowcounseling.com{p.path}</span>
          <span className="prc-serif prc-pg-t">{p.t}</span>
          <span className="prc-pg-d">{p.d}</span>
        </A>
      ))}
      <SiteWindow x={TA.x} y={TA.y} z={TZ} live={false}>
        <svg className="prc-ring" style={{ left: S.btn.x - 6, top: S.btn.y - 6 }} width={S.btn.w + 12} height={S.btn.h + 12} aria-hidden>
          <rect data-k="bk.ring" x="0.75" y="0.75" width={S.btn.w + 10.5} height={S.btn.h + 10.5} rx={(S.btn.h + 10.5) / 2} pathLength={1} strokeDasharray="1 2" strokeLinecap="round" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </SiteWindow>
      <PhoneSite x={PH_AT.x} y={PH_AT.y} />

      {/* the ways to book */}
      <A k="bk" x={BK.x} y={BK.y} w={BK.w} r={12} c="prc-card prc-pop prc-light">
        <span className="prc-pop-t">Book a free consultation</span>
        <span data-k="bk.l0" className="prc-pop-row">
          {Ico.phone}
          <b>Call</b>
          <em>(503) 555 0142</em>
        </span>
        <span data-k="bk.l1" className="prc-pop-row">
          {Ico.mail}
          <b>Email</b>
          <em>hello@willowcounseling.com</em>
        </span>
        <span data-k="bk.l2" className="prc-pop-row">
          <i data-k="bk.sel" className="prc-lime" />
          {Ico.cal}
          <b>Book online</b>
          <em>
            Pick a time {Ico.arrow}
          </em>
        </span>
      </A>

      {/* the search result */}
      <A k="gg" x={GG.x} y={GG.y} w={GG.w} h={GG.h} r={12} c="prc-card prc-gg prc-light">
        <span className="prc-gg-bar">
          {Ico.search}
          <span className="prc-gg-qwrap">
            <span data-k="gg.q" className="prc-gg-q">
              therapist portland anxiety
            </span>
            <span data-k="gg.caret" className="caret prc-gg-caret">
              <i />
            </span>
          </span>
        </span>
        <span data-k="gg.src" className="prc-gg-src">
          <i className="prc-serif">W</i>
          <span>
            <b>Willow Counseling</b>
            <em>willowcounseling.com</em>
          </span>
        </span>
        <span data-k="gg.t" className="prc-gg-t">
          Willow Counseling · Therapy in Portland
        </span>
        <span data-k="gg.d1" className="prc-gg-d">
          Individual and couples therapy for{' '}
          <span className="prc-mk">
            <i data-k="gg.mk" />
            anxiety in Portland
          </span>
          ,
        </span>
        <span data-k="gg.d2" className="prc-gg-d">
          and online. Book a free consultation.
        </span>
        <span data-k="gg.links" className="prc-gg-links">
          <span>About</span>
          <span>Specialties</span>
          <span>Fees and Insurance</span>
          <span>Contact</span>
        </span>
      </A>

      {/* the owner */}
      <A k="own" x={OWN.x} y={OWN.y} w={OWN.w} r={12} c="prc-card prc-own prc-light">
        <span className="prc-own-t">Your website</span>
        <span data-k="own.r0" className="prc-own-row">
          <span>Owner</span>
          <b data-k="own.you" className="prc-own-you">
            You
          </b>
        </span>
        <span data-k="own.r1" className="prc-own-row">
          <span>Domain</span>
          <em>
            <Lock /> willowcounseling.com
          </em>
        </span>
        <span data-k="own.r2" className="prc-own-row prc-own-note">
          <Tick /> Hosting billed to you, in your name
        </span>
      </A>

      {/* the how-to video */}
      <A k="vid" x={VID.x} y={VID.y} w={VID.w} h={VID.h} r={12} c="prc-vid">
        <span className="prc-vid-top">
          <b>How to edit your text</b>
          <span>2:30</span>
        </span>
        <span className="prc-vid-screen prc-light">
          <span className="prc-ed-bar">
            <span>Editing · Home</span>
            <b>Save</b>
          </span>
          <span className="prc-serif prc-ed-h1">A calm place to begin.</span>
          <span className="prc-ed-block">
            <span className="prc-ed-line">
              Now booking for{' '}
              <span className="prc-ed-word">
                <i data-k="vid.sel" className="prc-ed-sel" />
                <span data-k="vid.old">June.</span>
                <span className="prc-ed-new">
                  <span data-k="vid.new">July.</span>
                  <span data-k="vid.caret" className="caret prc-ed-caret">
                    <i />
                  </span>
                </span>
              </span>
            </span>
          </span>
          <span className="prc-ed-sub">Individual and couples therapy, in Portland and online.</span>
          <span className="prc-ed-pic">
            <Room />
          </span>
          <Cursor k="vid.cur" x={146} y={110} />
        </span>
        <span className="prc-vid-ctl">
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden className="ico">
            <rect x="2.5" y="2" width="2.4" height="8" rx="0.6" fill="currentColor" />
            <rect x="7.1" y="2" width="2.4" height="8" rx="0.6" fill="currentColor" />
          </svg>
          <span className="prc-vid-track">
            <i data-k="vid.bar" />
          </span>
          <span data-k="vid.time" className="prc-vid-time">
            0:45 / 2:30
          </span>
        </span>
      </A>

      {/* thirty days of small fixes */}
      <A k="cal" x={CAL.x} y={CAL.y} w={CAL.w} r={12} c="prc-card prc-cal prc-light">
        <span className="prc-cal-k">After launch</span>
        <span className="prc-cal-t">30 days of small fixes</span>
        <span className="prc-cal-row prc-cal-dow">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </span>
        {[0, 1, 2, 3, 4].map((r) => (
          <span key={r} data-k={`cal.r${r}`} className="prc-cal-row">
            {[1, 2, 3, 4, 5, 6, 7].map((c) => {
              const d = r * 7 + c;
              if (d > 30) return <span key={c} className="prc-day is-none" />;
              const fix = FIXES.indexOf(d);
              const today = d === TODAY;
              return (
                <span key={c} data-k={today ? 'cal.today' : undefined} className={`prc-day${fix >= 0 ? ' is-fix' : ''}${d > TODAY ? ' is-later' : ''}`}>
                  <b data-k={today ? 'cal.todayn' : undefined}>{d}</b>
                  {fix >= 0 && <Tick k={`cal.c${fix}`} />}
                </span>
              );
            })}
          </span>
        ))}
        <span data-k="cal.foot" className="prc-cal-foot">
          <Tick /> {FIXES.length} small fixes so far · {30 - TODAY} days to go
        </span>
      </A>
      <Cursor />
    </Scene>
  );
}

/* ---------------------------------------------------------------------------
   PracticeHero: the homepage, live, with its phone
--------------------------------------------------------------------------- */

const HZ = 0.86;
const HA = { x: 0, y: 48 };
const HP = { x: 404, y: 176 };

export function PracticeHero() {
  return (
    <Scene
      n={1}
      w={600}
      h={600}
      intro="load"
      label="Willow Counseling's calm homepage, live at willowcounseling.com, with its phone"
      build={(q, tl) => {
        // the window opens on the page; its headline is set, its room comes in from the floor up
        tl.from(q('site'), { clip: SHUT }).to(q('site'), { clip: OPEN }, 0.0, 0.3, E.out);
        wipe(tl, q('s.h1a'), 0.1, 0.22);
        wipe(tl, q('s.h1b'), 0.15, 0.22);
        tl.from(q('s.pic'), { clip: 'inset(100% 0% 0% 0% round 8px)' }).to(q('s.pic'), { clip: 'inset(0% 0% 0% 0% round 8px)' }, 0.13, 0.36, E.out);
        // its address typed in behind a lock, live, and its phone beside it
        tl.from(q('url.lock'), { o: 0 }).to(q('url.lock'), { o: 1 }, 0.4, 0.01, E.lin);
        tl.type(q('url.new'), 0.41, 0.16);
        wipe(tl, q('live'), 0.6, 0.08);
        tl.from(q('phone'), { y: 90, clip: PH_SHUT }).to(q('phone'), { y: 0, clip: PH_OPEN }, 0.5, 0.44, E.out);
      }}
    >
      <SiteWindow x={HA.x} y={HA.y} z={HZ} />
      <PhoneSite x={HP.x} y={HP.y} />
    </Scene>
  );
}
