'use client';

import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import Hero from '@/components/sections/Hero';
import BlockStage from '@/components/story/BlockStage';
import Marker from '@/components/Marker';
import SplitText from '@/components/SplitText';
import { useAudience } from '@/components/Audience';
import { useContactModal } from '@/components/ContactModalProvider';
import { CONTACT_EMAIL, PRICES, offers, services } from '@/lib/data';

/**
 * The homepage as one story. Each chapter is an ordinary section with its own
 * words; the one object behind them (BlockStage, 27 blocks) takes the
 * arrangement the chapter names in `form`, on the side it names in `side`
 * (the words take the other side), sized to the words. Tones alternate black
 * and paper. A chapter with `steps` has its current step set on it by the
 * stage, as `data-step`, while you read.
 */
type ChapterProps = {
  id?: string;
  form: string;
  inner?: string;
  tone: 'dark' | 'paper';
  side: 'left' | 'right';
  steps?: number;
  h?: string;
  className?: string;
  children: ReactNode;
};

function Chapter({ id, form, inner, tone, side, steps, h = '200vh', className = '', children }: ChapterProps) {
  return (
    <section
      id={id}
      className={`ch ${className}`}
      data-chapter
      data-form={form}
      data-inner={inner}
      data-tone={tone}
      data-nav-theme={tone === 'paper' ? 'light' : 'dark'}
      data-side={side}
      data-steps={steps}
      style={{ '--h': h } as CSSProperties}
    >
      <div className="ch-frame">
        {/* On a phone the object shows through this window, the words follow. */}
        <div className="ch-window" aria-hidden />
        <div className="ch-copy">{children}</div>
      </div>
    </section>
  );
}

function Steps({ items }: { items: string[] }) {
  return (
    <ol className="ch-steps">
      {items.map((s, i) => (
        <li key={s}>
          <span className="ch-step-n mono">{String(i + 1).padStart(2, '0')}</span>
          <span>{s}</span>
        </li>
      ))}
    </ol>
  );
}

function Act({ children, onClick, href }: { children: string; onClick?: () => void; href?: string }) {
  if (href) {
    return (
      <Link href={href} className="btn btn-solid btn-lg split-cta">
        <SplitText text={children} arrow />
      </Link>
    );
  }
  return (
    <button type="button" className="btn btn-solid btn-lg split-cta" onClick={onClick}>
      <SplitText text={children} arrow />
    </button>
  );
}

const [design, brand] = services;
const [kit, practice] = offers;

const PRODUCTS = [
  { title: 'Strata', status: 'Live', href: '/products/strata', blurb: 'A moodboard in, a working design system out: tokens, components, and code.' },
  { title: 'AI Bidding', status: 'Live', blurb: 'Blind auctions as a game. Bid, bluff, or go all in, while the model reads your hand.' },
  { title: 'TTS Editor', status: 'Soon', blurb: 'Shape pitch, pauses, and emotion, and edit the script until the voice is right.' },
  { title: 'Interview Assistant', status: 'Soon', blurb: 'Live hints, follow-up questions, and clean notes, so you stay in the conversation.' },
];

function StudioChapters() {
  const { open } = useContactModal();
  return (
    <>
      {/* The cube unstacks into one wall: a page. The lime block is the part that's live. */}
      <Chapter id="services" form="wall" tone="paper" side="right" steps={3}>
        <p className="ch-kicker mono">{design.title} · {design.audience}</p>
        <h2 className="ch-title">From moodboard to a live domain.</h2>
        <p className="ch-lede">{design.blurb}</p>
        <Steps items={['Moodboard', 'Design and code', 'Live on your domain']} />
        <p className="ch-meta">
          <span>From <b>{design.priceFrom}</b></span>
          <span>{design.typical}</span>
        </p>
        <div className="ch-acts"><Act onClick={open}>Start a brief</Act></div>
      </Chapter>

      {/* Three slabs, lifted apart: the grid, colour and type, the mark; they press into one. */}
      <Chapter form="slabs" inner="pressed" tone="dark" side="left" steps={3}>
        <p className="ch-kicker mono">{brand.title} · {brand.audience}</p>
        <h2 className="ch-title">From usable to worth sharing.</h2>
        <p className="ch-lede">{brand.blurb}</p>
        <Steps items={['The grid', 'Color and type', 'The mark']} />
        <p className="ch-meta">
          <span>From <b>{brand.priceFrom}</b></span>
          <span>{brand.typical}</span>
        </p>
        <div className="ch-acts"><Act onClick={open}>Start a brief</Act></div>
      </Chapter>

      {/* A skyline: what's been built. */}
      <Chapter id="products" form="skyline" tone="paper" side="right">
        <p className="ch-kicker mono">Qbix Labs</p>
        <h2 className="ch-title">Things we’ve shipped.</h2>
        <p className="ch-lede">Qbix also builds products. Two are live, two are on the way.</p>
        <ul className="ch-list">
          {PRODUCTS.map((p) => (
            <li key={p.title}>
              <span className="ch-list-head">
                {p.href ? <Link href={p.href} className="ch-list-link">{p.title}</Link> : <b>{p.title}</b>}
                <span className={`ch-tag mono${p.status === 'Live' ? ' is-live' : ''}`}>{p.status}</span>
              </span>
              <span>{p.blurb}</span>
            </li>
          ))}
        </ul>
        <div className="ch-acts"><Act href="/products/strata">Explore Strata</Act></div>
      </Chapter>
    </>
  );
}

function OfferChapters() {
  return (
    <>
      {/* A flyer, standing, with its posts laid out beside it; the lime block is the Just Listed tag. */}
      <Chapter id="services" form="flyer" tone="paper" side="right" steps={3}>
        <p className="ch-kicker mono">{kit.title} · {kit.audience}</p>
        <h2 className="ch-title">Your listing, ready to share in 48 hours.</h2>
        <p className="ch-lede">{kit.blurb} Made by a designer, delivered as files you own.</p>
        <Steps items={['Print flyer', 'Five social posts', 'A 30-second video']} />
        <p className="ch-meta">
          <span><b>{PRICES.listingKit.now}</b> <del>{PRICES.listingKit.was}</del> per listing</span>
          <span>{kit.typical}</span>
        </p>
        <div className="ch-acts"><Act href={kit.href}>See the kit</Act></div>
      </Chapter>

      {/* A calm page with its phone; the lime block is the one button. */}
      <Chapter form="practice" tone="dark" side="left" steps={3}>
        <p className="ch-kicker mono">{practice.title} · {practice.audience}</p>
        <h2 className="ch-title">A website that feels as calm as your office.</h2>
        <p className="ch-lede">{practice.blurb}</p>
        <Steps items={['A short questionnaire', 'Your new homepage in 3 days', 'Live in 7 days']} />
        <p className="ch-meta">
          <span><b>{PRICES.practice.now}</b> <del>{PRICES.practice.was}</del> flat</span>
          <span>{practice.typical}</span>
        </p>
        <div className="ch-acts"><Act href={practice.href}>See the refresh</Act></div>
      </Chapter>
    </>
  );
}

export default function Story() {
  const { audience } = useAudience();
  const { open } = useContactModal();
  const ai = audience === 'ai';
  return (
    <main className="story" data-audience={audience}>
      <BlockStage />
      <Hero />
      {ai ? <StudioChapters /> : <OfferChapters />}

      {/* Every idea, loose; then every one of them kept and sorted. */}
      <Chapter id="about" form="field" inner="sorted" tone={ai ? 'dark' : 'paper'} side={ai ? 'left' : 'right'}>
        <p className="ch-kicker mono">About us</p>
        <h2 className="ch-title">Our story is simple.</h2>
        <p className="ch-lede ch-story">
          AI has lowered the technical barrier, but the fact that anyone can build does not mean anyone can build
          well. We bring unusually sharp instincts, more than 10 years of training toward the best taste in the
          industry, real curiosity about new things (which means you get the newest tech), and respect for every
          idea that comes in. We put weight on early exploration and research, because{' '}
          <Marker className="about-hi">no idea deserves to be wasted</Marker>.
        </p>
      </Chapter>

      {/* The blocks stack back into the cube, bottom row first: the thing, built. */}
      <Chapter id="contact" form="cube" tone={ai ? 'paper' : 'dark'} side={ai ? 'right' : 'left'} h="170vh" className="ch--contact">
        <h2 className="ch-title ch-sign">
          Bring the idea. <Marker className={ai ? 'marker--ink' : 'marker--white'}>{'We’ll build the thing.'}</Marker>
        </h2>
        <div className="ch-acts">
          <button type="button" className="btn btn-solid btn-lg split-cta" onClick={open}>
            <SplitText text="Tell us your idea" arrow />
          </button>
          <a className="ch-mail" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </div>
      </Chapter>
    </main>
  );
}
