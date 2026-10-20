'use client';

import '@/app/scenes-kova.css';
import Scene from '@/components/scene/Scene';
import { A, T } from '@/components/scene/kit';
import { E } from '@/lib/scene/timeline';

/**
 * Brand upgrade: "kova", a money app that already works, on a phone. Beside
 * it, the sheet the studio draws for each round; on the phone, what that
 * round does to the app.
 * 1 · the grid: the app as it ships (system type, everything grey, a
 *     placeholder logo, edges that don't line up). The sheet's four numbers
 *     come in one by one and each draws its part over the screen: the
 *     columns, the gutter (measured), the 8 pt baseline, the margin, which
 *     measures the greeting at 18, and everything snaps onto the grid (the
 *     tag turning a lime 24);
 * 2 · colour and type: the grid sheet folds away, the token sheet opens (ink,
 *     chalk, lime; Eurostile, Geist), and the screen re-renders in them, top
 *     to bottom: ink, the balance set in Eurostile counting up, the bars
 *     growing from their baseline, the rows sliding into place, the +4.2%
 *     chip filling with chalk;
 * 3 · the mark: a k is constructed on an icon grid (keylines, the type's
 *     guides, its outline, its fill), the lime icon comes down over it,
 *     labelled kova as on a home screen, and its mono version (a chalk tile)
 *     slides out from behind it into the app's header, where the empty logo
 *     slot was.
 * The sheet stands left of the phone, so everything it hands over travels
 * right, into the screen, and nothing crosses on its way.
 * One lime per state, and never two on screen at once: the 24 margin tag
 * (the fix the grid makes), then the lime of the colour strip (the token),
 * then the app icon (the mark). The app itself stays ink and chalk.
 */

// the phone, and its screen inside an 8 px bezel
const PH = { x: 424, y: 16, w: 280, h: 608, r: 46 };
const SCR = { x: PH.x + 8, y: PH.y + 8, w: 264, h: 592, r: 38 };
// the screen's grid: a 24 margin, four columns of 42, 16 gutters, an 8 pt baseline from under the status bar
const M = 24;
const COL = 42;
const GUT = 16;
const TOP = 44;
const colX = (i: number) => M + i * (COL + GUT);
// where the gutter is measured (between the third and fourth columns, under the balance)
const GUT_Y = 236;

// the sheet beside the phone
const L = { x: 16, w: 352 };
const HEAD_Y = 120;
const BODY_Y = HEAD_Y + 25;

const SPEC: [string, string][] = [
  ['4', 'columns'],
  ['16', 'pt gutter'],
  ['8', 'pt baseline'],
  ['24', 'pt margin'],
];
const SPEC_H = 88;

// the colours as a proportion strip, as wide as each is used: mostly ink, some chalk, a little lime
const SWATCHES: [string, string, string, number][] = [
  ['Ink', '#0B0C0E', 'ink', 192],
  ['Chalk', '#F4F5F2', 'chalk', 104],
  ['Lime', '#B8FF00', 'lime', 56],
];
const swX = (i: number) => L.x + SWATCHES.slice(0, i).reduce((n, sw) => n + sw[3], 0);
const SW_Y = BODY_Y + 46;
const SW_H = 120;
const TYPE_Y = BODY_Y + 214;

// the app's data: twelve months of spending (October, now, is the bright one), three rows
const BARS = [30, 40, 26, 46, 34, 52, 32, 44, 58, 38, 50, 44];
const MONTHS = 'NDJFMAMJJASO'.split('');
const BAR_W = 12;
const BAR_BASE = 376;
const barX = (i: number) => M + (i * (216 - BAR_W)) / 11;
const ROWS: [string, string, string][] = [
  ['Groceries', 'Today', '−$84'],
  ['Studio rent', 'Monthly', '−$1,200'],
  ['Coffee', 'Yesterday', '−$4.50'],
];
const ROW_Y = 424;
const ROW_H = 44;

// the mark: a k on a 208 icon grid (its stem and its arms' outer corners on the 76.8 circle,
// its arms at 45°, along the grid's diagonals)
const ICON = { s: 208, r: 46, x: L.x + (L.w - 208) / 2, y: 212 };
const K = 'M56 44H80V110.06L118.06 72H152L106 118L152 164H118.06L80 125.94V164H56Z';
// the type's guides it is drawn on, run out across the sheet, named at their left end
const GUIDES: [string, number][] = [
  ['ascender', 44],
  ['x-height', 72],
  ['baseline', 164],
];
// the logo slot in the app's header, in the scene
const SLOT = { x: SCR.x + M, y: SCR.y + 56, s: 32 };
// the small icon starts hidden behind the big one, near its top right corner, a little larger
const FLY0 = { x: ICON.x + 150 - 16, y: ICON.y + 70 - 16, s: 1.75 };

/** The phone's status bar (its colour is the layer's). */
function Status() {
  return (
    <div className="kova-status">
      <span>9:41</span>
      <i className="kova-island" />
      <span className="kova-sig" aria-hidden>
        <i />
        <i />
        <i />
        <i />
        <b className="kova-batt">
          <b />
        </b>
      </span>
    </div>
  );
}

/** The k, as a glyph in a 208 box. */
const KGlyph = ({ c }: { c?: string }) => (
  <svg className={c} width="208" height="208" viewBox="0 0 208 208" aria-hidden>
    <path d={K} />
  </svg>
);

export default function Kova() {
  return (
    <Scene
      n={3}
      w={720}
      h={640}
      label="kova, a money app that already works, on a phone: a layout grid drawn over it and its parts snapped onto it; then its colors and type, and the screen re-rendered in them; then its mark, built on an icon grid and set into the app's header"
      build={(q, tl) => {
        const clipIn = (el: Element | null, at: number, dur: number, from: [number, number, number, number], ease: string = E.out) =>
          tl.from(el, { clip: from }).to(el, { clip: [0, 0, 0, 0] }, at, dur, ease);

        /* 0 → 1: the app as it ships, and the grid laid over it */
        const phone = q('phone');
        tl.from(phone, { y: 80, clip: `inset(0% 0% 100% 0% round ${PH.r}px)` }).to(phone, { y: 0, clip: `inset(0% 0% 0% 0% round ${PH.r}px)` }, 0.02, 0.3, E.out);
        tl.type(q('hd.kova'), 0.12, 0.06);
        tl.type(q('hd.grid'), 0.18, 0.05);
        tl.from(q('hd.rule'), { sx: 0 }).to(q('hd.rule'), { sx: 1 }, 0.14, 0.22, E.out);

        // each number of the spec, then what it draws on the screen
        const spec = (i: number, at: number) => clipIn(q(`g.${i}`), at, 0.12, [0, 100, 0, 0]);
        // 4 columns: drawn down the screen
        spec(0, 0.24);
        q.all('grid.c').forEach((c, i) => clipIn(c, 0.28 + i * 0.03, 0.16, [0, 0, 100, 0]));
        // a 16 gutter, measured
        spec(1, 0.4);
        clipIn(q('rl.gut'), 0.45, 0.07, [0, 50, 0, 50]);
        clipIn(q('rl.gut.l'), 0.49, 0.06, [100, 0, 0, 0]);
        // the 8 pt baseline
        spec(2, 0.54);
        clipIn(q('grid.base'), 0.57, 0.16, [0, 0, 100, 0], E.soft);
        // a 24 margin: the greeting measures 18; everything snaps onto the grid
        spec(3, 0.68);
        clipIn(q('rl.mar'), 0.72, 0.06, [0, 100, 0, 0]);
        clipIn(q('rl.mar.l'), 0.75, 0.06, [100, 0, 0, 0]);
        const snaps: [string, number, number][] = [
          ['p.brand', 10, 0],
          ['p.av', -10, 0],
          ['p.greet', 6, 0],
          ['p.bal', -6, 2],
          ['p.card', 10, 4],
          ['p.rows', 6, 4],
        ];
        // top to bottom, settled before the state holds (the greeting, third, carries the measure with it)
        const snapAt = (i: number) => 0.8 + i * 0.02;
        snaps.forEach(([k, x, y], i) => tl.to(q(k), { x, y }, snapAt(i), 0.08, E.move));
        tl.to(q('p.card'), { w: 216 }, snapAt(4), 0.08, E.move);
        tl.to(q('rl.mar'), { w: 24 }, snapAt(2), 0.08, E.move);
        // the fix, the state's one lime: the tag wipes from 18 to a lime 24 as the greeting lands
        clipIn(q('rl.mar.on'), snapAt(2) + 0.02, 0.06, [0, 100, 0, 0], E.move);

        /* 1 → 2: colour and type */
        // the grid sheet folds away
        q.all('g.').forEach((g, i) => tl.to(g, { y: -6, clip: [0, 0, 100, 0] }, 1.0 + i * 0.02, 0.08, E.in));
        tl.to(q('hd.grid'), { clip: [0, 100, 0, 0] }, 1.02, 0.05, E.in);
        // and its drawing on the screen: the measures (the lime tag with them), then the baseline and columns, up
        ['rl.mar.l', 'rl.mar', 'rl.gut.l', 'rl.gut'].forEach((k, i) => tl.to(q(k), { clip: [0, 0, 100, 0] }, 1.0 + i * 0.01, 0.05, E.in));
        tl.to(q('grid.base'), { clip: [0, 0, 100, 0] }, 1.03, 0.08, E.in);
        q.all('grid.c').forEach((c, i) => tl.to(c, { clip: [0, 0, 100, 0] }, 1.04 + i * 0.012, 0.08, E.in));
        // the token sheet opens
        tl.type(q('hd.tokens'), 1.09, 0.06);
        tl.type(q('t.color'), 1.1, 0.04);
        q.all('t.sw').forEach((s, i) => clipIn(s, 1.12 + i * 0.04, 0.14, [0, 0, 100, 0]));
        q.all('t.hex').forEach((h, i) => tl.type(h, 1.18 + i * 0.04, 0.04));
        tl.type(q('t.type'), 1.24, 0.04);
        q.all('t.row').forEach((r, i) => clipIn(r, 1.27 + i * 0.05, 0.14, [0, 100, 0, 0]));
        // the screen re-renders in them, top to bottom
        tl.from(q('d'), { clip: [0, 0, 100, 0] }).to(q('d'), { clip: [0, 0, 0, 0] }, 1.42, 0.24, E.move);
        // the balance, set in Eurostile, counts up
        const bal = q('d.bal');
        tl.on((t) => {
          if (!bal) return;
          const k = Math.min(1, Math.max(0, (t - 1.48) / 0.2));
          const v = Math.round(48210 * (1 - Math.pow(1 - k, 3)));
          const s = `$${v.toLocaleString('en-US')}`;
          if (bal.textContent !== s) bal.textContent = s;
        });
        // the bars grow from their baseline, the rows slide into place, the chip fills with chalk
        q.all('d.bar').forEach((b, i) => tl.from(b, { sy: 0 }).to(b, { sy: 1 }, 1.55 + i * 0.012, 0.14, E.out));
        q.all('d.row').forEach((r, i) => tl.from(r, { y: ROW_H }).to(r, { y: 0 }, 1.62 + i * 0.035, 0.14, E.out));
        clipIn(q('d.chip'), 1.72, 0.06, [0, 100, 0, 0], E.soft);

        /* 2 → 3: the mark */
        // the token sheet folds away
        [...q.all('t.sw'), ...q.all('t.row')].forEach((el, i) => tl.to(el, { y: -6, clip: [0, 0, 100, 0] }, 2.0 + i * 0.016, 0.08, E.in));
        tl.to(q('t.color'), { clip: [0, 100, 0, 0] }, 2.0, 0.05, E.in);
        q.all('t.hex').forEach((h, i) => tl.to(h, { clip: [0, 100, 0, 0] }, 2.0 + i * 0.016, 0.05, E.in));
        tl.to(q('t.type'), { clip: [0, 100, 0, 0] }, 2.02, 0.05, E.in);
        tl.to(q('hd.tokens'), { clip: [0, 100, 0, 0] }, 2.02, 0.05, E.in);
        tl.type(q('hd.mark'), 2.1, 0.05);
        // the icon grid, line by line, then the k's outline, then its fill
        q.all('m.key').forEach((l, i) => tl.from(l, { dash: 1, o: 0 }).set(l, { o: 1 }, 2.12 + i * 0.016).to(l, { dash: 0 }, 2.12 + i * 0.016, 0.14, E.soft));
        q.all('m.gl').forEach((g, i) => tl.type(g, 2.25 + i * 0.03, 0.05));
        tl.from(q('m.kline'), { dash: 1, o: 0 }).set(q('m.kline'), { o: 1 }, 2.3).to(q('m.kline'), { dash: 0 }, 2.3, 0.12, E.soft);
        clipIn(q('m.kfill'), 2.42, 0.06, [100, 0, 0, 0], E.soft);
        // the lime icon comes down over it
        tl.from(q('m.icon'), { clip: `inset(0% 0% 100% 0% round ${ICON.r}px)` }).to(q('m.icon'), { clip: `inset(0% 0% 0% 0% round ${ICON.r}px)` }, 2.49, 0.1, E.move);
        q.all('m.key').forEach((l) => tl.to(l, { dash: -1 }, 2.6, 0.06, E.in).set(l, { o: 0 }, 2.66));
        tl.set(q('m.kline'), { o: 0 }, 2.6);
        q.all('m.gl').forEach((g) => tl.to(g, { clip: [0, 100, 0, 0] }, 2.6, 0.05, E.in));
        tl.type(q('m.label'), 2.6, 0.05);
        // and its mono version (chalk, an ink k) slides out from behind it into the app's header, onto the empty logo slot
        const fly = q('fly');
        // (a ring of the page's colour round the big icon parts them as it slides out)
        tl.from(q('m.ring'), { o: 0 }).set(q('m.ring'), { o: 1 }, 2.65);
        tl.from(fly, { x: FLY0.x - SLOT.x, y: FLY0.y - SLOT.y, s: FLY0.s, o: 0 });
        tl.to(fly, { o: 1 }, 2.64, 0.01, E.lin);
        tl.to(fly, { x: 0, y: 0, s: 1 }, 2.66, 0.18, E.move);
        tl.to(q('d.slot'), { o: 0 }, 2.83, 0.01, E.lin);
      }}
    >
      {/* --- the sheet beside the phone: its title stays, its subject changes --- */}
      <A k="hd" x={L.x} y={HEAD_Y} c="f-label kova-hd">
        <span data-k="hd.kova">kova /</span>
        <span className="kova-hd-w">
          <span data-k="hd.grid">grid</span>
          <span data-k="hd.tokens">tokens</span>
          <span data-k="hd.mark">mark</span>
        </span>
      </A>
      <A k="hd.rule" x={L.x} y={HEAD_Y + 24} w={L.w} h={1} c="kova-rule" />

      {/* 1 · the grid, in four numbers */}
      {SPEC.map(([n, label], i) => (
        <A key={n} k={`g.${i}`} x={L.x} y={BODY_Y + i * SPEC_H} w={L.w} h={SPEC_H} c="kova-spec">
          <span className="f-head kova-spec-n">{n}</span>
          <span className="kova-spec-l">{label}</span>
        </A>
      ))}

      {/* 2 · colour and type */}
      <T k="t.color" x={L.x} y={BODY_Y + 22} c="f-label">
        Color
      </T>
      {SWATCHES.map(([name, , cls, w], i) => (
        <A
          key={name}
          k={`t.sw${i}`}
          x={swX(i)}
          y={SW_Y}
          w={w}
          h={SW_H}
          c={`kova-sw kova-sw--${cls}`}
        >
          <span className="kova-sw-name">{name}</span>
        </A>
      ))}
      {SWATCHES.map(([name, hex], i) => (
        <T key={name} k={`t.hex${i}`} x={swX(i)} y={SW_Y + SW_H + 10} c="kova-sw-hex">
          {hex}
        </T>
      ))}
      <T k="t.type" x={L.x} y={TYPE_Y} c="f-label">
        Type
      </T>
      <A k="t.row0" x={L.x} y={TYPE_Y + 16} w={L.w} h={76} c="kova-type">
        <span className="f-head kova-aa">Aa</span>
        <span className="kova-type-name">
          Eurostile
          <i className="f-label">44/48 · display</i>
        </span>
      </A>
      <A k="t.row1" x={L.x} y={TYPE_Y + 92} w={L.w} h={76} c="kova-type">
        <span className="kova-aa kova-aa--text">Aa</span>
        <span className="kova-type-name">
          Geist
          <i className="f-label">15/22 · text</i>
        </span>
      </A>

      {/* 3 · the mark: its icon grid (with the type's guides run out across the sheet), the k, the icon */}
      <svg className="a kova-keys" style={{ left: L.x, top: ICON.y }} width={L.w} height={ICON.s} viewBox={`${L.x - ICON.x} 0 ${L.w} ${ICON.s}`} aria-hidden>
        <rect data-k="m.key.0" x="0.5" y="0.5" width="207" height="207" rx={ICON.r} pathLength={1} />
        <circle data-k="m.key.1" cx="104" cy="104" r="76.84" pathLength={1} />
        <line data-k="m.key.2" x1="0" y1="0" x2="208" y2="208" pathLength={1} />
        <line data-k="m.key.3" x1="208" y1="0" x2="0" y2="208" pathLength={1} />
        <circle data-k="m.key.4" cx="104" cy="104" r="32" pathLength={1} />
        <line data-k="m.key.5" x1={L.x - ICON.x} y1="44" x2={L.x - ICON.x + L.w} y2="44" pathLength={1} />
        <line data-k="m.key.6" x1={L.x - ICON.x} y1="72" x2={L.x - ICON.x + L.w} y2="72" pathLength={1} />
        <line data-k="m.key.7" x1={L.x - ICON.x} y1="164" x2={L.x - ICON.x + L.w} y2="164" pathLength={1} />
        <line data-k="m.key.8" x1="104" y1="0" x2="104" y2="208" pathLength={1} />
      </svg>
      {GUIDES.map(([name, gy], i) => (
        <T key={name} k={`m.gl${i}`} x={L.x} y={ICON.y + gy - 16} c="f-label">
          {name}
        </T>
      ))}
      <svg className="a kova-kline" style={{ left: ICON.x, top: ICON.y }} width="208" height="208" viewBox="0 0 208 208" aria-hidden>
        <path data-k="m.kline" d={K} pathLength={1} />
      </svg>
      <A k="m.kfill" x={ICON.x} y={ICON.y} w={208} h={208} c="kova-kfill">
        <KGlyph />
      </A>
      <A k="m.ring" x={ICON.x - 4} y={ICON.y - 4} w={ICON.s + 8} h={ICON.s + 8} r={ICON.r + 4} c="kova-ring" />
      <A k="m.icon" x={ICON.x} y={ICON.y} w={ICON.s} h={ICON.s} r={ICON.r} c="kova-icon kova-icon--sheet">
        <KGlyph />
      </A>
      <A x={ICON.x} y={ICON.y + ICON.s + 14} w={ICON.s} c="kova-icon-cap">
        <span data-k="m.label">kova</span>
      </A>

      {/* --- the phone --- */}
      <A k="phone" x={PH.x} y={PH.y} w={PH.w} h={PH.h} r={PH.r} c="kova-phone">
        <div className="kova-screen">
          {/* the app as it ships: system type, greys, a placeholder logo, edges off the grid */}
          <div className="kova-layer kova-plain">
            <Status />
            <A k="p.brand" x={14} y={56} h={32} c="kova-p-brand">
              <span className="kova-p-logo">
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                  <path d="M2 12.5 L6 7.5 L9 10.5 L11 8.5 L14 12.5 Z" fill="currentColor" />
                  <circle cx="11" cy="4.5" r="1.6" fill="currentColor" />
                </svg>
              </span>
              <span>Kova</span>
            </A>
            <A k="p.av" x={218} y={56} w={32} h={32} r={16} c="kova-p-av">
              A
            </A>
            <A x={0} y={100} w={264} h={1} c="kova-p-rule" />
            <T k="p.greet" x={18} y={112} c="kova-p-greet">
              Good morning, Ana
            </T>
            <A k="p.bal" x={30} y={150} c="kova-p-bal">
              <span className="kova-p-cap">Balance</span>
              <span className="kova-p-num">$48,210</span>
              <span className="kova-p-cap">+4.2% this month</span>
            </A>
            <A k="p.card" x={14} y={252} w={236} h={140} r={10} c="kova-p-card">
              <span className="kova-p-h">Spending</span>
              <span className="kova-p-bars">
                {BARS.map((h, i) => (
                  <i key={i} style={{ height: Math.round(h * 1.15) }} />
                ))}
              </span>
            </A>
            <A k="p.rows" x={18} y={420} w={216} c="kova-p-rows">
              {ROWS.map(([n, , a]) => (
                <span key={n}>
                  <b>{n}</b>
                  <i>{a}</i>
                </span>
              ))}
            </A>
            <i className="kova-ind" />
          </div>

          {/* the grid over it: an 8 pt baseline, four columns */}
          <div className="kova-layer">
            <A k="grid.base" x={0} y={TOP} w={SCR.w} h={SCR.h - TOP} c="kova-base" />
            {[0, 1, 2, 3].map((i) => (
              <A key={i} k={`grid.c${i}`} x={colX(i)} y={TOP} w={COL} h={SCR.h - TOP} c="kova-col" />
            ))}
            {/* a gutter, measured in the clear band under the balance */}
            <A k="rl.gut" x={colX(2) + COL} y={GUT_Y} w={GUT} h={9} c="kova-ib" />
            <A k="rl.gut.l" x={colX(2) + COL + GUT / 2 - 11} y={GUT_Y - 18} w={22} c="kova-pill">
              16
            </A>
            {/* the margin, measured at the greeting */}
            <A k="rl.mar" x={0} y={119} w={18} h={9} c="kova-ib" />
            <A k="rl.mar.l" x={1} y={134} w={22} c="kova-pill">
              <span>18</span>
              <span data-k="rl.mar.on" className="kova-pill-on">
                24
              </span>
            </A>
          </div>

          {/* the app, designed: ink and chalk (the lime is kept for its mark); Eurostile for the figures, Geist for the words */}
          <div data-k="d" className="kova-layer kova-app">
            <Status />
            <svg data-k="d.slot" className="a kova-slot" style={{ left: M, top: 56 }} width="32" height="32" viewBox="0 0 32 32" aria-hidden>
              <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" />
            </svg>
            <A x={66} y={56} h={32} c="f-head kova-word">
              kova
            </A>
            <A x={208} y={56} w={32} h={32} r={16} c="kova-av">
              A
            </A>
            <T x={M} y={112} c="kova-greet">
              Good morning, Ana
            </T>
            <T x={M} y={152} c="f-label">
              Balance
            </T>
            <T k="d.bal" x={M} y={168} c="f-head kova-bal">
              $48,210
            </T>
            <A x={M} y={224} c="kova-chiprow">
              <span className="kova-chip">
                +4.2%
                <span data-k="d.chip" className="kova-chip-on">
                  +4.2%
                </span>
              </span>
              <span className="kova-note">this month</span>
            </A>
            <A x={M} y={272} w={216} c="kova-spend">
              <span>Spending</span>
              <span className="f-label">12 months</span>
            </A>
            <A x={M} y={BAR_BASE} w={216} h={1} c="kova-axis" />
            {BARS.map((h, i) => (
              <A key={i} k={`d.bar${String(i).padStart(2, '0')}`} x={barX(i)} y={BAR_BASE - h} w={BAR_W} h={h} r={2} c={i === BARS.length - 1 ? 'kova-bar is-now' : 'kova-bar'} />
            ))}
            {MONTHS.map((m, i) => (
              <A key={i} x={barX(i) - 4} y={384} w={BAR_W + 8} c={i === MONTHS.length - 1 ? 'kova-mon is-now' : 'kova-mon'}>
                {m}
              </A>
            ))}
            {ROWS.map(([n, s, a], i) => (
              <A key={n} x={M} y={ROW_Y + i * ROW_H} w={216} h={ROW_H} c="kova-row">
                <span data-k={`d.row${i}`} className="kova-row-in">
                  <span className="kova-row-t">
                    <b>{n}</b>
                    <i>{s}</i>
                  </span>
                  <em>{a}</em>
                </span>
              </A>
            ))}
            <i className="kova-ind" />
          </div>
        </div>
      </A>

      {/* the icon, dragged into the app */}
      <A k="fly" x={SLOT.x} y={SLOT.y} w={SLOT.s} h={SLOT.s} r={7.5} c="kova-tile kova-fly">
        <KGlyph />
      </A>
    </Scene>
  );
}
