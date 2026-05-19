'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { services } from '@/lib/data';
import BrandText from '@/components/BrandText';

const ease = [0.16, 1, 0.3, 1] as const;

export default function WhatWeDo() {
  return (
    <section id="services" className="section-pad">
      <div className="container">
        <header className="section-head">
          <div>
            <span className="eyebrow">
              <span className="num">02</span>
              What we do
            </span>
            <h2 style={{ marginTop: 14 }}>
              End-to-end design and build for AI-native products.
            </h2>
          </div>
        </header>

        <div className="services-wrap">
          {services.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.32, ease, delay: i * 0.06 }}
            >
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicePattern({ slug }: { slug: string }) {
  const stroke = { stroke: 'currentColor', strokeWidth: 1, fill: 'none' as const, strokeLinecap: 'round' as const };
  switch (slug) {
    case 'ai-product-design':
      return (
        <svg viewBox="0 0 240 140" preserveAspectRatio="xMidYMid meet">
          <g {...stroke}>
            <line x1="60" y1="48" x2="180" y2="48" />
            <line x1="60" y1="48" x2="120" y2="100" />
            <line x1="180" y1="48" x2="120" y2="100" />
            <line x1="120" y1="48" x2="120" y2="100" strokeDasharray="2 3" />
            <circle cx="60" cy="48" r="5" fill="var(--bg-2)" />
            <circle cx="180" cy="48" r="5" fill="var(--bg-2)" />
            <circle cx="120" cy="100" r="5" fill="var(--bg-2)" />
          </g>
          <circle cx="120" cy="48" r="8" fill="var(--signal-dim)" stroke="var(--signal)" strokeWidth="1.2" />
          <circle cx="120" cy="48" r="2.5" fill="var(--signal)" />
        </svg>
      );
    case 'ux-ui':
      return (
        <svg viewBox="0 0 240 140" preserveAspectRatio="xMidYMid meet">
          <g {...stroke}>
            <rect x="48" y="30" width="144" height="86" rx="4" />
            <line x1="48" y1="44" x2="192" y2="44" />
            <line x1="80" y1="44" x2="80" y2="116" />
            <line x1="94" y1="56" x2="172" y2="56" />
            <line x1="94" y1="68" x2="162" y2="68" />
            <line x1="94" y1="92" x2="166" y2="92" />
            <line x1="94" y1="104" x2="156" y2="104" />
            <circle cx="56" cy="37" r="1.4" />
            <circle cx="62" cy="37" r="1.4" />
            <circle cx="68" cy="37" r="1.4" />
          </g>
          <line x1="94" y1="80" x2="130" y2="80" stroke="var(--signal)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'strategy-prototype':
      return (
        <svg viewBox="0 0 240 140" preserveAspectRatio="xMidYMid meet">
          <g {...stroke}>
            <rect x="32" y="56" width="44" height="28" rx="3" />
            <rect x="98" y="56" width="44" height="28" rx="3" />
            <line x1="76" y1="70" x2="98" y2="70" />
            <path d="M93 66 L98 70 L93 74" />
            <line x1="142" y1="70" x2="164" y2="70" />
            <path d="M159 66 L164 70 L159 74" />
            <circle cx="54" cy="70" r="2" fill="currentColor" />
            <circle cx="120" cy="70" r="2" fill="currentColor" />
          </g>
          <rect x="164" y="56" width="44" height="28" rx="3" fill="var(--signal-dim)" stroke="var(--signal)" strokeWidth="1.2" />
          <circle cx="186" cy="70" r="2.5" fill="var(--signal)" />
        </svg>
      );
    case 'web-mobile-build':
      return (
        <svg viewBox="0 0 240 140" preserveAspectRatio="xMidYMid meet">
          <g {...stroke}>
            <rect x="32" y="30" width="108" height="70" rx="3" />
            <line x1="32" y1="42" x2="140" y2="42" />
            <line x1="44" y1="54" x2="116" y2="54" />
            <line x1="44" y1="66" x2="106" y2="66" />
            <line x1="44" y1="78" x2="120" y2="78" />
            <line x1="44" y1="88" x2="112" y2="88" />
            <line x1="70" y1="110" x2="102" y2="110" />
            <line x1="86" y1="100" x2="86" y2="110" />
            <rect x="156" y="32" width="44" height="76" rx="6" />
            <line x1="170" y1="40" x2="186" y2="40" />
            <line x1="164" y1="52" x2="192" y2="52" />
            <line x1="164" y1="62" x2="186" y2="62" />
            <line x1="164" y1="72" x2="190" y2="72" />
            <line x1="164" y1="82" x2="184" y2="82" />
            <circle cx="178" cy="102" r="2" />
          </g>
          <circle cx="116" cy="54" r="3.2" fill="var(--signal)" />
        </svg>
      );
    case 'labs':
      return (
        <svg viewBox="0 0 240 140" preserveAspectRatio="xMidYMid meet">
          <g {...stroke} transform="translate(120 70)">
            <ellipse cx="0" cy="0" rx="64" ry="22" />
            <ellipse cx="0" cy="0" rx="64" ry="22" transform="rotate(60)" />
            <ellipse cx="0" cy="0" rx="64" ry="22" transform="rotate(-60)" />
            <circle cx="0" cy="0" r="3" fill="var(--bg-2)" />
          </g>
          <circle cx="184" cy="70" r="4" fill="var(--signal)" />
          <circle cx="64" cy="89" r="2" fill="currentColor" />
          <circle cx="120" cy="48" r="2" fill="currentColor" />
        </svg>
      );
    default:
      return null;
  }
}
