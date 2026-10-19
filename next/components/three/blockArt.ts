import { type Pen, person, seeded } from './blockPrints';

/**
 * The pictures printed on the pieces (components/three/blockPrints.ts):
 * drawn like a print studio's line art, in the ink at full strength, the
 * paper left white, and now and then one lime thing. No greys. Each fills
 * the face it is drawn on.
 */

// Several circles filled as one shape.
function blob(g: Pen, circles: number[][]) {
  g.shape((c) => {
    for (const [x, y, r] of circles) {
      c.moveTo(x + r, y);
      c.arc(x, y, r, 0, Math.PI * 2);
    }
  }, 'ink', 1);
}
// A box outlined `line` wide (the line inside it).
const outline = (g: Pen, x: number, y: number, w: number, h: number, line: number) => g.frame(x, y, w, h, line, 'ink', 1);

/** Headphones from the front: the band's centre at cx, cy; s the band's radius. Takes about 2.4 s by 2.3 s. */
function headphonesAt(g: Pen, cx: number, cy: number, s: number) {
  g.shape((c) => c.arc(cx, cy, s, Math.PI, 0), 'ink', 1, s * 0.15);
  g.shape((c) => c.arc(cx, cy, s * 0.99, Math.PI * 1.22, Math.PI * 1.78), 'base', 1, s * 0.03);   // the pad's seam
  for (const d of [-1, 1]) {
    g.box(cx + d * s - s * 0.045, cy - s * 0.02, s * 0.09, s * 0.3, 'ink', 1);          // the yoke
    const ox = cx + d * s * 1.02;
    g.box(ox - s * 0.18, cy + s * 0.2, s * 0.36, s * 0.96, 'ink', 1, s * 0.18);           // the cup
    g.box(d < 0 ? ox + s * 0.14 : ox - s * 0.18, cy + s * 0.34, s * 0.04, s * 0.68, 'base', 1, s * 0.02);   // where the cushion meets it
    g.box(d < 0 ? ox - s * 0.1 : ox + s * 0.05, cy + s * 0.36, s * 0.04, s * 0.4, 'base', 1, s * 0.02);    // a highlight
  }
  g.dot(cx + s * 1.02, cy + s * 1.0, s * 0.045, 'lime');
}

/** A product shot of the headphones on white. */
export function headphones(g: Pen, scale = 1) {
  const { w, h } = g;
  const s = Math.min(w / 2.9, h / 2.9) * scale;
  headphonesAt(g, w / 2, h * 0.47 - s * 0.1, s);
  g.box(w * 0.5 - s * 1.3, h * 0.47 + s * 1.28, s * 2.6, s * 0.03, 'ink', 1);   // what they stand on
}

/** Sound: rings going out from a point, the point lime. */
export function waves(g: Pen) {
  const { h } = g;
  const cx = g.w * 0.28, cy = h * 0.62;
  for (let i = 1; i <= 9; i++) g.ring(cx, cy, i * h * 0.13, h * Math.max(0.006, 0.03 - i * 0.003), 'ink', 1);
  g.dot(cx, cy, h * 0.06, 'lime');
}

function tree(g: Pen, x: number, gy: number, s: number) {
  g.box(x - s * 0.03, gy - s * 0.5, s * 0.06, s * 0.5, 'ink', 1);
  blob(g, [[x, gy - s * 0.72, s * 0.26], [x - s * 0.15, gy - s * 0.56, s * 0.19], [x + s * 0.16, gy - s * 0.55, s * 0.18]]);
}

/** A house from the street, its walls s wide, standing on gy, centred on cx. The door is lime. */
function houseAt(g: Pen, cx: number, gy: number, s: number) {
  const x = cx - s / 2, top = gy - s * 0.5, line = s * 0.022;
  g.box(cx + s * 0.22, top - s * 0.34, s * 0.09, s * 0.24, 'ink', 1);                                   // chimney
  outline(g, x, top, s, s * 0.5, line);                                                               // walls
  g.poly([x - s * 0.08, top + s * 0.03, cx, top - s * 0.36, x + s + s * 0.08, top + s * 0.03], 'ink', 1);   // roof
  g.dot(cx, top - s * 0.12, s * 0.055, 'base');                                                       // the gable's window
  const win = (wx: number) => {
    g.box(wx, top + s * 0.13, s * 0.2, s * 0.17, 'ink', 1);
    g.box(wx + s * 0.094, top + s * 0.13, s * 0.012, s * 0.17, 'base', 1);
    g.box(wx, top + s * 0.21, s * 0.2, s * 0.012, 'base', 1);
  };
  win(x + s * 0.09);
  win(x + s * 0.71);
  g.box(cx - s * 0.075, gy - s * 0.31, s * 0.15, s * 0.31, 'lime');                                   // the door
  outline(g, cx - s * 0.075, gy - s * 0.31, s * 0.15, s * 0.31, line * 0.8);
  blob(g, [[x + s * 0.06, gy - s * 0.03, s * 0.07], [x + s * 0.17, gy - s * 0.02, s * 0.06], [x + s * 0.84, gy - s * 0.03, s * 0.07], [x + s * 0.95, gy - s * 0.02, s * 0.06]]);
}

/** The house on its street: the ground, the path up to the door, two trees. */
export function street(g: Pen, o: { s?: number; cx?: number; gy?: number } = {}) {
  const { w, h } = g;
  const gy = o.gy ?? h * 0.8, cx = o.cx ?? w * 0.5, s = o.s ?? Math.min(w * 0.5, h * 0.95);
  g.ring(w * 0.84, h * 0.2, h * 0.07, h * 0.012, 'ink', 1);                     // the sun
  g.box(0, gy, w, s * 0.022, 'ink', 1);                                        // the ground
  g.line([cx - s * 0.06, gy, cx - s * 0.2, h], s * 0.018, 'ink', 1);            // the path
  g.line([cx + s * 0.06, gy, cx + s * 0.2, h], s * 0.018, 'ink', 1);
  tree(g, cx - s * 0.82, gy, s * 0.62);
  tree(g, cx + s * 0.84, gy, s * 0.5);
  houseAt(g, cx, gy, s);
}

/** A sign on the lawn: OPEN HOUSE, hung from a post; the house behind, in outline. */
export function openSign(g: Pen) {
  const { w, h } = g;
  const gy = h * 0.8, s = h * 0.9, hx = w * 0.7 - s / 2, top = gy - s * 0.5;
  g.shape((c) => {
    c.moveTo(hx - s * 0.08, top + s * 0.03);
    c.lineTo(hx + s / 2, top - s * 0.36);
    c.lineTo(hx + s + s * 0.08, top + s * 0.03);
    c.moveTo(hx, top + s * 0.02);
    c.lineTo(hx, gy);
    c.moveTo(hx + s, top + s * 0.02);
    c.lineTo(hx + s, gy);
  }, 'ink', 1, h * 0.012);
  g.box(0, gy, w, h * 0.02, 'ink', 1);
  const px = w * 0.24;
  g.box(px - w * 0.012, h * 0.16, w * 0.024, gy - h * 0.16, 'ink', 1);   // the post
  g.box(px, h * 0.18, w * 0.36, h * 0.03, 'ink', 1);                     // its arm
  g.line([px + w * 0.08, h * 0.21, px + w * 0.08, h * 0.28], h * 0.012, 'ink', 1);
  g.line([px + w * 0.3, h * 0.21, px + w * 0.3, h * 0.28], h * 0.012, 'ink', 1);
  const bx = px + w * 0.03, by = h * 0.28, bw = w * 0.32, bh = h * 0.3;
  g.box(bx, by, bw, bh, 'lime');
  g.text('OPEN', bx + bw / 2, by + bh * 0.38, { size: bh * 0.3, weight: 600, align: 'center', mid: true, track: 0.04 });
  g.text('HOUSE', bx + bw / 2, by + bh * 0.72, { size: bh * 0.22, weight: 600, align: 'center', mid: true, track: 0.08 });
}

/** A kitchen: an island under two pendants, cabinets, a window, stools. */
export function kitchen(g: Pen) {
  const { w, h } = g;
  const l = h * 0.018;
  g.box(0, h * 0.82, w, l, 'ink', 1);
  outline(g, w * 0.06, h * 0.1, w * 0.34, h * 0.24, l);
  g.box(w * 0.226, h * 0.1, l, h * 0.24, 'ink', 1);
  outline(g, w * 0.58, h * 0.1, w * 0.34, h * 0.3, l);
  g.box(w * 0.746, h * 0.1, l, h * 0.3, 'ink', 1);
  for (const x of [w * 0.36, w * 0.6]) {
    g.line([x, 0, x, h * 0.3], l * 0.8, 'ink', 1);
    g.shape((c) => { c.arc(x, h * 0.37, w * 0.06, Math.PI, 0); c.closePath(); }, 'ink', 1);
  }
  g.box(w * 0.12, h * 0.52, w * 0.76, h * 0.05, 'ink', 1);
  outline(g, w * 0.15, h * 0.57, w * 0.7, h * 0.25, l);
  for (const x of [w * 0.33, w * 0.5, w * 0.67]) g.box(x - w * 0.04, h * 0.66, w * 0.08, l, 'ink', 1);
  for (const x of [w * 0.3, w * 0.5, w * 0.7]) {
    g.box(x - w * 0.055, h * 0.7, w * 0.11, h * 0.035, 'ink', 1);
    g.line([x - w * 0.04, h * 0.73, x - w * 0.05, h * 0.83], l, 'ink', 1);
    g.line([x + w * 0.04, h * 0.73, x + w * 0.05, h * 0.83], l, 'ink', 1);
  }
}

/** A living room: a sofa under a window, a plant, a rug. */
export function living(g: Pen) {
  const { w, h } = g;
  const l = h * 0.018;
  g.box(0, h * 0.82, w, l, 'ink', 1);
  outline(g, w * 0.2, h * 0.1, w * 0.48, h * 0.36, l);
  g.box(w * 0.436, h * 0.1, l, h * 0.36, 'ink', 1);
  g.shape((c) => c.ellipse(w * 0.44, h * 0.88, w * 0.34, h * 0.045, 0, 0, Math.PI * 2), 'ink', 1, l * 0.8);
  g.box(w * 0.14, h * 0.5, w * 0.6, h * 0.17, 'ink', 1, h * 0.04);
  g.box(w * 0.1, h * 0.58, w * 0.68, h * 0.18, 'ink', 1, h * 0.04);
  g.box(w * 0.2, h * 0.535, w * 0.16, h * 0.012, 'base', 1);
  g.box(w * 0.52, h * 0.53, w * 0.16, h * 0.1, 'lime', 1, h * 0.03);
  g.box(w * 0.14, h * 0.76, w * 0.012, h * 0.06, 'ink', 1);
  g.box(w * 0.73, h * 0.76, w * 0.012, h * 0.06, 'ink', 1);
  g.poly([w * 0.83, h * 0.66, w * 0.93, h * 0.66, w * 0.915, h * 0.8, w * 0.845, h * 0.8], 'ink', 1);
  g.shape((c) => {
    for (const [x, y, rx, ry, r] of [[0.88, 0.5, 0.025, 0.12, -0.3], [0.85, 0.56, 0.022, 0.1, -0.9], [0.91, 0.55, 0.022, 0.1, 0.8], [0.88, 0.42, 0.02, 0.09, 0.2]]) {
      c.moveTo(w * x + w * rx, h * y);
      c.ellipse(w * x, h * y, w * rx, h * ry, r, 0, Math.PI * 2);
    }
  }, 'ink', 1);
}

/** A bedroom: a bed with pillows, a lamp on a side table, a picture above. */
export function bedroom(g: Pen) {
  const { w, h } = g;
  const l = h * 0.018;
  g.box(0, h * 0.82, w, l, 'ink', 1);
  outline(g, w * 0.36, h * 0.1, w * 0.26, h * 0.2, l);
  g.line([w * 0.38, h * 0.27, w * 0.46, h * 0.18, w * 0.52, h * 0.24, w * 0.56, h * 0.2, w * 0.6, h * 0.27], l * 0.8, 'ink', 1);
  g.box(w * 0.2, h * 0.38, w * 0.58, h * 0.36, 'ink', 1, h * 0.04);       // headboard
  g.box(w * 0.16, h * 0.56, w * 0.66, h * 0.24, 'base');                    // the bed
  outline(g, w * 0.16, h * 0.56, w * 0.66, h * 0.24, l);
  g.box(w * 0.16, h * 0.66, w * 0.66, h * 0.14, 'ink', 1);                   // the blanket
  g.box(w * 0.24, h * 0.47, w * 0.2, h * 0.1, 'base', 1, h * 0.03);
  g.box(w * 0.54, h * 0.47, w * 0.2, h * 0.1, 'base', 1, h * 0.03);
  outline(g, w * 0.24, h * 0.47, w * 0.2, h * 0.1, l * 0.8);
  outline(g, w * 0.54, h * 0.47, w * 0.2, h * 0.1, l * 0.8);
  g.box(w * 0.86, h * 0.6, w * 0.1, h * 0.22, 'ink', 1);
  g.box(w * 0.905, h * 0.44, w * 0.01, h * 0.16, 'ink', 1);
  g.poly([w * 0.87, h * 0.44, w * 0.95, h * 0.44, w * 0.93, h * 0.34, w * 0.89, h * 0.34], 'ink', 1);
}

/** A therapist's room: an armchair by a window, a floor lamp lit, a plant, a rug. Calm. */
export function room(g: Pen) {
  const { w, h } = g;
  const l = h * 0.016;
  g.box(0, h * 0.8, w, l, 'ink', 1);
  g.shape((c) => c.ellipse(w * 0.4, h * 0.88, w * 0.3, h * 0.045, 0, 0, Math.PI * 2), 'ink', 1, l * 0.8);
  outline(g, w * 0.5, h * 0.1, w * 0.34, h * 0.42, l);                      // the window
  g.box(w * 0.666, h * 0.1, l, h * 0.42, 'ink', 1);
  g.line([w * 0.47, h * 0.07, w * 0.47, h * 0.6], l, 'ink', 1);              // the curtain, hanging
  g.line([w * 0.51, h * 0.07, w * 0.5, h * 0.6], l * 0.7, 'ink', 1);
  outline(g, w * 0.12, h * 0.17, w * 0.18, h * 0.16, l * 0.8);              // a small framed print
  g.dot(w * 0.21, h * 0.25, h * 0.035, 'ink', 1);
  g.box(w * 0.16, h * 0.46, w * 0.36, h * 0.24, 'ink', 1, h * 0.06);       // the armchair
  g.box(w * 0.13, h * 0.6, w * 0.42, h * 0.12, 'ink', 1, h * 0.035);
  g.box(w * 0.11, h * 0.54, w * 0.07, h * 0.2, 'ink', 1, h * 0.03);
  g.box(w * 0.5, h * 0.54, w * 0.07, h * 0.2, 'ink', 1, h * 0.03);
  g.box(w * 0.2, h * 0.595, w * 0.28, h * 0.01, 'base', 1);                  // the seam of its cushion
  g.box(w * 0.15, h * 0.74, w * 0.015, h * 0.07, 'ink', 1);
  g.box(w * 0.52, h * 0.74, w * 0.015, h * 0.07, 'ink', 1);
  g.box(w * 0.7, h * 0.36, w * 0.012, h * 0.44, 'ink', 1);                   // a floor lamp, its light on
  g.box(w * 0.66, h * 0.79, w * 0.09, h * 0.015, 'ink', 1);
  g.poly([w * 0.645, h * 0.38, w * 0.765, h * 0.38, w * 0.745, h * 0.27, w * 0.665, h * 0.27], 'ink', 1);
  g.box(w * 0.672, h * 0.38, w * 0.066, h * 0.014, 'lime');
  g.poly([w * 0.82, h * 0.68, w * 0.92, h * 0.68, w * 0.905, h * 0.8, w * 0.835, h * 0.8], 'ink', 1);   // a plant
  g.shape((c) => {
    for (const [x, y, rx, ry, r] of [[0.87, 0.53, 0.024, 0.12, -0.25], [0.84, 0.58, 0.022, 0.1, -0.85], [0.9, 0.58, 0.022, 0.1, 0.85], [0.875, 0.45, 0.018, 0.08, 0.15]]) {
      c.moveTo(w * x + w * rx, h * y);
      c.ellipse(w * x, h * y, w * rx, h * ry, r, 0, Math.PI * 2);
    }
  }, 'ink', 1);
}

/** A landscape to take a palette from: two hills, the far one drawn, the near one solid, a lime sun. */
export function landscape(g: Pen) {
  const { w, h } = g;
  g.dot(w * 0.66, h * 0.33, Math.min(w, h) * 0.13, 'lime');
  g.line([0, h * 0.6, w * 0.2, h * 0.42, w * 0.36, h * 0.53, w * 0.55, h * 0.36, w * 0.78, h * 0.56, w, h * 0.45], h * 0.012, 'ink', 1);
  g.poly([0, h * 0.74, w * 0.26, h * 0.58, w * 0.52, h * 0.76, w * 0.8, h * 0.62, w, h * 0.72, w, h, 0, h], 'ink', 1);
  g.line([w * 0.08, h * 0.88, w * 0.3, h * 0.88], h * 0.008, 'base', 1);
  g.line([w * 0.5, h * 0.92, w * 0.78, h * 0.92], h * 0.008, 'base', 1);
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
    blob(g, [[cx, cy - s * 0.2, r], [cx - s * 0.26, cy + s * 0.08, r], [cx + s * 0.26, cy + s * 0.08, r]]);
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

/** Someone on a video call: a picture on the wall behind, head and shoulders. */
export function caller(g: Pen, cx = g.w * 0.5) {
  const { h } = g;
  g.frame(g.w * 0.08, h * 0.12, g.w * 0.16, h * 0.3, h * 0.012, 'ink', 1);
  person(g, cx, h * 1.02, h * 0.82, 'ink', 1);
}

/** A recorded voice, bars around a centre line; played up to `played` (0..1), the rest drawn thin. */
export function waveform(g: Pen, x: number, y: number, w: number, h: number, played: number, seed = 3) {
  const rnd = seeded(seed), n = Math.floor(w / 0.075);
  let v = 0.4;
  for (let i = 0; i < n; i++) {
    v = Math.min(1, Math.max(0.08, v + (rnd() - 0.5) * 0.5));
    const env = 0.35 + 0.65 * Math.sin((i / n) * Math.PI * 3.2) ** 2;
    const bh = h * v * env;
    const bx = x + i * 0.075;
    const done = bx < x + w * played;
    g.box(done ? bx : bx + 0.0135, y + h / 2 - bh / 2, done ? 0.045 : 0.018, Math.max(0.02, bh), 'ink', 1, 0.01);
  }
}
