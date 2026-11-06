// Every block of text that runs past three lines, per page, at a laptop and a phone width.
//   node tools/lines.cjs [page …]
const { chromium } = require('/Users/fangyuan/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const PAGES = process.argv.slice(2).length ? process.argv.slice(2) : ['home', 'strata', 'listing-kit', 'samples', 'start'];
(async () => {
  const b = await chromium.launch();
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    for (const pg of PAGES) {
      for (const q of pg === 'home' ? ['', '?for=business'] : ['']) {
        const p = await b.newPage({ viewport: { width: w, height: h } });
        await p.goto(`http://127.0.0.1:5190/pages/${pg}.html${q}`, { waitUntil: 'load' });
        await p.evaluate(() => document.fonts.ready);
        await p.waitForTimeout(1200);
        const long = await p.evaluate(() => {
          const out = [];
          for (const el of document.querySelectorAll('p, li, dd, h1, h2, h3, h4, summary, .row-d, .notes > *, .lede')) {
            if (el.closest('.scn, .opts, .nav-sheet, .nav, script, [hidden], details:not([open]) > :not(summary)')) continue;
            if (el.querySelector('p, li, h1, h2, h3, h4')) continue; // only the innermost
            const r = el.getBoundingClientRect();
            if (!r.width || !r.height) continue;
            const cs = getComputedStyle(el);
            let lh = parseFloat(cs.lineHeight);
            if (!lh) lh = parseFloat(cs.fontSize) * 1.2;
            const lines = Math.round((el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)) / lh);
            if (lines > 3) out.push(`${lines} lines · ${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 2).join('.')} "${el.textContent.trim().replace(/\s+/g, ' ').slice(0, 70)}"`);
          }
          return out;
        });
        console.log(`${pg}${q} @${w}: ${long.length ? '' : 'ok'}`);
        long.forEach((x) => console.log('   ' + x));
        await p.close();
      }
    }
  }
  await b.close();
})();
