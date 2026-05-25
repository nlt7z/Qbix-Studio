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

// ----- SERVICES (5 numbered capability cards) --------------------------------

export type Service = {
  slug: string;
  num: string;       // "01"
  audience: string;  // "AI startups" / "Local business" / etc — primary buyer
  title: string;
  blurb: string;
  tags: string[];
  priceFrom: string; // "$2k" / "$15k" — starting anchor
  typical: string;   // "1 – 3 weeks" — duration anchor
  detail: {
    lede: string;
    deliverables: string[];
    engagement: { k: string; v: string }[];
  };
};

export const services: Service[] = [
  {
    slug: 'ai-products',
    num: '01',
    audience: 'AI startups · dev tools',
    title: 'AI products that real people use',
    blurb:
      'Agent flows, LLM interfaces, AI features that ship.',
    tags: ['Agent UX', 'LLM UI', 'AI features'],
    priceFrom: '$20k',
    typical: '6 – 12 weeks',
    detail: {
      lede:
        'We design and build AI products people actually use — agent workflows, chat and command surfaces, generative UIs, and AI features inside existing apps. One designer-engineer pair designs it, codes the front end, and ships it live.',
      deliverables: [
        'The shipped product — deployed live, with the production front-end code handed to you',
        'UI design system as markdown — components, tokens, and interaction rules you keep and version',
        'Information architecture as markdown — agent flows, screen hierarchy, and every state',
        'Model behavior spec — prompts, fallbacks, and empty / error / loading states',
        'Original illustration and icon set — hand-drawn by us, packaged with the files (no stock)',
      ],
      engagement: [
        { k: 'Moodboard',   v: 'Visual direction locked before a single screen gets built' },
        { k: 'Design',      v: 'UI system + IA written as markdown you own' },
        { k: 'Build',       v: 'We write the production front-end code ourselves' },
        { k: 'Launch',      v: 'We help you ship it live' },
        { k: 'Team',        v: '1 designer + 1 engineer — the people doing the work' },
        { k: 'Typical run', v: '6 – 12 weeks' },
      ],
    },
  },
  {
    slug: 'local-business',
    num: '02',
    audience: 'Local business · SMB',
    title: 'A marketing site, done with craft',
    blurb:
      'Restaurants, services, small brands. Design and build, one team, fixed scope.',
    tags: ['Marketing site', 'Brand basics', 'Launch'],
    priceFrom: '$2k',
    typical: '1 – 3 weeks',
    detail: {
      lede:
        'A site that earns trust before someone calls, books, or walks in. We design it and build it as one pair, then put it live for you — fixed scope, no agency overhead.',
      deliverables: [
        'The live site — built, deployed to your domain, with the code handed over',
        'Original logo and brand basics — type, color, and a mark designed by us (no stock)',
        'Any illustration or imagery the site needs — drawn by us and packaged with the files',
        'Responsive build with simple content editing for text and images',
        'On-page SEO and analytics, set up and verified',
      ],
      engagement: [
        { k: 'Moodboard',      v: 'We agree on the look in a day or two, before building' },
        { k: 'Design + build', v: 'Same pair designs and codes it — no handoff gap' },
        { k: 'Revisions',      v: 'One focused round, then we launch' },
        { k: 'Launch',         v: 'We put it live on your domain' },
        { k: 'Typical run',    v: '1 – 3 weeks' },
      ],
    },
  },
  {
    slug: 'saas-b2b',
    num: '03',
    audience: 'Growth-stage SaaS · B2B',
    title: 'Redesigns and new surfaces',
    blurb:
      'Dashboards, onboarding, feature launches. We ship into your repo.',
    tags: ['Dashboard', 'Onboarding', 'Feature launch'],
    priceFrom: '$5k',
    typical: '2 – 4 weeks',
    detail: {
      lede:
        'Interface design for growth-stage SaaS — dashboards, onboarding, and new feature surfaces. One pair that designs and writes the code, shipping into your repo instead of handing over PDFs.',
      deliverables: [
        'Shipped surfaces — production front-end code merged into your repo as PRs, or a deployed prototype',
        'UI design system as markdown — components, tokens, and states that extend what you already have',
        'Information architecture as markdown — flows, navigation, and screen hierarchy',
        'Interaction and motion specs for anything new',
        'Any original icons or illustration the work needs — made by us, no stock',
      ],
      engagement: [
        { k: 'Moodboard',   v: 'Quick visual alignment against your existing product' },
        { k: 'IA + design', v: 'Flows and UI system written as markdown' },
        { k: 'Build',       v: 'We open PRs into your repo — production front-end code' },
        { k: 'Handover',    v: 'Docs and components stay with your team' },
        { k: 'Team',        v: '1 designer + 1 engineer' },
        { k: 'Typical run', v: '2 – 4 weeks' },
      ],
    },
  },
  {
    slug: 'brand-studio',
    num: '04',
    audience: 'Brand · studio identity',
    title: 'Identity + site, end-to-end',
    blurb:
      'Brand systems, identity objects, and the website to carry them.',
    tags: ['Identity', 'Brand objects', 'Studio site'],
    priceFrom: '$3k',
    typical: '2 – 4 weeks',
    detail: {
      lede:
        'Brand identity plus the website to carry it — logo, type, motion, brand objects, and a built site. Designed and coded by the same pair, with every asset original to you.',
      deliverables: [
        'The live studio site — designed, built, deployed, with the code handed over',
        'Original identity — logo / mark, type system, color, and motion, all hand-designed by us',
        'Brand objects and illustration — rendered and drawn by us, packaged together (no stock)',
        'Brand guide as markdown — usage rules, do / don\'t, and tokens',
        'Organized source files for everything, handed over at the end',
      ],
      engagement: [
        { k: 'Moodboard',   v: 'Direction locked before we draw anything final' },
        { k: 'Identity',    v: 'Mark, type, color, and motion — all original' },
        { k: 'Site',        v: 'We design and code the site ourselves' },
        { k: 'Launch',      v: 'We deploy it live and hand over the files' },
        { k: 'Typical run', v: '2 – 4 weeks' },
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
    slug: 'qwen-character',
    num: 'FILE / 001',
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
    num: 'FILE / 002',
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
    num: 'FILE / 003',
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
    href: '/work/bidking',
  },
  {
    slug: 'sde-personal-rebrand',
    num: 'FILE / 004',
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
    slug: 'ai-interview-tool',
    num: 'FILE / 005',
    title: 'AI Interview Tool · 0→1 Launch',
    client: 'Studio Product',
    role: 'Product · AI UX · Front-end · Launch',
    year: 2026,
    category: 'ai-product',
    tags: ['AI Product', 'Developer tools', 'End-to-end'],
    hook:
      'An AI-native coding interview tool, taken from zero to one — problem framing through public launch. Designed around how engineers actually think out loud with a model in the room.',
    highlights: [
      'Defined the product from zero — target user, core loop, AI behavior, pricing.',
      'Designed an interview surface where the model coaches, probes, and grades without breaking flow.',
      'Owned design, front-end, and launch — public beta with onboarding, billing, and telemetry shipped.',
    ],
    aspect: 16 / 9,
    media: { kind: 'video', src: '/interview-tool.mp4' },
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
  slug: string;
  num: string;
  title: string;
  body: string;
  detail: {
    lede: string;
    highlights: { k: string; v: string }[];
    status: string;
  };
};

export const labCards: LabCard[] = [
  {
    slug: 'ai-software-products',
    num: '01',
    title: 'AI Software Products',
    body: 'Subscription-based AI tools designed and built in-house. Practical, small, sharp.',
    detail: {
      lede:
        'Subscription AI tools we design, build, and run ourselves — small, focused products that solve one annoying problem really well. Each one starts as a Qbix internal need and graduates if it survives daily use.',
      highlights: [
        { k: 'Active',      v: '3 internal tools' },
        { k: 'Public',      v: '1 released, 2 in beta' },
        { k: 'Stack',       v: 'Next.js · Anthropic · Vercel' },
        { k: 'Pricing',     v: 'Indie SaaS, sub $20 / mo' },
      ],
      status: 'Beta — invite list opens Q3.',
    },
  },
  {
    slug: 'interface-experiments',
    num: '02',
    title: 'Interface Experiments',
    body: 'Explorations around agent workflows, generative UI, and human-AI collaboration patterns.',
    detail: {
      lede:
        'Experiments around what an AI-native interface can be. We prototype patterns for agents, generative UI, multi-modal canvases, and collaboration between humans and models — the ones that earn it move into client work.',
      highlights: [
        { k: 'Current',     v: 'Generative form patterns' },
        { k: 'Released',    v: '4 prototypes · 2 writeups' },
        { k: 'Format',      v: 'Demos · short videos · code' },
        { k: 'License',     v: 'CC-BY / MIT where possible' },
      ],
      status: 'Ongoing — new drop every ~6 weeks.',
    },
  },
  {
    slug: 'game-interaction-systems',
    num: '03',
    title: 'Game & Interaction Systems',
    body: 'Small games and playful systems that test behavior, economy, and interaction loops.',
    detail: {
      lede:
        'Small games and playful systems we build to stress-test interaction loops, behavior, and economy. The constraints of a 15-minute game teach us things long-running software never does.',
      highlights: [
        { k: 'Shipped',     v: 'BidKing · playable prototype' },
        { k: 'In progress', v: '2 multiplayer concepts' },
        { k: 'Platform',    v: 'iOS · Android · Web' },
        { k: 'Team',        v: 'Designer + engineer pair' },
      ],
      status: 'BidKing playable prototype — App Store soon.',
    },
  },
];

// ----- ABOUT -----------------------------------------------------------------

export const aboutLede =
  'Qbix Studio LLC is an AI-native product and software studio in Seattle — a decade-deep artist and engineer working as one team. In this era, building with AI is table stakes; we also build AI ourselves. What we hold onto, and most have let go, is taste, craft, and logic.';

// ----- TEAM ------------------------------------------------------------------

export type TeamMember = {
  initial: string;          // single-letter sigil used in lieu of a photo
  name: string;
  title: string;
  bio: string;              // one line — the credibility hook
};

export const teamMembers: TeamMember[] = [
  {
    initial: 'Q',
    name: 'Q',
    title: 'Founder · Design Lead',
    bio: 'A decade of art and design craft across product, brand, and AI surfaces.',
  },
  {
    initial: 'J',
    name: 'J',
    title: 'Engineering Lead',
    bio: 'Four years of FAANG engineering — shipping high-scale production systems.',
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

// ----- STUDIO SHELL (HUD/mission-control routes) -----------------------------
//
// Stubs for /studio and /games — supplies the data the Archive, Capabilities,
// Dossier, Founders, and Ticker components import. Replace blurbs as the shell
// matures.

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

export type StudioCapability = {
  num: string;
  tag: string;
  label: string;
  cn: string;
  note: string;
  wide?: boolean;
};

export const studioCapabilities: StudioCapability[] = [
  { num: '01', tag: 'CORE',     label: 'Product design',      cn: '产品设计', note: 'Web, SaaS, and AI product interfaces, end to end.', wide: true },
  { num: '02', tag: 'CORE',     label: 'Interface craft',     cn: '界面打磨', note: 'Tactical UI, motion budgets, frame-perfect feel.' },
  { num: '03', tag: 'CORE',     label: 'AI behaviour',        cn: '智能体行为', note: 'Agent workflows, dialogue, dynamic content.' },
  { num: '04', tag: 'SUPPORT',  label: 'Strategy & framing',  cn: '产品策略', note: 'Positioning, audience, scope, the bet.' },
  { num: '05', tag: 'SUPPORT',  label: 'Visual systems',      cn: '视觉系统', note: 'Type, palette, motion, brand object library.' },
  { num: '06', tag: 'SUPPORT',  label: 'Web & mobile build',  cn: '网页与移动端', note: 'Ship the design as a real, fast product.' },
  { num: '07', tag: 'LAB',      label: 'Experiments',         cn: '实验',     note: 'Prototypes that test new interaction models.' },
];

export type DossierBlock = {
  num: string;
  title: string;
  body: string;
  tags?: string[];
  span?: boolean;
};

export const dossierBlocks: DossierBlock[] = [
  {
    num: '01',
    title: 'Independent.',
    body: 'Self-funded studio, no investors, no roadmap committees. Two founders shipping work they believe in.',
    tags: ['No VC', 'No middlemen'],
    span: true,
  },
  {
    num: '02',
    title: 'Compact.',
    body: 'Small teams, tight scope, fast cycles. A designer–engineer pair that ships in weeks, not quarters.',
    tags: ['Designer + engineer pair'],
  },
  {
    num: '03',
    title: 'Sharp.',
    body: 'We take on the products others over-scope. AI-native interfaces, clear systems, no fluff.',
    tags: ['Craft-led'],
  },
  {
    num: '04',
    title: 'Shipped.',
    body: 'Working software, not pitch decks. We measure progress in things you can ship.',
    tags: ['Code over slides'],
  },
];

export type Founder = {
  id: string;
  callsign: string;
  role: string;
  roleCn: string;
  blurb: string;
  capabilities: { num: string; label: string; cn: string; note: string }[];
};

export const founders: Founder[] = [
  {
    id: 'A',
    callsign: 'Founder · Design',
    role: 'Product · Interaction · Visual',
    roleCn: '产品 · 交互 · 视觉',
    blurb: 'Designs the systems, runs the visual craft, leads positioning. Decades of interface work across product, AI, and brand.',
    capabilities: [
      { num: '01', label: 'Product design',     cn: '产品设计', note: 'Flows, systems, decisions.' },
      { num: '02', label: 'Visual systems',    cn: '视觉系统', note: 'Type, motion, brand language.' },
      { num: '03', label: 'Interaction',       cn: '交互设计', note: 'Feel, friction, frame-perfect detail.' },
    ],
  },
  {
    id: 'B',
    callsign: 'Founder · Engineering',
    role: 'Systems · AI · Implementation',
    roleCn: '系统 · 智能 · 实现',
    blurb: 'Builds the runtime. Product systems, AI integration, web/mobile shipping. We design and we ship — same person, same week.',
    capabilities: [
      { num: '01', label: 'Product systems',   cn: '产品系统', note: 'State, data, performance.' },
      { num: '02', label: 'AI integration',    cn: '智能集成', note: 'Agents, dialogue, generative UI.' },
      { num: '03', label: 'Web & mobile',      cn: '网页与移动端', note: 'React, native, performance.' },
    ],
  },
];

export type LogTemplate = {
  lvl: 'ok' | 'warn' | 'er';
  msg: string;
};

export const logTemplates: LogTemplate[] = [
  { lvl: 'ok',   msg: 'studio.boot <span style="color:var(--off)">ready</span>' },
  { lvl: 'ok',   msg: 'mission.archive <span style="color:var(--off)">04 loaded</span>' },
  { lvl: 'warn', msg: 'cache.stale <span style="color:var(--off)">refreshing</span>' },
  { lvl: 'ok',   msg: 'render.frame <span style="color:var(--off)">stable 60fps</span>' },
  { lvl: 'ok',   msg: 'transmission.outbound <span style="color:var(--off)">accepted</span>' },
  { lvl: 'er',   msg: 'auth.guest <span style="color:var(--off)">read-only</span>' },
  { lvl: 'ok',   msg: 'queue.empty <span style="color:var(--off)">awaiting input</span>' },
  { lvl: 'warn', msg: 'experiment.unstable <span style="color:var(--off)">expect drift</span>' },
];

export const tickerItems: string[] = [
  '// QBIX STUDIO',
  '// EST 2026',
  '// SEATTLE · NY',
  '// 02 FOUNDERS',
  '// NO HIRES',
  '// NO MIDDLEMEN',
  '// CODE OVER SLIDES',
  '// PRODUCT OVER PITCH',
  '// SMALL TEAMS · SHARP SYSTEMS',
  '// HUMAN-LED · SYSTEM-FIRST',
];

// ----- CONTACT ---------------------------------------------------------------

export const CONTACT_EMAIL = 'hello@qbixstudio.com';
export const BOOKING_URL   = 'https://cal.com/qbix';
export const CONTACT_NOTE =
  'Qbix Studio is available for AI product design, UX/UI systems, web/mobile design, and product strategy consulting.';
