'use client';

import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import Hero from '@/components/sections/Hero';
import Forma from '@/components/scenes/Forma';
import Kova from '@/components/scenes/Kova';
import Labs from '@/components/scenes/Labs';
import Dream from '@/components/scenes/Dream';
import { ListingStory } from '@/components/scenes/Listing';
import { PracticeStory } from '@/components/scenes/Practice';
import GlassCube from '@/components/scene/GlassCube';
import { Contours, Ridges } from '@/components/scene/Generative';
import Marker from '@/components/Marker';
import SplitText from '@/components/SplitText';
import { useAudience } from '@/components/Audience';
import { useContactModal } from '@/components/ContactModalProvider';
import { CONTACT_EMAIL, PRICES, offers, services } from '@/lib/data';

/**
 * The homepage as one story. Each chapter is an ordinary section with its own
 * words and its own scene: a flat drawing that plays with the scroll
 * (components/scene), `states` of them, one after another as you scroll
 * through the chapter, on the side it names in `side` (the words take the
 * other side). Tones alternate black and paper; the sign-off is lime, its
 * top edge cut like a folder's, a tab rising out of it over the words (`tab`;
 * `prev` is the tone round the tab). Behind a chapter's words and scene,
 * pinned with them, is a generative drawing in its tone's own kind: contours
 * on paper, ridges on black (rising behind the scene); the lime is plain.
 * A chapter with `steps` has
 * the state its scene is showing set on it, as `data-step`, which lights that
 * step (or that product).
 *
 * On a phone the words come in three parts round the scene: the head (what
 * it is), then the scene, pinned in the middle of the screen while the scroll
 * plays it, with `caps` under it saying what each state shows (in place of
 * the list beside it on a wide screen), then the rest.
 */
type Cap = { k: string; v?: string; tag?: string };
type ChapterProps = {
  id?: string;
  scene?: ReactNode;
  states: number;
  tone: 'dark' | 'paper' | 'lime';
  prev?: 'dark' | 'paper';
  tab?: ReactNode;
  side: 'left' | 'right';
  steps?: number;
  caps?: Cap[];
  h?: string;
  className?: string;
  head: ReactNode;
  body?: ReactNode;
  foot?: ReactNode;
};

function Chapter({ id, scene, states, tone, prev, tab, side, steps, caps, h, className = '', head, body, foot }: ChapterProps) {
  // A chapter with several states is played by the scroll: it's as long as its moves need (80vh of
  // scroll each); on a phone its scene's runway is (see .ch-run in story.css).
  const moves = Math.max(0, states - 1);
  const height = h ?? (moves ? `${110 + 80 * moves}vh` : '170vh');
  const n = caps?.length ?? 0;
  const sub = caps?.some((c) => c.v);
  return (
    <section
      id={id}
      className={`ch${sub ? ' ch--subcaps' : ''} ${className}`}
      data-chapter
      data-tone={tone}
      data-prev={prev}
      data-nav-theme={tone === 'paper' ? 'light' : tone}
      data-side={side}
      data-steps={steps}
      style={{ '--h': height, '--moves': moves } as CSSProperties}
    >
      {tab && <div className="ch-tab">{tab}</div>}
      <div className="ch-frame">
        {tone !== 'lime' && (
          <div className="ch-backdrop">
            {tone === 'paper' ? (
              <Contours seed={seedOf(id)} alpha={0.12} levels={18} scale={240} speed={0.05} moves fps={12} density={1} />
            ) : (
              <Ridges seed={seedOf(id)} ink="184, 255, 0" bg="8, 9, 10" alpha={0.17} lines={40} amp={0.18} center={side === 'left' ? 0.3 : 0.7} spread={0.17} speed={0.12} moves fps={12} density={1} />
            )}
          </div>
        )}
        {/* Beside the words; on a phone, pinned while the scroll plays it. */}
        <div className="ch-run" data-run={moves ? '' : undefined}>
          <div className="ch-stage">
            <div className="ch-scene">{scene}</div>
            {n > 0 && (
              <div className={`ch-caps${sub ? ' ch-caps--sub' : ''}`} aria-hidden>
                <span className="ch-caps-roll">
                  <span className="ch-caps-list">
                    {caps!.map((c, i) => (
                      <span key={c.k} className="ch-cap">
                        <span className="ch-cap-n mono">
                          {String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
                        </span>
                        <span className="ch-cap-k">
                          {c.k}
                          {c.tag && <span className={`ch-tag mono${c.tag === 'Live' ? ' is-live' : ''}`}>{c.tag}</span>}
                        </span>
                        {c.v && <span className="ch-cap-v">{c.v}</span>}
                      </span>
                    ))}
                  </span>
                </span>
                <span className="ch-caps-bar">
                  {caps!.map((c) => (
                    <i key={c.k} />
                  ))}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="ch-copy">
          <div className="ch-head">{head}</div>
          {body && <div className="ch-body">{body}</div>}
          {foot && <div className="ch-foot">{foot}</div>}
        </div>
      </div>
    </section>
  );
}

/** A chapter's own seed, so no two backdrops draw the same land. */
const seedOf = (id = '') => id.split('').reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 9973, 7);

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
      <Link href={href} className="btn btn-solid btn-lg split-cta cut">
        <SplitText text={children} arrow />
      </Link>
    );
  }
  return (
    <button type="button" className="btn btn-solid btn-lg split-cta cut" onClick={onClick}>
      <SplitText text={children} arrow />
    </button>
  );
}

const [design, brand] = services;
const DESIGN_STEPS = ['Moodboard', 'Design and code', 'Live on your domain'];
const BRAND_STEPS = ['The grid', 'Color and type', 'The mark'];
const KIT_STEPS = ['Print flyer', 'Five social posts', 'A 30-second video'];
const PRACTICE_STEPS = ['A short questionnaire', 'Your new homepage in 3 days', 'Live in 7 days'];
const capsOf = (items: string[]): Cap[] => items.map((k) => ({ k }));
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
      {/* The moodboard for Forma, a studio of ceramic objects; its pieces travel into the launch site, which
          goes live at forma.studio, on a phone too. */}
      <Chapter
        id="services"
        scene={<Forma />}
        states={3}
        tone="paper"
        side="right"
        steps={3}
        caps={capsOf(DESIGN_STEPS)}
        head={
          <>
            <p className="ch-kicker mono">{design.title} · {design.audience}</p>
            <h2 className="ch-title">From moodboard to a live domain.</h2>
            <p className="ch-lede">{design.blurb}</p>
          </>
        }
        body={<Steps items={DESIGN_STEPS} />}
        foot={
          <>
            <p className="ch-meta">
              <span>From <b>{design.priceFrom}</b></span>
              <span>{design.typical}</span>
            </p>
            <div className="ch-acts"><Act onClick={open}>Start a brief</Act></div>
          </>
        }
      />

      {/* kova, a money app that works, on a phone: its layers lifted off in outline on a grid; then colour
          and type; then pressed back in, its mark popping out as the app's icon. */}
      <Chapter
        id="brand"
        scene={<Kova />}
        states={3}
        tone="dark"
        side="left"
        steps={3}
        caps={capsOf(BRAND_STEPS)}
        head={
          <>
            <p className="ch-kicker mono">{brand.title} · {brand.audience}</p>
            <h2 className="ch-title">From usable to worth sharing.</h2>
            <p className="ch-lede">{brand.blurb}</p>
          </>
        }
        body={<Steps items={BRAND_STEPS} />}
        foot={
          <>
            <p className="ch-meta">
              <span>From <b>{brand.priceFrom}</b></span>
              <span>{brand.typical}</span>
            </p>
            <div className="ch-acts"><Act onClick={open}>Start a brief</Act></div>
          </>
        }
      />

      {/* The four products, one after another, in the list's order (Strata's own film on a laptop); the one
          showing stays lit in the list. */}
      <Chapter
        id="products"
        scene={<Labs />}
        states={4}
        tone="paper"
        side="right"
        steps={4}
        caps={PRODUCTS.map((p) => ({ k: p.title, tag: p.status, v: p.blurb }))}
        head={
          <>
            <p className="ch-kicker mono">Qbix Labs</p>
            <h2 className="ch-title">Things we’ve shipped.</h2>
            <p className="ch-lede">Qbix also builds products. Two are live, two are on the way.</p>
          </>
        }
        body={
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
        }
        foot={<div className="ch-acts"><Act href="/products/strata">Explore Strata</Act></div>}
      />
    </>
  );
}

function OfferChapters() {
  return (
    <>
      {/* The flyer for 1428 Alder Street, then its five posts beside it, then its video. */}
      <Chapter
        id="services"
        scene={<ListingStory />}
        states={3}
        tone="paper"
        side="right"
        steps={3}
        caps={capsOf(KIT_STEPS)}
        head={
          <>
            <p className="ch-kicker mono">{kit.title} · {kit.audience}</p>
            <h2 className="ch-title">Your listing, ready to share in 48 hours.</h2>
            <p className="ch-lede">{kit.blurb} Made by a designer, delivered as files you own.</p>
          </>
        }
        body={<Steps items={KIT_STEPS} />}
        foot={
          <>
            <p className="ch-meta">
              <span><b>{PRICES.listingKit.now}</b> <del>{PRICES.listingKit.was}</del> per listing</span>
              <span>{kit.typical}</span>
            </p>
            <div className="ch-acts"><Act href={kit.href}>See the kit</Act></div>
          </>
        }
      />

      {/* A therapist's questionnaire becomes the calm homepage, which goes live with its phone. */}
      <Chapter
        id="practice"
        scene={<PracticeStory />}
        states={3}
        tone="dark"
        side="left"
        steps={3}
        caps={capsOf(PRACTICE_STEPS)}
        head={
          <>
            <p className="ch-kicker mono">{practice.title} · {practice.audience}</p>
            <h2 className="ch-title">A website that feels as calm as your office.</h2>
            <p className="ch-lede">{practice.blurb}</p>
          </>
        }
        body={<Steps items={PRACTICE_STEPS} />}
        foot={
          <>
            <p className="ch-meta">
              <span><b>{PRICES.practice.now}</b> <del>{PRICES.practice.was}</del> flat</span>
              <span>{practice.typical}</span>
            </p>
            <div className="ch-acts"><Act href={practice.href}>See the refresh</Act></div>
          </>
        }
      />
    </>
  );
}

export default function Story() {
  const { audience } = useAudience();
  const { open } = useContactModal();
  const ai = audience === 'ai';
  return (
    <main className="story" data-audience={audience}>
      <Hero />
      {ai ? <StudioChapters /> : <OfferChapters />}

      {/* Ideas as chat bubbles, floating; then pulled back to the ground: the real thing the lime one
          became, on a laptop (for AI teams, AI Bidding's own film). */}
      <Chapter
        id="about"
        scene={<Dream key={audience} biz={!ai} />}
        states={2}
        tone={ai ? 'dark' : 'paper'}
        side={ai ? 'left' : 'right'}
        caps={[{ k: 'The ideas people bring us' }, { k: ai ? 'One of them, built: AI Bidding' : 'One of them, built: a calm site' }]}
        head={
          <>
            <p className="ch-kicker mono">About us</p>
            <h2 className="ch-title">Our story is simple.</h2>
          </>
        }
        body={
          <p className="ch-lede ch-story">
            AI has lowered the technical barrier, but the fact that anyone can build does not mean anyone can build
            well. We bring unusually sharp instincts, more than 10 years of training toward the best taste in the
            industry, real curiosity about new things (which means you get the newest tech), and respect for every
            idea that comes in. We put weight on early exploration and research, because{' '}
            {/* the screen's one lime is the idea in its scene: the highlighter is the page's own ink or paper */}
            <Marker className={`about-hi ${ai ? 'marker--white' : 'marker--ink'}`}>no idea deserves to be wasted</Marker>.
          </p>
        }
      />

      {/* The sign-off, on plain lime: the glass cube, its core white. */}
      <Chapter
        id="contact"
        scene={<GlassCube />}
        states={1}
        tone="lime"
        prev={ai ? 'dark' : 'paper'}
        tab={<span className="ch-kicker mono">Contact</span>}
        side={ai ? 'right' : 'left'}
        h="160vh"
        className="ch--contact"
        head={
          <h2 className="ch-title ch-sign">
            Bring the idea. <Marker className="marker--ink">{'We’ll build the thing.'}</Marker>
          </h2>
        }
        foot={
          <div className="ch-acts">
            <button type="button" className="btn btn-solid btn-lg split-cta cut" onClick={open}>
              <SplitText text="Tell us your idea" arrow />
            </button>
            <a className="ch-mail" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </div>
        }
      />
    </main>
  );
}
