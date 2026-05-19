# qbix// studio

Next.js port of the prototype at `../index.html`.

## Stack

- Next.js 14 (App Router) + React 18 + TypeScript
- Tailwind v3 (design tokens in `tailwind.config.ts` + `globals.css`)
- Framer Motion 11 (boot sequence, hero reveal, mission card reveal, log feed, scrambled title)

## Run

```bash
cd next
npm install
npm run dev
```

Open http://localhost:3000

## Structure

```
next/
├── app/
│   ├── layout.tsx        next/font + global wrapper
│   ├── page.tsx          composition root
│   └── globals.css       all custom CSS (ported from prototype)
├── components/
│   ├── BootSequence      1.5s boot, ESC to skip, sessionStorage persistence
│   ├── SystemBar         top bar + live clock
│   ├── SideNav           64px shortcut nav with tooltips
│   ├── HudNav            bottom HUD with dual labels (cool + plain)
│   ├── useActiveSection  shared hook, sync side+HUD nav active state
│   ├── Ticker            seamless looping marquee
│   ├── ControlDeck       hero (radar + animated title + status panel)
│   ├── Radar             SVG radar with rotating sweep + 4 mission nodes
│   ├── StatusPanel       project stats with counter animation + log feed
│   ├── LogFeed           rotating system log
│   ├── Archive           4 mission cards + filter chips
│   ├── MissionCard       card with scroll-in + scrambled title on hover
│   ├── MissionPreviews   4 inline SVGs (BidkingPreview, DustPreview, ...)
│   ├── Dossier           5-block studio about
│   ├── Workshop          5-drawer process display
│   ├── SignalCTA         contact section
│   ├── Colophon          footer
│   ├── Overlays          scanlines + noise + vignette + perf-lite detection
│   └── TerminalButton    reusable CTA button
└── lib/
    ├── data.ts           missions, logs, ticker, nav items, dossier, workshop
    └── motion.ts         Framer Motion variants + easing curves
```

## Notes

- `globals.css` keeps the same custom CSS approach as the prototype. Tailwind is enabled but used sparingly for utilities — most styling stays semantic for clarity. Migrate to Tailwind utilities incrementally if you prefer.
- `perf-lite` mode auto-enables on low-end devices (≤4 cores), reduced-motion preference, or Save-Data. Disables overlays, ticker animation, log polling, and radar.
- The boot sequence is gated by `sessionStorage` — once seen in a tab, it doesn't replay on reload. Clear sessionStorage to see it again.
- Active section sync uses a shared `useActiveSection` hook driven by `scroll` + `requestAnimationFrame` throttling. Both side nav and HUD nav read from it.
- Mission card titles use a matrix-style scramble effect on hover (vanilla RAF loop wrapped in a React hook). Locked card (PROJECT VAULT) opts out.
- Counter animations use Framer Motion's `useMotionValue` + `animate` for smooth easing.

## Migration paths

- **Per-game detail pages**: Add `app/missions/[id]/page.tsx`. Mission data in `lib/data.ts` is already keyed.
- **MDX dev log**: Add `app/log/page.tsx` + `app/log/[slug]/page.tsx` using `@next/mdx`. Index ties into the existing Signal Log nav slot.
- **Real BLACK_BOX (06)**: The locked nav item currently links to `#`. Wire up a route + add unlock condition (konami code, secret query param, etc.).
- **CMS**: Mission/dossier/workshop content lives in `lib/data.ts`. Swap to a content layer (MDX, Sanity, Notion API) by replacing those exports.
- **i18n**: Add `next-intl` and lift all strings out of components into `lib/data.ts` (already most of them) + a translation file.
