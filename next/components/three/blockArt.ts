import { type Pen, person, seeded } from './blockPrints';

/**
 * The pictures printed on the pieces (components/three/blockPrints.ts):
 * flat shapes in the page's ink at a few strengths, now and then a lime
 * one, the way a print studio would draw them for a mock-up. Each fills the
 * face it is drawn on.
 */

// Several circles filled as one shape, so where they overlap is no darker.
function blob(g: Pen, circles: number[][], a: number) {
  g.shape((c) => {
    for (const [x, y, r] of circles) {
      c.moveTo(x + r, y);
      c.arc(x, y, r, 0, Math.PI * 2);
    }
  }, 'ink', a);
}

/** Headphones from the front: the band's centre at cx, cy; s the band's radius. Takes about 2.4 s by 2.3 s. */
function headphonesAt(g: Pen, cx: number, cy: number, s: number) {
  // a soft shadow under the cups
  g.shape((c) => c.ellipse(cx, cy + s * 1.24, s * 1.25, s * 0.07, 0, 0, Math.PI * 2), 'ink', 0.12);
  // the band, and its pad
  g.shape((c) => c.arc(cx, cy, s, Math.PI, 0), 'ink', 1, s * 0.15);
  g.shape((c) => c.arc(cx, cy, s * 0.88, Math.PI * 1.2, Math.PI * 1.8), 'ink', 0.5, s * 0.11);
  for (const d of [-1, 1]) {
    // the yoke down to the cup
    g.box(cx + d * s - s * 0.045, cy - s * 0.02, s * 0.09, s * 0.3, 'ink', 0.75);
    // the cup, and its cushion facing in
    const ox = cx + d * s * 1.02;
    g.box(ox - s * 0.18, cy + s * 0.2, s * 0.36, s * 0.96, 'ink', 1, s * 0.18);
    g.box(d < 0 ? ox + s * 0.14 : ox - s * 0.3, cy + s * 0.28, s * 0.16, s * 0.8, 'ink', 0.5, s * 0.08);
    // a highlight down the outer side
    g.box(d < 0 ? ox - s * 0.1 : ox + s * 0.05, cy + s * 0.36, s * 0.05, s * 0.44, 'base', 0.32, s * 0.025);
  }
  g.dot(cx + s * 1.02, cy + s * 1.0, s * 0.045, 'lime');
}

/** A studio shot of the headphones: a pale sweep, the floor a shade darker. */
export function headphones(g: Pen, scale = 1) {
  const { w, h } = g;
  g.fade(0, 0, 0, h, [[0, 0.04], [0.68, 0.1], [0.7, 0.13], [1, 0.17]]);
  const s = Math.min(w / 2.9, h / 2.9) * scale;
  headphonesAt(g, w / 2, h * 0.47 - s * 0.1, s);
}

/** Sound: rings going out from a point, the point lime. */
export function waves(g: Pen) {
  const { w, h } = g;
  g.fill('ink', 0.06);
  const cx = w * 0.28, cy = h * 0.62;
  for (let i = 1; i <= 9; i++) g.ring(cx, cy, i * h * 0.13, h * 0.022, 'ink', Math.max(0.1, 0.8 - i * 0.08));
  g.dot(cx, cy, h * 0.06, 'lime');
}

function tree(g: Pen, x: number, gy: number, s: number, a = 0.55) {
  g.box(x - s * 0.035, gy - s * 0.5, s * 0.07, s * 0.5, 'ink', 0.85);
  blob(g, [[x, gy - s * 0.72, s * 0.28], [x - s * 0.16, gy - s * 0.56, s * 0.2], [x + s * 0.17, gy - s * 0.55, s * 0.19]], a);
}

/** A house from the street, its walls s wide, standing on gy, centred on cx. The door is lime. */
function houseAt(g: Pen, cx: number, gy: number, s: number) {
  const x = cx - s / 2, top = gy - s * 0.5;
  g.box(cx + s * 0.22, top - s * 0.34, s * 0.09, s * 0.24, 'ink', 1);                            // chimney
  g.box(x, top, s, s * 0.5, 'ink', 0.72);                                                       // walls
  g.poly([x - s * 0.08, top + s * 0.03, cx, top - s * 0.36, x + s + s * 0.08, top + s * 0.03], 'ink', 1);   // roof
  g.dot(cx, top - s * 0.12, s * 0.055, 'base');                                                 // the gable's window
  const win = (wx: number) => {
    g.box(wx, top + s * 0.13, s * 0.2, s * 0.17, 'base');
    g.box(wx + s * 0.094, top + s * 0.13, s * 0.012, s * 0.17, 'ink', 0.72);
    g.box(wx, top + s * 0.21, s * 0.2, s * 0.012, 'ink', 0.72);
  };
  win(x + s * 0.09);
  win(x + s * 0.71);
  g.box(cx - s * 0.075, gy - s * 0.31, s * 0.15, s * 0.31, 'lime');                             // the door
  g.dot(cx + s * 0.045, gy - s * 0.15, s * 0.013, 'ink', 0.9);
  blob(g, [[x + s * 0.06, gy - s * 0.03, s * 0.07], [x + s * 0.17, gy - s * 0.02, s * 0.06], [x + s * 0.84, gy - s * 0.03, s * 0.07], [x + s * 0.95, gy - s * 0.02, s * 0.06]], 0.9);
}

/** The house on its street: sky, lawn, the path up to the door, two trees. */
export function street(g: Pen, o: { s?: number; cx?: number; gy?: number } = {}) {
  const { w, h } = g;
  const gy = o.gy ?? h * 0.8, cx = o.cx ?? w * 0.5, s = o.s ?? Math.min(w * 0.5, h * 0.95);
  g.fill('ink', 0.05);
  g.dot(w * 0.84, h * 0.2, h * 0.08, 'ink', 0.08);
  g.box(0, gy, w, h - gy, 'ink', 0.2);
  g.poly([cx - s * 0.07, gy, cx + s * 0.07, gy, cx + s * 0.18, h, cx - s * 0.18, h], 'base');
  tree(g, cx - s * 0.82, gy, s * 0.62);
  tree(g, cx + s * 0.84, gy, s * 0.5, 0.42);
  houseAt(g, cx, gy, s);
}

/** A sign on the lawn: OPEN HOUSE, hung from a post; the house behind, pale. */
export function openSign(g: Pen) {
  const { w, h } = g;
  g.fill('ink', 0.05);
  const gy = h * 0.8;
  g.shape((c) => {
    const s = h * 0.9, x = w * 0.7 - s / 2, top = gy - s * 0.5;
    c.rect(x, top, s, s * 0.5);
    c.moveTo(x - s * 0.08, top + s * 0.03);
    c.lineTo(x + s / 2, top - s * 0.36);
    c.lineTo(x + s + s * 0.08, top + s * 0.03);
    c.closePath();
  }, 'ink', 0.16);
  g.box(0, gy, w, h - gy, 'ink', 0.2);
  const px = w * 0.24;
  g.box(px - w * 0.012, h * 0.16, w * 0.024, gy - h * 0.16 + h * 0.04, 'ink', 1);   // the post
  g.box(px, h * 0.18, w * 0.36, h * 0.03, 'ink', 1);                                // its arm
  g.line([px + w * 0.08, h * 0.21, px + w * 0.08, h * 0.28], h * 0.012, 'ink', 0.9);
  g.line([px + w * 0.3, h * 0.21, px + w * 0.3, h * 0.28], h * 0.012, 'ink', 0.9);
  const bx = px + w * 0.03, by = h * 0.28, bw = w * 0.32, bh = h * 0.3;
  g.box(bx, by, bw, bh, 'lime');
  g.text('OPEN', bx + bw / 2, by + bh * 0.38, { size: bh * 0.3, weight: 600, align: 'center', mid: true, track: 0.04 });
  g.text('HOUSE', bx + bw / 2, by + bh * 0.72, { size: bh * 0.22, weight: 600, align: 'center', mid: true, track: 0.08 });
}

/** A kitchen: an island under two pendants, cabinets, a window, stools. */
export function kitchen(g: Pen) {
  const { w, h } = g;
  g.fill('ink', 0.06);
  g.box(0, h * 0.82, w, h * 0.18, 'ink', 0.16);
  g.box(w * 0.06, h * 0.1, w * 0.34, h * 0.24, 'ink', 0.3);
  g.box(w * 0.226, h * 0.1, w * 0.008, h * 0.24, 'ink', 0.45);
  g.box(w * 0.58, h * 0.1, w * 0.34, h * 0.3, 'base');
  g.frame(w * 0.58, h * 0.1, w * 0.34, h * 0.3, h * 0.025, 'ink', 0.35);
  g.box(w * 0.746, h * 0.1, w * 0.008, h * 0.3, 'ink', 0.35);
  for (const x of [w * 0.36, w * 0.6]) {
    g.line([x, 0, x, h * 0.3], h * 0.012, 'ink', 0.8);
    g.shape((c) => { c.arc(x, h * 0.37, w * 0.06, Math.PI, 0); c.closePath(); }, 'ink', 1);
  }
  g.box(w * 0.12, h * 0.52, w * 0.76, h * 0.05, 'ink', 1);
  g.box(w * 0.15, h * 0.57, w * 0.7, h * 0.25, 'ink', 0.74);
  for (const x of [w * 0.3, w * 0.5, w * 0.7]) {
    g.box(x - w * 0.055, h * 0.66, w * 0.11, h * 0.035, 'ink', 1);
    g.line([x - w * 0.04, h * 0.69, x - w * 0.05, h * 0.83], h * 0.012, 'ink', 1);
    g.line([x + w * 0.04, h * 0.69, x + w * 0.05, h * 0.83], h * 0.012, 'ink', 1);
  }
}

/** A living room: a sofa under a window, a plant, a lamp, a rug. */
export function living(g: Pen) {
  const { w, h } = g;
  g.fill('ink', 0.06);
  g.box(0, h * 0.8, w, h * 0.2, 'ink', 0.16);
  g.shape((c) => c.ellipse(w * 0.44, h * 0.86, w * 0.36, h * 0.05, 0, 0, Math.PI * 2), 'ink', 0.14);
  g.box(w * 0.2, h * 0.1, w * 0.48, h * 0.36, 'base');
  g.frame(w * 0.2, h * 0.1, w * 0.48, h * 0.36, h * 0.025, 'ink', 0.3);
  g.box(w * 0.436, h * 0.1, w * 0.008, h * 0.36, 'ink', 0.3);
  g.box(w * 0.14, h * 0.5, w * 0.6, h * 0.17, 'ink', 0.82, h * 0.04);
  g.box(w * 0.1, h * 0.58, w * 0.68, h * 0.18, 'ink', 1, h * 0.04);
  g.box(w * 0.2, h * 0.53, w * 0.16, h * 0.1, 'base', 0.3, h * 0.03);
  g.box(w * 0.52, h * 0.53, w * 0.16, h * 0.1, 'lime', 1, h * 0.03);
  g.box(w * 0.14, h * 0.76, w * 0.012, h * 0.06, 'ink', 1);
  g.box(w * 0.73, h * 0.76, w * 0.012, h * 0.06, 'ink', 1);
  // a plant
  g.poly([w * 0.83, h * 0.66, w * 0.93, h * 0.66, w * 0.915, h * 0.8, w * 0.845, h * 0.8], 'ink', 1);
  g.shape((c) => {
    for (const [x, y, rx, ry, r] of [[0.88, 0.5, 0.025, 0.12, -0.3], [0.85, 0.56, 0.022, 0.1, -0.9], [0.91, 0.55, 0.022, 0.1, 0.8], [0.88, 0.42, 0.02, 0.09, 0.2]]) {
      c.moveTo(w * x + w * rx, h * y);
      c.ellipse(w * x, h * y, w * rx, h * ry, r, 0, Math.PI * 2);
    }
  }, 'ink', 0.6);
}

/** A bedroom: a bed with pillows, a lamp on a side table, a picture above. */
export function bedroom(g: Pen) {
  const { w, h } = g;
  g.fill('ink', 0.06);
  g.box(0, h * 0.8, w, h * 0.2, 'ink', 0.16);
  g.frame(w * 0.36, h * 0.12, w * 0.26, h * 0.2, h * 0.02, 'ink', 0.5);
  g.shape((c) => { c.moveTo(w * 0.38, h * 0.3); c.lineTo(w * 0.46, h * 0.2); c.lineTo(w * 0.52, h * 0.27); c.lineTo(w * 0.56, h * 0.23); c.lineTo(w * 0.6, h * 0.3); c.closePath(); }, 'ink', 0.35);
  g.box(w * 0.2, h * 0.38, w * 0.58, h * 0.36, 'ink', 1, h * 0.04);         // headboard
  g.box(w * 0.16, h * 0.56, w * 0.66, h * 0.24, 'base');                       // the bed
  g.box(w * 0.16, h * 0.64, w * 0.66, h * 0.16, 'ink', 0.45);                  // the blanket
  g.box(w * 0.24, h * 0.47, w * 0.2, h * 0.1, 'base', 1, h * 0.03);
  g.box(w * 0.54, h * 0.47, w * 0.2, h * 0.1, 'base', 1, h * 0.03);
  g.box(w * 0.86, h * 0.6, w * 0.1, h * 0.2, 'ink', 0.85);                     // side table
  g.box(w * 0.905, h * 0.44, w * 0.01, h * 0.16, 'ink', 0.85);
  g.poly([w * 0.87, h * 0.44, w * 0.95, h * 0.44, w * 0.93, h * 0.34, w * 0.89, h * 0.34], 'ink', 0.85);
}

/** A therapist's room: an armchair by a window, a floor lamp, a plant, a rug. Calm. */
export function room(g: Pen) {
  const { w, h } = g;
  g.fill('ink', 0.05);
  g.box(0, h * 0.8, w, h * 0.2, 'ink', 0.13);
  g.shape((c) => c.ellipse(w * 0.4, h * 0.87, w * 0.3, h * 0.045, 0, 0, Math.PI * 2), 'ink', 0.1);
  // the window, a curtain at its side
  g.box(w * 0.5, h * 0.1, w * 0.34, h * 0.42, 'base');
  g.frame(w * 0.5, h * 0.1, w * 0.34, h * 0.42, h * 0.02, 'ink', 0.25);
  g.box(w * 0.666, h * 0.1, w * 0.008, h * 0.42, 'ink', 0.25);
  g.box(w * 0.46, h * 0.07, w * 0.07, h * 0.52, 'ink', 0.16);
  // a small framed print
  g.frame(w * 0.12, h * 0.17, w * 0.18, h * 0.16, h * 0.016, 'ink', 0.45);
  g.dot(w * 0.21, h * 0.25, h * 0.035, 'ink', 0.3);
  // the armchair
  g.box(w * 0.16, h * 0.46, w * 0.36, h * 0.24, 'ink', 0.82, h * 0.06);
  g.box(w * 0.13, h * 0.6, w * 0.42, h * 0.12, 'ink', 0.95, h * 0.035);
  g.box(w * 0.11, h * 0.54, w * 0.07, h * 0.2, 'ink', 1, h * 0.03);
  g.box(w * 0.5, h * 0.54, w * 0.07, h * 0.2, 'ink', 1, h * 0.03);
  g.box(w * 0.15, h * 0.74, w * 0.015, h * 0.07, 'ink', 1);
  g.box(w * 0.52, h * 0.74, w * 0.015, h * 0.07, 'ink', 1);
  // a floor lamp, its light on
  g.box(w * 0.7, h * 0.36, w * 0.012, h * 0.44, 'ink', 0.9);
  g.box(w * 0.66, h * 0.79, w * 0.09, h * 0.015, 'ink', 0.9);
  g.poly([w * 0.645, h * 0.38, w * 0.765, h * 0.38, w * 0.745, h * 0.27, w * 0.665, h * 0.27], 'ink', 0.9);
  g.box(w * 0.672, h * 0.38, w * 0.066, h * 0.012, 'lime');
  // a plant on the floor
  g.poly([w * 0.82, h * 0.68, w * 0.92, h * 0.68, w * 0.905, h * 0.8, w * 0.835, h * 0.8], 'ink', 1);
  g.shape((c) => {
    for (const [x, y, rx, ry, r] of [[0.87, 0.53, 0.024, 0.12, -0.25], [0.84, 0.58, 0.022, 0.1, -0.85], [0.9, 0.58, 0.022, 0.1, 0.85], [0.875, 0.45, 0.018, 0.08, 0.15]]) {
      c.moveTo(w * x + w * rx, h * y);
      c.ellipse(w * x, h * y, w * rx, h * ry, r, 0, Math.PI * 2);
    }
  }, 'ink', 0.6);
}

/** A landscape to take a palette from: hills, a pale sky, a lime sun. */
export function landscape(g: Pen) {
  const { w, h } = g;
  g.fade(0, 0, 0, h, [[0, 0.03], [0.62, 0.14]]);
  g.dot(w * 0.66, h * 0.33, Math.min(w, h) * 0.13, 'lime');
  g.poly([0, h * 0.6, w * 0.2, h * 0.42, w * 0.36, h * 0.53, w * 0.55, h * 0.36, w * 0.78, h * 0.56, w, h * 0.45, w, h, 0, h], 'ink', 0.42);
  g.poly([0, h * 0.74, w * 0.26, h * 0.58, w * 0.52, h * 0.76, w * 0.8, h * 0.62, w, h * 0.72, w, h, 0, h], 'ink', 0.85);
  g.box(0, h * 0.86, w, h * 0.14, 'ink', 1);
}

/** A playing card's suit, centred on cx, cy, s tall. */
export function suit(g: Pen, kind: 'spade' | 'heart' | 'diamond' | 'club', cx: number, cy: number, s: number) {
  const r = s * 0.27;
  if (kind === 'diamond') return g.poly([cx, cy - s * 0.5, cx + s * 0.36, cy, cx, cy + s * 0.5, cx - s * 0.36, cy]);
  if (kind === 'heart') {
    return g.shape((c) => {
      c.moveTo(cx, cy + s * 0.48);
      c.bezierCurveTo(cx - s * 0.6, cy + s * 0.05, cx - s * 0.5, cy - s * 0.52, cx, cy - s * 0.2);
      c.bezierCurveTo(cx + s * 0.5, cy - s * 0.52, cx + s * 0.6, cy + s * 0.05, cx, cy + s * 0.48);
      c.closePath();
    });
  }
  if (kind === 'spade') {
    g.shape((c) => {
      c.moveTo(cx, cy - s * 0.5);
      c.bezierCurveTo(cx + s * 0.6, cy - s * 0.02, cx + s * 0.5, cy + s * 0.42, cx, cy + s * 0.14);
      c.bezierCurveTo(cx - s * 0.5, cy + s * 0.42, cx - s * 0.6, cy - s * 0.02, cx, cy - s * 0.5);
      c.closePath();
    });
  } else {
    blob(g, [[cx, cy - s * 0.2, r], [cx - s * 0.26, cy + s * 0.08, r], [cx + s * 0.26, cy + s * 0.08, r]], 1);
  }
  g.poly([cx, cy + s * 0.02, cx + s * 0.13, cy + s * 0.5, cx - s * 0.13, cy + s * 0.5]);
}

/** A playing card's face: its rank and suit in the corner, one big suit in the middle. */
export function cardFace(g: Pen, rank: string, kind: 'spade' | 'heart' | 'diamond' | 'club') {
  const { w, h } = g;
  g.text(rank, w * 0.13, h * 0.2, { size: h * 0.16, weight: 600 });
  suit(g, kind, w * 0.2, h * 0.3, h * 0.1);
  suit(g, kind, w * 0.55, h * 0.58, h * 0.32);
}

/** Someone on a video call: a pale wall, head and shoulders. */
export function caller(g: Pen, cx = g.w * 0.5, a = 0.82) {
  const { h } = g;
  g.fade(0, 0, 0, h, [[0, 0.06], [1, 0.16]]);
  g.box(g.w * 0.08, h * 0.12, g.w * 0.16, h * 0.3, 'ink', 0.08);
  person(g, cx, h * 1.02, h * 0.82, 'ink', a);
}

/** A recorded voice, bars around a centre line; played up to `played` (0..1). */
export function waveform(g: Pen, x: number, y: number, w: number, h: number, played: number, seed = 3) {
  const rnd = seeded(seed), n = Math.floor(w / 0.075);
  let v = 0.4;
  for (let i = 0; i < n; i++) {
    v = Math.min(1, Math.max(0.08, v + (rnd() - 0.5) * 0.5));
    const env = 0.35 + 0.65 * Math.sin((i / n) * Math.PI * 3.2) ** 2;
    const bh = h * v * env;
    const bx = x + i * 0.075;
    g.box(bx, y + h / 2 - bh / 2, 0.045, Math.max(0.02, bh), 'ink', bx < x + w * played ? 0.85 : 0.28, 0.02);
  }
}
