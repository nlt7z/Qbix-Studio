'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { services } from '@/lib/data';
import BrandText from '@/components/BrandText';
import { Reveal, Stagger, RevealItem, Wipe } from '@/components/Reveal';
import Link from 'next/link';

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

function ServiceCard({ s }: { s: (typeof services)[number] }) {
  return (
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
          <span className="svc-arrow" aria-hidden>↗︎</span>
        </div>
        <span className="svc-audience mono">{s.audience}</span>
        <h3 className="svc-title"><BrandText>{s.title}</BrandText></h3>
        <p className="svc-blurb"><BrandText>{s.blurb}</BrandText></p>
        <div className="svc-tags">
          {s.tags.map((t) => (
            <span key={t} className="tag">{t}</span>
          ))}
        </div>
        <div className="svc-pricing">
          <span className="svc-price">
            From <strong>{s.priceFrom}</strong>
          </span>
          <span className="svc-typical mono">{s.typical}</span>
        </div>
      </div>
    </Link>
  );
}

/* The two cards start stacked at the centre of the row and spread out to their
   columns when the section enters the viewport — the deck being dealt. Runs
   once, entrance-triggered (no scroll pin, so it coexists with the panel
   stacking). side -1 = left card, +1 = right card. */
function DeckCard({ s, side }: { s: (typeof services)[number]; side: -1 | 1 }) {
  return (
    <motion.div
      className="svc-deck-side"
      style={{ zIndex: side === -1 ? 2 : 1 }}
      initial={{ x: `${side === -1 ? 54 : -54}%`, rotate: side === -1 ? 4 : -4, scale: 0.95, opacity: 0 }}
      whileInView={{ x: '0%', rotate: 0, scale: 1, opacity: 1 }}
      viewport={{ once: true, amount: 0.45 }}
      transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.2, opacity: { duration: 0.35, delay: 0.2 } }}
    >
      <ServiceCard s={s} />
    </motion.div>
  );
}

export default function WhatWeDo() {
  const reduced = useReducedMotion();
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 760px)');
    const apply = () => setIsNarrow(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const deckSpread = !reduced && !isNarrow;
  const [a, b] = services;

  return (
    <section id="services" className="section-pad" data-nav-theme="light">
      <div className="container">
        <header className="section-head">
          <div>
            <Reveal as="span" className="eyebrow" speed="fast">
              Turn your idea into something real
            </Reveal>
            <Wipe as="h2" style={{ marginTop: 14 }}>
              Work with Qbix
            </Wipe>
            <Reveal as="p" className="sub-plain" speed="base" delay={0.3}>
              We do{' '}
              <Link href="/services/web" className="text-link">UI/UX design</Link>{' '}
              and{' '}
              <Link href="/services/redesign" className="text-link">brand upgrades</Link>.
            </Reveal>
          </div>
        </header>

        {deckSpread ? (
          <div className="svc-deck svc-deck--two">
            <DeckCard s={a} side={-1} />
            <DeckCard s={b} side={1} />
          </div>
        ) : (
          <Stagger className="services-wrap services-wrap--two" stagger={0.1} delayChildren={0.1}>
            {services.map((s) => (
              <RevealItem key={s.num} speed="base">
                <ServiceCard s={s} />
              </RevealItem>
            ))}
          </Stagger>
        )}
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
  // Electric-lime accent plane — the lit face of each isometric illustration.
  const accent = {
    fill: 'var(--signal-dim)',
    stroke: 'var(--signal)',
    strokeWidth: 1,
    strokeLinejoin: 'round' as const,
  };
  switch (slug) {
    case 'ai-product-design':
    case 'ai-products':
    case 'app-ai':
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
    case 'saas-b2b':
    case 'redesign':
      // Exploded brand-system stack: foundation grid plate, colour + type
      // plate, and the new mark on a lime glass plate — with alignment rails,
      // an explode dimension, and a spec callout. The rebrand as an object.
      return (
        <svg viewBox="0 0 240 140" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="r-glass" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#B8FF00" stopOpacity="0.09" />
              <stop offset="100%" stopColor="#B8FF00" stopOpacity="0.02" />
            </linearGradient>
            <radialGradient id="r-halo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#B8FF00" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#B8FF00" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* shadow */}
          <ellipse cx="100" cy="131" rx="46" ry="7" fill="#000" opacity="0.20" />
          <ellipse cx="100" cy="131" rx="30" ry="4.5" fill="#000" opacity="0.16" />

          {/* alignment rails through the stack */}
          <line x1="100" y1="12" x2="100" y2="84" stroke="currentColor" strokeOpacity="0.22" strokeWidth="0.5" strokeDasharray="2 3" />
          <line x1="134.6" y1="32" x2="134.6" y2="104" stroke="currentColor" strokeOpacity="0.22" strokeWidth="0.5" strokeDasharray="2 3" />
          <line x1="65.4" y1="32" x2="65.4" y2="104" stroke="currentColor" strokeOpacity="0.22" strokeWidth="0.5" strokeDasharray="2 3" />

          {/* P3 · foundation grid plate (extruded) */}
          <path d="M134.6 104 L100 124 L100 130 L134.6 110 Z" fill="rgba(0,0,0,0.30)" stroke="currentColor" strokeOpacity="0.35" strokeWidth="0.7" />
          <path d="M100 124 L65.4 104 L65.4 110 L100 130 Z" fill="rgba(0,0,0,0.30)" stroke="currentColor" strokeOpacity="0.35" strokeWidth="0.7" />
          <polygon points="100,84 134.6,104 100,124 65.4,104" fill="rgba(255,255,255,0.03)" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1" />
          <line x1="82" y1="94" x2="116.6" y2="114" stroke="currentColor" strokeOpacity="0.25" strokeWidth="0.5" />
          <line x1="74" y1="98.6" x2="108.6" y2="118.6" stroke="currentColor" strokeOpacity="0.18" strokeWidth="0.4" />
          <line x1="126" y1="99" x2="91.4" y2="119" stroke="currentColor" strokeOpacity="0.18" strokeWidth="0.4" />
          <line x1="90" y1="89.5" x2="124.6" y2="109.5" stroke="currentColor" strokeOpacity="0.25" strokeWidth="0.5" />
          <line x1="110" y1="89.8" x2="75.4" y2="109.8" stroke="currentColor" strokeOpacity="0.25" strokeWidth="0.5" />
          <line x1="118" y1="94.4" x2="83.4" y2="114.4" stroke="currentColor" strokeOpacity="0.25" strokeWidth="0.5" />
          <ellipse cx="100" cy="104" rx="16" ry="9.2" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="0.6" strokeDasharray="2 3" />
          <circle cx="100" cy="104" r="1.2" fill="var(--signal)" opacity="0.8" />

          {/* P2 · colour + type plate */}
          <polygon points="100,48 134.6,68 100,88 65.4,68" fill="rgba(255,255,255,0.04)" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1" />
          <line x1="97" y1="53" x2="114.3" y2="63" stroke="currentColor" strokeOpacity="0.7" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="92" y1="56" x2="106" y2="64.1" stroke="currentColor" strokeOpacity="0.4" strokeWidth="0.7" strokeLinecap="round" />
          <line x1="87.5" y1="58.6" x2="99" y2="65.2" stroke="currentColor" strokeOpacity="0.22" strokeWidth="0.5" strokeDasharray="1.5 2" />
          <polygon points="84,60 91.8,64.5 86.6,67.5 78.8,63" fill="var(--signal)" opacity="0.85" />
          <polygon points="94.4,66 102.2,70.5 97,73.5 89.2,69" fill="var(--signal-dim)" stroke="var(--signal)" strokeOpacity="0.5" strokeWidth="0.6" />
          <polygon points="104.8,72 112.6,76.5 107.4,79.5 99.6,75" fill="rgba(255,255,255,0.22)" stroke="currentColor" strokeOpacity="0.3" strokeWidth="0.5" />

          {/* P1 · new-mark plate (lime glass) */}
          <circle cx="100" cy="32" r="30" fill="url(#r-halo)" />
          <polygon points="100,12 134.6,32 100,52 65.4,32" fill="url(#r-glass)" stroke="var(--signal)" strokeWidth="1" />
          <ellipse cx="100" cy="32" rx="14" ry="8.1" fill="none" stroke="var(--signal)" strokeOpacity="0.5" strokeWidth="0.6" strokeDasharray="2 3" />
          <ellipse cx="100" cy="32" rx="21" ry="12.1" fill="none" stroke="var(--signal)" strokeOpacity="0.18" strokeWidth="0.5" />
          <path d="M100 26 L101.6 30.4 L106 32 L101.6 33.6 L100 38 L98.4 33.6 L94 32 L98.4 30.4 Z" fill="var(--signal)" />

          {/* explode dimension, left */}
          <line x1="56" y1="32" x2="56" y2="68" stroke="currentColor" strokeOpacity="0.4" strokeWidth="0.5" />
          <line x1="53" y1="32" x2="59" y2="32" stroke="currentColor" strokeOpacity="0.4" strokeWidth="0.5" />
          <line x1="53" y1="68" x2="59" y2="68" stroke="currentColor" strokeOpacity="0.4" strokeWidth="0.5" />
          <path d="M54.5 38 L56 35 L57.5 38" fill="none" stroke="currentColor" strokeOpacity="0.4" strokeWidth="0.5" />
          <path d="M54.5 62 L56 65 L57.5 62" fill="none" stroke="currentColor" strokeOpacity="0.4" strokeWidth="0.5" />
          <line x1="65.4" y1="32" x2="58.5" y2="32" stroke="currentColor" strokeOpacity="0.25" strokeWidth="0.5" strokeDasharray="1.5 2" />
          <line x1="65.4" y1="68" x2="58.5" y2="68" stroke="currentColor" strokeOpacity="0.25" strokeWidth="0.5" strokeDasharray="1.5 2" />

          {/* spec callout, right */}
          <line x1="112.6" y1="76.5" x2="140" y2="68" stroke="currentColor" strokeOpacity="0.3" strokeWidth="0.6" strokeDasharray="2 2.5" />
          <circle cx="112.6" cy="76.5" r="1.2" fill="currentColor" opacity="0.6" />
          <polygon points="146,62 158.1,69 150.3,73.5 138.2,66.5" fill="rgba(255,255,255,0.05)" stroke="currentColor" strokeOpacity="0.5" strokeWidth="0.7" />
          <line x1="144.5" y1="65" x2="151.4" y2="69" stroke="currentColor" strokeOpacity="0.5" strokeWidth="0.6" />
          <circle cx="153.5" cy="69.5" r="1" fill="var(--signal)" />

          {/* corner brackets + sparkles */}
          <path d="M14 22 L14 14 L22 14" fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="0.7" />
          <path d="M226 118 L226 126 L218 126" fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="0.7" />
          <path d="M146 16 L147.2 19.2 L150.4 20.4 L147.2 21.6 L146 24.8 L144.8 21.6 L141.6 20.4 L144.8 19.2 Z" fill="var(--signal)" opacity="0.8" />
          <circle cx="46" cy="88" r="1" fill="var(--signal)" opacity="0.4" />
          <circle cx="170" cy="100" r="1.2" fill="currentColor" opacity="0.5" />
        </svg>
      );
    case 'strategy-prototype':
    case 'brand-studio':
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
    case 'local-business':
    case 'web':
      // True-isometric build scene: browser slab with a lit component card,
      // a floating chip above it, a phone receiving the same component, and
      // blueprint furniture (dimension line, corner brackets, sparkles).
      return (
        <svg viewBox="0 0 240 140" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="w-halo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#B8FF00" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#B8FF00" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* soft ground shadows */}
          <ellipse cx="110" cy="112" rx="54" ry="9" fill="#000" opacity="0.20" />
          <ellipse cx="110" cy="112" rx="36" ry="6" fill="#000" opacity="0.16" />
          <ellipse cx="191" cy="117" rx="25" ry="5" fill="#000" opacity="0.22" />

          {/* browser slab — extrusion side faces */}
          <path d="M174 73 L122 103 L122 110 L174 80 Z" fill="rgba(0,0,0,0.30)" stroke="currentColor" strokeOpacity="0.35" strokeWidth="0.7" />
          <path d="M122 103 L44 58 L44 65 L122 110 Z" fill="rgba(0,0,0,0.30)" stroke="currentColor" strokeOpacity="0.35" strokeWidth="0.7" />
          {/* top face + page inset */}
          <polygon points="96,28 174,73 122,103 44,58" fill="rgba(255,255,255,0.035)" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1" />
          <polygon points="96,34 163.6,73 122,97 54.4,58" fill="rgba(255,255,255,0.02)" stroke="currentColor" strokeOpacity="0.45" strokeWidth="0.7" />
          {/* traffic dots + chrome dividers */}
          <circle cx="98.2" cy="38.7" r="1.1" fill="currentColor" opacity="0.7" />
          <circle cx="102.5" cy="41.2" r="1.1" fill="currentColor" opacity="0.5" />
          <circle cx="106.8" cy="43.7" r="1.1" fill="currentColor" opacity="0.35" />
          <line x1="89.9" y1="37.5" x2="156" y2="75.5" stroke="currentColor" strokeOpacity="0.4" strokeWidth="0.7" />
          <line x1="110" y1="45" x2="75.4" y2="65" stroke="currentColor" strokeOpacity="0.4" strokeWidth="0.7" />
          {/* sidebar ticks */}
          <line x1="93" y1="49.5" x2="105.1" y2="56.5" stroke="currentColor" strokeOpacity="0.28" strokeWidth="0.6" strokeDasharray="2 3" />
          <line x1="86.9" y1="53" x2="99" y2="60" stroke="currentColor" strokeOpacity="0.28" strokeWidth="0.6" strokeDasharray="2 3" />
          <line x1="80.8" y1="56.5" x2="92.9" y2="63.5" stroke="currentColor" strokeOpacity="0.28" strokeWidth="0.6" strokeDasharray="2 3" />
          {/* content cards */}
          <polygon points="120,52 137.3,62 126,68.5 108.7,58.5" fill="rgba(255,255,255,0.05)" stroke="currentColor" strokeOpacity="0.5" strokeWidth="0.7" />
          <polygon points="139,63 156.3,73 145,79.5 127.7,69.5" fill="rgba(255,255,255,0.03)" stroke="currentColor" strokeOpacity="0.4" strokeWidth="0.7" />
          <polygon points="106.1,60 123.4,70 112.1,76.5 94.8,66.5" fill="rgba(255,255,255,0.03)" stroke="currentColor" strokeOpacity="0.4" strokeWidth="0.7" />
          {/* lit component card + cursor node */}
          <circle cx="128" cy="80" r="26" fill="url(#w-halo)" />
          <polygon points="125.1,72 142.4,82 131.1,88.5 113.8,78.5" fill="var(--signal-dim)" stroke="var(--signal)" strokeWidth="1" />
          <circle cx="128" cy="80" r="4" fill="none" stroke="var(--signal)" strokeOpacity="0.35" strokeWidth="0.8" />
          <circle cx="128" cy="80" r="1.6" fill="var(--signal)" />

          {/* floating chip above the lit card */}
          <path d="M146.9 46 L138.2 51 L138.2 55 L146.9 50 Z" fill="rgba(0,0,0,0.30)" stroke="currentColor" strokeOpacity="0.35" strokeWidth="0.6" />
          <path d="M138.2 51 L124.4 43 L124.4 47 L138.2 55 Z" fill="rgba(0,0,0,0.30)" stroke="currentColor" strokeOpacity="0.35" strokeWidth="0.6" />
          <polygon points="133,38 146.9,46 138.2,51 124.4,43" fill="rgba(255,255,255,0.06)" stroke="currentColor" strokeOpacity="0.6" strokeWidth="0.8" />
          <line x1="131" y1="42" x2="138.8" y2="46.5" stroke="currentColor" strokeOpacity="0.5" strokeWidth="0.7" />
          <circle cx="140.5" cy="47.5" r="1" fill="var(--signal)" />
          <line x1="135.6" y1="53" x2="128.6" y2="74" stroke="currentColor" strokeOpacity="0.35" strokeWidth="0.6" strokeDasharray="2 2.5" />

          {/* phone */}
          <path d="M215 93 L185.6 110 L185.6 115 L215 98 Z" fill="rgba(0,0,0,0.30)" stroke="currentColor" strokeOpacity="0.35" strokeWidth="0.7" />
          <path d="M185.6 110 L166.6 99 L166.6 104 L185.6 115 Z" fill="rgba(0,0,0,0.30)" stroke="currentColor" strokeOpacity="0.35" strokeWidth="0.7" />
          <polygon points="196,82 215,93 185.6,110 166.6,99" fill="rgba(255,255,255,0.035)" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1" />
          <polygon points="196,85 209.8,93 185.6,107 171.8,99" fill="rgba(255,255,255,0.02)" stroke="currentColor" strokeOpacity="0.45" strokeWidth="0.7" />
          <line x1="193" y1="89" x2="198.2" y2="92" stroke="currentColor" strokeOpacity="0.7" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="182" y1="96" x2="195.9" y2="104" stroke="currentColor" strokeOpacity="0.28" strokeWidth="0.6" strokeDasharray="2 3" />
          <line x1="177.7" y1="98.5" x2="191.6" y2="106.5" stroke="currentColor" strokeOpacity="0.28" strokeWidth="0.6" strokeDasharray="2 3" />
          <circle cx="198" cy="97" r="4" fill="none" stroke="var(--signal)" strokeOpacity="0.3" strokeWidth="0.8" />
          <circle cx="198" cy="97" r="1.6" fill="var(--signal)" />
          {/* sync leader browser → phone */}
          <line x1="142.4" y1="82" x2="171" y2="98.5" stroke="currentColor" strokeOpacity="0.3" strokeWidth="0.6" strokeDasharray="2 2.5" />
          <circle cx="142.4" cy="82" r="1.2" fill="currentColor" opacity="0.6" />

          {/* blueprint dimension line + corner brackets + sparkles */}
          <line x1="40" y1="72" x2="118" y2="117" stroke="currentColor" strokeOpacity="0.3" strokeWidth="0.5" />
          <line x1="40" y1="68" x2="40" y2="76" stroke="currentColor" strokeOpacity="0.3" strokeWidth="0.5" />
          <line x1="118" y1="113" x2="118" y2="121" stroke="currentColor" strokeOpacity="0.3" strokeWidth="0.5" />
          <line x1="77" y1="92.5" x2="81" y2="96.5" stroke="currentColor" strokeOpacity="0.3" strokeWidth="0.5" />
          <path d="M14 22 L14 14 L22 14" fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="0.7" />
          <path d="M226 118 L226 126 L218 126" fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="0.7" />
          <path d="M58 18 L59.6 22.4 L64 24 L59.6 25.6 L58 30 L56.4 25.6 L52 24 L56.4 22.4 Z" fill="var(--signal)" opacity="0.9" />
          <circle cx="70" cy="32" r="1" fill="var(--signal)" opacity="0.5" />
          <circle cx="30" cy="96" r="1.2" fill="currentColor" opacity="0.5" />
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
