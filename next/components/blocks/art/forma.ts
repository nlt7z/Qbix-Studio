/**
 * Forma's launch site, drawn on a canvas (no screenshots): the case in the design service. Forma is the
 * ceramics studio of the Forma scene (components/scenes/Forma.tsx), with its words, prices and palette
 * (ink, chalk, mist) and its three objects, drawn here as flat ceramics: its page for a desktop, 1440 wide,
 * whose top the hero's card shows (FormaShot). The faces and the canvas helper serve the Kova drawing too.
 */

export type Faces = { head: string; body: string; euro: string };

const INK = '#121417';
const CHALK = '#f4f5f2';
const MIST = '#dadfd6';
const LIME = '#b8ff00';

/** The faces next/font loaded, by their real names (a canvas can't read the CSS variables), once loaded. */
export async function loadFaces(): Promise<Faces> {
  const cs = getComputedStyle(document.documentElement);
  const f = {
    head: cs.getPropertyValue('--font-outfit').trim() || 'sans-serif',
    body: cs.getPropertyValue('--font-geist').trim() || 'sans-serif',
    euro: cs.getPropertyValue('--font-eurostile').trim() || 'sans-serif',
  };
  await Promise.all(
    [`200 40px ${f.head}`, `300 40px ${f.head}`, `400 40px ${f.body}`, `600 40px ${f.body}`, `400 40px ${f.euro}`].map((s) => document.fonts.load(s).catch(() => [])),
  );
  return f;
}

type C = CanvasRenderingContext2D;

function text(x: C, s: string, px: number, py: number, font: string, color: string, align: CanvasTextAlign = 'left') {
  x.font = font;
  x.fillStyle = color;
  x.textAlign = align;
  x.textBaseline = 'alphabetic';
  x.fillText(s, px, py);
}

/* --- the three objects, flat ceramics with a soft light from the upper left ------------------------------- */

/** Halo lamp: a ring standing on its edge. */
function ring(x: C, cx: number, cy: number, r: number) {
  floorShadow(x, cx, cy + r * 1.02, r * 0.9);
  const g = x.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.55, '#e4e7e1');
  g.addColorStop(1, '#b9beb6');
  x.beginPath();
  x.arc(cx, cy, r, 0, Math.PI * 2);
  x.arc(cx, cy, r * 0.56, 0, Math.PI * 2, true);
  x.fillStyle = g;
  x.fill('evenodd');
  // the inner edge, in its own shade
  const gi = x.createLinearGradient(cx - r * 0.56, cy - r * 0.56, cx + r * 0.56, cy + r * 0.56);
  gi.addColorStop(0, '#a9aea6');
  gi.addColorStop(1, '#f0f2ee');
  x.beginPath();
  x.arc(cx, cy, r * 0.56, 0, Math.PI * 2);
  x.arc(cx, cy, r * 0.5, 0, Math.PI * 2, true);
  x.fillStyle = gi;
  x.fill('evenodd');
  // its light, a lime point at the foot (the one lime on the page)
  x.beginPath();
  x.arc(cx, cy + r * 0.78, r * 0.06, 0, Math.PI * 2);
  x.fillStyle = LIME;
  x.fill();
}

/** Prism block: a cube seen at three-quarters, its three faces in three shades. */
function prism(x: C, cx: number, cy: number, s: number) {
  floorShadow(x, cx, cy + s * 0.98, s * 1.05);
  const h = s * 0.5;
  const top = [
    [cx, cy - s * 0.62],
    [cx + s, cy - s * 0.62 + h],
    [cx, cy - s * 0.62 + 2 * h],
    [cx - s, cy - s * 0.62 + h],
  ];
  const poly = (pts: number[][], fill: string | CanvasGradient) => {
    x.beginPath();
    pts.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b)));
    x.closePath();
    x.fillStyle = fill;
    x.fill();
  };
  const down = s * 1.05;
  poly([top[3], top[2], [top[2][0], top[2][1] + down], [top[3][0], top[3][1] + down]], '#d7dbd3');
  poly([top[2], top[1], [top[1][0], top[1][1] + down], [top[2][0], top[2][1] + down]], '#b3b9b0');
  poly(top, '#fbfbf9');
}

/** Knot stool: a round seat on three legs. */
function stool(x: C, cx: number, cy: number, r: number) {
  floorShadow(x, cx, cy + r * 1.36, r * 1.05);
  x.fillStyle = '#9ea59b';
  [-0.62, 0, 0.62].forEach((d, i) => {
    const lx = cx + d * r;
    x.fillRect(lx - r * 0.07, cy + r * 0.1, r * 0.14, r * (i === 1 ? 1.18 : 1.26));
  });
  const side = x.createLinearGradient(cx - r, 0, cx + r, 0);
  side.addColorStop(0, '#e9ece6');
  side.addColorStop(1, '#aeb4ab');
  x.beginPath();
  x.ellipse(cx, cy + r * 0.12, r, r * 0.3, 0, 0, Math.PI);
  x.lineTo(cx - r, cy - r * 0.06);
  x.ellipse(cx, cy - r * 0.06, r, r * 0.3, 0, Math.PI, 0, true);
  x.closePath();
  x.fillStyle = side;
  x.fill();
  x.beginPath();
  x.ellipse(cx, cy - r * 0.06, r, r * 0.3, 0, 0, Math.PI * 2);
  x.fillStyle = '#fafbf8';
  x.fill();
}

function floorShadow(x: C, cx: number, cy: number, w: number) {
  const g = x.createRadialGradient(cx, cy, 0, cx, cy, w);
  g.addColorStop(0, 'rgba(18, 20, 23, 0.18)');
  g.addColorStop(1, 'rgba(18, 20, 23, 0)');
  x.save();
  x.translate(cx, cy);
  x.scale(1, 0.16);
  x.translate(-cx, -cy);
  x.fillStyle = g;
  x.fillRect(cx - w, cy - w, w * 2, w * 2);
  x.restore();
}

const OBJECTS: [(x: C, cx: number, cy: number, s: number) => void, string, string][] = [
  [ring, 'Halo lamp', '$240'],
  [prism, 'Prism block', '$120'],
  [stool, 'Knot stool', '$180'],
];

/* --- the pages ----------------------------------------------------------------------------------------------- */

export const DESK = { w: 1440, h: 2140 };

/** The desktop page, at 1440 × DESK.h logical pixels (the context is scaled by the caller). */
export function drawDesk(x: C, f: Faces) {
  const { w } = DESK;
  x.fillStyle = CHALK;
  x.fillRect(0, 0, w, DESK.h);

  // the bar
  text(x, 'Forma', 64, 58, `400 30px ${f.euro}`, INK);
  ['Objects', 'Studio', 'Journal'].forEach((s, i) => text(x, s, 600 + i * 120, 56, `400 17px ${f.body}`, INK));
  text(x, 'Cart (0)', w - 64, 56, `400 17px ${f.body}`, INK, 'right');

  // the claim, and the lamp beside it
  text(x, 'Objects for', 60, 252, `400 116px ${f.euro}`, INK);
  text(x, 'bright rooms.', 60, 372, `400 116px ${f.euro}`, INK);
  text(x, 'Hand-finished ceramics,', 64, 452, `400 24px ${f.body}`, 'rgba(18, 20, 23, 0.62)');
  text(x, 'made in small runs.', 64, 486, `400 24px ${f.body}`, 'rgba(18, 20, 23, 0.62)');
  x.fillStyle = INK;
  x.fillRect(64, 536, 236, 64);
  text(x, 'Shop the drop', 182, 576, `500 19px ${f.body}`, CHALK, 'center');
  x.fillStyle = MIST;
  x.fillRect(820, 112, 556, 600);
  ring(x, 1098, 384, 168);

  // the drop: three objects and their prices
  text(x, 'The drop', 64, 818, `400 40px ${f.euro}`, INK);
  const cw = (w - 128 - 2 * 24) / 3;
  OBJECTS.forEach(([draw, name, price], i) => {
    const cx0 = 64 + i * (cw + 24);
    x.fillStyle = i === 1 ? '#e7eae3' : MIST;
    x.fillRect(cx0, 852, cw, 470);
    draw(x, cx0 + cw / 2, 1070, i === 0 ? 112 : i === 1 ? 104 : 118);
    text(x, name, cx0, 1366, `400 20px ${f.body}`, INK);
    text(x, price, cx0 + cw, 1366, `400 20px ${f.body}`, 'rgba(18, 20, 23, 0.55)', 'right');
  });

  // the studio, on ink
  x.fillStyle = INK;
  x.fillRect(0, 1450, w, 470);
  text(x, 'Hand-finished ceramics,', 64, 1600, `400 72px ${f.euro}`, CHALK);
  text(x, 'made in small runs.', 64, 1686, `400 72px ${f.euro}`, 'rgba(244, 245, 242, 0.45)');
  x.fillStyle = CHALK;
  x.fillRect(64, 1764, 236, 60);
  text(x, 'Shop the drop', 182, 1802, `500 18px ${f.body}`, INK, 'center');
  prism(x, 1150, 1650, 120);

  // the foot
  text(x, 'Forma', 56, 2104, `400 190px ${f.euro}`, INK);
  ['Objects', 'Studio', 'Journal'].forEach((s, i) => text(x, s, w - 64, 1990 + i * 30, `400 17px ${f.body}`, 'rgba(18, 20, 23, 0.6)', 'right'));
}

/** A canvas of the given logical size at a pixel scale, drawn by `draw`. */
export function paint(w: number, h: number, scale: number, draw: (x: C) => void) {
  const c = document.createElement('canvas');
  c.width = Math.round(w * scale);
  c.height = Math.round(h * scale);
  const x = c.getContext('2d')!;
  x.scale(scale, scale);
  draw(x);
  return c;
}
