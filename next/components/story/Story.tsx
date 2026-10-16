'use client';

import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import Hero from '@/components/sections/Hero';
import VoxelStage from '@/components/story/VoxelStage';
import Marker from '@/components/Marker';
import SplitText from '@/components/SplitText';
import { PixelEdge } from '@/components/ScrollMotion';
import { useAudience } from '@/components/Audience';
import { useContactModal } from '@/components/ContactModalProvider';
import { CONTACT_EMAIL, PRICES, offers, services } from '@/lib/data';

/**
 * The homepage as one story. Each chapter is an ordinary section with its own
 * words; the one 3D object behind them (VoxelStage) becomes whatever the
 * chapter names in `form`, on the side it names in `side` (the words take the
 * other side). Tones alternate black / paper. A chapter with `steps` has its
 * current step set on it by the stage, as `data-step`, while you read.
 */
type Side = 'left' | 'right' | 'center';
type ChapterProps = {
  id?: string;
  form: string;
  inner?: string;
  tone: 'dark' | 'paper';
  side: Side;
  live?: boolean;
  film?: string;
  steps?: number;
  push?: boolean;
  h?: string;
  className?: string;
  children: ReactNode;
};

function Chapter({ id, form, inner, tone, side, live, film, steps, push, h = '190vh', className = '', children }: ChapterProps) {
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
      data-live={live ? '1' : undefined}
      data-film={film}
      data-steps={steps}
      data-push={push ? '1' : undefined}
      style={{ '--h': h } as CSSProperties}
    >
      <PixelEdge />
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

function StudioChapters() {
  const { open } = useContactModal();
  return (
    <>
      {/* The cube comes apart and lays itself out as a website; the hero block lights lime: live. */}
      <Chapter id="services" form="site" tone="paper" side="left" live steps={3}>
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

      {/* The brand stack: grid, colour and type, the mark (lime); it presses into one slab. */}
      <Chapter form="brand" inner="press" tone="dark" side="right" steps={3}>
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

      {/* The blocks turn into a pixel screen and play the product. */}
      <Chapter id="products" form="led" film="strata" tone="paper" side="left" h="180vh">
        <p className="ch-kicker mono">Qbix Labs · Things we’ve shipped</p>
        <h2 className="ch-title">Strata</h2>
        <p className="ch-lede">
          Turn a moodboard into a working design system: tokens, components, and code, ready to hand off to AI or
          your library.
        </p>
        <p className="ch-meta"><span>Live at <b>stratadesign.app</b></span></p>
        <div className="ch-acts"><Act href="/products/strata">Explore Strata</Act></div>
      </Chapter>

      <Chapter form="led" film="bidding" tone="dark" side="right" h="180vh">
        <p className="ch-kicker mono">Qbix Labs · Live</p>
        <h2 className="ch-title">AI Bidding</h2>
        <p className="ch-lede">Blind auctions as a game. Bid, bluff, or go all in, while the model on the other side reads your hand.</p>
        <ul className="ch-soon">
          <li>
            <b>TTS Editor</b> <span className="ch-soon-tag mono">Soon</span>
            <span>Shape pitch, pauses, and emotion, and edit the script until the voice is right.</span>
          </li>
          <li>
            <b>Interview Assistant</b> <span className="ch-soon-tag mono">Soon</span>
            <span>Live hints, follow-up questions, and clean notes, so you stay in the conversation.</span>
          </li>
        </ul>
      </Chapter>
    </>
  );
}

function OfferChapters() {
  return (
    <>
      {/* The listing kit: a flyer (its Just Listed tag is the lime), five posts, a phone. */}
      <Chapter id="services" form="listing" tone="paper" side="left" steps={3}>
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

      {/* A calm practice website; its Book a consultation button is the lime. */}
      <Chapter form="practice" tone="dark" side="right" steps={3}>
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
  return (
    <main className="story" data-audience={audience}>
      <VoxelStage />
      <Hero />
      {audience === 'ai' ? <StudioChapters /> : <OfferChapters />}

      {/* Every idea scattered, then gathered into one block: none of them wasted. */}
      <Chapter id="about" form="cloud" inner="seed" tone="paper" side="left">
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

      {/* The blocks spell qbix across the screen; the i's dot is the lime. */}
      <Chapter id="contact" form="word" tone="dark" side="center" push h="150vh" className="ch--contact">
        <h2 className="ch-title ch-sign">
          Bring the idea. <Marker className="marker--white">{'We’ll build the thing.'}</Marker>
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
