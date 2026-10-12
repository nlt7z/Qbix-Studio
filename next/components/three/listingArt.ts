import type { SiteFonts } from './stage';

/**
 * 2D artwork the listing kit prints onto its 3D pieces — the flyer, the five
 * posts, the phone's captions, the yard sign. The listing photo is the same
 * golden-hour house as components/offers/HouseIllustration.tsx, drawn here
 * with the canvas API so it can live on a texture.
 */

type Ctx = CanvasRenderingContext2D;

export const LISTING = {
  address: '1428 Alder Lane',
  city: 'Palo Alto, California',
  price: '$2,195,000',
  newPrice: '$2,150,000',
  facts: ['4 bd', '3 ba', '2,310 sq ft'],
  open: 'Open house · Sat & Sun, 1 to 4 pm',
  agent: 'Jordan Lee',
  brokerage: 'Your Brokerage · DRE #01234567',
  handle: 'jordanlee.homes',
};

export const POST_LABELS = ['Just listed', 'Open house', 'Feature detail', 'Neighborhood', 'In escrow'];

const PAPER = '#faf8f3';
const INK = '#1e1d1a';
const MUTE = '#6b675f';
const BRASS = '#9c7a44';
const RULE = '#e1dbcf';

function spaced(ctx: Ctx, text: string, x: number, y: number, spacing: number) {
  // letter-spacing without relying on ctx.letterSpacing support
  let cx = x;
  for (const ch of text) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + spacing;
  }
  return cx - x;
}

/** The listing photo, cover-fitted into (x, y, w, h). `zoom` crops into the house. */
export function housePhoto(ctx: Ctx, x: number, y: number, w: number, h: number, zoom = 1, shiftX = 0) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const s = Math.max(w / 600, h / 400) * zoom;
  ctx.translate(x + w / 2 - 300 * s + shiftX * s, y + h / 2 - 200 * s);
  ctx.scale(s, s);

  const sky = ctx.createLinearGradient(0, 0, 0, 400);
  sky.addColorStop(0, '#d9c3a5');
  sky.addColorStop(0.55, '#efe2cf');
  sky.addColorStop(1, '#f7efe3');
  ctx.fillStyle = sky;
  ctx.fillRect(-400, -200, 1400, 800);

  ctx.globalAlpha = 0.55;
  ctx.fillStyle = '#cdb894';
  ctx.beginPath();
  ctx.moveTo(-400, 262);
  ctx.bezierCurveTo(90, 236, 170, 248, 260, 240);
  ctx.bezierCurveTo(360, 232, 440, 214, 1000, 236);
  ctx.lineTo(1000, 300);
  ctx.lineTo(-400, 300);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  const lawn = ctx.createLinearGradient(0, 296, 0, 400);
  lawn.addColorStop(0, '#a9b48c');
  lawn.addColorStop(1, '#8d9a6f');
  ctx.fillStyle = lawn;
  ctx.fillRect(-400, 296, 1400, 400);

  ctx.fillStyle = '#d8d2c6';
  ctx.beginPath();
  ctx.moveTo(318, 300);
  ctx.lineTo(372, 300);
  ctx.lineTo(470, 400);
  ctx.lineTo(330, 400);
  ctx.closePath();
  ctx.fill();

  const glow = () => {
    const g = ctx.createLinearGradient(0, 120, 0, 290);
    g.addColorStop(0, '#ffe7b0');
    g.addColorStop(1, '#f6c56f');
    return g;
  };
  ctx.fillStyle = '#f5f2ec';
  ctx.fillRect(120, 176, 236, 124);
  ctx.fillStyle = '#2a2926';
  ctx.fillRect(110, 166, 262, 12);
  ctx.fillStyle = glow();
  ctx.fillRect(138, 202, 128, 80);
  ctx.strokeStyle = '#2a2926';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(180, 202); ctx.lineTo(180, 282);
  ctx.moveTo(222, 202); ctx.lineTo(222, 282);
  ctx.moveTo(138, 242); ctx.lineTo(266, 242);
  ctx.stroke();
  ctx.fillStyle = '#2a2926';
  ctx.fillRect(290, 214, 34, 86);
  ctx.fillStyle = '#c9a86a';
  ctx.fillRect(317, 252, 3, 10);

  ctx.fillStyle = '#a6764d';
  ctx.fillRect(352, 126, 146, 174);
  ctx.strokeStyle = '#8c6240';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let bx = 366; bx <= 492; bx += 14) {
    ctx.moveTo(bx, 126);
    ctx.lineTo(bx, 300);
  }
  ctx.stroke();
  ctx.fillStyle = '#2a2926';
  ctx.fillRect(344, 116, 162, 12);
  ctx.fillStyle = glow();
  ctx.fillRect(378, 150, 62, 118);
  ctx.strokeStyle = '#2a2926';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(409, 150);
  ctx.lineTo(409, 268);
  ctx.stroke();

  ctx.fillStyle = '#7a7f69';
  ctx.fillRect(112, 286, 230, 14);
  ctx.fillStyle = '#5f4a36';
  ctx.fillRect(66, 214, 8, 86);
  const blob = (cx: number, cy: number, r: number, c: string) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  };
  blob(70, 196, 40, '#76875a');
  blob(46, 214, 26, '#6b7b51');
  blob(94, 216, 24, '#829364');
  ctx.fillStyle = '#6f8052';
  ctx.beginPath();
  ctx.ellipse(540, 292, 40, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Print flyer, 8.5 × 11. `price` lets the "editable copies" beat retype it; `caret` draws the text cursor. */
export function drawFlyer(ctx: Ctx, w: number, h: number, F: SiteFonts, price = LISTING.price, caret = false) {
  const u = w / 100;   // 1% of the sheet width
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, w, h);
  housePhoto(ctx, 0, 0, w, h * 0.5);

  let y = h * 0.5 + u * 7;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = BRASS;
  ctx.font = `600 ${u * 3.3}px ${F.body}`;
  spaced(ctx, 'JUST LISTED', u * 7, y, u * 0.66);

  y += u * 10.4;
  ctx.fillStyle = INK;
  ctx.font = `400 ${u * 9.4}px ${F.head}`;
  ctx.fillText(LISTING.address, u * 7, y);

  y += u * 5.4;
  ctx.fillStyle = MUTE;
  ctx.font = `400 ${u * 3.9}px ${F.body}`;
  ctx.fillText(LISTING.city, u * 7, y);

  y += u * 4.4;
  ctx.fillStyle = RULE;
  ctx.fillRect(u * 7, y, w - u * 14, Math.max(1, u * 0.18));
  const rowY = y + u * 6;
  ctx.fillStyle = INK;
  ctx.font = `600 ${u * 3.6}px ${F.body}`;
  ctx.fillText(price, u * 7, rowY);
  const pw = ctx.measureText(price).width;
  if (caret) ctx.fillRect(u * 7 + pw + u * 0.6, rowY - u * 3.4, Math.max(2, u * 0.4), u * 4.4);
  ctx.font = `400 ${u * 3.5}px ${F.body}`;
  let fx = u * 7 + Math.max(pw, ctx.measureText(LISTING.price).width + u * 1) + u * 3.6;
  for (const f of LISTING.facts) {
    ctx.fillText(f, fx, rowY);
    fx += ctx.measureText(f).width + u * 3.2;
  }
  y = rowY + u * 2.6;
  ctx.fillStyle = RULE;
  ctx.fillRect(u * 7, y, w - u * 14, Math.max(1, u * 0.18));

  y += u * 6.4;
  ctx.fillStyle = INK;
  ctx.font = `400 ${u * 3.6}px ${F.body}`;
  ctx.fillText(LISTING.open, u * 7, y);

  // agent row, pinned to the foot of the sheet
  const ay = h - u * 15.5;
  ctx.fillStyle = INK;
  ctx.fillRect(u * 7, ay, u * 9.5, u * 9.5);
  ctx.fillStyle = PAPER;
  ctx.font = `600 ${u * 3.4}px ${F.body}`;
  ctx.textAlign = 'center';
  ctx.fillText('JL', u * 11.75, ay + u * 6);
  ctx.textAlign = 'left';
  ctx.fillStyle = INK;
  ctx.font = `600 ${u * 3.8}px ${F.body}`;
  ctx.fillText(LISTING.agent, u * 19.5, ay + u * 4);
  ctx.fillStyle = MUTE;
  ctx.font = `400 ${u * 3.2}px ${F.body}`;
  ctx.fillText(LISTING.brokerage, u * 19.5, ay + u * 8.4);
}

/** One social post (4:5). */
export function drawPost(ctx: Ctx, w: number, h: number, F: SiteFonts, i: number) {
  const u = w / 100;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);

  // header
  ctx.fillStyle = INK;
  ctx.fillRect(u * 4, u * 3.4, u * 8, u * 8);
  ctx.fillStyle = '#ffffff';
  ctx.font = `600 ${u * 3}px ${F.body}`;
  ctx.textAlign = 'center';
  ctx.fillText('JL', u * 8, u * 8.6);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#111111';
  ctx.font = `600 ${u * 4}px ${F.body}`;
  ctx.fillText(LISTING.handle, u * 15, u * 8.8);

  const iy = u * 15;
  const ih = w;   // square image
  if (i === 2) {
    // feature detail: the wood volume up close, one lit window
    ctx.fillStyle = '#a6764d';
    ctx.fillRect(0, iy, w, ih);
    ctx.strokeStyle = '#8c6240';
    ctx.lineWidth = u * 1.1;
    ctx.beginPath();
    for (let x = u * 4; x < w; x += u * 7) {
      ctx.moveTo(x, iy);
      ctx.lineTo(x, iy + ih);
    }
    ctx.stroke();
    const g = ctx.createLinearGradient(0, iy, 0, iy + ih);
    g.addColorStop(0, '#ffe7b0');
    g.addColorStop(1, '#f6c56f');
    ctx.fillStyle = g;
    ctx.fillRect(u * 30, iy + u * 12, u * 36, u * 74);
    ctx.fillStyle = '#2a2926';
    ctx.fillRect(u * 47, iy + u * 12, u * 1.6, u * 74);
  } else if (i === 3) {
    // neighborhood: a quiet street map with one pin
    ctx.fillStyle = '#ece6d8';
    ctx.fillRect(0, iy, w, ih);
    ctx.fillStyle = '#dcd3c0';
    for (let k = 0; k < 6; k++) ctx.fillRect(0, iy + u * (8 + k * 17), w, u * 3);
    for (let k = 0; k < 5; k++) ctx.fillRect(u * (10 + k * 21), iy, u * 3, ih);
    ctx.fillStyle = '#b9c49d';
    ctx.fillRect(u * 56, iy + u * 46, u * 24, u * 20);
    ctx.fillStyle = INK;
    ctx.fillRect(u * 38, iy + u * 34, u * 9, u * 9);
    ctx.fillRect(u * 41.8, iy + u * 43, u * 1.4, u * 8);
  } else {
    housePhoto(ctx, 0, iy, w, ih, i === 1 ? 1.25 : 1, i === 1 ? -40 : 0);
  }

  // on-image badge
  const label = POST_LABELS[i].toUpperCase();
  ctx.font = `600 ${u * 3.6}px ${F.body}`;
  const bw = u * 6.8 + label.length * u * 3.15;
  if (i === 4) {
    ctx.save();
    ctx.translate(w / 2, iy + ih / 2);
    ctx.rotate(-0.42);
    ctx.fillStyle = 'rgba(30, 29, 26, 0.92)';
    ctx.fillRect(-w, -u * 6, w * 2, u * 12);
    ctx.fillStyle = PAPER;
    ctx.textAlign = 'center';
    spaced(ctx, label, -u * 18, u * 1.4, u * 0.9);
    ctx.textAlign = 'left';
    ctx.restore();
  } else {
    ctx.fillStyle = PAPER;
    ctx.fillRect(u * 5, iy + ih - u * 15, bw, u * 9.4);
    ctx.fillStyle = INK;
    spaced(ctx, label, u * 8.4, iy + ih - u * 8.8, u * 0.7);
  }

  // caption
  const cy = iy + ih + u * 8;
  ctx.fillStyle = '#111111';
  ctx.font = `600 ${u * 4}px ${F.body}`;
  ctx.fillText(LISTING.address, u * 4, cy);
  ctx.fillStyle = '#666666';
  ctx.font = `400 ${u * 3.6}px ${F.body}`;
  ctx.fillText(i === 1 ? 'Sat & Sun, 1 to 4 pm' : i === 3 ? 'Five minutes to downtown' : `${LISTING.price} · Open Sat & Sun`, u * 4, cy + u * 6);
}

/** Captions over the phone's video (transparent background). */
export function drawPhoneOverlay(ctx: Ctx, w: number, h: number, F: SiteFonts, seconds: number) {
  const u = w / 100;
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = u * 2;
  ctx.fillStyle = '#ffffff';
  ctx.font = `600 ${u * 7.2}px ${F.body}`;
  ctx.fillText(LISTING.address, u * 7, u * 14);
  ctx.font = `400 ${u * 5.4}px ${F.body}`;
  ctx.fillText('Open Sat & Sun', u * 7, u * 22);
  ctx.font = `500 ${u * 4.6}px ${F.mono}`;
  ctx.textAlign = 'right';
  const s = Math.max(0, Math.min(30, Math.floor(seconds)));
  ctx.fillText(`0:${String(s).padStart(2, '0')} / 0:30`, w - u * 7, h - u * 5);
  ctx.textAlign = 'left';
  ctx.shadowBlur = 0;
}

/** The lime yard sign. */
export function drawSign(ctx: Ctx, w: number, h: number, F: SiteFonts) {
  ctx.fillStyle = '#B8FF00';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#0F1A00';
  ctx.font = `500 ${h * 0.26}px ${F.mono}`;
  const label = 'JUST LISTED';
  const tw = ctx.measureText(label).width + label.length * h * 0.03;
  spaced(ctx, label, (w - tw) / 2, h * 0.5, h * 0.03);
  ctx.font = `400 ${h * 0.14}px ${F.body}`;
  ctx.textAlign = 'center';
  ctx.fillText('Jordan Lee · Your Brokerage', w / 2, h * 0.78);
  ctx.textAlign = 'left';
}

/** "Final files" stamp that lands on the flyer after the one round of changes. */
export function drawStamp(ctx: Ctx, w: number, h: number, F: SiteFonts) {
  ctx.fillStyle = '#B8FF00';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#0F1A00';
  ctx.font = `500 ${h * 0.38}px ${F.mono}`;
  const label = 'FINAL FILES';
  const tw = ctx.measureText(label).width + label.length * h * 0.05;
  spaced(ctx, label, (w - tw) / 2, h * 0.64, h * 0.05);
}

/** Golden-hour sky behind the house in the phone's video. */
export function drawSky(ctx: Ctx, w: number, h: number) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#cdb08c');
  g.addColorStop(0.5, '#ead9c0');
  g.addColorStop(1, '#f7efe3');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}
