/**
 * What is printed on the pieces: the words, pictures and small interfaces
 * that make a scene a particular thing (a launch site's headline, the house
 * on a flyer, a hand of cards), drawn into one texture, the atlas, and
 * printed on a piece's front face like the legend on a keycap.
 *
 * Prints are drawn in channels, not colours, so they follow the page like
 * everything else on the object: red is the ink (the colour that stands out
 * from the piece: ink on a white piece, white on an ink one, ink on lime),
 * green is the lime, black leaves the piece's own colour. Ink at part
 * strength is a grey.
 *
 * A print is named and sized in the units of the face it goes on. Scenes
 * define theirs (definePrint) as they build their pieces; a rig asks for an
 * atlas of the ones its scenes use (printAtlas), drawn once the page's fonts
 * are in.
 */

export type Ink = 'ink' | 'lime' | 'base';
export type Font = 'head' | 'sans' | 'mono' | 'serif';
export type TextOpts = {
  size: number;          // the font size, in units
  font?: Font;
  weight?: number;
  ink?: Ink;
  a?: number;            // strength: 1 the full colour, less a grey
  align?: CanvasTextAlign;
  track?: number;        // letter spacing, in ems
  italic?: boolean;
  mid?: boolean;         // y is the middle of the capitals, not the baseline
};
export type Draw = (g: Pen) => void;
/** Where a print is in the atlas: u, v, width, height. */
export type Rect = [number, number, number, number];
export type Atlas = { canvas: HTMLCanvasElement; rects: Map<string, Rect> };

type Def = { w: number; h: number; ppu: number; draw: Draw };
const defs = new Map<string, Def>();

/** A print `name`, for a face w × h units, drawn at ppu pixels a unit. The first definition of a name stands. */
export function definePrint(name: string, w: number, h: number, draw: Draw, ppu = 128) {
  if (!defs.has(name)) defs.set(name, { w, h, ppu, draw });
}

// a rectangle with round corners, for any canvas
function rr(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

/** Drawing on one face, in its units: x to the right and y down from its top left corner. */
export class Pen {
  constructor(
    readonly c: CanvasRenderingContext2D,
    private ox: number,
    private oy: number,
    readonly u: number,
    readonly w: number,
    readonly h: number,
    private fonts: Record<Font, string>,
  ) {}

  col(ink: Ink = 'ink', a = 1) {
    return ink === 'lime' ? `rgba(0,255,0,${a})` : ink === 'base' ? `rgba(0,0,0,${a})` : `rgba(255,0,0,${a})`;
  }
  /** A path given in units, filled, or stroked `line` wide. */
  shape(path: (c: CanvasRenderingContext2D) => void, ink: Ink = 'ink', a = 1, line = 0, square = false) {
    const c = this.c;
    c.save();
    c.setTransform(this.u, 0, 0, this.u, this.ox, this.oy);
    c.beginPath();
    path(c);
    if (line > 0) {
      c.lineWidth = line;
      c.lineCap = square ? 'butt' : 'round';
      c.lineJoin = square ? 'miter' : 'round';
      c.strokeStyle = this.col(ink, a);
      c.stroke();
    } else {
      c.fillStyle = this.col(ink, a);
      c.fill();
    }
    c.restore();
  }
  fill(ink: Ink = 'ink', a = 1) {
    this.box(0, 0, this.w, this.h, ink, a);
  }
  /** The face (or a box on it) in ink fading along a line; stops are [where, 0..1; strength]. */
  fade(x0: number, y0: number, x1: number, y1: number, stops: [number, number][], ink: Ink = 'ink', box?: [number, number, number, number]) {
    const c = this.c;
    c.save();
    c.setTransform(this.u, 0, 0, this.u, this.ox, this.oy);
    const gr = c.createLinearGradient(x0, y0, x1, y1);
    for (const [t, a] of stops) gr.addColorStop(t, this.col(ink, a));
    c.fillStyle = gr;
    const [bx, by, bw, bh] = box ?? [0, 0, this.w, this.h];
    c.fillRect(bx, by, bw, bh);
    c.restore();
  }
  box(x: number, y: number, w: number, h: number, ink: Ink = 'ink', a = 1, r = 0) {
    this.shape((c) => (r > 0 ? rr(c, x, y, w, h, r) : c.rect(x, y, w, h)), ink, a);
  }
  /** An outline `line` wide, inside the box. */
  frame(x: number, y: number, w: number, h: number, line: number, ink: Ink = 'ink', a = 1, r = 0) {
    const l = line / 2;
    this.shape((c) => (r > 0 ? rr(c, x + l, y + l, w - line, h - line, Math.max(0, r - l)) : c.rect(x + l, y + l, w - line, h - line)), ink, a, line, r <= 0);
  }
  dot(cx: number, cy: number, r: number, ink: Ink = 'ink', a = 1) {
    this.shape((c) => c.arc(cx, cy, r, 0, Math.PI * 2), ink, a);
  }
  ring(cx: number, cy: number, r: number, line: number, ink: Ink = 'ink', a = 1) {
    this.shape((c) => c.arc(cx, cy, r, 0, Math.PI * 2), ink, a, line);
  }
  /** A filled polygon: x, y, x, y, ... */
  poly(pts: number[], ink: Ink = 'ink', a = 1) {
    this.shape((c) => {
      c.moveTo(pts[0], pts[1]);
      for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
      c.closePath();
    }, ink, a);
  }
  /** A line through points: x, y, x, y, ... */
  line(pts: number[], width: number, ink: Ink = 'ink', a = 1) {
    this.shape((c) => {
      c.moveTo(pts[0], pts[1]);
      for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
    }, ink, a, width);
  }
  private font(o: TextOpts) {
    const c = this.c;
    c.font = `${o.italic ? 'italic ' : ''}${o.weight ?? 400} ${o.size * this.u}px ${this.fonts[o.font ?? 'sans']}`;
    (c as unknown as { letterSpacing: string }).letterSpacing = `${(o.track ?? 0) * o.size * this.u}px`;
  }
  /** Words at x, on the baseline y (or with `mid`, y the middle of the capitals). Returns their width. */
  text(s: string, x: number, y: number, o: TextOpts): number {
    const c = this.c;
    c.save();
    c.setTransform(1, 0, 0, 1, 0, 0);
    this.font(o);
    c.textAlign = o.align ?? 'left';
    c.textBaseline = 'alphabetic';
    c.fillStyle = this.col(o.ink, o.a ?? 1);
    c.fillText(s, this.ox + x * this.u, this.oy + (o.mid ? y + 0.35 * o.size : y) * this.u);
    const w = c.measureText(s).width / this.u;
    c.restore();
    return w;
  }
  measure(s: string, o: TextOpts): number {
    const c = this.c;
    c.save();
    this.font(o);
    const w = c.measureText(s).width / this.u;
    c.restore();
    return w;
  }
  /** Words wrapped to maxW, lines lh apart, the first baseline at y. Returns the number of lines. */
  para(s: string, x: number, y: number, maxW: number, lh: number, o: TextOpts): number {
    const words = s.split(' ');
    let line = '', n = 0;
    for (const w of words) {
      const next = line ? `${line} ${w}` : w;
      if (line && this.measure(next, o) > maxW) {
        this.text(line, x, y + n * lh, o);
        n++;
        line = w;
      } else line = next;
    }
    if (line) this.text(line, x, y + n * lh, o), n++;
    return n;
  }
}

/* ------------------------------------------------------------------ glyphs */

/** A padlock, its body's top left at x, y, s tall. */
export function lock(g: Pen, x: number, y: number, s: number, ink: Ink = 'ink', a = 1) {
  g.shape((c) => c.arc(x + s * 0.38, y + s * 0.4, s * 0.24, Math.PI, 0), ink, a, s * 0.11);
  g.shape((c) => c.rect(x + s * 0.14 - s * 0.055, y + s * 0.4, s * 0.11, s * 0.08), ink, a);
  g.shape((c) => c.rect(x + s * 0.62 - s * 0.055, y + s * 0.4, s * 0.11, s * 0.08), ink, a);
  g.box(x, y + s * 0.46, s * 0.76, s * 0.54, ink, a, s * 0.08);
}

/** A tick, in a box s wide whose top left is x, y. */
export function tick(g: Pen, x: number, y: number, s: number, ink: Ink = 'ink', a = 1) {
  g.line([x + s * 0.2, y + s * 0.52, x + s * 0.42, y + s * 0.74, x + s * 0.8, y + s * 0.3], s * 0.14, ink, a);
}

/** A head and shoulders, centred on cx, standing on y (bottom), h tall. */
export function person(g: Pen, cx: number, y: number, h: number, ink: Ink = 'ink', a = 1) {
  g.dot(cx, y - h * 0.68, h * 0.2, ink, a);
  g.shape((c) => {
    c.moveTo(cx - h * 0.42, y);
    c.bezierCurveTo(cx - h * 0.42, y - h * 0.34, cx - h * 0.2, y - h * 0.42, cx, y - h * 0.42);
    c.bezierCurveTo(cx + h * 0.2, y - h * 0.42, cx + h * 0.42, y - h * 0.34, cx + h * 0.42, y);
    c.closePath();
  }, ink, a);
}

/** A small seeded random source, so a print draws the same every time. */
export function seeded(seed: number) {
  let s = seed % 2147483647 || 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** A QR-like square of modules (a picture of one; it encodes nothing), s wide, top left x, y. */
export function qr(g: Pen, x: number, y: number, s: number, seed = 5, ink: Ink = 'ink') {
  const n = 21, m = s / n, rnd = seeded(seed);
  const finder = (i: number, j: number) => {
    g.box(x + i * m, y + j * m, 7 * m, 7 * m, ink);
    g.box(x + (i + 1) * m, y + (j + 1) * m, 5 * m, 5 * m, 'base');
    g.box(x + (i + 2) * m, y + (j + 2) * m, 3 * m, 3 * m, ink);
  };
  const inFinder = (i: number, j: number) => (i < 8 && j < 8) || (i > n - 9 && j < 8) || (i < 8 && j > n - 9);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    if (inFinder(i, j)) continue;
    if (rnd() < 0.48) g.box(x + i * m - 0.002, y + j * m - 0.002, m + 0.004, m + 0.004, ink);
  }
  finder(0, 0);
  finder(n - 7, 0);
  finder(0, n - 7);
}

/* ------------------------------------------------------------------- atlas */

const S = 2048;
const PAD = 6;

let fontsP: Promise<Record<Font, string>> | null = null;
function pageFonts(): Promise<Record<Font, string>> {
  if (!fontsP) {
    fontsP = (async () => {
      const cs = getComputedStyle(document.documentElement);
      const v = (n: string, fb: string) => cs.getPropertyValue(n).trim() || fb;
      const f: Record<Font, string> = {
        head: v('--font-headline', 'Arial, sans-serif'),
        sans: v('--font-sans', 'Arial, sans-serif'),
        mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
        serif: 'Georgia, "Times New Roman", serif',
      };
      const want = [`400 32px ${f.head}`, `400 32px ${f.sans}`, `500 32px ${f.sans}`, `600 32px ${f.sans}`];
      try {
        await Promise.race([Promise.all(want.map((s) => document.fonts.load(s))), new Promise((r) => setTimeout(r, 2500))]);
      } catch {
        /* draw with whatever fonts there are */
      }
      return f;
    })();
  }
  return fontsP;
}

type Spot = { name: string; x: number; y: number; w: number; h: number; u: number };

// Shelves, tallest first. null if they don't fit in S × S at this scale.
function pack(list: string[], scale: number): { spots: Spot[]; height: number } | null {
  const items = list.map((name) => {
    const d = defs.get(name)!;
    const u = d.ppu * scale;
    return { name, w: d.w * u, h: d.h * u, u };
  });
  items.sort((a, b) => b.h - a.h || b.w - a.w);
  const spots: Spot[] = [];
  let x = PAD, y = PAD, row = 0;
  for (const it of items) {
    const w = Math.ceil(it.w), h = Math.ceil(it.h);
    if (w + PAD * 2 > S) return null;
    if (x + w + PAD > S) {
      x = PAD;
      y += row + PAD;
      row = 0;
    }
    if (y + h + PAD > S) return null;
    spots.push({ name: it.name, x, y, w: it.w, h: it.h, u: it.u });
    x += w + PAD;
    row = Math.max(row, h);
  }
  return { spots, height: y + row + PAD };
}

// Drawn a few prints at a time, giving the page back between, so a slow phone doesn't stall.
async function drawAtlas(list: string[], fonts: Record<Font, string>): Promise<Atlas> {
  let packed: ReturnType<typeof pack> = null;
  for (let scale = 1, i = 0; !packed && i < 16; i++, scale *= 0.92) packed = pack(list, scale);
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = Math.max(4, Math.ceil((packed?.height ?? 4) / 4) * 4);
  const c = canvas.getContext('2d')!;
  c.fillStyle = '#000';
  c.fillRect(0, 0, canvas.width, canvas.height);
  const rects = new Map<string, Rect>();
  let slice = performance.now();
  for (const sp of packed?.spots ?? []) {
    if (performance.now() - slice > 8) {
      await new Promise((r) => setTimeout(r, 0));
      slice = performance.now();
    }
    const d = defs.get(sp.name)!;
    c.save();
    c.beginPath();
    c.rect(sp.x, sp.y, sp.w, sp.h);
    c.clip();
    try {
      d.draw(new Pen(c, sp.x, sp.y, sp.u, d.w, d.h, fonts));
    } catch (err) {
      console.warn(`[prints] ${sp.name}:`, err);
    }
    c.restore();
    rects.set(sp.name, [sp.x / S, 1 - (sp.y + sp.h) / canvas.height, sp.w / S, sp.h / canvas.height]);
  }
  return { canvas, rects };
}

const atlases = new Map<string, Promise<Atlas>>();
/** An atlas of these prints (any not defined are left out), drawn once the page's fonts are in. */
export function printAtlas(names: Iterable<string>): Promise<Atlas> {
  const list = Array.from(new Set(names)).filter((n) => defs.has(n)).sort();
  const key = list.join('|');
  let p = atlases.get(key);
  if (!p) {
    p = pageFonts().then((f) => drawAtlas(list, f));
    atlases.set(key, p);
  }
  return p;
}
