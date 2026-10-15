import type { SiteFonts } from './stage';

/**
 * 2D layers the listing kit prints onto its 3D pieces — the flyer, the five
 * posts, the phone's captions, the yard sign, the stamp. The listing photos
 * themselves are live renders of the 3D house, shown through the transparent
 * windows these layers leave open.
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

const PAPER = '#f7f8f9';
const INK = '#121417';
const MUTE = '#5f656d';
const RULE = '#e2e5e8';

function spaced(ctx: Ctx, text: string, x: number, y: number, spacing: number) {
  // letter-spacing without relying on ctx.letterSpacing support
  let cx = x;
  for (const ch of text) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + spacing;
  }
  return cx - x;
}

/** Share of the flyer's height taken by the photo window at its top. */
export const FLYER_PHOTO = 0.5;

/** Print flyer, 8.5 × 11 — the photo window is left transparent. */
export function drawFlyer(ctx: Ctx, w: number, h: number, F: SiteFonts, price = LISTING.price, caret = false) {
  const u = w / 100;   // 1% of the sheet width
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, h * FLYER_PHOTO, w, h * (1 - FLYER_PHOTO));

  let y = h * FLYER_PHOTO + u * 8;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = INK;
  ctx.fillRect(u * 7, y - u * 2.9, u * 2.9, u * 2.9);
  ctx.fillStyle = INK;
  ctx.font = `600 ${u * 3.1}px ${F.body}`;
  spaced(ctx, 'JUST LISTED', u * 11.6, y, u * 0.7);

  y += u * 10.4;
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

/** Post layout (4:5): header band, square photo window, caption band — as fractions of the height. */
export const POST = { head: 0.09, photo: 0.8 };

/** Map for the neighborhood post (drawn instead of a photo). */
function streetMap(ctx: Ctx, x: number, y: number, s: number) {
  const u = s / 100;
  ctx.fillStyle = '#e7ebee';
  ctx.fillRect(x, y, s, s);
  ctx.fillStyle = '#d3d9de';
  for (let k = 0; k < 6; k++) ctx.fillRect(x, y + u * (8 + k * 17), s, u * 3);
  for (let k = 0; k < 5; k++) ctx.fillRect(x + u * (10 + k * 21), y, u * 3, s);
  ctx.fillStyle = '#c9d2d8';
  ctx.fillRect(x + u * 56, y + u * 46, u * 24, u * 20);
  ctx.fillStyle = INK;
  ctx.fillRect(x + u * 36, y + u * 32, u * 11, u * 11);
  ctx.fillStyle = PAPER;
  ctx.fillRect(x + u * 39, y + u * 35, u * 5, u * 5);
  ctx.fillStyle = INK;
  ctx.fillRect(x + u * 40.8, y + u * 43, u * 1.4, u * 8);
}

/** One social post — the photo window is transparent (except the map post). */
export function drawPost(ctx: Ctx, w: number, h: number, F: SiteFonts, i: number) {
  const u = w / 100;
  const head = h * POST.head;
  const iy = head;
  const ih = h * POST.photo;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, head);
  ctx.fillRect(0, iy + ih, w, h - iy - ih);

  // header
  ctx.fillStyle = INK;
  ctx.fillRect(u * 4, head / 2 - u * 4, u * 8, u * 8);
  ctx.fillStyle = '#ffffff';
  ctx.font = `600 ${u * 3}px ${F.body}`;
  ctx.textAlign = 'center';
  ctx.fillText('JL', u * 8, head / 2 + u * 1.1);
  ctx.textAlign = 'left';
  ctx.fillStyle = INK;
  ctx.font = `600 ${u * 4}px ${F.body}`;
  ctx.fillText(LISTING.handle, u * 15, head / 2 + u * 1.4);

  if (i === 3) streetMap(ctx, 0, iy, ih);

  // on-image badge
  const label = POST_LABELS[i].toUpperCase();
  ctx.font = `600 ${u * 3.6}px ${F.body}`;
  if (i === 4) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, iy, w, ih);
    ctx.clip();
    ctx.translate(w / 2, iy + ih / 2);
    ctx.rotate(-0.42);
    ctx.fillStyle = INK;
    ctx.fillRect(-w, -u * 6, w * 2, u * 12);
    ctx.fillStyle = PAPER;
    spaced(ctx, label, -u * 18, u * 1.4, u * 0.9);
    ctx.restore();
  } else {
    const bw = u * 6.8 + label.length * u * 3.15;
    ctx.fillStyle = i === 0 ? INK : PAPER;
    ctx.fillRect(u * 5, iy + ih - u * 15, bw, u * 9.4);
    ctx.fillStyle = i === 0 ? PAPER : INK;
    spaced(ctx, label, u * 8.4, iy + ih - u * 8.8, u * 0.7);
  }

  // caption
  const cy = iy + ih + u * 7.2;
  ctx.fillStyle = INK;
  ctx.font = `600 ${u * 4}px ${F.body}`;
  ctx.fillText(LISTING.address, u * 4, cy);
  ctx.fillStyle = MUTE;
  ctx.font = `400 ${u * 3.4}px ${F.body}`;
  ctx.fillText(i === 1 ? 'Sat & Sun, 1 to 4 pm' : i === 3 ? 'Five minutes to downtown' : `${LISTING.price} · Open Sat & Sun`, u * 4, cy + u * 5.4);
}

/** Captions over the phone's video (transparent background). */
export function drawPhoneOverlay(ctx: Ctx, w: number, h: number, F: SiteFonts, seconds: number) {
  const u = w / 100;
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
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

/** The yard sign: white type on ink. */
export function drawSign(ctx: Ctx, w: number, h: number, F: SiteFonts) {
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = PAPER;
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
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = PAPER;
  ctx.font = `500 ${h * 0.38}px ${F.mono}`;
  const label = 'FINAL FILES';
  const tw = ctx.measureText(label).width + label.length * h * 0.05;
  spaced(ctx, label, (w - tw) / 2, h * 0.64, h * 0.05);
}

/** Cool studio sky behind the house in the photos and the video. */
export function drawSky(ctx: Ctx, w: number, h: number) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#c9d3da');
  g.addColorStop(0.55, '#e4e9ed');
  g.addColorStop(1, '#f3f5f6');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

/** White terrazzo with ink chips — the plinth's top. */
export function drawTerrazzo(ctx: Ctx, w: number, h: number) {
  ctx.fillStyle = '#f2f3f1';
  ctx.fillRect(0, 0, w, h);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const n = Math.round((w * h) / 520);
  for (let i = 0; i < n; i++) {
    const r = rnd();
    if (r < 0.45) continue;   // sparser: ink chips only
    ctx.fillStyle = r < 0.8 ? '#1a1d21' : '#2c3036';
    ctx.beginPath();
    const s = 1 + rnd() * rnd() * 5.5;
    ctx.ellipse(rnd() * w, rnd() * h, s, s * (0.5 + rnd() * 0.6), rnd() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
}
