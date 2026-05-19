// =============================================================================
// QBIX STUDIO — content / positioning
// =============================================================================

// ----- NAVIGATION -------------------------------------------------------------

export type NavItem = { label: string; href: string };

export const navItems: NavItem[] = [
  { label: 'Work',     href: '#work' },
  { label: 'Services', href: '#services' },
  { label: 'Sprint',   href: '#sprint' },
  { label: 'Labs',     href: '#labs' },
  { label: 'About',    href: '#about' },
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
  title: string;
  blurb: string;
  tags: string[];
  detail: {
    lede: string;
    deliverables: string[];
    engagement: { k: string; v: string }[];
  };
};

export const services: Service[] = [
  {
    slug: 'ai-product-design',
    num: '01',
    title: 'AI Product Design',
    blurb:
      'AI product experience design — agent workflows, LLM interfaces, AI feature design. We make complex model behavior understandable and useful.',
    tags: ['Agent workflow', 'LLM UI', 'AI features', 'Model behavior'],
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
    slug: 'ux-ui',
    num: '02',
    title: 'UX/UI & Digital Product Design',
    blurb:
      'Web apps, mobile apps, dashboards, SaaS, consumer products. The full stack of interface work — research, IA, interaction, visual.',
    tags: ['Web app', 'Mobile', 'Dashboard', 'SaaS', 'Consumer'],
    detail: {
      lede:
        'Full-stack interface design for web and mobile products. We work from research and IA through to interaction, visual systems, and front-end-ready specs — one team, one critique loop.',
      deliverables: [
        'Discovery and product research',
        'Information architecture and core flows',
        'Interaction design and motion specs',
        'Visual systems and component libraries',
        'Mobile and responsive UI for iOS, Android, web',
      ],
      engagement: [
        { k: 'Engagement', v: 'Project or retainer' },
        { k: 'Typical run', v: '8 – 16 weeks' },
        { k: 'Team',        v: 'Pair of designers, optional engineer' },
      ],
    },
  },
  {
    slug: 'strategy-prototype',
    num: '03',
    title: 'Product Strategy & Prototyping',
    blurb:
      'Positioning, user paths, MVP scope, information architecture, clickable and runnable prototypes. Turning unclear ideas into clear product direction.',
    tags: ['Positioning', 'MVP scope', 'IA', 'Prototype'],
    detail: {
      lede:
        'We turn unclear ideas into a clear product. Positioning sharpens, scope narrows, prototypes get real. Output is decisions you can act on, not slides.',
      deliverables: [
        'Positioning and product narrative',
        'User and use-case mapping',
        'MVP scope and feature sequencing',
        'Clickable prototypes — Figma, Framer, or live React',
        'Roadmap recommendation with risks',
      ],
      engagement: [
        { k: 'Engagement', v: 'Fixed-scope sprint' },
        { k: 'Typical run', v: '2 – 6 weeks' },
        { k: 'Team',        v: 'Strategy lead + designer' },
      ],
    },
  },
  {
    slug: 'web-mobile-build',
    num: '04',
    title: 'Web & Mobile Build',
    blurb:
      'Marketing sites, landing pages, web apps, mobile prototypes, front-end implementation. We design and we ship the code.',
    tags: ['Landing', 'Web app', 'Mobile build', 'Front-end'],
    detail: {
      lede:
        'We design and we ship. Marketing sites, landing pages, web apps, and mobile prototypes — implemented by the same team that designed them, so nothing is lost in translation.',
      deliverables: [
        'Marketing site or product landing page',
        'Web app front-end implementation',
        'Mobile prototype build (React Native or native)',
        'CMS integration and content modeling',
        'Performance budgeting and motion polish',
      ],
      engagement: [
        { k: 'Engagement', v: 'Fixed-scope or T&M' },
        { k: 'Typical run', v: '4 – 12 weeks' },
        { k: 'Team',        v: 'Designer + 1 – 2 engineers' },
      ],
    },
  },
  {
    slug: 'labs',
    num: '05',
    title: 'Qbix Labs',
    blurb:
      'Our proprietary AI software products and experiments. The internal playground for new interaction models and intelligent tools.',
    tags: ['Proprietary', 'Internal', 'AI tools'],
    detail: {
      lede:
        'Qbix Labs is our internal product playground — proprietary AI tools, interface experiments, and small games that test new interaction patterns before they appear in client work.',
      deliverables: [
        'In-house AI software products',
        'Interface experiments around agents and generative UI',
        'Game and interaction prototypes',
        'Open releases and writeups when they hold up',
      ],
      engagement: [
        { k: 'Status',     v: 'Self-funded, ongoing' },
        { k: 'Cadence',    v: 'New experiment ~6 weeks' },
        { k: 'Output',     v: 'Products, posts, and code' },
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
  aspect: number;          // intrinsic w/h
  media: Media;
  href?: string;
};

export const projects: Project[] = [
  {
    slug: 'bidking',
    num: 'FILE / 001',
    title: 'BidKing',
    client: 'Studio Product',
    role: 'Game Design · Mobile UI · System',
    year: 2025,
    category: 'game',
    tags: ['Studio Product', 'Mobile', 'Game'],
    hook:
      'A sealed-bid auction game where strategy hides behind cute chaos. Bid, bluff, or burn — only the last vault standing wins.',
    aspect: 720 / 332,
    media: { kind: 'video', src: '/bidking.mp4' },
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
    aspect: '316 / 270',
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
