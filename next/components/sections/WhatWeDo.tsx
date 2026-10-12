'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { offers, type Offer } from '@/lib/data';
import BrandText from '@/components/BrandText';
import { Reveal, Stagger, RevealItem, Wipe } from '@/components/Reveal';
import Link from 'next/link';
import DitherField from '@/components/DitherField';
import ServiceScene from '@/components/ServiceScene';

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

// The 3D scene each service card plays.
const SCENES: Record<string, 'listing' | 'practice'> = {
  'listing-kit': 'listing',
  'practice-websites': 'practice',
};

function ServiceCard({ s }: { s: Offer }) {
  return (
    <Link
      href={s.href}
      className="svc"
      aria-label={`Open ${s.title}`}
    >
      <div className="svc-pattern" aria-hidden>
        {SCENES[s.slug] && <ServiceScene variant={SCENES[s.slug]} fallback={null} />}
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
            {s.priceLead && <>{s.priceLead} </>}
            <strong>{s.price}</strong>
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
function DeckCard({ s, side }: { s: Offer; side: -1 | 1 }) {
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

  return (
    <section id="services" className="section-pad" data-nav-theme="light">
      <DitherField />
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
              <Link href="/listing-kit" className="text-link">listing launch kits</Link> and{' '}
              <Link href="/practice-websites" className="text-link">practice websites</Link>.
            </Reveal>
          </div>
        </header>

        {deckSpread ? (
          <div className="svc-deck svc-deck--two svc-deck--grid">
            {offers.map((c, i) => (
              <DeckCard key={c.slug} s={c} side={i % 2 === 0 ? -1 : 1} />
            ))}
          </div>
        ) : (
          <Stagger className="services-wrap services-wrap--two" stagger={0.1} delayChildren={0.1}>
            {offers.map((c) => (
              <RevealItem key={c.slug} speed="base">
                <ServiceCard s={c} />
              </RevealItem>
            ))}
          </Stagger>
        )}
      </div>
    </section>
  );
}
