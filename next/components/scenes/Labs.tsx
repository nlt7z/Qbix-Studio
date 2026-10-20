'use client';

import '@/app/scenes-labs.css';
import Scene from '@/components/scene/Scene';
import { A, Lock, Play, Check, cut, notch } from '@/components/scene/kit';
import { BidTable } from '@/components/scenes/BidKing';
import { E } from '@/lib/scene/timeline';

/**
 * Qbix Labs: four products in one window, one after another, as the list
 * beside it names them.
 * 1 · Strata, live, at stratadesign.app: a wall of inspiration (photographs,
 *     public/art), its colours pinned on it in glass, and the system it makes
 *     beside it: colours, type, components, tokens;
 * 2 · AI Bidding, live: Bid King, drawn (BidKing.tsx): a sealed lot on the
 *     room's currents, the table, your bid;
 * 3 · TTS Editor, on the way: a voice's waveform, its pitch drawn over it, and
 *     a frosted sheet over its lower half with the script (the playhead lights
 *     it word by word) and three dials;
 * 4 · Interview Assistant, on the way: a call; frosted over it, the live
 *     captions and the assistant, whose hints arrive while the candidate talks.
 * Each move: the window's address is selected and the next one typed; then
 * the next product pushes up into the window, and its name (its tag with it)
 * into the title above. Each product's own parts come in as it settles.
 * Square, like the site; the lime is the product's own (its accent, its bid).
 */

const TOP = 20; // the names
const TH = 46;
const WY = TOP + TH + 16; // the window
const CH = 420; // its content, 718 × 420
const CW = 718;

const PRODUCTS = [
  { name: 'Strata', live: true, url: 'stratadesign.app', lock: true },
  { name: 'AI Bidding', live: true, url: 'Bid King' },
  { name: 'TTS Editor', live: false, url: 'Voiceover, take 3' },
  { name: 'Interview Assistant', live: false, url: 'Interview with Sam' },
];

/* --- Strata: the wall of inspiration, and the system it makes ------------------ */
const WALL = { x: 16, y: 40, w: 100, h: 166, gap: 8 };
const WALL_PICS: [string, string?][][] = [
  [['ribbon', '58% 50%'], ['wall', '50% 70%'], ['slices']],
  [['curves'], ['block', '40% 50%'], ['ring', '62% 50%']],
];
const cell = (c: number, r: number) => ({ x: WALL.x + c * (WALL.w + WALL.gap), y: WALL.y + r * (WALL.h + WALL.gap) });
// a colour read off a picture: the point, and the glass tag pinned beside it
const PINS: { c: number; r: number; px: number; py: number; hex: string }[] = [
  { c: 2, r: 0, px: 52, py: 96, hex: '#B8FF00' },
  { c: 1, r: 1, px: 44, py: 118, hex: '#6E8F1A' },
  { c: 0, r: 0, px: 22, py: 26, hex: '#121417' },
  { c: 0, r: 1, px: 70, py: 52, hex: '#E6E9E3' },
];
const SYS = { x: 356 };
const SWATCHES: [string, string, string][] = [
  ['Lime', '#B8FF00', 'var(--lime)'],
  ['Moss', '#6E8F1A', '#6e8f1a'],
  ['Ink', '#121417', '#121417'],
  ['Mist', '#E6E9E3', '#e6e9e3'],
];

/* --- the TTS Editor: a voice, 4.2 s of it ---------------------------------- */
// the waveform's stage (in its panel); a frosted sheet floats over its lower part
const WF = { x: 20, y: 60, w: 678, h: 344 };
const PX0 = 16;
const PX1 = WF.w - 16; // the plot, in the stage
const DUR = 4.2;
const pxs = (PX1 - PX0) / DUR;
const sx = (s: number) => PX0 + s * pxs;
const MID = 172; // the waveform's middle; the pitch is drawn above it
const py = (p: number) => 40 + (1 - p) * (MID - 58);
const SHEET = { x: 36, y: 258, w: 646, h: 130 };
// what's said: [word, from, to (s), loudness]
const SAID: [string, number, number, number][] = [
  ['Welcome', 0.12, 0.66, 0.95],
  ['back.', 0.72, 1.08, 0.8],
  ['Today,', 1.68, 2.12, 0.9],
  ['we', 2.18, 2.34, 0.55],
  ['take', 2.4, 2.78, 0.85],
  ['it', 2.84, 2.98, 0.5],
  ['slow.', 3.04, 3.86, 0.82],
];
const PAUSE: [number, number] = [1.08, 1.68];
const NOW = 3.4; // where the playhead stops (in "slow.")
// the pitch, sentence by sentence: [s, pitch 0..1]; the dots are its points at each word's middle
const PITCH: [number, number][][] = [
  [[0.12, 0.5], [0.39, 0.72], [0.9, 0.46], [1.08, 0.32]],
  [[1.68, 0.52], [1.9, 0.76], [2.26, 0.62], [2.59, 0.7], [2.91, 0.56], [3.45, 0.38], [3.86, 0.22]],
];
const DOTS: [number, number][] = [...PITCH[0].slice(1, 3), ...PITCH[1].slice(1, 6)];

/** A smooth line through the points (Catmull-Rom, as cubic Béziers). */
function through(pts: [number, number][]) {
  const P = pts.map(([s, p]) => [sx(s), py(p)]);
  const f = (n: number) => n.toFixed(1);
  let d = `M${f(P[0][0])} ${f(P[0][1])}`;
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[i - 1] ?? P[i];
    const p1 = P[i];
    const p2 = P[i + 1];
    const p3 = P[i + 2] ?? p2;
    d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}

// the waveform: a bar every 5 px, each word a swell, the pause and the ends flat
const BARS: [number, number][] = [];
for (let x = PX0, i = 0; x <= PX1 - 3; x += 5, i++) {
  const s = (x + 1.5 - PX0) / pxs;
  const w = SAID.find(([, a, b]) => s >= a && s <= b);
  let h = 2;
  if (w) {
    const [, a, b, loud] = w;
    const env = Math.pow(Math.sin((Math.PI * (s - a)) / (b - a)), 0.55);
    const r = Math.abs((Math.sin(i * 12.9898 + 4.1) * 43758.5453) % 1);
    h = Math.max(2, Math.round(env * loud * (0.45 + 0.55 * r) * 200));
  }
  BARS.push([x, h]);
}

function Wave({ c }: { c: string }) {
  return (
    <svg className={c} width={WF.w} height={WF.h} viewBox={`0 0 ${WF.w} ${WF.h}`} aria-hidden>
      {BARS.map(([x, h]) => (
        <rect key={x} x={x} y={MID - h / 2} width={3} height={h} />
      ))}
    </svg>
  );
}

const SLIDERS: [string, string, number][] = [
  ['Pitch', '+2 st', 0.62],
  ['Pace', '0.9×', 0.42],
  ['Warmth', '70%', 0.7],
];

/* --- the Interview Assistant: a call, the assistant and the captions frosted over it --- */
const SIDE = { x: 422, y: 16, w: 280, h: 388 };
const HINTS = { x: 438, w: 248, h: 60, y: [56, 124, 192] };
const HINT = ['Ask what they measured', 'How big was the team?', 'Led the rebuild.'];
const CAPS = { x: 16, y: 336, w: 390, h: 68 };

export default function Labs() {
  return (
    <Scene
      n={4}
      w={720}
      h={560}
      label="Qbix Labs, four products in one window: Strata turning a wall of pictures into a design system, Bid King's blind auction table, then the TTS Editor and the Interview Assistant, on the way"
      build={(q, tl) => {
        const win = q('win');
        const panels = q('panels');
        const name = (i: number) => q(`name.${i}`);
        PRODUCTS.forEach((_, i) => {
          tl.from(name(i), { y: TH });
          tl.from(q(`url.sel.${i}`), { sx: 0 });
        });

        /* 0 → 1: the window opens, its address is typed, Strata comes up into it */
        // (drawn as the chapter comes up the screen: late enough to be seen)
        tl.from(win, { clip: 'inset(-12% -10% 100% -10%)' }).to(win, { clip: 'inset(-12% -10% -14% -10%)' }, 0.16, 0.24, E.out);
        tl.type(q('url.0'), 0.3, 0.15);
        tl.from(panels, { y: CH }).to(panels, { y: 0 }, 0.48, 0.32, E.out);
        tl.to(name(0), { y: 0 }, 0.56, 0.26, E.out);

        /* k → k+1: the address selected, the next one typed; the next product pushes up */
        PRODUCTS.slice(1).forEach((p, j) => {
          const k = j + 1;
          const at = k;
          tl.to(q(`url.sel.${j}`), { sx: 1 }, at + 0.02, 0.06, E.soft);
          tl.to(q(`url.${j}`), { o: 0 }, at + 0.09, 0.005, E.lin);
          tl.type(q(`url.${k}`), at + 0.1, Math.max(0.08, p.url.length * 0.0095));
          tl.to(panels, { y: -CH * k }, at + 0.28, 0.3, E.move);
          // the name goes up and out, then the next one comes up in (its tag with it: never two tags at once)
          tl.to(name(j), { y: -TH }, at + 0.3, 0.1, E.in);
          tl.to(name(k), { y: 0 }, at + 0.4, 0.2, E.out);
        });

        /* Strata, settling: its colours are read off the pictures and pinned; the system is set beside them */
        PINS.forEach((_, i) => {
          tl.from(q(`st.pt.${i}`), { s: 0 }).to(q(`st.pt.${i}`), { s: 1 }, 0.72 + i * 0.03, 0.05, E.out);
          tl.from(q(`st.tag.${i}`), { clip: notch(10, [0, 100, 0, 0]) }).to(q(`st.tag.${i}`), { clip: notch(10) }, 0.74 + i * 0.03, 0.07, E.out);
          tl.from(q(`st.sw.${i}`), { clip: [100, 0, 0, 0] }).to(q(`st.sw.${i}`), { clip: [0, 0, 0, 0] }, 0.78 + i * 0.025, 0.08, E.out);
        });
        tl.from(q('st.type'), { clip: [0, 100, 0, 0] }).to(q('st.type'), { clip: [0, 0, 0, 0] }, 0.86, 0.08, E.out);
        q.all('st.ui.').forEach((el, i) => {
          const t = 0.88 + i * 0.02;
          // the button keeps its cut corner as it opens
          if (i === 0) tl.from(el, { clip: cut(10, 100) }).to(el, { clip: cut(10) }, t, 0.07, E.out);
          else tl.from(el, { clip: [0, 100, 0, 0] }).to(el, { clip: [0, 0, 0, 0] }, t, 0.07, E.out);
        });
        tl.type(q('st.code.0'), 0.92, 0.04).type(q('st.code.1'), 0.95, 0.03);

        /* Bid King, settling: the table fills, the read comes in, the bid is up */
        [0, 1, 2, 3].forEach((i) => {
          tl.from(q(`bid.p${i}`), { clip: [0, 100, 0, 0] }).to(q(`bid.p${i}`), { clip: [0, 0, 0, 0] }, 1.6 + i * 0.03, 0.08, E.out);
        });
        tl.from(q('bid.read'), { clip: [100, 0, 0, 0] }).to(q('bid.read'), { clip: [0, 0, 0, 0] }, 1.72, 0.08, E.out);
        tl.from(q('bid.meter'), { sx: 0 }).to(q('bid.meter'), { sx: 1 }, 1.76, 0.12, E.soft);
        tl.from(q('bid.bar'), { y: 20, clip: notch(16, [100, 0, 0, 0]) }).to(q('bid.bar'), { y: 0, clip: notch(16) }, 1.8, 0.1, E.out);

        /* 2 → 3, then: the pitch is drawn over the voice, and the playhead reads it out */
        const draw = (el: HTMLElement | null, pts: [number, number][], at: number, dur: number) => {
          // dashes of 1 with gaps of 2, offset past the start: no stray cap before it's drawn
          tl.from(el, { dash: 1.05 }).to(el, { dash: 0 }, at, dur, E.lin);
          const x0 = sx(pts[0][0]);
          const x1 = sx(pts[pts.length - 1][0]);
          return (s: number) => at + (dur * (sx(s) - x0)) / (x1 - x0);
        };
        const on1 = draw(q('tts.c0'), PITCH[0], 2.58, 0.05);
        const on2 = draw(q('tts.c1'), PITCH[1], 2.635, 0.075);
        DOTS.forEach(([s], i) => {
          const at = s < PAUSE[0] ? on1(s) : on2(s);
          tl.from(q(`tts.dot.${i}`), { o: 0 }).to(q(`tts.dot.${i}`), { o: 1 }, at, 0.004, E.lin);
        });
        const PH = { at: 2.72, dur: 0.24 };
        const beatOf = (s: number) => PH.at + (PH.dur * s) / NOW;
        tl.to(q('tts.ph'), { x: sx(NOW) - PX0 }, PH.at, PH.dur, E.lin);
        const R = (s: number) => ((WF.w - sx(s)) / WF.w) * 100;
        tl.from(q('tts.played'), { clip: [0, R(0), 0, 0] }).to(q('tts.played'), { clip: [0, R(NOW), 0, 0] }, PH.at, PH.dur, E.lin);
        // the word being said, lit: from word to word as the playhead reaches each; none in the pause
        const mark = q('tts.mark');
        const words = SAID.map((_, i) => q(`tts.w.${i}`));
        const box = (el: HTMLElement | null) => (el ? { x: el.offsetLeft - 3, w: el.offsetWidth + 6 } : { x: 0, w: 0 });
        const resume = SAID.findIndex(([, a]) => a >= PAUSE[1]);
        tl.from(mark, { ...box(words[0]), o: 0 });
        SAID.forEach(([, a], i) => {
          if (a > NOW) return;
          if (i > 0) tl.set(mark, box(words[i]), beatOf(a));
          if (i === 0 || i === resume) tl.set(mark, { o: 1 }, beatOf(a));
        });
        tl.set(mark, { o: 0 }, beatOf(PAUSE[0]));
        // playing while the playhead runs
        tl.from(q('tts.pause'), { o: 0 }).to(q('tts.pause'), { o: 1 }, PH.at, 0.004, E.lin).to(q('tts.pause'), { o: 0 }, PH.at + PH.dur, 0.004, E.lin);
        tl.to(q('tts.play'), { o: 0 }, PH.at, 0.004, E.lin).to(q('tts.play'), { o: 1 }, PH.at + PH.dur, 0.004, E.lin);
        // the time, counted
        const tc = q('tts.tc');
        let shown = '';
        tl.on((t) => {
          const s = Math.min(1, Math.max(0, (t - PH.at) / PH.dur)) * NOW;
          const txt = `0:0${s.toFixed(1)}`;
          if (tc && txt !== shown) {
            tc.textContent = txt;
            shown = txt;
          }
        });

        /* 3 → 4, then: Sam answers, and the hints come in, the newest lit */
        const SAYS = { at: 3.58, dur: 0.12 };
        tl.type(q('int.l1'), SAYS.at, SAYS.dur);
        // his voice moves the bars by his name while he talks
        const bars = [0, 1, 2].map((i) => q(`int.bar.${i}`));
        let said = '';
        tl.on((t) => {
          const talking = t > SAYS.at && t < SAYS.at + SAYS.dur;
          const hs = bars.map((_, i) => (talking ? 3 + Math.round(9 * Math.abs(Math.sin(t * 260 + i * 2.1))) : [4, 7, 5][i]));
          const key = hs.join();
          if (key === said) return;
          said = key;
          bars.forEach((b, i) => b && (b.style.height = `${hs[i]}px`));
        });
        const card = (i: number, at: number) =>
          [q(`int.r${i}`), q(`int.h${i}`)].forEach((el) =>
            tl.from(el, { y: 10, clip: 'inset(100% 0% 0% 0%)' }).to(el, { y: 0, clip: 'inset(0% 0% 0% 0%)' }, at, 0.08, E.out),
          );
        // the lime is one block that moves to the newest hint; it carries the hints' words in ink, held in place inside it
        const cur = q('int.cur');
        const ink = q('int.cur.ink');
        const step = HINTS.y[1] - HINTS.y[0];
        card(0, 3.7);
        tl.from(cur, { clip: notch(24, [0, 100, 0, 0]) }).to(cur, { clip: notch(24) }, 3.74, 0.045, E.out);
        card(1, 3.8);
        tl.to(cur, { y: step }, 3.855, 0.05, E.move);
        tl.to(ink, { y: -step }, 3.855, 0.05, E.move);
        card(2, 3.9);
      }}
    >
      {/* --- the names, in a mask: each product's name with its tag --- */}
      <A x={0} y={TOP} w={720} h={TH} c="labs-titles">
        {PRODUCTS.map((p, i) => (
          <div key={p.name} data-k={`name.${i}`} className="labs-row">
            <span className="f-head labs-name">{p.name}</span>
            {p.live ? <span className="live">Live</span> : <span className="labs-soon">Soon</span>}
          </div>
        ))}
      </A>

      {/* --- the window --- */}
      <A k="win" x={0} y={WY} w={720} h={2 + 36 + CH} c="win">
        <div className="win-bar">
          <span className="win-dots" aria-hidden>
            <i />
            <i />
            <i />
          </span>
          <span className="win-url labs-url">
            {PRODUCTS.map((p, i) => (
              <span key={p.url} data-k={`url.${i}`} className="labs-url-item">
                <i data-k={`url.sel.${i}`} className="labs-url-sel" />
                {p.lock && (
                  <span className="labs-lock">
                    <Lock />
                  </span>
                )}
                <span>{p.url}</span>
              </span>
            ))}
          </span>
        </div>
        <div className="win-body labs-body">
          <div data-k="panels" className="labs-panels" style={{ height: 4 * CH }}>
            {/* 1 · Strata: the wall of inspiration, its colours pinned in glass; the system beside it */}
            <div className="labs-panel" style={{ top: 0, height: CH }}>
              <A x={WALL.x} y={14} c="labs-k">
                Inspiration · 6
              </A>
              {WALL_PICS.map((row, r) =>
                row.map(([src, pos], c) => (
                  <A key={src} x={cell(c, r).x} y={cell(c, r).y} w={WALL.w} h={WALL.h} c="labs-pic">
                    <img src={`/art/${src}.webp`} alt="" draggable={false} decoding="async" style={pos ? { objectPosition: pos } : undefined} />
                  </A>
                )),
              )}
              {PINS.map((p, i) => {
                const o = cell(p.c, p.r);
                const right = p.c < 2;
                return (
                  <div key={p.hex}>
                    <i data-k={`st.pt.${i}`} className="a round labs-pt-ring" style={{ left: o.x + p.px - 6, top: o.y + p.py - 6 }} />
                    <A
                      k={`st.tag.${i}`}
                      x={right ? o.x + p.px + 10 : o.x + p.px - 10 - 92}
                      y={o.y + p.py - 13}
                      w={92}
                      h={26}
                      c="glass labs-tag notch"
                    >
                      <i style={{ background: p.hex }} />
                      {p.hex}
                    </A>
                  </div>
                );
              })}
              <A x={SYS.x} y={14} w={346} c="labs-k labs-k--row">
                <span>System</span>
                <span className="faint">v1.0</span>
              </A>
              {SWATCHES.map(([name, hex, bg], i) => (
                <A key={name} k={`st.sw.${i}`} x={SYS.x + i * 88} y={40} w={80} h={92} c="labs-sw">
                  <i style={{ background: bg }} />
                  <span>{name}</span>
                  <em>{hex}</em>
                </A>
              ))}
              <A k="st.type" x={SYS.x} y={148} w={346} h={62} c="labs-type">
                <span className="f-head labs-aa">Aa</span>
                <span className="labs-scale">
                  <span>
                    Display <i>48 / 52</i>
                  </span>
                  <span>
                    Title <i>28 / 32</i>
                  </span>
                  <span>
                    Body <i>15 / 24</i>
                  </span>
                </span>
              </A>
              <A k="st.ui.0" x={SYS.x} y={226} w={130} h={38} c="labs-ui-btn">
                Get started
              </A>
              <A k="st.ui.1" x={SYS.x + 140} y={226} w={92} h={38} c="labs-ui-line">
                Docs
              </A>
              <A k="st.ui.2" x={SYS.x + 242} y={233} h={24} c="labs-ui-tag">
                New
              </A>
              <A k="st.ui.3" x={SYS.x} y={274} w={232} h={38} c="labs-ui-field">
                you@studio.com
              </A>
              <A k="st.ui.4" x={SYS.x + 242} y={282} w={40} h={22} c="labs-ui-toggle">
                <i />
              </A>
              <A x={SYS.x} y={324} w={346} h={56} c="labs-code f-mono">
                <span data-k="st.code.0" className="t">
                  --color-accent: <b>#B8FF00</b>;
                </span>
                <span data-k="st.code.1" className="t">
                  --space-4: 16px;
                </span>
              </A>
            </div>

            {/* 2 · AI Bidding: Bid King, drawn */}
            <div className="labs-panel labs-dark" style={{ top: CH, height: CH }}>
              <BidTable />
            </div>

            {/* 3 · TTS Editor: the voice on its stage, the script and the dials frosted over it */}
            <div className="labs-panel" style={{ top: 2 * CH, height: CH }}>
              <A x={0} y={0} w={CW} h={48} c="labs-tb">
                <span className="labs-play">
                  <span data-k="tts.play" className="labs-ico">
                    <Play size={10} />
                  </span>
                  <span data-k="tts.pause" className="labs-ico">
                    <svg width={10} height={10} viewBox="0 0 10 10" aria-hidden className="ico">
                      <rect x={2} y={1.5} width={2.2} height={7} fill="currentColor" />
                      <rect x={5.8} y={1.5} width={2.2} height={7} fill="currentColor" />
                    </svg>
                  </span>
                </span>
                <span className="labs-tc">
                  <span data-k="tts.tc">0:00.0</span>
                  <i> / 0:04.2</i>
                </span>
                <span className="labs-voice">
                  <i>Voice</i> Ava
                </span>
              </A>
              <A x={WF.x} y={WF.y} w={WF.w} h={WF.h} c="labs-wf">
                {[0, 1, 2, 3, 4].map((s) => (
                  <span key={s} className="a labs-ruler" style={{ left: sx(s), top: 10, transform: 'translateX(-50%)' }}>
                    0:0{s}
                  </span>
                ))}
                <Wave c="labs-wf-base" />
                <div data-k="tts.played" className="labs-wf-played">
                  <Wave c="labs-wf-on" />
                </div>
                <svg width={WF.w} height={WF.h} viewBox={`0 0 ${WF.w} ${WF.h}`} aria-hidden>
                  {PITCH.map((pts, i) => (
                    <path key={i} data-k={`tts.c${i}`} className="labs-curve" d={through(pts)} pathLength={1} />
                  ))}
                  {DOTS.map(([s, p], i) => (
                    <circle key={s} data-k={`tts.dot.${i}`} className="labs-pt" cx={sx(s)} cy={py(p)} r={3.5} />
                  ))}
                </svg>
                <span className="labs-gap f-label" style={{ left: sx(PAUSE[0]), width: sx(PAUSE[1]) - sx(PAUSE[0]), top: MID - 26 }}>
                  0.6s
                </span>
                <i data-k="tts.ph" className="a labs-ph" style={{ left: PX0 - 1, top: 0, height: MID + 100 }} />
              </A>
              <A x={SHEET.x} y={SHEET.y} w={SHEET.w} h={SHEET.h} c="glass labs-sheet">
                <A k="tts.line" x={20} y={18} h={32} c="labs-script">
                  <i data-k="tts.mark" className="labs-mark" />
                  <span data-k="tts.w.0">Welcome</span> <span data-k="tts.w.1">back.</span> <span className="labs-pause">0.6s</span>{' '}
                  <span data-k="tts.w.2">Today,</span> <span data-k="tts.w.3">we</span> <span data-k="tts.w.4">take</span>{' '}
                  <span data-k="tts.w.5">it</span> <span data-k="tts.w.6">slow.</span>
                </A>
                {SLIDERS.map(([k, v, f], i) => (
                  <A key={k} x={20 + i * 210} y={72} w={186} c="labs-sl">
                    <span className="labs-sl-k">{k}</span>
                    <span className="labs-sl-v">{v}</span>
                    <span className="labs-sl-track">
                      <i style={{ width: `${f * 100}%` }} />
                      <b style={{ left: `${f * 100}%` }} />
                    </span>
                  </A>
                ))}
              </A>
            </div>

            {/* 4 · Interview Assistant: the call, and frosted over it the assistant and the captions */}
            <div className="labs-panel labs-call" style={{ top: 3 * CH, height: CH }}>
              <svg className="a" width={CW} height={CH} viewBox={`0 0 ${CW} ${CH}`} aria-hidden style={{ left: 0, top: 0 }}>
                <circle cx={262} cy={172} r={60} fill="rgba(244,245,242,0.16)" />
                <path d="M42 420 C42 206 482 206 482 420 Z" fill="rgba(244,245,242,0.16)" />
              </svg>
              <A x={16} y={16} w={96} h={64} c="labs-self">
                <svg width={96} height={64} viewBox="0 0 96 64" aria-hidden>
                  <circle cx={58} cy={26} r={11} fill="rgba(244,245,242,0.22)" />
                  <path d="M32 64 C32 38 84 38 84 64 Z" fill="rgba(244,245,242,0.22)" />
                </svg>
                <span>You</span>
              </A>
              {/* the live captions */}
              <A x={CAPS.x} y={CAPS.y} w={CAPS.w} h={CAPS.h} c="glass labs-dark-glass labs-caps notch">
                <span className="labs-line labs-line--you">
                  <b>You</b>
                  <span>What was your part in it?</span>
                </span>
                <span className="labs-line">
                  <b>
                    Sam
                    <span className="labs-bars" aria-hidden>
                      <i data-k="int.bar.0" style={{ height: 4 }} />
                      <i data-k="int.bar.1" style={{ height: 7 }} />
                      <i data-k="int.bar.2" style={{ height: 5 }} />
                    </span>
                  </b>
                  <span data-k="int.l1">I led the rebuild of our checkout.</span>
                </span>
              </A>
              {/* the assistant: its hints, the newest lit, and a note */}
              <A x={SIDE.x} y={SIDE.y} w={SIDE.w} h={SIDE.h} c="glass labs-dark-glass labs-side">
                <span className="f-label">Assistant</span>
              </A>
              {HINTS.y.map((y, i) => (
                <A key={y} k={`int.r${i}`} x={HINTS.x} y={y} w={HINTS.w} h={HINTS.h} c={i === 2 ? 'labs-card labs-note' : 'labs-card'} />
              ))}
              {HINT.map((s, i) => (
                <A key={s} k={`int.h${i}`} x={HINTS.x} y={HINTS.y[i]} w={HINTS.w} h={HINTS.h} c="labs-hint">
                  <span>
                    {i === 2 && <Check size={14} />}
                    {s}
                  </span>
                </A>
              ))}
              <A k="int.cur" x={HINTS.x} y={HINTS.y[0]} w={HINTS.w} h={HINTS.h} c="labs-cur">
                <div data-k="int.cur.ink" className="labs-cur-ink">
                  {HINT.slice(0, 2).map((s, i) => (
                    <span key={s} className="labs-hint labs-hint--ink" style={{ top: HINTS.y[i] - HINTS.y[0], height: HINTS.h }}>
                      <span>{s}</span>
                    </span>
                  ))}
                </div>
              </A>
            </div>
          </div>
        </div>
      </A>
    </Scene>
  );
}
