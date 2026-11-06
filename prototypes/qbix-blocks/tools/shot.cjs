// Screenshots of a prototype page down its scroll, plus its console errors.
//   node tools/shot.cjs <page> [--w 1440] [--h 900] [--step 0.9] [--at y1,y2,…] [--out dir] [--q query]
// <page> is a file in pages/ (home, strata, …). Shots are viewport-sized, taken after the
// scroll settles, so sticky blocks and pinned scenes show as they do in a browser.
const { chromium } = require('/Users/fangyuan/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const path = require('path');
const fs = require('fs');
const a = process.argv.slice(2);
const opt = (k, d) => { const i = a.indexOf('--' + k); return i >= 0 ? a[i + 1] : d; };
const page = a[0];
const W = +opt('w', 1440), H = +opt('h', 900), STEP = +opt('step', 0.9);
const OUT = opt('out', path.join(__dirname, '..', 'shots'));
const Q = opt('q', '');
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errs = [];
  p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text()); });
  p.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  await p.goto(`http://127.0.0.1:5190/pages/${page}.html${Q ? '?' + Q : ''}`, { waitUntil: 'load' });
  await p.waitForTimeout(2200);
  const total = await p.evaluate(() => document.documentElement.scrollHeight);
  const at = opt('at', '');
  const ys = at ? at.split(',').map(Number) : [];
  if (!ys.length) for (let y = 0; y < total - H + 1; y += Math.round(H * STEP)) ys.push(y);
  if (!at && ys[ys.length - 1] < total - H) ys.push(total - H);
  let i = 0;
  for (const y of ys) {
    // walk there in steps so the scroll-driven scenes follow, then let them settle
    await p.evaluate(async (to) => {
      const from = scrollY, n = 8;
      for (let k = 1; k <= n; k++) { scrollTo(0, from + ((to - from) * k) / n); await new Promise((r) => requestAnimationFrame(r)); }
    }, y);
    await p.waitForTimeout(1300);
    const f = path.join(OUT, `${page}${Q ? '-' + Q.replace(/\W+/g, '') : ''}-${W}-${String(i++).padStart(2, '0')}.jpg`);
    await p.screenshot({ path: f, type: 'jpeg', quality: 70 });
  }
  const over = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  console.log(JSON.stringify({ page, W, H, total, shots: ys.length, overflowX: over, errors: [...new Set(errs)].slice(0, 12) }, null, 1));
  await browser.close();
})();
