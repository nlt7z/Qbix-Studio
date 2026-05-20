// =============================================================================
// QBIX STUDIO — content / positioning
// =============================================================================

// ----- NAVIGATION -------------------------------------------------------------

export type NavItem = { label: string; href: string };

export const navItems: NavItem[] = [
  { label: 'Services', href: '#services' },
  { label: 'Work',     href: '#work' },
  { label: 'Process',  href: '#how' },
  { label: 'Labs',     href: '#labs' },
  { label: 'Contact',  href: '#contact' },
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
        'We design AI products that real people use — agent workflows, chat surfaces, generative UIs, and AI features inside existing apps. Tight craft, model-aware interaction, behavior you can ship.',
      deliverables: [
        'Agent workflow design — task flows, tool surfaces, hand-off rules',
        'LLM interface design — chat, command, canvas, inspector',
        'AI feature design — suggestion, generation, transformation, summarization',
        'Model behavior specification — prompts, evals, fallback states',
        'Design system extensions for AI surfaces',
      ],
      engagement: [
        { k: 'Engagement', v: 'Retainer or fixed-scope' },
        { k: 'Typical run', v: '6 – 12 weeks' },
        { k: 'Team',        v: '1 lead designer + 1 engineer' },
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
        'Online presence for local business and small brands — a site that earns trust before the customer calls, books, or walks in. Fixed scope, fast turnaround, no agency overhead.',
      deliverables: [
        'Marketing site or single-page landing',
        'Brand basics — type, color, mark direction',
        'Responsive build with content management',
        'On-page SEO and analytics setup',
        'One round of revisions, then launch',
      ],
      engagement: [
        { k: 'Engagement', v: 'Fixed-scope sprint' },
        { k: 'Typical run', v: '1 – 3 weeks' },
        { k: 'Team',        v: 'Designer + engineer pair' },
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
        'Full-stack interface design for growth-stage SaaS — dashboards, onboarding, new feature surfaces, design system extensions. One team that ships into your repo, not handoff PDFs.',
      deliverables: [
        'Discovery, product research, and user interviews',
        'Information architecture and core flows',
        'Interaction design and motion specs',
        'Visual systems and component libraries',
        'Front-end-ready specs or direct PR contributions',
      ],
      engagement: [
        { k: 'Engagement', v: 'Fixed-scope or short retainer' },
        { k: 'Typical run', v: '2 – 4 weeks' },
        { k: 'Team',        v: 'Designer + engineer pair' },
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
        'Brand identity + studio sites for design-forward operators. Logo, type, motion, brand objects, and the website that holds them — built by people who can also code the site.',
      deliverables: [
        'Brand strategy and naming alignment',
        'Identity system — mark, type, color, motion',
        'Brand object renders and lookbook frames',
        'Studio site design + build',
        'Hand-off kit with usage rules and component library',
      ],
      engagement: [
        { k: 'Engagement', v: 'Fixed-scope sprint' },
        { k: 'Typical run', v: '2 – 4 weeks' },
        { k: 'Team',        v: 'Designer + engineer pair' },
      ],
    },
  },
];

// ----- SELECTED WORK (real projects with real media) -------------------------

export type ProjectCategory = 'all' | 'ai-product' | 'ux-ui' | 'web' | 'mobile' | 'game' | 'lab';

export type Media =
  | { kind: 'video'; src: string; poster?: string }
  | { kind: 'image'; src: string }
  | { kind: 'images'; srcs: string[] };

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
    title: 'Qwen Character',
    client: 'Alibaba Cloud',
    role: 'AI Product Design · Front-end · Agent flow',
    year: 2025,
    category: 'ai-product',
    tags: ['AI Product', 'Developer tools', 'LLM', 'Agent'],
    hook:
      'Replaced static API documentation with four hands-on LLM product surfaces — model call volume grew 200% after launch, validating documentation-as-product for developer adoption.',
    highlights: [
      'Four interactive product surfaces replaced static API docs with hands-on LLM demos.',
      'Prompt-to-deploy framework in HTML, CSS, and component integrations cut design-to-deploy time by 60%.',
      'Art direction across all four surfaces — motion, state transitions, and a custom illustration set.',
    ],
    metric: '+200% model call volume · 60% faster design-to-deploy',
    aspect: 16 / 9,
    media: {
      kind: 'images',
      srcs: [
        '/qwen-character/01.png',
        '/qwen-character/02.png',
        '/qwen-character/03.png',
        '/qwen-character/04.png',
        '/qwen-character/05.png',
        '/qwen-character/06.png',
        '/qwen-character/07.png',
        '/qwen-character/08.png',
      ],
    },
  },
  {
    slug: 'spark-tts',
    num: 'FILE / 002',
    title: 'Spark TTS Workflow',
    client: 'Alibaba Cloud',
    role: 'AI Product Design · Interaction · Motion',
    year: 2025,
    category: 'ai-product',
    tags: ['AI Product', 'Generation UX', 'Design System', 'Patent'],
    hook:
      "A text-to-speech workflow that turns a black-box generator into editable steps — patented, and adopted into Alibaba Cloud's Spark Design System as the standard for inspectable, controllable generation.",
    highlights: [
      'Patent-winning workflow that breaks black-box text-to-speech into editable steps — pitch, pauses, emotional cues.',
      'Adopted by the Alibaba Cloud Spark Design System as the reusable template for inspectable, controllable generation.',
      'Interaction logic, UI states, and motion for preview and edit moments that let users understand, refine, and trust outputs.',
    ],
    metric: 'Patent · Innovation award · Spark Design System template',
    aspect: 16 / 9,
    media: { kind: 'image', src: '/tts-flow.jpg' },
  },
  {
    slug: 'bidking',
    num: 'FILE / 003',
    title: 'BidKing',
    client: 'Mobile Game',
    role: 'Game Design · Mobile UI · System',
    year: 2025,
    category: 'game',
    tags: ['Studio Product', 'Mobile', 'Game'],
    hook:
      'A sealed-bid auction game where strategy hides behind cute chaos. Bid, bluff, or burn — only the last vault standing wins.',
    aspect: 720 / 332,
    media: { kind: 'video', src: '/bidking.mov' },
    href: '/work/bidking',
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

// ----- CONTACT ---------------------------------------------------------------

export const CONTACT_EMAIL = 'hello@qbixstudio.com';
export const BOOKING_URL   = 'https://cal.com/qbix';
export const CONTACT_NOTE =
  'Available for AI product design, UX/UI systems, web/mobile design, and product strategy consulting.';
