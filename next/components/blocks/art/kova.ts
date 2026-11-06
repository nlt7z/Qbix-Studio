import type { Faces } from '@/components/blocks/art/forma';

/**
 * Kova's app, drawn on a canvas for the brand upgrade's 3D (KovaLayers): the Kova scene's own app
 * (components/scenes/Kova.tsx), its words and figures, as the layers of its screen. As it shipped: system
 * type, greys, a placeholder logo, edges off the grid. The grid it was set on: four columns, an 8 pt
 * baseline. As designed: ink and chalk, Eurostile for the figures, Geist for the words, the lime kept for
 * its mark and this month. All 300 × 624 logical pixels, the screen; everything but the grounds on clear.
 */
export const KW = 300;
export const KH = 624;
type C = CanvasRenderingContext2D;

const BARS = [30, 40, 26, 46, 34, 52, 32, 44, 58, 38, 50, 44];
const MONTHS = 'NDJFMAMJJASO'.split('');
const ROWS: [string, string, string][] = [
  ['Groceries', 'Today', '−$84'],
  ['Studio rent', 'Monthly', '−$1,200'],
  ['Coffee', 'Yesterday', '−$4.50'],
];
const K = 'M56 44H80V110.06L118.06 72H152L106 118L152 164H118.06L80 125.94V164H56Z';
const SYS = 'Helvetica, Arial, sans-serif';
const CHALK = '#f4f5f2';
const chalk = (a: number) => `rgba(244, 245, 242, ${a})`;

function t(x: C, s: string, px: number, py: number, font: string, color: string, align: CanvasTextAlign = 'left') {
  x.font = font;
  x.fillStyle = color;
  x.textAlign = align;
  x.fillText(s, px, py);
}

function status(x: C, font: string, color: string) {
  t(x, '9:41', 26, 26, font, color);
  x.fillStyle = color;
  x.fillRect(KW - 48, 16, 22, 11);
  x.fillRect(KW - 25, 19, 2, 5);
}

/** As it shipped: the content only (the white ground is its own layer). */
export function drawPlain(x: C) {
  status(x, `600 13px ${SYS}`, '#222');
  // a placeholder logo, a stock mountain
  x.fillStyle = '#9a9a9a';
  x.beginPath();
  x.moveTo(16, 80);
  x.lineTo(24, 66);
  x.lineTo(29, 73);
  x.lineTo(32, 69);
  x.lineTo(38, 80);
  x.closePath();
  x.fill();
  t(x, 'Kova', 44, 79, `700 16px ${SYS}`, '#555');
  x.fillStyle = '#dddddd';
  x.beginPath();
  x.arc(266, 72, 16, 0, Math.PI * 2);
  x.fill();
  t(x, 'A', 266, 77, `700 14px ${SYS}`, '#777', 'center');
  x.fillStyle = '#e6e6e6';
  x.fillRect(0, 100, KW, 1);
  t(x, 'Good morning, Ana', 18, 134, `400 17px ${SYS}`, '#333');
  t(x, 'Balance', 30, 168, `400 12px ${SYS}`, '#8a8a8a');
  t(x, '$48,210', 30, 206, `700 34px ${SYS}`, '#333');
  t(x, '+4.2% this month', 30, 228, `400 12px ${SYS}`, '#8a8a8a');
  x.fillStyle = '#f0f0f0';
  x.fillRect(14, 254, 272, 142);
  t(x, 'Spending', 28, 280, `700 13px ${SYS}`, '#444');
  x.fillStyle = '#c3c3c3';
  BARS.forEach((h, i) => x.fillRect(30 + i * 20.4, 382 - h * 1.15, 11, h * 1.15));
  ROWS.forEach(([n, , a], i) => {
    const y = 438 + i * 44;
    t(x, n, 18, y, `400 14px ${SYS}`, '#333');
    t(x, a, 282, y, `400 14px ${SYS}`, '#333', 'right');
    x.fillStyle = '#ececec';
    x.fillRect(18, y + 16, 264, 1);
  });
  x.fillStyle = '#cccccc';
  x.fillRect(KW / 2 - 54, KH - 14, 108, 4);
}

/** The grid: four columns in lime, an 8 pt baseline, the 24 pt margins. */
export function drawGrid(x: C) {
  const M = 24;
  const G = 16;
  const col = (KW - 2 * M - 3 * G) / 4;
  x.fillStyle = 'rgba(184, 255, 0, 0.3)';
  for (let i = 0; i < 4; i++) x.fillRect(M + i * (col + G), 44, col, KH - 72);
  x.fillStyle = 'rgba(11, 12, 13, 0.08)';
  for (let y = 44; y < KH - 28; y += 8) x.fillRect(0, y, KW, 1);
}

/** As designed: its content on clear (the ink is its own layer). */
export function drawDesigned(x: C, f: Faces) {
  const M = 24;
  status(x, `600 13px ${f.body}`, CHALK);
  t(x, 'kova', 68, 80, `400 26px ${f.euro}`, CHALK);
  x.strokeStyle = chalk(0.35);
  x.lineWidth = 1;
  x.beginPath();
  x.arc(260, 72, 16, 0, Math.PI * 2);
  x.stroke();
  t(x, 'A', 260, 77, `400 14px ${f.body}`, CHALK, 'center');
  t(x, 'Good morning, Ana', M, 128, `400 15px ${f.body}`, chalk(0.72));
  t(x, 'Balance', M, 160, `400 11px ${f.body}`, chalk(0.45));
  t(x, '$48,210', M - 2, 210, `400 48px ${f.euro}`, CHALK);
  t(x, '+4.2%', M, 242, `500 13px ${f.body}`, '#b8ff00');
  t(x, 'this month', M + 46, 242, `400 13px ${f.body}`, chalk(0.5));
  t(x, 'Spending', M, 292, `500 14px ${f.body}`, CHALK);
  t(x, '12 months', KW - M, 292, `400 11px ${f.body}`, chalk(0.45), 'right');
  x.fillStyle = chalk(0.16);
  x.fillRect(M, 376, KW - 2 * M, 1);
  BARS.forEach((h, i) => {
    const bx = M + (i * (KW - 2 * M - 12)) / 11;
    const now = i === BARS.length - 1;
    x.fillStyle = now ? '#b8ff00' : chalk(0.3);
    x.fillRect(bx, 376 - h, 12, h);
    t(x, MONTHS[i], bx + 6, 394, `400 10px ${f.body}`, now ? CHALK : chalk(0.4), 'center');
  });
  ROWS.forEach(([n, s, a], i) => {
    const y = 432 + i * 48;
    t(x, n, M, y, `400 14px ${f.body}`, CHALK);
    t(x, s, M, y + 17, `400 11px ${f.body}`, chalk(0.45));
    t(x, a, KW - M, y + 6, `400 15px ${f.euro}`, CHALK, 'right');
  });
  x.fillStyle = chalk(0.5);
  x.fillRect(KW / 2 - 54, KH - 14, 108, 4);
}

/** Its mark: the k on the lime icon, at its place in the bar. */
export function drawMark(x: C) {
  x.fillStyle = '#b8ff00';
  x.fillRect(24, 56, 34, 34);
  x.save();
  x.translate(24, 56);
  x.scale(34 / 208, 34 / 208);
  x.fillStyle = '#0b0c0e';
  x.fill(new Path2D(K));
  x.restore();
}
