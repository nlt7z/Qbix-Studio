'use client';

import '@/app/scenes-kova.css';
import Scene from '@/components/scene/Scene';
import { A, T, notch } from '@/components/scene/kit';
import { E } from '@/lib/scene/timeline';

/**
 * Brand upgrade: "kova", a money app that already works, on a phone. In front
 * of it, the studio's sheet: a glass panel lying over the phone's lower left
 * corner (the app shows through it, frosted), its page turned each round.
 * 1 · the grid: the app as it ships (system type, everything grey, a
 *     placeholder logo, edges that don't line up). The grid's four numbers
 *     come in one by one and each draws its part over the screen: the
 *     columns, the gutter (measured), the 8 pt baseline, the margin, which
 *     measures the greeting at 18, and everything snaps onto the grid (the
 *     tag turning a lime 24);
 * 2 · colour and type: the page turns to the tokens (a proportion strip of
 *     ink, chalk and a little lime; Eurostile and Geist), and the screen
 *     re-renders in them, top to bottom: ink, the balance set in Eurostile
 *     counting up, the bars growing from their baseline, the rows sliding into
 *     place, the +4.2% chip filling with chalk;
 * 3 · the mark: a k is constructed on an icon grid (keylines, the type's
 *     guides, its outline, its fill), the lime icon comes down beside it,
 *     labelled kova as on a home screen, and its mono version (a chalk tile)
 *     slides out from behind it, up and into the app's header, where the
 *     empty logo slot was.
 * Square, like the site: only the phone itself is round. One lime per state,
 * never two on screen at once: the 24 margin tag (the fix), the lime of the
 * strip (the token), the app icon (the mark). The app stays ink and chalk.
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

// the sheet: a glass panel over the phone's lower left corner (its bezel and 56 of the screen, from
// under the chip down), so the app's chart and rows show through it, frosted
const CARD = { x: 8, y: 272, w: 480, h: 344 };
const CX = 24; // the sheet's left edge
const CW = 384; // the width its blocks keep to (they stay off the phone)
const HEAD_Y = CARD.y + 16;
const RULE_Y = CARD.y + 40;

// 1 · the grid, in four numbers
const SPEC: [string, string][] = [
  ['4', 'columns'],
  ['16', 'pt gutter'],
  ['8', 'pt baseline'],
  ['24', 'pt margin'],
];
const SPEC_Y = RULE_Y + 8;
const SPEC_H = 69;

// 2 · the colours as a proportion strip, as wide as each is used: mostly ink, some chalk, a little lime
const SWATCHES: [string, string, string, number][] = [
  ['Ink', '#0B0C0E', 'ink', 176],
  ['Chalk', '#F4F5F2', 'chalk', 96],
  ['Lime', '#B8FF00', 'lime', 72],
];
const swX = (i: number) => CX + SWATCHES.slice(0, i).reduce((n, sw) => n + sw[3], 0);
const SW_Y = RULE_Y + 34;
const SW_H = 76;
const TYPE_Y = SW_Y + SW_H + 18;

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

// 3 · the mark: a k drawn on a 208 icon grid (its stem and its arms' outer corners on the 76.8 circle,
// its arms at 45°, along the grid's diagonals), shown at 184; the lime icon beside it, the pair
// centred in the sheet's body
const K = 'M56 44H80V110.06L118.06 72H152L106 118L152 164H118.06L80 125.94V164H56Z';
const DR = { s: 184, x: CX, y: RULE_Y + 52 };
const KS = DR.s / 208;
// the type's guides it is drawn on, run out across the sheet, named at their right end
const GUIDES: [string, number][] = [
  ['ascender', 44],
  ['x-height', 72],
  ['baseline', 164],
];
const ICON = { s: 152, x: CX + CW - 152 - 8, y: DR.y };
// the logo slot in the app's header, in the scene
const SLOT = { x: SCR.x + M, y: SCR.y + 56, s: 32 };
// the mono tile starts hidden behind the icon, near its top right corner, a little larger; it rises
// in the gap beside the phone, then turns into the header (two wrappers, so the path curves)
const FLY0 = { x: ICON.x + 0.7 * ICON.s - 16, y: ICON.y + 0.3 * ICON.s - 16, s: 1.6 };

/** The phone's status bar (its colour is the layer's). */
function Status() {
  return (
    <div className="kova-status">
      <span>9:41</span>
      <i className="kova-island round" />
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

/** The k, as a glyph in a 208 box (drawn at its container's size). */
const KGlyph = () => (
  <svg className="kova-k" viewBox="0 0 208 208" aria-hidden>
    <path d={K} />
  </svg>
);

export default function Kova() {
  return (
    <Scene
      n={3}
      w={720}
      h={640}
      label="kova, a money app that already works, on a phone, with the studio's sheet in glass over its corner: a layout grid drawn over the app and its parts snapped onto it; then its colors and type, and the screen re-rendered in them; then its mark, built on an icon grid and set into the app's header"
      build={(q, tl) => {
        const clipIn = (el: Element | null, at: number, dur: number, from: [number, number, number, number], ease: string = E.out) =>
          tl.from(el, { clip: from }).to(el, { clip: [0, 0, 0, 0] }, at, dur, ease);

        /* 0 → 1: the app as it ships, and the grid laid over it */
        const phone = q('phone');
        tl.from(phone, { y: 80, clip: [0, 0, 100, 0] }).to(phone, { y: 0, clip: [0, 0, 0, 0] }, 0.02, 0.3, E.out);
        // the sheet, in glass, over the phone's corner; its title
        tl.from(q('card'), { clip: notch(32, [0, 100, 0, 0]) }).to(q('card'), { clip: notch(32) }, 0.16, 0.12, E.out);
        tl.type(q('hd.kova'), 0.22, 0.05);
        tl.type(q('hd.grid'), 0.27, 0.04);
        tl.from(q('hd.rule'), { sx: 0 }).to(q('hd.rule'), { sx: 1 }, 0.24, 0.16, E.out);
        // each number of the grid, then what it draws on the screen
        const spec = (i: number, at: number) => clipIn(q(`g.${i}`), at, 0.1, [0, 100, 0, 0]);
        // 4 columns: drawn down the screen
        spec(0, 0.3);
        q.all('grid.c').forEach((c, i) => clipIn(c, 0.33 + i * 0.03, 0.15, [0, 0, 100, 0]));
        // a 16 gutter, measured
        spec(1, 0.45);
        clipIn(q('rl.gut'), 0.48, 0.07, [0, 50, 0, 50]);
        clipIn(q('rl.gut.l'), 0.52, 0.06, [100, 0, 0, 0]);
        // the 8 pt baseline
        spec(2, 0.57);
        clipIn(q('grid.base'), 0.6, 0.15, [0, 0, 100, 0], E.soft);
        // a 24 margin: the greeting measures 18; everything snaps onto the grid
        spec(3, 0.69);
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
        // the grid's page folds away, and its drawing on the screen: the measures (the lime tag first), the baseline, the columns
        q.all('g.').forEach((g, i) => tl.to(g, { y: -6, clip: [0, 0, 100, 0] }, 1.0 + i * 0.018, 0.07, E.in));
        tl.to(q('hd.grid'), { clip: [0, 100, 0, 0] }, 1.02, 0.05, E.in);
        ['rl.mar.l', 'rl.mar', 'rl.gut.l', 'rl.gut'].forEach((k, i) => tl.to(q(k), { clip: [0, 0, 100, 0] }, 1.0 + i * 0.01, 0.05, E.in));
        tl.to(q('grid.base'), { clip: [0, 0, 100, 0] }, 1.03, 0.08, E.in);
        q.all('grid.c').forEach((c, i) => tl.to(c, { clip: [0, 0, 100, 0] }, 1.04 + i * 0.012, 0.08, E.in));
        // the tokens: the colours, then the type
        tl.type(q('hd.tokens'), 1.1, 0.06);
        tl.type(q('t.color'), 1.12, 0.04);
        q.all('t.sw').forEach((s, i) => clipIn(s, 1.14 + i * 0.04, 0.12, [0, 0, 100, 0]));
        tl.type(q('t.type'), 1.24, 0.04);
        q.all('t.row').forEach((r, i) => clipIn(r, 1.27 + i * 0.05, 0.12, [0, 100, 0, 0]));
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
        // the tokens' page folds away
        [...q.all('t.row'), ...q.all('t.sw')].forEach((el, i) => tl.to(el, { y: -6, clip: [0, 0, 100, 0] }, 2.0 + i * 0.016, 0.07, E.in));
        tl.to(q('t.color'), { clip: [0, 100, 0, 0] }, 2.04, 0.05, E.in);
        tl.to(q('t.type'), { clip: [0, 100, 0, 0] }, 2.0, 0.05, E.in);
        tl.to(q('hd.tokens'), { clip: [0, 100, 0, 0] }, 2.04, 0.05, E.in);
        tl.type(q('hd.mark'), 2.12, 0.05);
        // the icon grid, line by line, the type's guides named, then the k's outline, then its fill
        q.all('m.key').forEach((l, i) => tl.from(l, { dash: 1, o: 0 }).set(l, { o: 1 }, 2.14 + i * 0.016).to(l, { dash: 0 }, 2.14 + i * 0.016, 0.14, E.soft));
        q.all('m.gl').forEach((g, i) => tl.type(g, 2.27 + i * 0.03, 0.05));
        tl.from(q('m.kline'), { dash: 1, o: 0 }).set(q('m.kline'), { o: 1 }, 2.32).to(q('m.kline'), { dash: 0 }, 2.32, 0.12, E.soft);
        clipIn(q('m.kfill'), 2.44, 0.06, [100, 0, 0, 0], E.soft);
        // the guides run out across the sheet go (the icon grid stays, as the drawing), and the lime icon comes down beside it
        q.all('m.key.g').forEach((l) => tl.to(l, { dash: -1 }, 2.5, 0.05, E.in).set(l, { o: 0 }, 2.55));
        q.all('m.gl').forEach((g) => tl.to(g, { clip: [0, 0, 0, 100] }, 2.5, 0.04, E.in));
        clipIn(q('m.icon'), 2.55, 0.09, [0, 0, 100, 0], E.move);
        tl.type(q('m.label'), 2.63, 0.04);
        // its mono version (chalk, an ink k) slides out from behind it, rises beside the phone and turns into the header
        const fly = q('fly');
        const flyUp = q('fly.up');
        const dx = SLOT.x - FLY0.x;
        const dy = SLOT.y - FLY0.y;
        tl.from(fly, { s: FLY0.s, o: 0 }).set(fly, { o: 1 }, 2.66);
        tl.from(flyUp, { x: 0, y: 0 });
        tl.to(flyUp, { y: dy }, 2.67, 0.15, E.move);
        tl.to(fly, { x: dx, s: 1 }, 2.72, 0.13, E.move);
        tl.to(q('d.slot'), { o: 0 }, 2.84, 0.01, E.lin);
      }}
    >
      {/* --- the phone (the one round thing: its body, its screen, its island) --- */}
      <A k="phone" x={PH.x} y={PH.y} w={PH.w} h={PH.h} r={PH.r} c="kova-phone round">
        <div className="kova-screen round">
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
            <A k="p.av" x={218} y={56} w={32} h={32} c="kova-p-av">
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
            <A k="p.card" x={14} y={252} w={236} h={140} c="kova-p-card">
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
              <rect x="0.5" y="0.5" width="31" height="31" />
            </svg>
            <A x={66} y={56} h={32} c="f-head kova-word">
              kova
            </A>
            <A x={208} y={56} w={32} h={32} c="kova-av">
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
              <A key={i} k={`d.bar${String(i).padStart(2, '0')}`} x={barX(i)} y={BAR_BASE - h} w={BAR_W} h={h} c={i === BARS.length - 1 ? 'kova-bar is-now' : 'kova-bar'} />
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

      {/* --- the sheet: glass over the phone's corner; its title stays, its page turns --- */}
      <A k="card" x={CARD.x} y={CARD.y} w={CARD.w} h={CARD.h} c="glass kova-card" />
      <A k="hd" x={CX} y={HEAD_Y} c="f-label kova-hd kova-on">
        <span data-k="hd.kova">kova /</span>
        <span className="kova-hd-w">
          <span data-k="hd.grid">grid</span>
          <span data-k="hd.tokens">tokens</span>
          <span data-k="hd.mark">mark</span>
        </span>
      </A>
      <A k="hd.rule" x={CX} y={RULE_Y} w={CARD.x + CARD.w - 16 - CX} h={1} c="kova-rule kova-on" />

      {/* 1 · the grid, in four numbers */}
      {SPEC.map(([n, label], i) => (
        <A key={n} k={`g.${i}`} x={CX} y={SPEC_Y + i * SPEC_H} w={CW} h={SPEC_H} c={`kova-spec kova-on${i === SPEC.length - 1 ? ' is-last' : ''}`}>
          <span className="f-head kova-spec-n">{n}</span>
          <span className="kova-spec-l">{label}</span>
        </A>
      ))}

      {/* 2 · the colours, then the type */}
      <T k="t.color" x={CX} y={RULE_Y + 14} c="f-label kova-on">
        Color
      </T>
      {SWATCHES.map(([name, hex, cls, w], i) => (
        <A key={name} k={`t.sw${i}`} x={swX(i)} y={SW_Y} w={w} h={SW_H} c={`kova-sw kova-sw--${cls} kova-on`}>
          <span className="kova-sw-name">{name}</span>
          <span className="kova-sw-hex">{hex}</span>
        </A>
      ))}
      <T k="t.type" x={CX} y={TYPE_Y} c="f-label kova-on">
        Type
      </T>
      <A k="t.row0" x={CX} y={TYPE_Y + 18} w={CW} h={60} c="kova-type kova-on">
        <span className="f-head kova-aa">Aa</span>
        <span className="kova-type-name">
          Eurostile
          <i className="f-label">44/48 · display</i>
        </span>
      </A>
      <A k="t.row1" x={CX} y={TYPE_Y + 78} w={CW} h={60} c="kova-type kova-on is-last">
        <span className="kova-aa kova-aa--text">Aa</span>
        <span className="kova-type-name">
          Geist
          <i className="f-label">15/22 · text</i>
        </span>
      </A>

      {/* 3 · the mark: its icon grid (the type's guides run out across the sheet), the k, and the icon beside it */}
      <svg
        className="a kova-keys kova-on"
        style={{ left: CX, top: DR.y }}
        width={CW}
        height={DR.s}
        viewBox={`0 0 ${CW / KS} 208`}
        aria-hidden
      >
        <rect data-k="m.key.0" x="0.5" y="0.5" width="207" height="207" pathLength={1} />
        <circle data-k="m.key.1" cx="104" cy="104" r="76.84" pathLength={1} />
        <line data-k="m.key.2" x1="0" y1="0" x2="208" y2="208" pathLength={1} />
        <line data-k="m.key.3" x1="208" y1="0" x2="0" y2="208" pathLength={1} />
        <circle data-k="m.key.4" cx="104" cy="104" r="32" pathLength={1} />
        {GUIDES.map(([name, gy], i) => (
          <line key={name} data-k={`m.key.g${i}`} x1="0" y1={gy} x2={CW / KS} y2={gy} pathLength={1} />
        ))}
        <line data-k="m.key.8" x1="104" y1="0" x2="104" y2="208" pathLength={1} />
      </svg>
      {GUIDES.map(([name, gy], i) => (
        <A key={name} x={CX} y={DR.y + gy * KS - 16} w={CW} c="kova-gl kova-on">
          <span data-k={`m.gl${i}`} className="f-label">
            {name}
          </span>
        </A>
      ))}
      <svg className="a kova-kline kova-on" style={{ left: DR.x, top: DR.y }} width={DR.s} height={DR.s} viewBox="0 0 208 208" aria-hidden>
        <path data-k="m.kline" d={K} pathLength={1} />
      </svg>
      <A k="m.kfill" x={DR.x} y={DR.y} w={DR.s} h={DR.s} c="kova-kfill kova-on">
        <KGlyph />
      </A>
      <A k="m.icon" x={ICON.x} y={ICON.y} w={ICON.s} h={ICON.s} c="kova-icon kova-icon--sheet">
        <KGlyph />
      </A>
      <A x={ICON.x} y={ICON.y + ICON.s + 12} w={ICON.s} c="kova-icon-cap">
        <span data-k="m.label">kova</span>
      </A>

      {/* the mono tile, that goes into the app's header (it rises in one wrapper, turns right in the other) */}
      <A k="fly.up" x={FLY0.x} y={FLY0.y} w={SLOT.s} h={SLOT.s} c="kova-fly">
        <A k="fly" x={0} y={0} w={SLOT.s} h={SLOT.s} c="kova-tile">
          <KGlyph />
        </A>
      </A>
    </Scene>
  );
}
