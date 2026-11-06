# Qbix Blocks

A redesign prototype for qbix.space after wise.com: white and lime-black blocks that
switch by a 45° wipe into the dark and a cover back to white, Outfit Light headlines in
four sizes, a centred nav, and Start a brief hung at the bottom centre. Static pages,
not part of the Next app and not deployed.

    cd prototypes/qbix-blocks && python3 -m http.server 5190

Then open http://127.0.0.1:5190/ (the overview) or /pages/home.html.

- `pages/` the five pages (home, strata, listing-kit, samples, start), `block.css` and
  `block.js` the shared system, `variants/` the options board (the 方案 chip, bottom
  left) with the other heroes, footers, colour switches and the moving-clue dock.
- `scenes/`, `assets/site/` the site's own scene components, bundled by
  `tools/scenes/build.cjs` from `next/components/scenes` (Labs is the prototype's copy,
  with the Interview Assistant drawn).
- `samples` links to `next/public/samples`.
- `tools/` checks: `resp.cjs` (12 screen sizes), `sizes-used.cjs` (type sizes),
  `lines.cjs` (paragraph length), `shot.cjs` (screenshots).
