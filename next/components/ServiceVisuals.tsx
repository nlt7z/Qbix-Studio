// Linear-style line illustrations for the service detail pages.
//
// Minimal 24×24 stroke icons (1.6px, round caps) that ride on `currentColor`,
// plus two composed views — a card grid for deliverables and a numbered step
// flow for the engagement process — that trade dense text blocks for visual
// rhythm. All server-rendered; no client JS.

type IconProps = { className?: string };

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function Svg({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false" {...STROKE}>
      {children}
    </svg>
  );
}

const Icons = {
  compass: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5 13 13l-4.5 2.5L11 11z" />
    </Svg>
  ),
  pen: (p: IconProps) => (
    <Svg {...p}>
      <path d="M14 5.5 18.5 10 8 20.5l-4.5 1 1-4.5z" />
      <path d="M13 6.5 17.5 11" />
    </Svg>
  ),
  code: (p: IconProps) => (
    <Svg {...p}>
      <path d="M8.5 8 4.5 12l4 4M15.5 8l4 4-4 4M13.5 6.5l-3 11" />
    </Svg>
  ),
  rocket: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 3c3 1.5 5 4.8 5 8.5 0 2-.6 3.6-1.3 4.8H8.3C7.6 15.1 7 13.5 7 11.5 7 7.8 9 4.5 12 3z" />
      <circle cx="12" cy="10" r="1.6" />
      <path d="M8.5 17c-1.4.6-2.2 1.8-2.4 3.6 1.8-.2 3-.9 3.6-2.3M15.5 17c1.4.6 2.2 1.8 2.4 3.6-1.8-.2-3-.9-3.6-2.3" />
    </Svg>
  ),
  search: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="11" cy="11" r="6" />
      <path d="m15.5 15.5 4 4" />
    </Svg>
  ),
  box: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 3 4.5 7v10L12 21l7.5-4V7z" />
      <path d="M4.5 7 12 11l7.5-4M12 11v10" />
    </Svg>
  ),
  loop: (p: IconProps) => (
    <Svg {...p}>
      <path d="M5 9a7 7 0 0 1 12-2.5L19 8M19 15a7 7 0 0 1-12 2.5L5 16" />
      <path d="M19 4v4h-4M5 20v-4h4" />
    </Svg>
  ),
  spark: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M12 8.5c0 1.9 1.6 3.5 3.5 3.5-1.9 0-3.5 1.6-3.5 3.5 0-1.9-1.6-3.5-3.5-3.5 1.9 0 3.5-1.6 3.5-3.5z" />
    </Svg>
  ),
  doc: (p: IconProps) => (
    <Svg {...p}>
      <path d="M7 3h7l3.5 3.5V21H7z" />
      <path d="M14 3v4h3.5M10 12h5M10 15.5h5M10 8.5h2" />
    </Svg>
  ),
  globe: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.4 2.5 15.6 0 18M12 3c-2.5 2.4-2.5 15.6 0 18" />
    </Svg>
  ),
  layers: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 4 3.5 8.5 12 13l8.5-4.5z" />
      <path d="M3.5 13 12 17.5 20.5 13M3.5 16.5 12 21l8.5-4.5" />
    </Svg>
  ),
  chart: (p: IconProps) => (
    <Svg {...p}>
      <path d="M4 4v16h16" />
      <path d="M8 16v-3M12 16v-6M16 16v-4M20 16V8" />
    </Svg>
  ),
  clock: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </Svg>
  ),
  check: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </Svg>
  ),
};

type IconName = keyof typeof Icons;

// Resolve an icon from free-text by keyword — falls back to a neutral check so
// new copy never renders blank.
function resolveIcon(text: string, fallback: IconName = 'check'): IconName {
  const t = text.toLowerCase();
  const rules: [RegExp, IconName][] = [
    [/moodboard|direction|visual direction|diagnos|look/, 'compass'],
    [/live|deploy|domain|launch|ship|prototype/, 'rocket'],
    [/seo|analytic|metric|data|feedback/, 'chart'],
    [/markdown|spec|architecture|\bia\b|docs?\b|behavior/, 'doc'],
    [/design system|ui system|component|token|interface design/, 'layers'],
    [/code|front[- ]?end|back[- ]?end|repo|\bpr\b|build/, 'code'],
    [/logo|brand|identity|illustration|icon|design\b/, 'pen'],
    [/revision|iterat|round|polish/, 'loop'],
    [/responsive|edit|surface|site|web|globe|page/, 'globe'],
    [/handover|hand over|keep|own|stay with/, 'box'],
    [/typical|run|week|time/, 'clock'],
    [/add|extra|alongside|spark/, 'spark'],
  ];
  for (const [re, name] of rules) if (re.test(t)) return name;
  return fallback;
}

function Icon({ name, className }: { name: IconName; className?: string }) {
  const C = Icons[name];
  return <C className={className} />;
}

/** Split "Lead — supporting detail" into a bold lead + muted detail. */
function splitLead(text: string): { lead: string; rest?: string } {
  const idx = text.indexOf(' — ');
  if (idx === -1) return { lead: text };
  return { lead: text.slice(0, idx), rest: text.slice(idx + 3) };
}

export function DeliverableGrid({ items }: { items: string[] }) {
  return (
    <ul className="deliv-grid">
      {items.map((item) => {
        const { lead, rest } = splitLead(item);
        return (
          <li key={item} className="deliv-card">
            <span className="deliv-icon" aria-hidden>
              <Icon name={resolveIcon(item)} />
            </span>
            <span className="deliv-text">
              <span className="deliv-lead">{lead}</span>
              {rest && <span className="deliv-rest">{rest}</span>}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function ProcessFlow({ steps }: { steps: { k: string; v: string }[] }) {
  return (
    <ol className="flow">
      {steps.map((step, i) => (
        <li key={step.k} className="flow-step">
          <span className="flow-node" aria-hidden>
            <Icon name={resolveIcon(step.k)} className="flow-node-icon" />
          </span>
          <div className="flow-body">
            <span className="flow-num mono">{String(i + 1).padStart(2, '0')}</span>
            <h4 className="flow-k">{step.k}</h4>
            <p className="flow-v">{step.v}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
