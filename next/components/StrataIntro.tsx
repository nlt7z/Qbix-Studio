'use client';

import Link from 'next/link';
import { Reveal, Stagger, RevealItem, Wipe } from '@/components/Reveal';
import SitePreviewFrame from '@/components/SitePreviewFrame';
import SplitText from '@/components/SplitText';

const STRATA_URL = 'https://stratadesign.app';

// FIG 01 — the pipeline, three verbs.
const steps = [
  {
    num: '01',
    title: 'Read the image.',
    body: 'Drop in a moodboard, a screenshot, a photo. Strata pulls color, type, spacing, and mood out of it — taste becomes measurements.',
  },
  {
    num: '02',
    title: 'Draft the system.',
    body: 'Tokens first, then components — buttons, cards, forms drawn from the same measurements, not lifted from a template.',
  },
  {
    num: '03',
    title: 'Ship the code.',
    body: 'Export CSS variables, Tailwind config, and component code. Hand it to your library — or straight to AI.',
  },
];

// FIG 02 — what actually comes out.
const outputs = [
  {
    num: '01',
    title: 'Design tokens',
    body: 'Color, type, spacing, and radius as named scales — CSS variables ready to theme.',
  },
  {
    num: '02',
    title: 'Component library',
    body: 'Buttons, cards, forms, and nav drafted inside your system, not on top of one.',
  },
  {
    num: '03',
    title: 'Code export',
    body: 'Copy CSS, Tailwind config, or component code straight into the repo.',
  },
  {
    num: '04',
    title: 'AI handoff',
    body: 'A prompt-ready spec of the whole system, so the model builds in your language.',
  },
];

export default function StrataIntro() {
  return (
    <main className="pd">
      {/* 1 — hero: name, claim, CTAs, and the product itself in a frame */}
      <section className="pd-hero" data-nav-theme="dark">
        <div className="container">
          <Link href="/#products" className="detail-crumb">
            <span className="arrow">←</span> Products
          </Link>

          <header className="pd-head">
            <Reveal as="span" className="eyebrow" speed="fast">
              Qbix Labs · Strata · Live
            </Reveal>
            <h1 className="pd-title">
              <Wipe as="span" className="pd-title-line">
                One image in.
              </Wipe>
              <Wipe as="span" className="pd-title-line" index={1}>
                A working <span className="pd-signal">system</span> out.
              </Wipe>
            </h1>
            <Reveal as="p" className="detail-lede" speed="base" delay={0.35}>
              Strata turns a moodboard into a design system you can actually
              ship — tokens, components, and code, ready to hand to AI or your
              library.
            </Reveal>
            <Reveal className="pd-ctas" speed="base" delay={0.45}>
              <a
                className="btn btn-primary btn-lg split-cta"
                href={STRATA_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <SplitText text="Open Strata" arrow />
              </a>
              <a className="btn btn-secondary btn-lg split-cta" href="#how">
                <SplitText text="How it works" />
              </a>
            </Reveal>
          </header>

          <Reveal gesture="media" speed="slow" delay={0.15}>
            <a
              className="about-preview"
              href={STRATA_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Strata"
            >
              <span className="about-preview-bar" aria-hidden>
                <span className="about-preview-dots">
                  <i /><i /><i />
                </span>
                <span className="about-preview-arrow">↗︎</span>
              </span>
              <div className="about-preview-frame">
                <SitePreviewFrame
                  src={STRATA_URL}
                  title="Strata preview"
                  poster="/previews/strata.jpg"
                  motion="/previews/strata.mp4"
                />
              </div>
            </a>
          </Reveal>

          <Reveal speed="base" delay={0.1}>
            <dl className="detail-meta pd-meta">
              <div className="detail-meta-cell">
                <dt>Input</dt>
                <dd>Any image or moodboard</dd>
              </div>
              <div className="detail-meta-cell">
                <dt>Output</dt>
                <dd>Tokens · Components · Code</dd>
              </div>
              <div className="detail-meta-cell">
                <dt>Status</dt>
                <dd>Live — stratadesign.app</dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </section>

      {/* 2 — the campaign gesture: full-bleed lime, dark ink, three verbs */}
      <section id="how" className="pd-lime section-pad" data-nav-theme="light">
        <div className="container">
          <header className="section-head">
            <div>
              <Reveal as="span" className="eyebrow" speed="fast">
                FIG 01 — How it works
              </Reveal>
              <Wipe as="h2" style={{ marginTop: 14 }} delay={0.1} color="var(--signal-dark)">
                Drop in an image. Ship a system.
              </Wipe>
            </div>
          </header>

          <Stagger className="pd-steps" stagger={0.12} delayChildren={0.15}>
            {steps.map((s) => (
              <RevealItem key={s.num} as="article" className="pd-step" speed="base">
                <span className="pd-step-num">{s.num}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </RevealItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* 3 — deliverables, back on black */}
      <section id="outputs" className="pd-outputs section-pad" data-nav-theme="dark">
        <div className="container">
          <header className="section-head">
            <div>
              <Reveal as="span" className="eyebrow" speed="fast">
                FIG 02 — What you get
              </Reveal>
              <Wipe as="h2" style={{ marginTop: 14 }} delay={0.1}>
                Everything a system needs.
              </Wipe>
            </div>
          </header>

          <Stagger className="line-list" stagger={0.08} delayChildren={0.1}>
            {outputs.map((o) => (
              <RevealItem key={o.num} speed="fast">
                <div className="line-row">
                  <span className="line-num">{o.num}</span>
                  <div className="line-body">
                    <span className="line-title">{o.title}</span>
                    <span className="line-blurb">{o.body}</span>
                  </div>
                </div>
              </RevealItem>
            ))}
          </Stagger>

          <div className="detail-cta">
            <p className="detail-cta-text">
              Your next product already has a moodboard.{' '}
              <span className="accent">Feed it to Strata.</span>
            </p>
            <a
              className="btn btn-primary btn-lg split-cta"
              href={STRATA_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <SplitText text="Open Strata" arrow />
            </a>
            <Link href="/#products" className="btn btn-secondary btn-lg split-cta">
              <SplitText text="All products" arrow />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
