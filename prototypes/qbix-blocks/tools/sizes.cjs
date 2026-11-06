// Each page at each size: its top and a point further down, one sheet per size (shots/size-<w>x<h>.jpg).
//   node tools/sizes.cjs [WxH …]
const { chromium } = require('/Users/fangyuan/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const OUT = path.join(__dirname, '..', 'shots', 'sizes');
fs.mkdirSync(OUT, { recursive: true });
const PAGES = ['home', 'strata', 'listing-kit', 'samples', 'start'];
const sizes = (process.argv.slice(2).length ? process.argv.slice(2) : ['360x740', '768x1024', '1024x768', '1280x720', '1920x1080', '2560x1440']).map((s) => s.split('x').map(Number));
(async () => {
  const b = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
  for (const [w, h] of sizes) {
    const files = [];
    await Promise.all(PAGES.map(async (pg) => {
      const ctx = await b.newContext({ viewport: { width: w, height: h } });
      const p = await ctx.newPage();
      await p.goto(`http://127.0.0.1:5190/pages/${pg}.html`, { waitUntil: 'load' });
      await p.evaluate(() => document.fonts.ready);
      await p.waitForTimeout(2200);
      const f0 = path.join(OUT, `${w}x${h}-${pg}-0.jpg`);
      await p.screenshot({ path: f0, type: 'jpeg', quality: 70 });
      const H = await p.evaluate(() => document.documentElement.scrollHeight);
      const to = Math.round(H * 0.3);
      for (let k = 1; k <= 10; k++) { await p.evaluate((y) => scrollTo(0, y), Math.round((to * k) / 10)); await p.waitForTimeout(60); }
      await p.waitForTimeout(1500);
      const f1 = path.join(OUT, `${w}x${h}-${pg}-1.jpg`);
      await p.screenshot({ path: f1, type: 'jpeg', quality: 70 });
      await ctx.close();
    }));
    for (const pg of PAGES) files.push(path.join(OUT, `${w}x${h}-${pg}-0.jpg`), path.join(OUT, `${w}x${h}-${pg}-1.jpg`));
    // one sheet: a row a page (home, listing-kit, samples, start, strata), its top beside further down
    const sw = w < 900 ? 300 : 560;
    const args = ['-loglevel', 'error', '-y', '-pattern_type', 'glob', '-i', path.join(OUT, `${w}x${h}-*.jpg`),
      '-vf', `scale=${sw}:-2,tile=2x5:padding=8:color=gray`, '-frames:v', '1', '-q:v', '4', path.join(__dirname, '..', 'shots', `size-${w}x${h}.jpg`)];
    execFileSync('ffmpeg', args);
    console.log(`${w}x${h} done`);
  }
  await b.close();
})();
