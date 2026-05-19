'use client';

import Link from 'next/link';
import { services } from '@/lib/data';
import BrandText from '@/components/BrandText';
import { Reveal, Stagger, RevealItem } from '@/components/Reveal';

export default function WhatWeDo() {
  return (
    <section id="services" className="section-pad">
      <div className="container">
        <Reveal as="header" className="section-head" speed="fast">
          <div>
            <span className="eyebrow">
              <span className="num">02</span>
              What we do
            </span>
            <h2 style={{ marginTop: 14 }}>
              End-to-end design and build for AI-native products.
            </h2>
          </div>
        </Reveal>

        <Stagger className="services-wrap" stagger={0.1} delayChildren={0.1}>
          {services.map((s) => (
            <RevealItem key={s.num} speed="base">
              <Link
                href={`/services/${s.slug}`}
                className="svc"
                aria-label={`Open ${s.title}`}
              >
                <div className="svc-pattern" aria-hidden>
                  <ServicePattern slug={s.slug} />
                </div>
                <div className="svc-body">
                  <div className="svc-meta">
                    <span className="svc-num">{s.num}</span>
                    <span className="svc-arrow" aria-hidden>↗</span>
                  </div>
                  <h3 className="svc-title"><BrandText>{s.title}</BrandText></h3>
                  <p className="svc-blurb"><BrandText>{s.blurb}</BrandText></p>
                  <div className="svc-tags">
                    {s.tags.map((t) => (
                      <span key={t} className="tag">{t}</span>
                    ))}
                  </div>
                </div>
              </Link>
            </RevealItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function ServicePattern({ slug }: { slug: string }) {
  const iso = {
    stroke: 'currentColor',
    strokeWidth: 1,
    fill: 'none' as const,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  const dim = {
    stroke: 'currentColor',
    strokeWidth: 0.75,
    fill: 'none' as const,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeDasharray: '2 3',
  };
  const accent = {
    fill: 'var(--signal-dim)',
    stroke: 'var(--signal)',
    strokeWidth: 1,
    strokeLinejoin: 'round' as const,
  };
  switch (slug) {
    case 'ai-product-design':
      return (
        <svg viewBox="0 0 240 140" preserveAspectRatio="xMidYMid meet">
          {/* Base platform — neural graph footprint */}
          <polygon points="120,68 184,100 120,132 56,100" {...iso} />
          <path d="M56 100 L56 104 L120 136 L120 132 Z" {...iso} />
          <path d="M184 100 L184 104 L120 136 L120 132 Z" {...iso} />
          {/* Surface graph grid */}
          <line x1="88" y1="84" x2="152" y2="116" {...dim} />
          <line x1="152" y1="84" x2="88" y2="116" {...dim} />
          <line x1="120" y1="68" x2="120" y2="132" {...dim} />
          {/* Neural nodes scattered on surface */}
          <circle cx="92" cy="94" r="2.2" fill="currentColor" />
          <circle cx="148" cy="94" r="2.2" fill="currentColor" />
          <circle cx="106" cy="116" r="2.2" fill="currentColor" />
          <circle cx="134" cy="116" r="2.2" fill="currentColor" />
          <circle cx="120" cy="82" r="2.2" fill="currentColor" />
          <circle cx="120" cy="106" r="2.4" fill="var(--signal)" />
          {/* Connections from surface nodes up to agent */}
          <line x1="92" y1="94" x2="120" y2="52" {...dim} />
          <line x1="148" y1="94" x2="120" y2="52" {...dim} />
          <line x1="120" y1="82" x2="120" y2="52" {...dim} />
          <line x1="106" y1="116" x2="120" y2="106" {...dim} />
          <line x1="134" y1="116" x2="120" y2="106" {...dim} />
          {/* Floating AI agent cube */}
          <path d="M104 26 L104 44 L120 52 L120 34 Z" {...iso} />
          <path d="M136 26 L136 44 L120 52 L120 34 Z" {...iso} />
          <polygon points="120,18 136,26 120,34 104,26" {...accent} />
          {/* Pulse indicator on agent face */}
          <line x1="112" y1="36" x2="128" y2="44" stroke="var(--signal)" strokeWidth="0.75" strokeLinecap="round" />
          <circle cx="120" cy="40" r="1.1" fill="var(--signal)" />
        </svg>
      );
    case 'ux-ui':
      return (
        <svg viewBox="0 0 240 140" preserveAspectRatio="xMidYMid meet">
          {/* Canvas slab */}
          <polygon points="120,40 192,76 120,112 48,76" {...iso} />
          <path d="M48 76 L48 80 L120 116 L120 112 Z" {...iso} />
          <path d="M192 76 L192 80 L120 116 L120 112 Z" {...iso} />
          {/* Title bar divider */}
          <line x1="110" y1="45" x2="178" y2="79" {...iso} />
          {/* Traffic-light dots */}
          <circle cx="116" cy="48" r="1.3" fill="currentColor" />
          <circle cx="120" cy="50" r="1.3" fill="currentColor" />
          <circle cx="124" cy="52" r="1.3" fill="currentColor" />
          {/* Sidebar divider */}
          <line x1="128" y1="54" x2="68" y2="84" {...iso} />
          {/* Sidebar nav items (parallel ticks) */}
          <line x1="118" y1="56" x2="98" y2="66" {...dim} />
          <line x1="112" y1="62" x2="92" y2="72" {...dim} />
          <line x1="106" y1="68" x2="86" y2="78" {...dim} />
          {/* Content header rule */}
          <line x1="132" y1="60" x2="172" y2="80" {...dim} />
          {/* Content cards (row of three) */}
          <polygon points="128,66 148,76 142,79 122,69" {...iso} />
          <polygon points="150,71 170,81 164,84 144,74" {...iso} />
          <polygon points="172,76 188,84 182,87 166,79" {...accent} />
          {/* Floating component above canvas */}
          <polygon points="172,12 208,30 196,36 160,18" {...iso} />
          <line x1="166" y1="18" x2="194" y2="32" {...dim} />
          <line x1="178" y1="22" x2="200" y2="33" {...dim} />
          {/* Connector */}
          <line x1="180" y1="26" x2="166" y2="44" {...dim} />
        </svg>
      );
    case 'strategy-prototype':
      return (
        <svg viewBox="0 0 240 140" preserveAspectRatio="xMidYMid meet">
          {/* Tablet 1 — rough sketch */}
          <polygon points="40,55 70,70 40,85 10,70" {...iso} />
          <path d="M10 70 L10 73 L40 88 L40 85 Z" {...iso} />
          <path d="M70 70 L70 73 L40 88 L40 85 Z" {...iso} />
          {/* Sketch squiggle */}
          <path
            d="M22 70 Q32 62 42 70 T58 72"
            stroke="currentColor"
            strokeWidth="0.85"
            fill="none"
            strokeLinecap="round"
          />
          <circle
            cx="48"
            cy="78"
            r="2.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.65"
            strokeDasharray="1 1.4"
          />

          {/* Arrow 1 → 2 */}
          <line x1="76" y1="70" x2="92" y2="70" {...iso} />
          <path d="M89 67 L93 70 L89 73" {...iso} />

          {/* Tablet 2 — wireframe */}
          <polygon points="120,55 150,70 120,85 90,70" {...iso} />
          <path d="M90 70 L90 73 L120 88 L120 85 Z" {...iso} />
          <path d="M150 70 L150 73 L120 88 L120 85 Z" {...iso} />
          {/* Wireframe header bar (parallelogram) */}
          <polygon points="106,64 122,72 120,74 104,66" {...iso} />
          {/* Wireframe content lines */}
          <line x1="104" y1="71" x2="124" y2="81" {...dim} />
          <line x1="102" y1="75" x2="122" y2="85" {...dim} />

          {/* Arrow 2 → 3 */}
          <line x1="156" y1="70" x2="172" y2="70" {...iso} />
          <path d="M169 67 L173 70 L169 73" {...iso} />

          {/* Tablet 3 — polished */}
          <polygon points="200,55 230,70 200,85 170,70" {...iso} />
          <path d="M170 70 L170 73 L200 88 L200 85 Z" {...iso} />
          <path d="M230 70 L230 73 L200 88 L200 85 Z" {...iso} />
          {/* Polished header rule */}
          <line x1="186" y1="64" x2="214" y2="78" {...iso} />
          {/* Polished accent card */}
          <polygon points="184,68 204,78 198,81 178,71" {...accent} />
          {/* Polished caption line */}
          <line x1="184" y1="77" x2="200" y2="85" {...dim} />
        </svg>
      );
    case 'web-mobile-build':
      return (
        <svg viewBox="0 0 240 140" preserveAspectRatio="xMidYMid meet">
          {/* === iMac (left) === */}
          {/* Monitor frame */}
          <polygon points="22,28 108,40 108,84 22,72" {...iso} />
          {/* Inner screen */}
          <polygon points="28,34 102,44 102,78 28,68" {...iso} />
          {/* Top bar divider */}
          <line x1="28" y1="40" x2="102" y2="50" {...dim} />
          {/* Traffic-light dots */}
          <circle cx="32" cy="37" r="0.9" fill="currentColor" />
          <circle cx="35.5" cy="37.5" r="0.9" fill="currentColor" />
          <circle cx="39" cy="38" r="0.9" fill="currentColor" />
          {/* Sidebar split */}
          <line x1="48" y1="42.5" x2="48" y2="76.5" {...dim} />
          {/* Sidebar nav items */}
          <line x1="32" y1="46" x2="44" y2="47.5" {...dim} />
          <line x1="32" y1="51" x2="44" y2="52.5" {...dim} />
          <line x1="32" y1="56" x2="44" y2="57.5" {...dim} />
          <line x1="32" y1="61" x2="44" y2="62.5" {...dim} />
          {/* Content cards (2x2 grid) */}
          <polygon points="52,46 72,49 72,57 52,54" {...iso} />
          <polygon points="76,49.5 96,52.5 96,60.5 76,57.5" {...iso} />
          <polygon points="52,60 72,63 72,71 52,68" {...iso} />
          <polygon points="76,63.5 96,66.5 96,74.5 76,71.5" {...accent} />
          {/* Chin */}
          <polygon points="22,72 108,84 108,88 22,76" {...iso} />
          <line x1="22" y1="76" x2="108" y2="88" {...dim} />
          {/* Stand neck */}
          <polygon points="54,88 78,92 78,100 54,96" {...iso} />
          {/* Foot */}
          <polygon points="40,101 92,109 92,114 40,106" {...iso} />

          {/* === iPhone (right) === */}
          {/* Phone body */}
          <polygon points="158,28 198,32 198,116 158,112" {...iso} />
          {/* Phone screen */}
          <polygon points="162,33 194,36.5 194,108 162,104.5" {...iso} />
          {/* Dynamic island */}
          <rect x="172" y="36" width="10" height="2.6" rx="1.3" fill="currentColor" />
          {/* Status bar */}
          <line x1="164" y1="43" x2="192" y2="46" {...dim} />
          {/* App icons grid (3 rows x 3 cols) */}
          <circle cx="168" cy="52" r="1.3" fill="currentColor" />
          <circle cx="176" cy="52.8" r="1.3" fill="currentColor" />
          <circle cx="184" cy="53.6" r="1.3" fill="currentColor" />
          <circle cx="168" cy="60" r="1.3" fill="currentColor" />
          <circle cx="176" cy="60.8" r="1.3" fill="currentColor" />
          <circle cx="184" cy="61.6" r="1.3" fill="currentColor" />
          {/* Accent card on phone */}
          <polygon points="166,68 192,70.5 192,84 166,81.5" {...accent} />
          {/* UI lines below card */}
          <line x1="166" y1="89" x2="188" y2="91" {...dim} />
          <line x1="166" y1="94" x2="184" y2="96" {...dim} />
          <line x1="166" y1="99" x2="190" y2="101" {...dim} />
          {/* Home indicator */}
          <rect x="172" y="106" width="12" height="1.4" rx="0.7" fill="currentColor" opacity="0.45" />
        </svg>
      );
    case 'labs':
      return (
        <svg viewBox="0 0 240 140" preserveAspectRatio="xMidYMid meet">
          {/* Cube 1 — left, solid */}
          <polygon points="95,90 107,96 95,102 83,96" {...iso} />
          <path d="M83 96 L83 110 L95 116 L95 102 Z" {...iso} />
          <path d="M107 96 L107 110 L95 116 L95 102 Z" {...iso} />

          {/* Cube 2 — center, accent */}
          <path d="M104 86 L104 104 L120 112 L120 94 Z" {...iso} />
          <path d="M136 86 L136 104 L120 112 L120 94 Z" {...iso} />
          <polygon points="120,78 136,86 120,94 104,86" {...accent} />

          {/* Cube 3 — right, dashed (in-progress) */}
          <polygon points="145,90 157,96 145,102 133,96" {...dim} />
          <path d="M133 96 L133 110 L145 116 L145 102 Z" {...dim} />
          <path d="M157 96 L157 110 L145 116 L145 102 Z" {...dim} />

          {/* Floating particles */}
          <circle cx="92" cy="30" r="1.5" fill="currentColor" />
          <circle cx="148" cy="36" r="1.5" fill="currentColor" />
          <circle cx="110" cy="50" r="1.4" fill="currentColor" />
          <circle cx="130" cy="20" r="1.4" fill="currentColor" />
          <circle cx="120" cy="58" r="2" fill="var(--signal)" />
        </svg>
      );
    default:
      return null;
  }
}
