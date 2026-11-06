#!/usr/bin/env node
/**
 * Builds the Scenes group's bundle: the site's own scene components, one IIFE.
 *
 *     node tools/scenes/build.cjs
 *
 * in:   tools/scenes/entry.tsx, which imports components/scenes/* from the site
 *       (~/Desktop/tech/next, read only)
 * out:  scenes/scenes.js   the components, React and the timeline, production, minified
 *       scenes/scenes.css  the scenes' CSS imports (app/scenes*.css), bundled
 *       assets/site/...    the public files the scenes use, same paths as on the site
 *
 * What differs from the site's build, and only this:
 *   - `@/` is the site's root; React and friends come from the site's node_modules (one React)
 *   - lib/scene/driver.ts is replaced by tools/scenes/driver.ts: it hands each scene's
 *     timeline to the demo page (window.QMSceneReady) instead of listening to the scroll
 *   - components/scene/pictures.tsx and Generative.tsx are wrapped (pictures.tsx, generative.tsx
 *     here): a Photographs / Drawings toggle, and Halftone's photograph inlined, which a page
 *     opened from disk (file://) cannot read back off a canvas
 *   - next/link, next/image, next/navigation are stubbed (nothing the scenes use needs them)
 *   - the scenes' absolute public paths (/art/…, /previews/…) become ../assets/site/… (the
 *     demos live in demos/), and the files they name are copied there
 */
const fs = require('fs');
const os = require('os');
const path = require('path');

const ESBUILD = process.env.QM_ESBUILD || '/Users/fangyuan/Desktop/kimoji studio/node_modules/esbuild';
const SITE = process.env.QM_SITE || path.join(os.homedir(), 'Desktop/tech/next');
const HERE = __dirname;
const ROOT = path.resolve(HERE, '..', '..');
const OUT = path.join(ROOT, 'scenes');
const SITE_ASSETS = path.join(ROOT, 'assets', 'site');
const ASSET_URL = '../assets/site';

/**
 * The public files the scenes use. Most are named in the source, a few are built from a
 * name (`/art/${src}.webp`: Forma's Img, Labs' wall, Listing's shots): listed here from
 * reading those components, and checked below (nothing left unrewritten, every file there).
 */
const ASSETS = {
  art: [
    'ava', 'block', 'bottle', 'calla', 'container', 'cross', 'curves', 'glass', 'house',
    'kitchen', 'objects', 'office', 'ribbon', 'ring', 'sam', 'slices', 'wall', 'you',
  ].map((n) => `${n}.webp`).concat('CREDITS.txt'),
  previews: ['strata.mp4', 'strata.jpg'],
};
const PUBLIC_DIRS = ['art', 'previews', 'scenes', 'splash', 'samples', 'assets', 'og', 'fonts'];

const esbuild = require(ESBUILD);

const plugin = {
  name: 'qm-scenes',
  setup(build) {
    const here = (f) => path.join(HERE, f);
    // @/… is the site's root
    build.onResolve({ filter: /^@\// }, (args) => {
      const rel = args.path.slice(2);
      const fromHere = args.importer.startsWith(HERE + path.sep);
      if (rel === 'lib/scene/driver') return { path: here('driver.ts') };
      // the prototype's Labs: the site's, with the Interview Assistant drawn (labs.tsx here)
      if (rel === 'components/scenes/Labs') return { path: here('labs.tsx') };
      if (rel === 'components/scene/pictures') return { path: here('pictures.tsx') };
      if (rel === 'components/scene/Generative' && !fromHere) return { path: here('generative.tsx') };
      return build.resolve('./' + rel, { resolveDir: SITE, kind: args.kind, importer: args.importer });
    });
    // the real module behind a wrapper, and a public file inlined
    build.onResolve({ filter: /^qm-real\// }, (args) =>
      build.resolve('./' + args.path.slice('qm-real/'.length), { resolveDir: SITE, kind: args.kind, importer: args.importer }));
    build.onResolve({ filter: /^qm-public\// }, (args) => ({ path: path.join(SITE, 'public', args.path.slice('qm-public/'.length)) }));
    // nothing the scenes use needs the router; if that changes, these keep it building
    build.onResolve({ filter: /^next\/(link|image|navigation)$/ }, (args) => ({ path: here(`next-${args.path.slice(5)}.tsx`) }));
    build.onResolve({ filter: /^next\/font\/google$/ }, () => ({ path: here('next-font-google.tsx') }));
  },
};

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const t0 = Date.now();
  const res = await esbuild.build({
    entryPoints: [path.join(HERE, 'entry.tsx')],
    outfile: path.join(OUT, 'scenes.js'),
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: 'es2020',
    jsx: 'automatic',
    minify: true,
    charset: 'utf8',
    legalComments: 'none',
    logLevel: 'warning',
    logOverride: { 'ignored-directive': 'silent' },
    define: { 'process.env.NODE_ENV': '"production"' },
    alias: {
      react: path.join(SITE, 'node_modules/react'),
      'react-dom': path.join(SITE, 'node_modules/react-dom'),
      'framer-motion': path.join(SITE, 'node_modules/framer-motion'),
    },
    nodePaths: [path.join(SITE, 'node_modules')],
    loader: { '.webp': 'dataurl' },
    plugins: [plugin],
    metafile: true,
  });

  // --- the public paths, rewritten to where the demos find the files ----------------------
  const dirs = Object.keys(ASSETS).join('|');
  const rewrite = (file) => {
    const p = path.join(OUT, file);
    let s = fs.readFileSync(p, 'utf8');
    s = s.replace(new RegExp('(["\'`(])/(' + dirs + ')/', 'g'), `$1${ASSET_URL}/$2/`);
    fs.writeFileSync(p, s);
    return s;
  };
  const js = rewrite('scenes.js');
  const css = rewrite('scenes.css');

  // nothing may still point at the site's root, or at a file we did not copy
  const left = new RegExp('["\'`(]/(' + PUBLIC_DIRS.join('|') + ')/[^"\'`)\\s$]*', 'g');
  const stray = [...(js.match(left) || []), ...(css.match(left) || [])];
  if (stray.length) throw new Error('absolute public paths left in the bundle: ' + [...new Set(stray)].join(', '));

  // --- the files themselves ----------------------------------------------------------------
  let copied = 0, bytes = 0;
  for (const [dir, files] of Object.entries(ASSETS)) {
    fs.mkdirSync(path.join(SITE_ASSETS, dir), { recursive: true });
    for (const f of files) {
      const from = path.join(SITE, 'public', dir, f);
      if (!fs.existsSync(from)) throw new Error('missing on the site: public/' + dir + '/' + f);
      const to = path.join(SITE_ASSETS, dir, f);
      fs.copyFileSync(from, to);
      copied++;
      bytes += fs.statSync(to).size;
    }
  }
  // a literal path in the bundle must be one we copied
  const lit = new RegExp(ASSET_URL.replace(/\./g, '\\.') + '/(' + dirs + ')/([\\w.-]+\\.[a-z0-9]+)', 'g');
  for (const m of (js + css).matchAll(lit)) {
    if (!ASSETS[m[1]].includes(m[2])) throw new Error(`the bundle names ${m[1]}/${m[2]}, which is not in ASSETS`);
  }

  const kb = (n) => (n / 1024).toFixed(0) + ' KB';
  const out = (f) => kb(fs.statSync(path.join(OUT, f)).size);
  console.log(`scenes.js ${out('scenes.js')} · scenes.css ${out('scenes.css')} · ${copied} files (${kb(bytes)}) in assets/site · ${Date.now() - t0} ms`);
  if (res.warnings.length) console.log(res.warnings.length + ' warnings');
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
