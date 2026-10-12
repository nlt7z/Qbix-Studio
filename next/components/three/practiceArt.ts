import type { SiteFonts } from './stage';

/**
 * Artwork for the practice rebuild — the same invented practice as
 * components/offers/BeforeAfter.tsx. Every piece of the dated homepage and of
 * the calm one is its own texture, so each can lift off or be set down alone.
 */

type Ctx = CanvasRenderingContext2D;
const OLD_SERIF = "Georgia, 'Times New Roman', serif";
const OLD_SANS = "'Trebuchet MS', Verdana, sans-serif";

/* ------------------------------------------------------------- the old site */

export function oldTop(ctx: Ctx, w: number, h: number) {
  ctx.fillStyle = '#2e6f73';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#ffffff';
  ctx.font = `${h * 0.42}px ${OLD_SERIF}`;
  ctx.textBaseline = 'middle';
  ctx.fillText('Dana Reyes, MA, LMFT ~ Counseling & Psychotherapy Services', w * 0.025, h * 0.52);
  ctx.fillStyle = '#ffe874';
  ctx.font = `bold ${h * 0.42}px ${OLD_SERIF}`;
  ctx.textAlign = 'right';
  ctx.fillText('Call (555) 014-2290', w * 0.975, h * 0.52);
  ctx.textAlign = 'left';
}

export function oldNav(ctx: Ctx, w: number, h: number) {
  ctx.fillStyle = '#e6e2d3';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#2e6f73';
  ctx.strokeStyle = '#2e6f73';
  ctx.lineWidth = Math.max(1, h * 0.03);
  ctx.font = `${h * 0.42}px ${OLD_SERIF}`;
  ctx.textBaseline = 'middle';
  let x = w * 0.025;
  for (const l of ['Home', 'About', 'Services', 'Specialties', 'Fees', 'Insurance', 'Forms', 'Blog', 'Links', 'Contact']) {
    ctx.fillText(l, x, h * 0.5);
    const tw = ctx.measureText(l).width;
    ctx.beginPath();
    ctx.moveTo(x, h * 0.72);
    ctx.lineTo(x + tw, h * 0.72);
    ctx.stroke();
    x += tw + w * 0.032;
  }
}

export function oldBanner(ctx: Ctx, w: number, h: number) {
  ctx.fillStyle = '#f6d55c';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#aa3333';
  ctx.font = `bold ${h * 0.46}px ${OLD_SANS}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Welcome!! Now accepting new clients!!', w / 2, h * 0.54);
  ctx.textAlign = 'left';
}

export function oldPhoto(ctx: Ctx, w: number, h: number) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#9db1b7');
  g.addColorStop(1, '#cdd6d2');
  ctx.fillStyle = g;
  ctx.fillRect(w * 0.04, h * 0.04, w * 0.92, h * 0.92);
  ctx.strokeStyle = '#bbbbbb';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, w - 2, h - 2);
}

export function oldCols(ctx: Ctx, w: number, h: number) {
  ctx.fillStyle = '#fdfdf7';
  ctx.fillRect(0, 0, w, h);
  const heads = ['Individual Therapy', 'Couples Counseling', 'Teens & Families'];
  const cw = w / 3;
  heads.forEach((t, c) => {
    const x = c * cw + cw * 0.04;
    ctx.fillStyle = '#2e6f73';
    ctx.font = `bold ${h * 0.075}px ${OLD_SERIF}`;
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(t, x, h * 0.12);
    ctx.fillRect(x, h * 0.14, ctx.measureText(t).width, Math.max(1, h * 0.008));
    ctx.fillStyle = '#c4c1b6';
    for (let i = 0; i < 9; i++) {
      const lw = cw * (0.7 + (((i * 37 + c * 13) % 30) / 100)) * 0.88;
      ctx.fillRect(x, h * (0.22 + i * 0.085), lw, h * 0.035);
    }
  });
}

export function oldFoot(ctx: Ctx, w: number, h: number) {
  ctx.fillStyle = '#efece3';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#777777';
  ctx.font = `${h * 0.4}px ${OLD_SERIF}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('© 2019 Dana Reyes Counseling · All Rights Reserved · Site Map · Privacy', w / 2, h * 0.52);
  ctx.textAlign = 'left';
}

/* ------------------------------------------------------------ the calm site */

export function calmNav(ctx: Ctx, w: number, h: number, F: SiteFonts) {
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(0, 0, w, h);
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#15171a';
  ctx.font = `500 ${h * 0.34}px ${F.body}`;
  ctx.fillText('Dana Reyes, LMFT', 0, h * 0.5);
  ctx.fillStyle = '#5f656c';
  ctx.font = `400 ${h * 0.3}px ${F.body}`;
  ctx.textAlign = 'right';
  let x = w;
  for (const l of ['Contact', 'Fees', 'Specialties', 'About']) {
    ctx.fillText(l, x, h * 0.5);
    x -= ctx.measureText(l).width + h * 0.7;
  }
  ctx.textAlign = 'left';
}

export function calmPhoto(ctx: Ctx, w: number, h: number) {
  // A sunlit white room: pale wall, a tall window, a slate chair, a sage plant.
  const g = ctx.createLinearGradient(0, 0, w * 0.5, h);
  g.addColorStop(0, '#f4f7f8');
  g.addColorStop(0.55, '#e3e9ed');
  g.addColorStop(1, '#ccd6dd');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const sky = ctx.createLinearGradient(0, h * 0.1, 0, h * 0.62);
  sky.addColorStop(0, '#dcebf5');
  sky.addColorStop(1, '#f6fafc');
  ctx.fillStyle = sky;
  ctx.fillRect(w * 0.16, h * 0.1, w * 0.38, h * 0.52);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(w * 0.345, h * 0.1, w * 0.012, h * 0.52);
  ctx.fillRect(w * 0.16, h * 0.355, w * 0.38, h * 0.01);
  // light falling across the floor
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.beginPath();
  ctx.moveTo(w * 0.16, h * 0.62);
  ctx.lineTo(w * 0.54, h * 0.62);
  ctx.lineTo(w * 0.78, h);
  ctx.lineTo(w * 0.3, h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#3c4650';
  ctx.fillRect(w * 0.08, h * 0.76, w * 0.46, h * 0.16);
  ctx.fillRect(w * 0.08, h * 0.66, w * 0.08, h * 0.26);
  ctx.fillStyle = '#7f9a7a';
  ctx.fillRect(w * 0.7, h * 0.56, w * 0.15, h * 0.3);
  ctx.fillStyle = '#8fae8a';
  ctx.fillRect(w * 0.74, h * 0.5, w * 0.08, h * 0.14);
  ctx.fillStyle = '#e8ecef';
  ctx.fillRect(w * 0.72, h * 0.86, w * 0.11, h * 0.14);
}

export function calmText(ctx: Ctx, w: number, h: number, F: SiteFonts) {
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(0, 0, w, h);
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#767c83';
  ctx.font = `400 ${h * 0.05}px ${F.body}`;
  let x = 0;
  for (const ch of 'THERAPY IN OAKLAND AND ONLINE') {
    ctx.fillText(ch, x, h * 0.1);
    x += ctx.measureText(ch).width + h * 0.007;
  }
  ctx.fillStyle = '#15171a';
  ctx.font = `400 ${h * 0.2}px ${F.body}`;
  ctx.fillText('Feel more like', 0, h * 0.36);
  ctx.fillText('yourself again.', 0, h * 0.57);
  ctx.fillStyle = '#5a6067';
  ctx.font = `400 ${h * 0.066}px ${F.body}`;
  ctx.fillText('Individual and couples therapy for anxiety,', 0, h * 0.75);
  ctx.fillText('life changes, and relationships.', 0, h * 0.85);
}

export function calmButton(ctx: Ctx, w: number, h: number, F: SiteFonts) {
  ctx.fillStyle = '#2f4a3e';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#f8f9fa';
  ctx.font = `500 ${h * 0.36}px ${F.body}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Book a free consultation', w / 2, h * 0.54);
  ctx.textAlign = 'left';
}

export function chromeBar(ctx: Ctx, w: number, h: number) {
  ctx.fillStyle = '#eceef0';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#d2d6da';
  for (let i = 0; i < 3; i++) ctx.fillRect(h * 0.45 + i * h * 0.55, h * 0.36, h * 0.3, h * 0.3);
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(w * 0.3, h * 0.25, w * 0.4, h * 0.5);
  ctx.fillStyle = '#8f959c';
  ctx.font = `${h * 0.32}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('danareyestherapy.com', w / 2, h * 0.52);
  ctx.textAlign = 'left';
}
