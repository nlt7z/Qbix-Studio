// Every page at every common screen size: what doesn't fit.
//   node tools/resp.cjs [page …]
// Reports per page and size: sideways overflow, text cut by the window's edge, fitted headlines wider
// than their box, and pinned chapter frames whose words are taller than the screen.
const { chromium } = require('/Users/fangyuan/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const SIZES = [[360, 740], [390, 844], [430, 932], [768, 1024], [834, 1194], [1024, 768], [1180, 820], [1280, 720], [1366, 768], [1440, 900], [1920, 1080], [2560, 1440]];
const PAGES = process.argv.slice(2).length ? process.argv.slice(2) : ['home', 'strata', 'listing-kit', 'samples', 'start'];
const check = () => {
  const W = document.documentElement.clientWidth;
  const name = (el) => (el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '') + ' "' + (el.textContent || '').trim().slice(0, 28) + '"');
  const skip = (el) => el.closest('.scn, .reel, .foot-mark, .vcard-media, .nav-sheet, [hidden], .sr');
  const out = { hx: document.documentElement.scrollWidth - W, cut: [], fit: [], frames: [] };
  for (const el of document.querySelectorAll('h1,h2,h3,h4,p,li,a,dt,dd,button,label,summary,input,textarea')) {
    if (skip(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    if (r.right > W - 1 || r.left < 1) out.cut.push(name(el) + ` [${Math.round(r.left)}..${Math.round(r.right)}]`);
  }
  for (const el of document.querySelectorAll('[data-fit]')) if (el.offsetParent && el.scrollWidth > el.clientWidth + 1) out.fit.push(name(el) + ` ${el.scrollWidth}>${el.clientWidth}`);
  for (const f of document.querySelectorAll('.chapter .ch-frame')) {
    if (!f.offsetParent || getComputedStyle(f).position !== 'sticky') continue;
    if (f.scrollHeight > f.clientHeight + 1) out.frames.push((f.closest('.chapter').id || name(f.closest('.chapter'))) + ` ${f.scrollHeight}>${f.clientHeight}`);
  }
  out.cut = [...new Set(out.cut)].slice(0, 6);
  return out;
};
(async () => {
  const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
  for (const [w, h] of SIZES) {
    const res = await Promise.all(PAGES.map(async (pg) => {
      const ctx = await browser.newContext({ viewport: { width: w, height: h } });
      const p = await ctx.newPage();
      const errs = [];
      p.on('pageerror', (e) => errs.push(e.message));
      await p.goto(`http://127.0.0.1:5190/pages/${pg}.html`, { waitUntil: 'load' });
      await p.evaluate(() => document.fonts.ready);
      await p.waitForTimeout(900);
      const H = await p.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < H; y += Math.round(h * 0.8)) { await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(50); }
      await p.waitForTimeout(400);
      const r = await p.evaluate(check);
      await ctx.close();
      return [pg, r, errs];
    }));
    for (const [pg, r, errs] of res) {
      const bad = r.hx > 0 || r.cut.length || r.fit.length || r.frames.length || errs.length;
      console.log(`${w}x${h} ${pg.padEnd(11)} ${bad ? '!!' : 'ok'}${r.hx > 0 ? ' overflowX=' + r.hx : ''}${r.fit.length ? ' fit:' + r.fit.join(' | ') : ''}${r.frames.length ? ' frames:' + r.frames.join(' | ') : ''}${r.cut.length ? '\n      cut: ' + r.cut.join('\n           ') : ''}${errs.length ? ' errors:' + errs.join(' | ') : ''}`);
    }
  }
  await browser.close();
})();
