'use client';

import '@/app/scenes-forma.css';
import Scene from '@/components/scene/Scene';
import Flow from '@/components/scene/Flow';
import { A, Lock, Phone, cut } from '@/components/scene/kit';
import { E } from '@/lib/scene/timeline';

/**
 * The design service, for Forma, a studio of ceramic objects:
 * 1 · the moodboard: renders of the objects, the light they want, a lime
 *     slice, a motion study (generative, live), the palette and the type;
 * 2 · design: the board's pieces travel into the launch site, each to its
 *     place (the objects become the hero, three of them the products, the
 *     palette's lime the button) while the rest folds away, and the layout
 *     grid is laid over it;
 * 3 · live: the grid lifts, forma.studio is typed into the address, and the
 *     phone comes up with the same site on it.
 * Things that carry on travel; nothing is cut. Pictures are photographs
 * (public/art, Unsplash); everything else is drawn.
 */

// the board: three columns
const COL = [0, 244, 488];
const TW = 232;
const T = {
  slices: { x: COL[0], y: 28, h: 174 },
  pal: { x: COL[0], y: 214, h: 130 },
  wall: { x: COL[0], y: 356, h: 160 },
  obj: { x: COL[1], y: 28, h: 166 },
  flow: { x: COL[1], y: 206, h: 200 },
  type: { x: COL[1], y: 418, h: 98 },
  cross: { x: COL[2], y: 28, h: 166 },
  ring: { x: COL[2], y: 206, h: 130 },
  block: { x: COL[2], y: 348, h: 168 },
};
// the palette's lime, its own piece (it becomes the button)
const LIME = { x: COL[0] + 14, y: T.pal.y + 34, w: TW - 28, h: 52 };

// the site's window, and where things land in it
const WIN = { x: 0, y: 28, w: 600, h: 488 };
const HERO = { x: 268, y: 116, w: 308 };
const BTN = { x: 24, y: 282, w: 140, h: 38 };
const PROD = { y: 362, w: 172, h: 96, x: [24, 214, 404] };
const GRID = { x: 24, y: 64, w: 552, h: 452, n: 6, gap: 16 };
const PHONE = { x: 540, y: 144 };

const PRODUCTS: [keyof typeof T, string, string][] = [
  ['ring', 'Halo lamp', '$240'],
  ['block', 'Prism block', '$120'],
  ['cross', 'Knot stool', '$180'],
];

function Img({ src, pos }: { src: string; pos?: string }) {
  return <img className="fm-img" src={`/art/${src}.webp`} alt="" draggable={false} decoding="async" style={pos ? { objectPosition: pos } : undefined} />;
}

export default function Forma() {
  return (
    <Scene
      n={3}
      label="A moodboard for Forma, a studio of ceramic objects: renders, a lime slice, a motion study, a palette and type. Its pieces travel into the launch site, then the site goes live at forma.studio, on a phone too"
      build={(q, tl) => {
        const tiles = ['slices', 'obj', 'cross', 'pal', 'flow', 'ring', 'wall', 'type', 'block'] as const;

        /* 0 → 1: the board, piece by piece */
        tl.type(q('lbl'), 0.1, 0.08);
        tl.from(q('lbl.n'), { clip: [0, 100, 0, 0] }).to(q('lbl.n'), { clip: [0, 0, 0, 0] }, 0.16, 0.08, E.out);
        tiles.forEach((k, i) => {
          tl.from(q(`t.${k}`), { clip: [100, 0, 0, 0] }).to(q(`t.${k}`), { clip: [0, 0, 0, 0] }, 0.16 + i * 0.05, 0.22, E.out);
        });
        tl.from(q('lime'), { clip: cut(14, 100) }).to(q('lime'), { clip: cut(14) }, 0.42, 0.14, E.out);

        /* 1 → 2: what isn't kept folds away; the window comes up under the rest; they travel into the site */
        (['slices', 'wall', 'flow', 'type', 'pal'] as const).forEach((k, i) => {
          tl.to(q(`t.${k}`), { clip: [0, 0, 100, 0] }, 1.02 + i * 0.016, 0.08, E.in);
        });
        tl.to(q('lbl'), { clip: [0, 100, 0, 0] }, 1.02, 0.05, E.in).to(q('lbl.n'), { clip: [0, 0, 0, 100] }, 1.02, 0.05, E.in);
        tl.from(q('win'), { clip: 'inset(0px 0px 100% 0px)' }).to(q('win'), { clip: 'inset(-64px -64px -64px -64px)' }, 1.1, 0.22, E.out);
        const hs = HERO.w / TW;
        tl.to(q('t.obj'), { x: HERO.x - T.obj.x, y: HERO.y - T.obj.y, s: hs }, 1.18, 0.26, E.move);
        const ps = PROD.w / TW;
        const keep = PROD.h / ps; // of a tile's height, what shows as a product
        PRODUCTS.forEach(([k], i) => {
          const t = T[k];
          const crop = Math.max(0, ((t.h - keep) / t.h) * 100);
          tl.to(q(`t.${k}`), { x: PROD.x[i] - t.x, y: PROD.y - t.y, s: ps, clip: [0, 0, crop, 0] }, 1.22 + i * 0.03, 0.26, E.move);
        });
        tl.to(q('lime'), { x: BTN.x - LIME.x, y: BTN.y - LIME.y, sx: BTN.w / LIME.w, sy: BTN.h / LIME.h }, 1.3, 0.24, E.move);
        // the site's words
        tl.type(q('s.logo'), 1.4, 0.04);
        tl.from(q('s.nav'), { clip: [0, 100, 0, 0] }).to(q('s.nav'), { clip: [0, 0, 0, 0] }, 1.42, 0.08, E.out);
        tl.from(q('s.cart'), { clip: [0, 0, 0, 100] }).to(q('s.cart'), { clip: [0, 0, 0, 0] }, 1.44, 0.06, E.out);
        tl.type(q('s.h1'), 1.44, 0.08);
        tl.type(q('s.h2'), 1.5, 0.09);
        tl.from(q('s.sub'), { clip: [0, 100, 0, 0] }).to(q('s.sub'), { clip: [0, 0, 0, 0] }, 1.56, 0.1, E.out);
        tl.type(q('s.btn'), 1.56, 0.07);
        PRODUCTS.forEach((_, i) => {
          tl.from(q(`s.c${i}`), { clip: [0, 100, 0, 0] }).to(q(`s.c${i}`), { clip: [0, 0, 0, 0] }, 1.58 + i * 0.025, 0.08, E.out);
        });
        // the layout grid, laid over it, column by column
        q.all('grid.').forEach((c, i) => {
          tl.from(c, { clip: [0, 0, 100, 0] }).to(c, { clip: [0, 0, 0, 0] }, 1.64 + i * 0.02, 0.12, E.out);
        });

        /* 2 → 3: the grid lifts; the address is typed; the phone comes up with it */
        q.all('grid.').forEach((c, i) => tl.to(c, { clip: [100, 0, 0, 0] }, 2.02 + i * 0.012, 0.08, E.in));
        tl.from(q('url.sel'), { sx: 0 }).to(q('url.sel'), { sx: 1 }, 2.06, 0.05, E.soft);
        tl.to(q('url.old'), { o: 0 }, 2.12, 0.005, E.lin);
        tl.from(q('url.lock'), { o: 0 }).to(q('url.lock'), { o: 1 }, 2.125, 0.005, E.lin);
        tl.type(q('url.new'), 2.13, 0.12);
        tl.from(q('live'), { clip: [0, 100, 0, 0] }).to(q('live'), { clip: [0, 0, 0, 0] }, 2.28, 0.07, E.out);
        tl.from(q('phone'), { y: 90, clip: 'inset(0% 0% 100% 0%)' }).to(q('phone'), { y: 0, clip: 'inset(-64px -64px -64px -64px)' }, 2.24, 0.28, E.out);
      }}
    >
      {/* --- the board's title --- */}
      <A x={0} y={0} h={18} c="fm-lbl">
        <span data-k="lbl" className="t">Forma / Moodboard</span>
      </A>
      <A k="lbl.n" x={0} y={0} w={720} h={18} c="fm-lbl fm-lbl--n">
        <span>9 pieces</span>
      </A>

      {/* --- the site's window (under the board's pieces, which travel into it) --- */}
      <A k="win" x={WIN.x} y={WIN.y} w={WIN.w} h={WIN.h} c="win fm-win">
        <div className="win-bar">
          <span className="win-dots" aria-hidden>
            <i />
            <i />
            <i />
          </span>
          <span className="win-url fm-url">
            <span data-k="url.old" className="fm-url-item">
              <i data-k="url.sel" className="fm-url-sel" />
              <span>localhost:3000</span>
            </span>
            <span className="fm-url-item">
              <span data-k="url.lock" className="fm-lock">
                <Lock />
              </span>
              <span data-k="url.new" className="t">forma.studio</span>
            </span>
          </span>
          <span data-k="live" className="fm-live">Live</span>
        </div>
      </A>
      <A x={20} y={78} c="f-head fm-logo">
        <span data-k="s.logo" className="t">Forma</span>
      </A>
      <A k="s.nav" x={262} y={81} c="fm-nav">
        <span>Objects</span>
        <span>Studio</span>
        <span>Journal</span>
      </A>
      <A k="s.cart" x={500} y={81} w={76} c="fm-nav fm-cart">
        <span>Cart (0)</span>
      </A>
      <A x={24} y={134} c="f-head fm-h1">
        <span data-k="s.h1" className="t">Objects for</span>
      </A>
      <A x={24} y={172} c="f-head fm-h1">
        <span data-k="s.h2" className="t">bright rooms.</span>
      </A>
      <A k="s.sub" x={24} y={224} c="fm-sub">
        Hand-finished ceramics,
        <br />
        made in small runs.
      </A>
      {PRODUCTS.map(([, name, price], i) => (
        <A key={name} k={`s.c${i}`} x={PROD.x[i]} y={PROD.y + PROD.h + 10} w={PROD.w} c="fm-cap">
          <span>{name}</span>
          <span className="dim">{price}</span>
        </A>
      ))}

      {/* --- the board's pieces --- */}
      <A k="t.slices" x={T.slices.x} y={T.slices.y} w={TW} h={T.slices.h} c="fm-tile">
        <Img src="slices" />
      </A>
      <A k="t.pal" x={T.pal.x} y={T.pal.y} w={TW} h={T.pal.h} c="fm-card">
        <span className="f-label fm-card-k">Palette</span>
        <span className="fm-chips">
          {[
            ['#121417', 'Ink'],
            ['#f4f5f2', 'Chalk'],
            ['#dadfd6', 'Mist'],
          ].map(([c, n]) => (
            <span key={n} className="fm-chip">
              <i style={{ background: c }} />
              {n}
            </span>
          ))}
        </span>
      </A>
      <A k="t.wall" x={T.wall.x} y={T.wall.y} w={TW} h={T.wall.h} c="fm-tile">
        <Img src="wall" pos="50% 78%" />
      </A>
      <A k="t.flow" x={T.flow.x} y={T.flow.y} w={TW} h={T.flow.h} c="fm-tile fm-flow">
        <Flow count={420} seed={11} />
        <span className="glass fm-flow-cap notch">Motion study</span>
      </A>
      <A k="t.type" x={T.type.x} y={T.type.y} w={TW} h={T.type.h} c="fm-card fm-type">
        <span className="f-head fm-aa">Aa</span>
        <span className="fm-type-k">
          <b>Eurostile</b> display
          <br />
          <b>Geist</b> text
        </span>
      </A>
      <A k="t.block" x={T.block.x} y={T.block.y} w={TW} h={T.block.h} c="fm-tile">
        <Img src="block" />
      </A>
      <A k="t.ring" x={T.ring.x} y={T.ring.y} w={TW} h={T.ring.h} c="fm-tile">
        <Img src="ring" />
      </A>
      <A k="t.cross" x={T.cross.x} y={T.cross.y} w={TW} h={T.cross.h} c="fm-tile">
        <Img src="cross" />
      </A>
      <A k="t.obj" x={T.obj.x} y={T.obj.y} w={TW} h={T.obj.h} c="fm-tile">
        <Img src="objects" />
      </A>
      <A k="lime" x={LIME.x} y={LIME.y} w={LIME.w} h={LIME.h} c="fm-lime" />
      <A x={BTN.x} y={BTN.y} w={BTN.w} h={BTN.h} c="fm-btn">
        <span data-k="s.btn" className="t">Shop the drop</span>
      </A>

      {/* --- the layout grid, over the site --- */}
      {Array.from({ length: GRID.n }, (_, i) => {
        const cw = (GRID.w - GRID.gap * (GRID.n - 1)) / GRID.n;
        return <A key={i} k={`grid.${i}`} x={GRID.x + i * (cw + GRID.gap)} y={GRID.y} w={cw} h={GRID.h} c="fm-col" />;
      })}

      {/* --- the phone --- */}
      <Phone k="phone" x={PHONE.x} y={PHONE.y} w={180} h={372} c="fm-phone">
        <div className="fm-m">
          <span className="fm-m-bar">
            <span className="f-head">Forma</span>
            <i />
          </span>
          <span className="fm-m-pic">
            <Img src="objects" />
          </span>
          <span className="f-head fm-m-h1">
            Objects for
            <br />
            bright rooms.
          </span>
          <span className="fm-m-btn">Shop the drop</span>
        </div>
      </Phone>
    </Scene>
  );
}

