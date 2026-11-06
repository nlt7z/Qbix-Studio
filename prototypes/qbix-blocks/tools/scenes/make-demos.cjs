#!/usr/bin/env node
/**
 * Writes the Scenes group's demo pages (demos/<id>.html) from one list: their meta, the step
 * names of their caption (components/story/Story.tsx, the offer pages) and the small glue
 * that hands each scene's timeline to the gallery's harness (kit/stage.js). Hand edits to
 * those files are overwritten: change this list and run it again.
 *
 *     node tools/scenes/make-demos.cjs [id …]
 *
 * Needs scenes/scenes.js (node tools/scenes/build.cjs). The beats in each spec are measured
 * off the built timelines: the stretch of beats in which a state's parts move.
 */
const fs = require('fs');
const path = require('path');

const DEMOS = path.resolve(__dirname, '..', '..', 'demos');

/* the files a scene's code tab shows: its own, then the drawing kit and the timeline it runs on */
const files = (tsx, css, extra = []) => [
  `components/scenes/${tsx}.tsx`,
  `app/${css}.css`,
  ...extra,
  'app/scenes.css',
  'components/scene/Scene.tsx',
  'components/scene/kit.tsx',
  'lib/scene/timeline.ts',
  'lib/scene/driver.ts',
];
const BID = ['components/scenes/BidKing.tsx', 'app/scenes-bid.css'];
const PICS = ['components/scene/pictures.tsx'];
const GEN = 'components/scene/Generative.tsx';
const QUIET = 'components/useQuietPlayback.ts';

/* where it lives, the short list: the component, its css, the box that runs it, the dope sheet, the driver */
const source = (sym, css, extra = []) => [
  `components/scenes/${sym[0]}.tsx · ${sym[1]}`,
  `app/${css}.css`,
  ...extra,
  'components/scene/Scene.tsx · Scene',
  'lib/scene/timeline.ts · Timeline',
  'lib/scene/driver.ts · playScene',
];

/* a story chapter's length on the homepage: 110vh, then 80vh a move (components/story/Story.tsx · Chapter) */
const vh = (n) => 110 + 80 * (n - 1);

const DRIVE = 'The scroll is the playhead (lib/scene/driver.ts); the shown time chases it, 1 − e^(−6.5 dt)';
const BEATS = 'Time is in beats: state k is settled at beat k, each move in the middle of its stretch, so every state holds a while';
const CHAPTER = (n) => ['Chapter', `${vh(n)}vh pinned: 110vh, then 80vh a move`];
/* the last state is held, then the loop rewinds */
const HOLD = 3200;
const LOAD = 'load: the first state draws itself over 1.7 s, linear, the shown time chasing it (lib/scene/driver.ts)';

const LIST = [
  {
    id: 'forma', order: 10, tone: 'paper', kind: 'states', mount: 'forma', dwell: 2400,
    title: 'Forma: moodboard to live site',
    steps: ['Moodboard', 'Design and code', 'Live on your domain'],
    line: '3 states · 270vh · scroll',
    summary: 'A moodboard for Forma, a studio of ceramic objects: renders, a lime slice, a motion study, the palette and the type. Its pieces travel into the launch site, the layout grid is laid over it, then the site goes live at forma.studio and a phone comes up with it. Things that carry on travel; nothing is cut.',
    spec: [
      ['States', '3: Moodboard · Design and code · Live on your domain'],
      ['Beats', '0 → 1, beats 0.10 – 0.78: the board comes in piece by piece, the slice cut in · 1 → 2, 1.02 – 1.86: what is not kept folds, the pieces travel into the site, its words are typed, the grid is laid over it · 2 → 3, 2.02 – 2.52: the grid lifts, the address is selected and typed, the phone rises'],
      ['Easing', 'E.out for entrances (11), E.move for the travels into the site (3), E.in for folds (4), E.soft for the address selection, E.lin for jumps'],
      CHAPTER(3),
      ['Drawn at', '720 × 540 in its own px, zoomed to its box (zoom, not a transform, so type and hairlines stay sharp)'],
      ['Trigger', DRIVE],
    ],
    source: source(['Forma', 'Forma'], 'scenes-forma', ['components/story/Story.tsx · Chapter']),
    where: 'Homepage for AI teams, the Services chapter: paper, the scene on the right of its words, the three steps listed beside it.',
    rules: [
      'Things that carry on travel; nothing is cut. Only what is not kept folds away.',
      'Photographs are the only pictures; everything else is drawn, flat, in the chapter’s tone.',
      'One lime a state: the board’s slice, which becomes the site’s button.',
      BEATS,
    ],
    tags: ['scene', 'scroll', 'moodboard', 'browser', 'phone'],
    bundle: files('Forma', 'scenes-forma'),
  },
  {
    id: 'kova', order: 20, tone: 'dark', kind: 'states', mount: 'kova', dwell: 2600,
    title: 'Kova: usable to worth sharing',
    steps: ['The grid', 'Color and type', 'The mark'],
    line: '3 states · 270vh · scroll',
    summary: 'Kova, a money app that already works, on a phone, with the studio’s sheet in glass over its corner, its page turned each round. One: the grid’s four numbers draw over the app and everything snaps onto them. Two: the page turns to the tokens and the screen re-renders in them. Three: a k is built on an icon grid, the lime icon comes down, and its mono version slides up into the app’s header.',
    spec: [
      ['States', '3: The grid · Color and type · The mark'],
      ['Beats', '0 → 1, beats 0.02 – 0.98: the phone rises, the sheet opens, columns, gutter, baseline and margin draw over the screen, the parts snap on · 1 → 2, 1.00 – 1.83: the sheet turns to ink, chalk and lime, the screen re-renders top to bottom, the balance counts up · 2 → 3, 2.00 – 2.85: the k is built on keylines, the lime icon comes down, the mono icon slides into the header'],
      ['Easing', 'E.in for what folds away (11), E.move (8), E.out (6), E.soft (5)'],
      CHAPTER(3),
      ['Drawn at', '720 × 640 in its own px, zoomed to its box'],
      ['Trigger', DRIVE],
    ],
    source: source(['Kova', 'Kova'], 'scenes-kova', ['components/story/Story.tsx · Chapter']),
    where: 'Homepage for AI teams, the Brand upgrade chapter: black, the scene on the left of its words, the three steps listed beside it.',
    rules: [
      'Square, like the site: only the phone itself is round.',
      'One lime a state, never two on screen: the 24 margin tag (the fix), the lime of the strip (the token), the app icon (the mark). The app stays ink and chalk.',
      'The sheet is glass over the phone, so the app shows through it, frosted.',
      BEATS,
    ],
    tags: ['scene', 'scroll', 'grid', 'tokens', 'phone', 'glass'],
    bundle: files('Kova', 'scenes-kova'),
  },
  {
    id: 'labs', order: 30, tone: 'paper', kind: 'states', mount: 'labs', dwell: 2800,
    title: 'Labs: things we’ve shipped',
    steps: [['Strata', 'Live'], ['AI Bidding', 'Live'], ['TTS Editor', 'Soon'], ['Interview Assistant', 'Soon']],
    line: '4 states · 350vh · scroll',
    summary: 'Qbix Labs: four products in one window, one after another, as the list beside it names them. Each move selects the window’s address and types the next one, then the next product pushes up into the window and its name, its tag with it, into the title above. Each product’s own parts come in as it settles.',
    spec: [
      ['States', '4: Strata (live) · AI Bidding (live) · TTS Editor (soon) · Interview Assistant (soon)'],
      ['Beats', '0 → 1, beats 0.16 – 1.00: the window opens, its address is typed, Strata comes up and its colours are pinned · k → k+1, from k + 0.02 to k + 0.9 – 1.0: the address is selected, the next one typed, the next product pushes up and settles (the table fills; the pitch is drawn and the playhead reads the script out; Sam answers and the hints arrive, the newest lit)'],
      ['Easing', 'E.out for what comes in (17), E.move (3), E.soft for the selection (2), E.in (1), E.lin for jumps and counters (9)'],
      CHAPTER(4),
      ['Drawn at', '720 × 560 in its own px, zoomed to its box'],
      ['Trigger', DRIVE],
    ],
    source: source(['Labs', 'Labs'], 'scenes-labs', ['components/scenes/BidKing.tsx · BidTable', 'components/story/Story.tsx · Chapter']),
    where: 'Homepage for AI teams, the Products chapter: paper, the scene on the right; the product it shows stays lit in the list beside it.',
    rules: [
      'Square, like the site; the lime is the product’s own (its accent, its bid).',
      'Never two tags at once: the name goes up and out before the next comes in with its tag.',
      'Photographs: the wall of inspiration, the container lot, the call.',
      BEATS,
    ],
    tags: ['scene', 'scroll', 'products', 'browser', 'glass', 'typing'],
    bundle: files('Labs', 'scenes-labs', BID),
  },
  {
    id: 'dream', order: 40, tone: 'dark', kind: 'states', mount: 'dream', dwell: 3000, dream: true,
    title: 'About: ideas into a thing',
    steps: ['The ideas people bring us', 'One of them, built: AI Bidding'],
    line: '2 states · 190vh · scroll',
    summary: 'About: imagination, then reality. Ideas are said one by one as square chat bubbles of frosted glass, each growing out of its tail’s point; one is still being typed, and the lime one is a thought. Then a window rises with the real thing in it, the other ideas are pulled down into it behind its glass bar, and the lime one travels up and pins to its corner.',
    spec: [
      ['States', '2: The ideas people bring us · One of them, built (AI Bidding, or a calm site for business)'],
      ['Beats', '0 → 1, beats 0.18 – 0.98: six bubbles at 0.18 – 0.72, each out of its tail’s point, then the thought’s trail and body · 1 → 2, 1.02 – 1.77: the window rises (E.move), the ideas fall into it, the lime one leaves it and tucks under its bar; for business the shade over the office lifts (1.79 – 1.95)'],
      ['Easing', 'E.out for bubbles growing out of their tails (5), E.move for the window and the thought (3), E.in for the fall (3), E.soft for the shade'],
      CHAPTER(2),
      ['Drawn at', '720 × 560 in its own px, zoomed to its box'],
      ['Trigger', DRIVE],
      ['Variants', 'biz: false for AI teams (black, Bid King’s table), true for business (paper, a counseling practice’s homepage, its office photographed)'],
    ],
    source: source(['Dream', 'Dream'], 'scenes-dream', ['components/scenes/BidKing.tsx · BidTable', 'components/story/Story.tsx · Chapter']),
    where: 'Both homepages, the About chapter: black with Bid King’s table for AI teams, paper with a calm counseling site for business (switch below).',
    rules: [
      'The ideas float inside the window’s span, so each falls straight into it; the lime one moves only once they are gone, so nothing crosses its way.',
      'The screen’s one lime is the idea itself: the table’s Bid button is chalk, the page’s highlighter is the page’s own ink or paper.',
      'The bubbles are glass over what is behind them (the window’s bar frosts the ideas falling in, the lime one’s edge), so the window rises inside a mask, not a clip.',
      BEATS,
    ],
    tags: ['scene', 'scroll', 'about', 'glass', 'chat', 'photograph'],
    bundle: files('Dream', 'scenes-dream', BID),
  },
  {
    id: 'listing-story', order: 50, tone: 'paper', kind: 'states', mount: 'listing-story', dwell: 2600, pics: true,
    title: 'Listing kit: flyer to video',
    steps: ['Print flyer', 'Five social posts', 'A 30-second video'],
    line: '3 states · 270vh · scroll',
    summary: 'The Listing Launch Kit for 1428 Alder Street: one flyer and everything made from it. The flyer prints, front and back, from photographs; the pictures on it are cropped into five posts; then the posts fold away and a phone rises with the 30-second video, its pictures wiping through as its captions type.',
    spec: [
      ['States', '3: Print flyer · Five social posts · A 30-second video'],
      ['Beats', '0 → 1, beats 0.00 – 0.76: the flyer prints, front then back, its parts set in · 1 → 2, 1.00 – 1.96: the back folds around its two pictures, which go down into the feed; two crops lift out of the front’s photo; the last post comes in · 2 → 3, 2.00 – 2.98: the posts fold, the phone rises, the video plays'],
      ['Easing', 'E.out for what prints and opens (13), E.in for folds (9), E.move (6), E.lin for jumps (6), E.soft (3)'],
      CHAPTER(3),
      ['Drawn at', '720 × 560 in its own px, zoomed to its box'],
      ['Trigger', DRIVE],
      ['Variants', 'Photographs (the homepage: the house and its kitchen; the neighborhood a contour map, In Escrow the house in dots, the video’s last shot a field of ridges) or Drawings'],
    ],
    source: source(['Listing', 'ListingStory'], 'scenes-listing', ['components/scene/pictures.tsx · Pictures', 'components/scene/Generative.tsx', 'components/story/Story.tsx · Chapter']),
    where: 'Business homepage, the Listing kit chapter: paper, the scene on the right of its words, the three steps listed beside it.',
    rules: [
      'Everything printed or posted is ink on paper, in either tone.',
      'One lime a state, handed on as the story moves: the flyer’s tag, the Just Listed post’s tag (the flyer’s is reprinted in ink first), the video’s running time.',
      'Every crop of the house is the same crop of the same photograph: the photograph is laid in the drawing’s own units.',
      BEATS,
    ],
    tags: ['scene', 'scroll', 'flyer', 'posts', 'video', 'photograph', 'generative'],
    bundle: files('Listing', 'scenes-listing', PICS.concat(GEN)),
  },
  {
    id: 'practice-story', order: 60, tone: 'dark', kind: 'states', mount: 'practice-story', dwell: 2800, pics: true,
    title: 'Practice: questionnaire to site',
    steps: ['A short questionnaire', 'Your new homepage in 3 days', 'Live in 7 days'],
    line: '3 states · 270vh · scroll',
    summary: 'Willow Counseling, an invented sample practice. A therapist’s dated website, with a short questionnaire over it on frosted glass, typed field by field. Sent, the answers settle into the homepage they make (the name is the logo, the office photo grows into the hero, the feel is rewritten as the headline); then the address becomes willowcounseling.com behind a lock, Live, and the window steps aside for its phone.',
    spec: [
      ['States', '3: A short questionnaire · Your new homepage in 3 days · Live in 7 days'],
      ['Beats', '0 → 1, beats 0.02 – 0.98: the old site, the questionnaire over it, each answer typed in · 1 → 2, 1.00 – 2.00: a pointer sends it, the form and the old site fold, the answers settle into the homepage, “calm” is marked · 2 → 3, 2.01 – 2.86: the draft address is replaced by the live one, Live, the window steps aside for the phone'],
      ['Easing', 'E.lin for typing and jumps (17), E.in for folds (15), E.out (12), E.soft (9)'],
      CHAPTER(3),
      ['Drawn at', '720 × 560 in its own px, zoomed to its box; the site is drawn once, at its own size (600 × 430)'],
      ['Trigger', DRIVE],
      ['Variants', 'Photographs (the homepage: the office is a photograph) or Drawings (the office drawn flat)'],
    ],
    source: source(['Practice', 'PracticeStory'], 'scenes-practice', ['components/scene/pictures.tsx · Pictures', 'components/story/Story.tsx · Chapter']),
    where: 'Business homepage, the Practice chapter: black, the scene on the left of its words, the three steps listed beside it.',
    rules: [
      'One lime a state, never two on screen: Send, then “calm” marked in the headline, then Live. The site’s own button is ink.',
      'The card is laid out over the old site so every answer is near where it goes, and nothing crosses on its way.',
      'The window is clipped, not faded: it opens and folds on an inset, its corners kept.',
      BEATS,
    ],
    tags: ['scene', 'scroll', 'browser', 'phone', 'typing', 'glass', 'photograph'],
    bundle: files('Practice', 'scenes-practice', PICS),
  },
  {
    id: 'strata-hero', order: 70, tone: 'dark', kind: 'play', mount: 'strata-hero', shot: 4200,
    title: 'Strata hero: live in a window',
    steps: [['Live at stratadesign.app']],
    line: 'draws in 1.7 s on load',
    summary: 'Strata itself, its own film playing in a browser window at stratadesign.app, live, with two of the tokens it makes sliding out from under the window: a type style and a spacing scale, drawn as it goes. The window opens, its address is typed, the tag lights.',
    spec: [
      ['States', '1, drawn on load'],
      ['Beats', 'beats 0.00 – 0.94: the window opens (0 – 0.3), the address is typed (0.18), Live (0.38), the type token peels out (0.44), the spacing token (0.56), its scale drawn step by step (0.74 – 0.94)'],
      ['Easing', 'E.out for the window and the tokens (3), E.soft for the scale being drawn, E.lin for the lock'],
      ['Intro', LOAD],
      ['Drawn at', '640 × 480 in its own px, zoomed to its box (the film is 1600 × 750)'],
      ['Trigger', 'Page load, once'],
    ],
    source: source(['Strata', 'StrataHero'], 'scenes-strata', [QUIET + ' · useQuietPlayback', 'components/StrataIntro.tsx']),
    where: 'Strata page (/products/strata), the hero: black, the scene beside the claim, in a 4 : 3 figure.',
    rules: [
      'No lime in the hero: the page’s own button beside it is the lime; the window’s Live tag is chalk.',
      'The film plays only while it is on screen, not covered, the tab visible and the page at rest.',
      'The tokens are glass over the window’s bottom edge: the film shows through them, blurred.',
    ],
    tags: ['scene', 'hero', 'load', 'video', 'glass', 'browser'],
    bundle: files('Strata', 'scenes-strata', [QUIET]),
  },
  {
    id: 'strata-tour', order: 80, tone: 'dark', kind: 'states', mount: 'strata-tour', dwell: 2800,
    title: 'Strata tour: image to system',
    steps: ['Read the image.', 'Draft the system.', 'Ship the code.'],
    line: '3 states · 355vh · scroll',
    summary: 'One image in, a working system out. An image is dragged in and read: a scan passes over it, sample points pin its colours, its type and spacing are measured with redlines. The readout becomes tokens, the picture is redrawn as a card and a form is drawn from the same tokens. Then the colours drop into the CSS as it is typed out, and the system is handed to AI.',
    spec: [
      ['States', '3: Read the image · Draft the system · Ship the code'],
      ['Beats', '0 → 1, beats 0.00 – 0.99: the image is dropped in, scanned, its colours pinned, its type and spacing measured · 1 → 2, 1.00 – 1.98: each measurement gets a name, the scales fill, the picture becomes a card, a form is drawn from the tokens · 2 → 3, 2.00 – 2.96: the CSS is typed out, the colours drop into it, the system is handed to AI'],
      ['Easing', 'E.move (18), E.lin for typing and the pointer’s clicks (17), E.out (15), E.soft (8), E.in (5)'],
      ['Chapter', '355vh pinned: 75vh a stop, 130vh more, the last state held for 0.3 screens'],
      ['Drawn at', '720 × 640 in its own px, zoomed to its box'],
      ['Trigger', DRIVE],
    ],
    source: source(['Strata', 'StrataTour'], 'scenes-strata', ['components/offers/KitTour.tsx']),
    where: 'Strata page, “Drop in an image. Ship a system.”: black, the section pins and the scroll reads, drafts and ships (KitTour, three stops); the scene is the right-hand column.',
    rules: [
      'The picture stays left (picture, then components) and the panel right (readout, tokens, code), so everything changes in place and nothing crosses.',
      'One lime at a time, passed on: the picture’s sun, then the button drawn from the accent, then the accent’s chip in the code.',
      BEATS,
    ],
    tags: ['scene', 'scroll', 'tour', 'tokens', 'code', 'glass', 'pointer'],
    bundle: files('Strata', 'scenes-strata'),
  },
  {
    id: 'listing-hero', order: 90, tone: 'dark', kind: 'play', mount: 'listing-hero', shot: 4200, pics: false,
    title: 'Listing kit hero: at a glance',
    steps: [['The kit at a glance']],
    line: 'draws in 1.7 s on load',
    summary: 'The kit at a glance: the flyer prints, the kitchen and In Escrow posts open under it, and the phone with the 30-second video rises beside them, its first caption typed.',
    spec: [
      ['States', '1, drawn on load'],
      ['Beats', 'beats 0.00 – 1.00: the flyer prints (0 – 0.24) and its parts set in (from 0.1), the two posts open (0.34, 0.40), the phone rises (0.42 – 0.72), its caption types (0.66) and its progress runs (0.5 – 1.0)'],
      ['Easing', 'E.out for the print, the openings and the phone’s rise (5); the caption types in E.lin jumps'],
      ['Intro', LOAD],
      ['Drawn at', '600 × 600 in its own px, zoomed to its box'],
      ['Trigger', 'Page load, once'],
      ['Variants', 'Drawings (the offer page keeps them) or Photographs'],
    ],
    source: source(['Listing', 'ListingHero'], 'scenes-listing', ['components/scene/pictures.tsx · Pictures', 'components/offers/ListingKit.tsx']),
    where: 'Listing kit page (/listing-kit), the hero: black, the scene beside the headline and the checkout buttons.',
    rules: [
      'No lime here: the page’s button beside it is the one.',
      'Everything printed or posted is ink on paper, in either tone.',
    ],
    tags: ['scene', 'hero', 'load', 'flyer', 'phone'],
    bundle: files('Listing', 'scenes-listing', PICS.concat(GEN)),
  },
  {
    id: 'listing-tour', order: 100, tone: 'dark', kind: 'states', mount: 'listing-tour', dwell: 2600, pics: false,
    title: 'Listing kit tour: what you get',
    steps: ['Print flyer', '5 social posts', '30-second video', 'Editable copies', 'One round of changes'],
    line: '5 states · 505vh · scroll',
    summary: 'What you get, in five stops: the flyer prints, front and back; five posts are cropped from its pictures; a phone rises with the 30-second video. Then the editable copy opens beside the flyer and a new price typed into it rolls over on the flyer; and a change asked for in a message lands on the flyer’s open house line.',
    spec: [
      ['States', '5: Print flyer · 5 social posts · 30-second video · Editable copies · One round of changes'],
      ['Beats', '0 → 1, beats 0.00 – 0.76: the flyer prints · 1 → 2, 1.00 – 1.96: five posts · 2 → 3, 2.00 – 2.98: the video · 3 → 4, 3.00 – 3.94: the copy opens, the price is typed and rolls over on the flyer, underlined in ink · 4 → 5, 4.00 – 4.88: a message asks, the open house line rolls over to Sunday, the reply says it is done'],
      ['Easing', 'E.out for what prints and opens (13), E.in for folds (9), E.move (6), E.lin for jumps and typing (6), E.soft (3)'],
      ['Chapter', '505vh pinned: 75vh a stop, 130vh more, the last state held for 0.3 screens'],
      ['Drawn at', '720 × 640 in its own px, zoomed to its box'],
      ['Trigger', DRIVE],
      ['Variants', 'Drawings (the offer page keeps them) or Photographs'],
    ],
    source: source(['Listing', 'ListingTour'], 'scenes-listing', ['components/scene/pictures.tsx · Pictures', 'components/offers/KitTour.tsx']),
    where: 'Listing kit page, What you get: black, the section pins, the five rows listed beside the scene, each a stop (KitTour).',
    rules: [
      'One lime a state, handed on: the flyer’s tag, the Just Listed tag, the video’s running time, the field being edited, the reply that says it is done.',
      'What changed on the flyer is underlined in ink.',
      BEATS,
    ],
    tags: ['scene', 'scroll', 'tour', 'flyer', 'posts', 'video', 'typing'],
    bundle: files('Listing', 'scenes-listing', PICS.concat(GEN)),
  },
  {
    id: 'practice-hero', order: 110, tone: 'paper', kind: 'play', mount: 'practice-hero', shot: 4200, pics: false,
    title: 'Practice hero: live with a phone',
    steps: [['Live at willowcounseling.com']],
    line: 'draws in 1.7 s on load',
    summary: 'Willow Counseling’s calm homepage draws itself on load: the window opens on the page, its headline is set and its room comes in from the floor up, the address is typed in behind a lock, Live, and its phone rises beside it.',
    spec: [
      ['States', '1, drawn on load'],
      ['Beats', 'beats 0.00 – 0.94: the window opens (0 – 0.3), the headline is wiped in (0.1, 0.15), the room rises (0.13 – 0.49), the address is typed behind a lock (0.4 – 0.57), Live (0.6), the phone rises (0.5 – 0.94)'],
      ['Easing', 'E.out for openings and wipes (3), E.lin for the lock'],
      ['Intro', LOAD],
      ['Drawn at', '600 × 600 in its own px, the site zoomed to 0.86 so its type stays type'],
      ['Trigger', 'Page load, once'],
      ['Variants', 'Drawings (the offer page keeps them) or Photographs'],
    ],
    source: source(['Practice', 'PracticeHero'], 'scenes-practice', ['components/scene/pictures.tsx · Pictures', 'components/offers/RebuildHero.tsx']),
    where: 'Practice page (/practice-websites), the hero: paper, beside the headline, with the before-and-after sample below.',
    rules: [
      'One lime: Live.',
      'The window is clipped, not faded: it opens on an inset, its corners kept.',
    ],
    tags: ['scene', 'hero', 'load', 'browser', 'phone', 'typing'],
    bundle: files('Practice', 'scenes-practice', PICS),
  },
  {
    id: 'practice-tour', order: 120, tone: 'paper', kind: 'states', mount: 'practice-tour', dwell: 2400, pics: false,
    title: 'Practice tour: what you get',
    steps: ['3 to 5 pages.', 'Works on every phone.', 'One clear next step.', 'Found on Google.', 'You own it.', 'A short how-to video', '30 days of small fixes'],
    line: '7 states · 550vh · scroll',
    summary: 'The homepage window stays put while each thing you get comes out beside it (on frosted glass where it lies over the window, so the window shows through) and folds away for the next: its four other pages, the phone, the booking button clicked open, the Google result, the owner card, the how-to video, thirty days of fixes.',
    spec: [
      ['States', '7: 3 to 5 pages · Works on every phone · One clear next step · Found on Google · You own it · A short how-to video · 30 days of small fixes'],
      ['Beats', '0 → 1, beats 0.04 – 0.93: the site opens, four pages slide out from behind it · 1 → 2, 1.02 – 1.72: the phone · 2 → 3, 2.00 – 2.98: the button is clicked, the ways to book open · 3 → 4, 3.02 – 3.92: the Google result · 4 → 5, 4.02 – 4.54: the owner card · 5 → 6, 5.02 – 5.90: the video, its text edited · 6 → 7, 6.02 – 6.96: a month of fixes, today ticked'],
      ['Easing', 'E.lin for typing and jumps (14), E.soft (9), E.out (8), E.in for folds (7)'],
      ['Chapter', '550vh pinned: 60vh a stop, 130vh more, the last state held for 0.3 screens'],
      ['Drawn at', '720 × 600 in its own px; the site zoomed to 0.86 so its type stays type'],
      ['Trigger', DRIVE],
      ['Variants', 'Drawings (the offer page keeps them) or Photographs'],
    ],
    source: source(['Practice', 'PracticeTourScene'], 'scenes-practice', ['components/scene/pictures.tsx · Pictures', 'components/offers/PracticeTour.tsx']),
    where: 'Practice page, What you get: paper, the section pins, the seven items listed beside the scene, each a stop.',
    rules: [
      'One lime a state, never two: the Home tab, the phone’s secure address, the booking way picked, the search words matched, You, the video’s progress, today.',
      'Where a thing lies over the window it is on frosted glass, so the window shows through; it folds away before the next comes out.',
      BEATS,
    ],
    tags: ['scene', 'scroll', 'tour', 'browser', 'phone', 'glass', 'pointer'],
    bundle: files('Practice', 'scenes-practice', PICS),
  },
];

/* --------------------------------------------------------------------------------------------- */

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const norm = (steps) => steps.map((s) => (Array.isArray(s) ? s : [s]));

function page(d) {
  const steps = norm(d.steps);
  const n = d.kind === 'play' ? 1 : steps.length;
  const first = d.dwell + 400;
  // the thumbnail shows the last state, settled: the harness aims at it at start + first + (n − 2) dwells (start is about
  // 0.45 s after load), and a page drawing in software takes up to ~3.5 s to arrive, the hold after it is long enough
  if (d.kind === 'states') d.shot = Math.ceil((0.45 + first / 1000 + (n - 2) * (d.dwell / 1000) + 3.6) * 10) * 100;
  const meta = {
    id: d.id, title: d.title, group: 'scenes', order: d.order, kind: d.kind, tone: d.tone, n,
    line: d.line, summary: d.summary, spec: d.spec, source: d.source,
    where: d.where, rules: d.rules, tags: d.tags,
    bundle: { files: d.bundle },
    shot: d.shot,
  };

  // the toggle: About's audience, or a scene's pictures
  const ui = d.dream
    ? { label: 'Homepage for', a: ['ai', 'AI teams'], b: ['biz', 'Business'], note: 'AI teams: black, Bid King · Business: paper, a calm site' }
    : d.pics === true
      ? { label: 'Pictures', a: ['1', 'Photographs'], b: ['0', 'Drawings'], note: 'the business homepage shows photographs' }
      : d.pics === false
        ? { label: 'Pictures', a: ['0', 'Drawings'], b: ['1', 'Photographs'], note: 'the offer page keeps the drawings' }
        : null;
  const uiHtml = ui
    ? `  <div class="qm-ui" id="ui">
    <span>${ui.label}</span>
    <button type="button" data-v="${ui.a[0]}" class="is-on">${ui.a[1]}</button>
    <button type="button" data-v="${ui.b[0]}">${ui.b[1]}</button>
    <span class="qm-sep">${ui.note}</span>
  </div>
`
    : '';

  const s0 = steps[0];
  const capHtml = `<span class="qms-n">01 / ${String(n).padStart(2, '0')}</span><span>${esc(s0[0])}</span>${s0[1] ? `<span class="tag qms-tag${s0[1] === 'Live' ? ' is-live' : ''}">${esc(s0[1])}</span>` : ''}`;

  const common = `
  const section = document.getElementById('ch');
  const box = document.getElementById('scene');
  const cap = document.getElementById('cap');
  const el = (tag, cls, text) => Object.assign(document.createElement(tag), { className: cls, textContent: text });
  let tl = null, mounted = null;
  const mount = (props) => {
    mounted?.unmount();
    mounted = QMScenes.mount('${d.mount}', box, props);
  };`;

  const stepsJs = JSON.stringify(steps);

  let glue;
  if (d.kind === 'states') {
    glue = `
  /* The real scene (the site's own component, bundled in ../scenes/scenes.js). The site's driver, which plays it
     with the scroll, is replaced by the harness: it hands the timeline over here. */
  let STEPS = ${stepsJs};
  const n = STEPS.length;
  let at = 0, step = -1, started = false;
${common}

  function label(s) {
    step = s;
    section.dataset.step = String(s);                                       // the chapter's lit step, as the driver sets it
    section.dispatchEvent(new CustomEvent('scene:step', { detail: s }));
    const [name, tag] = STEPS[s];
    cap.replaceChildren(el('span', 'qms-n', \`\${String(s + 1).padStart(2, '0')} / \${String(n).padStart(2, '0')}\`), el('span', '', name));
    if (tag) cap.append(el('span', 'tag qms-tag' + (tag === 'Live' ? ' is-live' : ''), tag));
  }
  function seek(t) {
    at = t;
    if (!tl) return;
    tl.seek(QM.reduced ? (t > 0 ? Math.max(1, Math.round(t)) : 0) : t);      // reduced motion: a still per state, as the driver
    const s = Math.max(0, Math.min(n - 1, Math.round(t) - 1));
    if (s !== step) label(s);
  }

  window.QMSceneReady = (timeline) => {
    tl = timeline;
    step = -1;
    seek(at);
    if (started) return;
    started = true;
    QM.demo({ kind: 'states', n, seek, dwell: ${d.dwell}, first: ${first}, hold: ${HOLD} });
  };`;
  } else {
    glue = `
  /* The real scene (the site's own component, bundled in ../scenes/scenes.js). A hero draws itself when the page
     opens: the driver's 'load' intro is its one state over 1.7 s, linear, the shown time chasing it. */
  const LOAD = 1700;
  let shown = 0, raf = 0, started = false;
${common}

  const apply = (t) => { shown = t; tl?.seek(t); };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };
  function play() {
    stop();
    if (QM.reduced) return apply(1);                                         // reduced motion: the state at once
    const t0 = performance.now();
    let last = t0;
    const frame = (now) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      const want = Math.min(1, (now - t0) / LOAD);
      const next = shown + (want - shown) * (1 - Math.exp(-dt * 6.5));
      apply(Math.abs(want - next) < 0.0005 ? want : next);
      raf = shown < 1 ? requestAnimationFrame(frame) : 0;
    };
    raf = requestAnimationFrame(frame);
  }

  window.QMSceneReady = (timeline) => {
    tl = timeline;
    tl.seek(shown);
    if (started) return;
    started = true;
    QM.demo({ kind: 'play', dur: 2200, hold: 2600, lead: 500, reset() { stop(); apply(0); }, play, seekPlay(v) { stop(); apply(v); } });
  };`;
  }

  let toggle;
  if (ui && d.dream) {
    toggle = `
  /* About, for AI teams (black, Bid King's table) or for business (paper, a calm counseling site) */
  const COPY = {
    ai: { tone: 'dark', biz: false, steps: [['The ideas people bring us'], ['One of them, built: AI Bidding']] },
    biz: { tone: 'paper', biz: true, steps: [['The ideas people bring us'], ['One of them, built: a calm site']] },
  };
  function audience(k) {
    const c = COPY[k];
    document.documentElement.dataset.tone = section.dataset.tone = c.tone;   // the scene reads its colours from the chapter
    STEPS = c.steps;
    step = -1;
    mount({ biz: c.biz });
  }
  document.querySelectorAll('#ui [data-v]').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('#ui [data-v]').forEach((x) => x.classList.toggle('is-on', x === b));
    audience(b.dataset.v);
  }));
  audience('ai');`;
  } else if (ui) {
    toggle = `
  /* Photographs or drawings: the site shows ${d.pics ? 'photographs on the business homepage' : 'drawings on its offer pages'} (components/scene/pictures.tsx) */
  document.querySelectorAll('#ui [data-v]').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('#ui [data-v]').forEach((x) => x.classList.toggle('is-on', x === b));
    mount({ pictures: b.dataset.v === '1' });
  }));
  mount();`;
  } else {
    toggle = `
  mount();`;
  }

  return `<!doctype html>
<html lang="en" data-tone="${d.tone}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(d.title)} · Qbix Motion</title>
<link rel="stylesheet" href="../kit/qbix.css">
<link rel="stylesheet" href="../scenes/scenes.css">
<script type="application/json" id="qm-meta">
${JSON.stringify(meta, null, 2)}
</script>
<style>
  /* demo only: the scene fills the stage at its own proportions; its caption sits in the corner */
  :root { --pad: clamp(12px, 3vmin, 40px); --bar: 0px; }
  html:not(.qm-tile) body.has-ui { --bar: 46px; }
  .qm-stage { padding: var(--pad); place-items: start center; }
  .qms { width: 100%; height: calc(100svh - 2 * var(--pad) - var(--bar)); display: grid; grid-template-rows: minmax(0, 1fr) 24px; gap: 4px; }
  .qms-box { min-width: 0; min-height: 0; }
  .qms-cap { display: flex; align-items: center; gap: 10px; color: var(--fg3); white-space: nowrap; }
  .qms-cap .qms-n { color: var(--fg); }
</style>
</head>
<body${ui ? ' class="has-ui"' : ''}>
<main class="qm-stage">
  <section class="qms" id="ch" data-chapter data-tone="${d.tone}" data-step="0">
    <div class="qms-box" id="scene"></div>
    <p class="kicker qms-cap" id="cap" aria-live="polite">${capHtml}</p>
  </section>
${uiHtml}</main>
<script src="../kit/stage.js"></script>
<script src="../scenes/scenes.js"></script>
<script>
${glue.replace(/^\n/, '')}
${toggle}
</script>
</body>
</html>
`;
}

const only = process.argv.slice(2);
for (const d of LIST) {
  if (only.length && !only.includes(d.id)) continue;
  fs.writeFileSync(path.join(DEMOS, `${d.id}.html`), page(d));
  console.log('wrote demos/' + d.id + '.html');
}
