// The type sizes a page really uses: every visible text element's computed size (the scenes' drawings
// and the options board left out), grouped, with an example of each.
//   node tools/sizes-used.cjs [page …] [--w 1440 --h 900]
const { chromium } = require('/Users/fangyuan/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const a = process.argv.slice(2);
const opt = (k, d) => { const i = a.indexOf('--' + k); return i >= 0 ? +a[i + 1] : d; };
const pages = a.filter((x, i) => !x.startsWith('--') && !(i > 0 && a[i - 1].startsWith('--')));
const W = opt('w', 1440), H = opt('h', 900);
(async () => {
  const b = await chromium.launch();
  for (const pg of pages.length ? pages : ['home', 'strata', 'listing-kit', 'samples', 'start']) {
    const p = await b.newPage({ viewport: { width: W, height: H } });
    await p.goto(`http://127.0.0.1:5190/pages/${pg}.html`, { waitUntil: 'load' });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(1500);
    const out = await p.evaluate(() => {
      const seen = new Map();
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (!n.textContent.trim()) continue;
        const el = n.parentElement;
        if (!el || el.closest('.scn, .opts, script, style, [hidden], .sr, svg, .nav-sheet')) continue;
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none') continue;
        const px = Math.round(parseFloat(cs.fontSize) * 2) / 2;
        if (!seen.has(px)) seen.set(px, { n: 0, ex: `${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 2).join('.')} "${n.textContent.trim().slice(0, 24)}"` });
        seen.get(px).n++;
      }
      return [...seen.entries()].sort((x, y) => y[0] - x[0]);
    });
    console.log(`${pg} @${W}: ${out.length} sizes`);
    out.forEach(([px, v]) => console.log(`   ${String(px).padStart(6)}px ×${String(v.n).padEnd(4)} ${v.ex}`));
    await p.close();
  }
  await b.close();
})();
