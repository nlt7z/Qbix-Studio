// =============================================================================
// QBIX STUDIO — content / positioning
// =============================================================================

// ----- NAVIGATION -------------------------------------------------------------

export type NavItem = {
  num: string;
  label: string;
  href: string;
  cool: string;   // HUD callsign (uppercase)
  plain: string;  // HUD plain echo (lowercase)
  side: string;   // SideNav short label
  tip: string;    // SideNav tooltip
};

export const navItems: NavItem[] = [
  { num: '01', label: 'Services', href: '#services', cool: 'SERVICES', plain: 'services', side: 'SVC', tip: 'Services'  },
  { num: '02', label: 'Work',     href: '#work',     cool: 'WORK',     plain: 'work',     side: 'WRK', tip: 'Selected work' },
  { num: '03', label: 'Process',  href: '#how',      cool: 'PROCESS',  plain: 'process',  side: 'PRC', tip: 'How we work' },
  { num: '04', label: 'Labs',     href: '#labs',     cool: 'LABS',     plain: 'labs',     side: 'LAB', tip: 'Qbix Labs' },
  { num: '05', label: 'Contact',  href: '#contact',  cool: 'CONTACT',  plain: 'contact',  side: 'CON', tip: 'Get in touch' },
];

// ----- HERO CUBE GRID (4 capability cubes, 1 lit lime) ----------------------

export type CubeCell = {
  num: string;
  label: string;
  meta: string;       // mono sub-label, e.g. "Agent · LLM · UI"
  lit?: 1 | 2;        // 1 = lime accent, 2 = ink solid
};

export const cubeCells: CubeCell[] = [
  { num: '01', label: 'AI Product',     meta: 'Agent · LLM · UI',     lit: 1 },
  { num: '02', label: 'UX / UI',        meta: 'Web · Mobile · SaaS' },
  { num: '03', label: 'Prototype',      meta: 'Sketch → clickable'   },
  { num: '04', label: 'Build & Ship',   meta: 'Front-end · launch'   },
];

// ----- SERVICES (3 numbered capability cards) --------------------------------

export type Service = {
  slug: string;
  num: string;       // "01"
  audience: string;  // "AI startups" / "Local business" / etc — primary buyer
  title: string;
  blurb: string;
  tags: string[];
  priceFrom: string; // "$2k" / "$15k" — starting anchor
  typical: string;   // "1 – 3 weeks" — duration anchor
  caseSlugs?: string[]; // slugs from `projects` shown as cases on the detail page
  detail: {
    lede: string;
    deliverables: string[];
    engagement: { k: string; v: string }[];
  };
};

export const services: Service[] = [
  {
    slug: 'web',
    num: '01',
    audience: 'Local business · Portfolio · Brand',
    title: 'Web, shipped.',
    blurb:
      'Your idea, faithfully rendered into a live site. Design, code, deploy, domain — end to end.',
    tags: ['Marketing site', 'Portfolio', 'Brand'],
    priceFrom: '$500',
    typical: '1 – 3 weeks',
    caseSlugs: ['lamdre', 'sde-personal-rebrand'],
    detail: {
      lede:
        'We do the whole thing — design to live. Moodboard sets the direction, then we render your idea faithfully into the interface, write the front-end code, push to your GitHub, deploy it, wire up the domain, and hand it over. What you end up with is a live site anyone can visit — and the code you own.',
      deliverables: [
        'The live site — deployed to your domain, with the code handed to you',
        'Interface design that renders your idea faithfully — responsive, with scroll feel and motion built in',
        'On-page SEO and analytics, set up and verified',
      ],
      engagement: [
        { k: 'Moodboard',      v: 'We agree on the look in a day or two, before building' },
        { k: 'Design + build', v: 'Designed and coded end to end — no handoff gap' },
        { k: 'Revisions',      v: 'One focused round, then we launch' },
        { k: 'Launch',         v: 'We deploy to your domain' },
      ],
    },
  },
  {
    slug: 'app-ai',
    num: '02',
    audience: 'AI startups · 0 → 1',
    title: 'AI products that ship.',
    blurb:
      'An AI idea, turned into a real product people can use. Design, front end, back end — we handle it.',
    tags: ['Agent UX', 'AI chat', '0 → 1'],
    priceFrom: '$20k',
    typical: '6 – 12 weeks',
    caseSlugs: ['qwen-character', 'bidking'],
    detail: {
      lede:
        'Agent flows, LLM interfaces, AI chat, AI features dropped into an existing app. We design it, then write the front end — and the back end if you don\'t have one. This is taking a product from zero to live. Two paths, depending on whether you already have engineering.',
      deliverables: [
        'The shipped product — deployed live, with the production front-end code handed to you',
        'Design system + IA as markdown — components, tokens, agent flows, and every state, versioned and yours',
        'Model behavior spec — prompts, fallbacks, and empty / error / loading states',
      ],
      engagement: [
        { k: 'Moodboard', v: 'Visual direction locked before a single screen gets built' },
        { k: 'Design',    v: 'UI system + IA written as markdown you own' },
        { k: 'Build',     v: 'We design and write the front end into your repo — or design, front end, and back end for a full ship if you have no engineering yet' },
        { k: 'Launch',    v: 'We help you ship it live' },
      ],
    },
  },
  {
    slug: 'redesign',
    num: '03',
    audience: 'Growth-stage · 1 → 100',
    title: 'Redesign, from 1 to 100.',
    blurb:
      'You already have a product. Polish it until it\'s worth sharing — round after round, straight into your repo.',
    tags: ['Redesign', 'User feedback', 'Iteration'],
    priceFrom: '$5k',
    typical: '5 – 10 weeks',
    caseSlugs: ['spark-tts', 'liner-ai-collaboration'],
    detail: {
      lede:
        'You already have a product, but it needs to move forward. Working from your needs and real user feedback, we upgrade it round by round — not a rewrite from scratch, but lifting it from working to good, from good to worth sharing. Designed and coded end to end; the changes go straight into your product.',
      deliverables: [
        'Upgraded surfaces — production front-end code merged into your repo as PRs',
        'Design system + IA as markdown — extends the components, tokens, and flows you already have',
        'Interaction and motion specs for anything new',
      ],
      engagement: [
        { k: 'Diagnose',    v: 'We look at data and feedback to find what most needs to move' },
        { k: 'IA + design', v: 'Flows and UI system written as markdown' },
        { k: 'Build',       v: 'Design and code, iterating round by round — every round shippable and verifiable' },
        { k: 'Handover',    v: 'Docs and components stay with your team' },
      ],
    },
  },
];

// ----- SELECTED WORK (real projects with real media) -------------------------

export type ProjectCategory = 'all' | 'ai-product' | 'ux-ui' | 'web' | 'mobile' | 'game' | 'lab';

export type Media =
  | { kind: 'video'; src: string; poster?: string }
  | { kind: 'image'; src: string }
  | { kind: 'images'; srcs: string[] }
  | { kind: 'iframe'; src: string };

export type Project = {
  slug: string;
  num: string;
  title: string;
  client: string;
  role: string;
  year: number;
  category: ProjectCategory;
  tags: string[];
  hook: string;
  aspect?: number;            // intrinsic w/h (only when media present)
  media?: Media;              // optional — text-forward cases have no media yet
  highlights?: string[];      // 2–4 short bullet outcomes
  metric?: string;            // single mono badge line, e.g. "+200% model calls"
  href?: string;
};

export const projects: Project[] = [
  {
    slug: 'lamdre',
    num: 'FILE / 001',
    title: 'Lamdre Restaurant Design',
    client: 'Lamdre · Restaurant',
    role: 'Brand · Visual Design · Web',
    year: 2026,
    category: 'web',
    tags: ['Brand', 'Restaurant', 'Visual Design'],
    hook:
      'Brand and visual design for Lamdre — an identity and design language carried from the space through to the screen.',
    aspect: 2110 / 1080,
    media: { kind: 'video', src: '/lamdre.mp4' },
  },
  {
    slug: 'qwen-character',
    num: 'FILE / 002',
    title: 'AI Character Product Build',
    client: 'Enterprise AI Platform',
    role: 'AI Product Design · Front-end · Agent flow',
    year: 2025,
    category: 'ai-product',
    tags: ['AI Product', 'Developer tools', 'LLM', 'Agent'],
    hook:
      'Turned static API docs into four hands-on LLM surfaces — model call volume grew 200% after launch, proving documentation can be the product.',
    highlights: [
      'Four interactive surfaces replaced static API docs with hands-on LLM demos developers could touch.',
      'A prompt-to-deploy framework — HTML, CSS, component integrations — cut design-to-deploy time by 60%.',
      'Art direction across all four surfaces: motion, state transitions, and a custom illustration set.',
    ],
    metric: '+200% model calls · 60% faster ship',
    aspect: 16 / 9,
    media: { kind: 'video', src: '/figma.mp4' },
  },
  {
    slug: 'spark-tts',
    num: 'FILE / 003',
    title: 'Reframe TTS Workflow',
    client: 'Enterprise AI Platform',
    role: 'AI Product Design · Interaction · Motion',
    year: 2025,
    category: 'ai-product',
    tags: ['AI Product', 'Generation UX', 'Design System', 'Patent'],
    hook:
      'A text-to-speech workflow that opens up the black box — patented, and adopted into an enterprise design system as the standard pattern for inspectable, controllable generation.',
    highlights: [
      'Patent-winning workflow that breaks black-box TTS into editable steps — pitch, pauses, emotional cues.',
      'Adopted into the enterprise design system as the reusable template for controllable generation.',
      'Interaction logic, UI states, and motion for the preview and edit moments where users learn to trust the output.',
    ],
    metric: 'Patent · Innovation award · Design system template',
    aspect: 16 / 9,
    media: { kind: 'image', src: '/tts-workflow.jpg' },
  },
  {
    slug: 'bidking',
    num: 'FILE / 004',
    title: 'Transform Bid Experience into Mobile Games',
    client: 'Studio Product',
    role: 'Game Design · Mobile UI · System',
    year: 2025,
    category: 'game',
    tags: ['Studio Product', 'Mobile', 'Game'],
    hook:
      'A sealed-bid auction reimagined as a mobile game — strategy hidden behind cute chaos, where players bid, bluff, or burn until the last vault standing wins.',
    aspect: 720 / 332,
    media: { kind: 'video', src: '/bidking-present.mp4' },
    href: '/games/bidking',
  },
  {
    slug: 'sde-personal-rebrand',
    num: 'FILE / 005',
    title: 'Rebrand SDE to Be Competitive',
    client: 'Senior SDE · Independent',
    role: 'Brand · Web · Front-end',
    year: 2026,
    category: 'web',
    tags: ['Branding', 'Web', 'Portfolio'],
    hook:
      'Rebrand and rebuild for a senior engineer — turned a stock résumé page into a personal site that reads like product work, sharp enough to stand out in a competitive hiring market.',
    highlights: [
      'Identity, type system, and tone rebuilt to feel sharp and engineering-native — not decorative.',
      'Architecture organized around the work, not the timeline — projects, writing, and contact in three clicks.',
      'Shipped in Next.js with motion details that read as craft without weighing the page down.',
    ],
    aspect: 16 / 9,
    media: { kind: 'iframe', src: 'https://hancao.space' },
    href: 'https://hancao.space',
  },
  {
    slug: 'liner-ai-collaboration',
    num: 'FILE / 006',
    title: 'Liner AI Collaboration Feature',
    client: 'Liner · AI Research Assistant',
    role: 'AI Product Design · Collaboration UX · Research workflow',
    year: 2026,
    category: 'ai-product',
    tags: ['AI Product', 'Collaboration', 'Research', 'Workflow'],
    hook:
      'A research-focused, AI-powered collaboration workflow for Liner — designed so teams can search, annotate, and synthesize sources together with the model in the loop, not bolted on after.',
    highlights: [
      'Designed a shared research surface where collaborators and the AI work the same sources in real time.',
      'Mapped the collaboration workflow end to end — invite, annotate, cite, and synthesize without breaking flow.',
      'Interaction and state design for the moments where human judgment and model output meet.',
    ],
    aspect: 1920 / 1302,
    media: { kind: 'video', src: '/liner-present.mp4' },
  },
];

// ----- HOW WE WORK (6 steps) -------------------------------------------------

export type ProcessStep = {
  num: string;
  title: string;
  body: string;
  icon: 'target' | 'search' | 'frame' | 'layers' | 'code' | 'arrow';
};

export const processSteps: ProcessStep[] = [
  {
    num: '01',
    title: 'Clarify',
    body: 'Name the problem, the user, the bet.',
    icon: 'target',
  },
  {
    num: '02',
    title: 'Research',
    body: 'Interviews, market scan, model probing.',
    icon: 'search',
  },
  {
    num: '03',
    title: 'Prototype',
    body: 'Sketches, flows, clickable models.',
    icon: 'frame',
  },
  {
    num: '04',
    title: 'Design',
    body: 'IA, interaction, visual systems.',
    icon: 'layers',
  },
  {
    num: '05',
    title: 'Build',
    body: 'Front-end build, web and mobile.',
    icon: 'code',
  },
  {
    num: '06',
    title: 'Launch',
    body: 'Hand off, document, measure.',
    icon: 'arrow',
  },
];

// ----- QBIX LABS (3 lab cards) -----------------------------------------------

export type LabCard = {
  num: string;
  title: string;
  body: string;
};

export const labCards: LabCard[] = [
  {
    num: '01',
    title: 'AI Software Products',
    body: 'Subscription-based AI tools designed and built in-house. Practical, small, sharp.',
  },
  {
    num: '02',
    title: 'Interface Experiments',
    body: 'Explorations around agent workflows, generative UI, and human-AI collaboration patterns.',
  },
  {
    num: '03',
    title: 'Game & Interaction Systems',
    body: 'Small games and playful systems that test behavior, economy, and interaction loops.',
  },
];

// ----- BRAND LOOKBOOK (identity stills, not project cases) -------------------

export type LookbookItem = {
  num: string;
  label: string;
  alt: string;
  src: string;
  aspect: string;   // CSS aspect-ratio shorthand
};

export const brandLookbook: LookbookItem[] = [
  {
    num: '01',
    label: 'Mixtape, vol. 01',
    alt: 'Clear plastic cassette tape labelled QBIX STUDIO LLC',
    src: '/brand-cassette.png',
    aspect: '1 / 1',
  },
  {
    num: '02',
    label: 'Qbix fan',
    alt: 'Translucent lime fan render with the Qbix mark',
    src: '/qbix-fan.png',
    aspect: '1448 / 1086',
  },
  {
    num: '03',
    label: 'Qbix square',
    alt: 'Qbix square brand object render',
    src: '/qbix-square.png',
    aspect: '1 / 1',
  },
];

// ----- GAMES SHELL (HUD/mission-control route) -------------------------------
//
// Supplies the data the Archive and Ticker components import for /games.

export type MissionStatus = 'playable' | 'concept' | 'paused';

export type Mission = {
  id: string;
  num: string;
  status: MissionStatus;
  statusLabel: string;
  statusTagClass?: string;
  title: string;
  hook: string;
  tags: string[];
  cta: string;
  ctaIcon: string;
  preview: 'bidking' | 'lucien' | 'omikuji' | 'therapy';
  cardClass?: string;
  href?: string;
};

export const missions: Mission[] = [
  {
    id: '01',
    num: 'MISSION / 001',
    status: 'playable',
    statusLabel: 'PLAYABLE',
    statusTagClass: 'tag-live',
    title: 'BidKing',
    hook: 'A blind auction. Bid, bluff, or burn. The last vault standing wins.',
    tags: ['Strategy', 'Party', 'Mobile'],
    cta: 'Open mission',
    ctaIcon: '→',
    preview: 'bidking',
    href: '/games/bidking',
  },
  {
    id: '02',
    num: 'MISSION / 002',
    status: 'concept',
    statusLabel: 'IN BUILD',
    title: 'Lucien',
    hook: 'A short narrative system about haunted inventories.',
    tags: ['Narrative', 'Web'],
    cta: 'Concept',
    ctaIcon: '→',
    preview: 'lucien',
    cardClass: 'locked',
  },
  {
    id: '03',
    num: 'MISSION / 003',
    status: 'concept',
    statusLabel: 'IN BUILD',
    title: 'Omikuji',
    hook: 'Daily-draw oracle game with shared seeds.',
    tags: ['Casual', 'Daily', 'Mobile'],
    cta: 'Concept',
    ctaIcon: '→',
    preview: 'omikuji',
    cardClass: 'locked',
  },
  {
    id: '04',
    num: 'MISSION / 004',
    status: 'concept',
    statusLabel: 'IN BUILD',
    title: 'Therapy',
    hook: 'Conversation-as-puzzle. You play the listener.',
    tags: ['Narrative', 'AI'],
    cta: 'Concept',
    ctaIcon: '→',
    preview: 'therapy',
    cardClass: 'locked',
  },
];

export const tickerItems: string[] = [
  '// QBIX STUDIO',
  '// EST 2026',
  '// SEATTLE',
  '// NO MIDDLEMEN',
  '// CODE OVER SLIDES',
  '// PRODUCT OVER PITCH',
  '// SMALL TEAMS · SHARP SYSTEMS',
  '// HUMAN-LED · SYSTEM-FIRST',
];

// ----- TESTIMONIALS (real client quotes — rotated in the Testimonial band) ---
//
// Add 2–3 verified quotes here and the homepage band auto-rotates through them.
// `highlight` (optional) is wrapped in the lime signal style if found verbatim
// in `quote`. Only add quotes you can attribute to a real person + org.

export type Testimonial = {
  quote: string;
  highlight?: string;
  name: string;   // person (initials are fine)
  org: string;    // company / role
};

export const testimonials: Testimonial[] = [
  {
    quote:
      'Qbix is one of the few studios that grew up inside the AI era. Their fluency with AI in the workflow — and their grasp of what AI products should feel like — is next level.',
    highlight: 'next level',
    name: 'CY',
    org: 'Alibaba Cloud',
  },
];

// ----- CONTACT ---------------------------------------------------------------

export const CONTACT_EMAIL = 'qbixspace@gmail.com';
export const BOOKING_URL   = 'https://cal.com/qbix-studio/30min';
export const CONTACT_NOTE =
  'Qbix Studio is available for AI product design, UX/UI systems, web/mobile design, and product strategy consulting.';
