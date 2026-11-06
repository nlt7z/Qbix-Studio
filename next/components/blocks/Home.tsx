'use client';

import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import Btn from '@/components/blocks/Btn';
import Chapter, { Meta, Steps, up } from '@/components/blocks/Chapter';
import Footer from '@/components/blocks/Footer';
import { Line, Mark, Rise } from '@/components/blocks/Rise';
import VCard from '@/components/blocks/VCard';
import { AudienceProvider, useAudience, type Audience } from '@/components/Audience';
import Forma from '@/components/scenes/Forma';
import Kova from '@/components/scenes/Kova';
import Labs from '@/components/scenes/Labs';
import Dream from '@/components/scenes/Dream';
import { ListingStory } from '@/components/scenes/Listing';
import { PracticeStory } from '@/components/scenes/Practice';
import GlassCube from '@/components/scene/GlassCube';
import { CONTACT_EMAIL, PRICES } from '@/lib/data';
import Count from '@/components/blocks/variants/Count';
import Panel from '@/components/blocks/variants/Panel';
import { relayout, useVariant } from '@/components/blocks/variants/store';
import '@/app/variants.css';
import { STRIP_SAMPLES } from '@/lib/samples';
import '@/app/home.css';

/**
 * The homepage, in blocks after Wise's: white for the most part, the lime's own black where it counts, the
 * lime only as a point. / talks to AI teams, /business to local businesses (components/Audience.tsx); the
 * bar's two audiences switch it in place (the bar sends `qb:audience`). Each audience's blocks stay in the
 * page, hidden while the other shows, so the switch is instant and their scenes keep their place.
 */
const was = (p: { now: string; was: string }) => (
  <>
    {p.now} <del>{p.was}</del>
  </>
);

// the hero's two services, side by side under the claim: each opens its own part of the page (or its page)
type Offer = { k: string; name: string; line: string; tl: string; time: string; pl: string; price: ReactNode; href: string; pic: string };
const OFFERS: Record<Audience, Offer[]> = {
  ai: [
    { k: 'web', name: 'Design service', line: 'From moodboard to a live domain.', tl: 'Ready in', time: '1 to 3 weeks', pl: 'Starts at', price: '$500', href: '#services', pic: '/motion/thumbs/forma.jpg' },
    { k: 'brand', name: 'Brand upgrade', line: 'From usable to worth sharing.', tl: 'Ready in', time: '5 to 10 weeks', pl: 'Starts at', price: '$5,000', href: '#brand', pic: '/motion/thumbs/kova.jpg' },
  ],
  business: [
    { k: 'kit', name: 'Listing Launch Kit', line: 'A flyer, five posts and a video.', tl: 'Ready in', time: '48 hours', pl: 'Per listing', price: was(PRICES.listingKit), href: '/listing-kit', pic: '/motion/thumbs/listing-story.jpg' },
    { k: 'practice', name: 'Practice Website Refresh', line: 'A calm website for your practice.', tl: 'Live in', time: '7 days', pl: 'Flat', price: was(PRICES.practice), href: '/practice-websites', pic: '/motion/thumbs/practice-story.jpg' },
  ],
};

const STORY = (
  <>
    Anyone can build now; not everyone builds well. We bring 10 years of training, because <b>no idea deserves to be wasted.</b>
  </>
);

type RowData = { href: string; t: string; d: string; e: ReactNode; img: string };

/**
 * The other audience's offers, in one of five ways (variants/store.ts 'cross'): 1 rows; 2 rows, and the one pointed
 * at shows its picture by the pointer; 3 rows that a tile sweeps across when pointed at; 4 rows that slide in one
 * after another; 5 cards side by side, a picture on each.
 */
function Rows({ v, rows }: { v: number; rows: RowData[] }) {
  const list = useRef<HTMLUListElement>(null);
  const [hot, setHot] = useState(-1);
  const [pt, setPt] = useState({ x: 0, y: 0 });
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = list.current;
    if (v !== 4 || !el) return;
    setShown(false);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setShown(true), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [v]);
  if (v === 5)
    return (
      <ul className="rows-cards">
        {rows.map((r) => (
          <li key={r.t}>
            <Link className="rcard" href={r.href}>
              <span className="rcard-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.img} alt="" loading="lazy" />
              </span>
              <span className="row-t">{r.t}</span>
              <span className="row-d">{r.d}</span>
              <span className="row-e">{r.e}</span>
            </Link>
          </li>
        ))}
      </ul>
    );
  return (
    <div
      className="rows-wrap"
      onPointerMove={
        v === 2
          ? (e) => {
              const b = e.currentTarget.getBoundingClientRect();
              setPt({ x: e.clientX - b.left, y: e.clientY - b.top });
            }
          : undefined
      }
    >
      <ul ref={list} className={`rows rows-v${v}${shown ? ' is-in' : ''}`}>
        {rows.map((r, i) => (
          <li key={r.t} style={{ '--k': i } as CSSProperties}>
            <Link className="row" href={r.href} onPointerEnter={() => setHot(i)} onPointerLeave={() => setHot(-1)}>
              <span className="row-t">{r.t}</span>
              <span className="row-d">{r.d}</span>
              <span className="row-e">{r.e}</span>
            </Link>
          </li>
        ))}
      </ul>
      {v === 2 && (
        <span className="rows-pre" aria-hidden="true" style={{ transform: `translate(${pt.x + 24}px, ${pt.y - 120}px)`, visibility: hot >= 0 ? 'visible' : 'hidden' }}>
          {rows.map((r, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={r.t} src={r.img} alt="" data-on={i === hot ? '' : undefined} />
          ))}
        </span>
      )}
    </div>
  );
}

function Page() {
  const { audience, setAudience } = useAudience();
  const ai = audience === 'ai';
  // the section options under review (variants/store.ts), 1 the page as built
  // chosen (Nov 6): the other audience's rows slide in (4), the contact headline lights word by word (4),
  // the footer comes up from under the page (3)
  const cv = 4;
  const fv = 3;
  const [counted, setCounted] = useState(false);

  // the bar's audiences
  useEffect(() => {
    const on = (e: Event) => {
      const a = (e as CustomEvent<Audience>).detail;
      if (a === 'ai' || a === 'business') setAudience(a);
    };
    addEventListener('qb:audience', on);
    return () => removeEventListener('qb:audience', on);
  }, [setAudience]);

  // the audience switched to: its headlines in view rise again (shown from hidden, so they start down)
  const first = useRef(true);
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const els = Array.from(
      document.querySelectorAll<HTMLElement>(`.pg-home [data-aud="${audience}"][data-rise], .pg-home [data-aud="${audience}"] [data-rise]`),
    ).filter((h) => !h.closest('[hidden]') && h.getBoundingClientRect().top < innerHeight);
    els.forEach((h) => {
      h.removeAttribute('data-in');
      h.querySelectorAll('[data-in]').forEach((x) => x.removeAttribute('data-in'));
    });
    void document.body.offsetWidth;
    const raf = requestAnimationFrame(() =>
      els.forEach((h) => {
        h.setAttribute('data-in', '');
        h.querySelectorAll('.mark[data-wipe]').forEach((x) => x.setAttribute('data-in', ''));
      }),
    );
    return () => cancelAnimationFrame(raf);
  }, [audience]);

  // the hero's card grows to its full size as the page scrolls into it (scrubbed, no timer)
  const card = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = card.current;
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const set = () => {
      raf = 0;
      const g = Math.min(1, Math.max(0, (innerHeight - el.getBoundingClientRect().top) / (innerHeight * 0.9)));
      el.style.setProperty('--g', (g * g * (3 - 2 * g)).toFixed(3));
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(set);
    };
    addEventListener('scroll', kick, { passive: true });
    addEventListener('resize', kick);
    set();
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('scroll', kick);
      removeEventListener('resize', kick);
    };
  }, []);

  // the hero's figures count up once the card is in view
  useEffect(() => {
    const el = card.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setCounted(true), { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // the contact headline's words light up one by one as the block comes up
  const sign = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = sign.current;
    if (!el) return;
    const words = Array.from(el.querySelectorAll<HTMLElement>('h2 .w'));
    const lit = () => {
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight * 0.8)));
      words.forEach((w, i) => w.classList.toggle('on', i < Math.round(p * words.length)));
    };
    lit();
    addEventListener('scroll', lit, { passive: true });
    return () => removeEventListener('scroll', lit);
  }, []);

  // footer 3: its words come up from behind the block before it as it comes into view
  useEffect(() => {
    const f = document.querySelector<HTMLElement>('footer.fv2');
    if (!f) return;
    const set = () => {
      const r = f.getBoundingClientRect();
      f.style.setProperty('--cp', String(Math.min(1, Math.max(0, (innerHeight - r.top) / Math.max(1, r.height)))));
    };
    set();
    addEventListener('scroll', set, { passive: true });
    return () => {
      removeEventListener('scroll', set);
      f.style.removeProperty('--cp');
    };
  }, []);

  // the other audience, from its block near the end: switch, then back to the top
  const switchTo = (a: Audience) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setAudience(a);
    scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  return (
    <main className="blocks pg-home" data-stack="">
      {/* 01 · white: the claim in the middle, then a big card with the thing itself and the converter over it */}
      <section className="block block--flat hv2" data-tone="white" id="top">
        <div className="in">
          <div className="hv2-say">
            {/* the cube, turning behind the claim: three-quarter view, at eye level */}
            <div className="hv2-cube" data-chapter="" aria-hidden="true">
              <div className="scene" data-tone="paper">
                <GlassCube />
              </div>
            </div>
            <Rise as="h1" className="display hv2-h" fit={{ max: 150, min: 30, ratio: 0.92 }} hidden={!ai} aud="ai" wave>
              <Line>We build the</Line>
              <Line>
                <Mark>coolest</Mark> things.
              </Line>
            </Rise>
            <Rise as="h1" className="display hv2-h" fit={{ max: 150, min: 30, ratio: 0.92 }} hidden={ai} aud="business" wave>
              <Line>Look as good</Line>
              <Line>
                as <Mark>your work.</Mark>
              </Line>
            </Rise>
            <p className="lede hv2-lede" {...up()} hidden={!ai}>
              Qbix never writes off a small idea.
              <br />
              We’re a sharp team that moves fast, <b>from sketch to shipped product.</b>
            </p>
            <p className="lede hv2-lede" {...up()} hidden={ai}>
              Fixed-price design for local businesses, <b>ready in days.</b>
              <br />
              A listing kit for real estate agents and a calm website for solo practices.
            </p>
          </div>

          {/* the two services, three lines each; pointed at, a service turns over to show what it is */}
          <div className="hv2-wrap" {...up(220)}>
            <div className="hv2-card" ref={card}>
              <ul className="offers">
                {OFFERS[audience].map((o) => (
                  <li key={o.k}>
                    <Link className="offer" href={o.href}>
                      <span className="offer-face">
                        <span className="offer-n">{o.name}</span>
                        <span className="offer-d">{o.line}</span>
                        <span className="offer-m">
                          <span>
                            <small>{o.tl}</small>
                            <Count text={o.time} play={counted} />
                          </span>
                          <span>
                            <small>{o.pl}</small>
                            {typeof o.price === 'string' ? <Count text={o.price} play={counted} /> : o.price}
                          </span>
                        </span>
                      </span>
                      <span className="offer-back" aria-hidden="true">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={o.pic} alt="" loading="lazy" />
                        <span className="offer-go-t">
                          {o.name}
                          <svg viewBox="0 0 16 16">
                            <path d="M4 12 12 4M5.5 4H12v6.5" />
                          </svg>
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===== for AI teams ===== */}

      {/* 02 · black: the design service, the Forma moodboard becoming its site */}
      <Chapter
        id="services"
        vkey="services"
        tone="black"
        side="right"
        moves={2}
        steps
        caps={['Moodboard', 'Design and code', 'Live on your domain']}
        hidden={!ai}
        aud="ai"
        copy={
          <>
            <p className="kicker">
              Design service <span>· Founders, launch sites, brand</span>
            </p>
            <Rise className="h2">
              <span className="nb">From moodboard</span> <span className="nb">to a <Mark>live domain.</Mark></span>
            </Rise>
            <Steps items={['Moodboard', 'Design and code', 'Live on your domain']} />
            <div className="acts">
              <Meta items={[['Starts at', '$500'], ['Takes', '1 to 3 weeks']]} />
            </div>
          </>
        }
        scene={<Forma />}
      />

      {/* 03 · white: the brand upgrade, Kova's layers lifted, coloured and pressed back */}
      <Chapter
        id="brand"
        vkey="brand"
        tone="white"
        side="left"
        moves={2}
        steps
        caps={['The grid', 'Color and type', 'The mark']}
        hidden={!ai}
        aud="ai"
        copy={
          <>
            <p className="kicker">
              Brand upgrade <span>· Growing teams, 1 to 100</span>
            </p>
            <Rise className="h2">
              <span className="nb">From usable</span> <span className="nb">to <Mark>worth sharing.</Mark></span>
            </Rise>
            <Steps items={['The grid', 'Color and type', 'The mark']} />
            <div className="acts">
              <Meta items={[['Starts at', '$5,000'], ['Takes', '5 to 10 weeks']]} />
            </div>
          </>
        }
        scene={<Kova />}
      />

      {/* 04 · black: Qbix Labs, the four products one after another */}
      <Chapter
        id="products"
        vkey="products"
        tone="black"
        side="right"
        moves={3}
        steps
        caps={['Strata', 'AI Bidding', 'TTS Editor', 'Interview Assistant']}
        hidden={!ai}
        aud="ai"
        copy={
          <>
            <p className="kicker">
              Qbix Labs <span>· Two live, two on the way</span>
            </p>
            <Rise className="h2">
              Things we’ve <Mark>shipped.</Mark>
            </Rise>
            <Steps
              items={[
                ['Strata', 'Live'],
                ['AI Bidding', 'Live'],
                ['TTS Editor', 'Soon'],
                ['Interview Assistant', 'Soon'],
              ].map(([n, st]) => (
                <span key={n}>
                  {n}
                  <span className="state">{st}</span>
                </span>
              ))}
            />
            <div className="ch-list-foot">
              <div className="notes">
                <p>
                  <b>Strata.</b> A moodboard in, a working design system out: tokens, components, and code.
                </p>
                <p>
                  <b>AI Bidding.</b> Blind boxes, sealed bids, one clue a round. Work your way up from flea markets to the Devil’s Auction.
                </p>
                <p>
                  <b>TTS Editor.</b> Shape pitch, pauses, and emotion, and edit the script until the voice is right.
                </p>
                <p>
                  <b>Interview Assistant.</b> Live hints, follow-up questions, and clean notes, so you stay in the conversation.
                </p>
              </div>
              <div className="acts">
                <Btn href="/products/strata">Explore Strata</Btn>
              </div>
            </div>
          </>
        }
        scene={<Labs />}
      />

      {/* ===== for business ===== */}

      {/* 02 · black: the work first, six samples, one from each kind of business */}
      <section className="block" id="work" data-tone="black" hidden={ai} data-aud="business">
        <div className="in">
          <div className="samples-head">
            <Rise className="h2">
              Short videos and posters we made for <Mark>local businesses.</Mark>
            </Rise>
            <Btn href="/samples" variant="2">
              See all samples
            </Btn>
          </div>
          <div className="reel-wrap">
            <div className="reel">
              {STRIP_SAMPLES.map((s) => (
                <VCard key={s.slug} s={s} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 03 · white: the listing kit, 1428 Alder Street's flyer, posts and video */}
      <Chapter
        id="services-biz"
        tone="white"
        side="right"
        moves={2}
        steps
        caps={['Print flyer', 'Five social posts', 'A 30-second video']}
        hidden={ai}
        aud="business"
        copy={
          <>
            <p className="kicker">
              Listing Launch Kit <span>· Real estate agents, per listing</span>
            </p>
            <Rise className="h2">
              Your listing, ready to share in <Mark>48 hours.</Mark>
            </Rise>
            <Steps items={['Print flyer', 'Five social posts', 'A 30-second video']} />
            <div className="acts">
              <Btn href="/listing-kit">See the kit</Btn>
              <Meta items={[['Per listing', was(PRICES.listingKit)], ['Takes', '48 hours']]} />
            </div>
          </>
        }
        scene={<ListingStory />}
      />

      {/* 04 · black: the practice refresh, a questionnaire becoming a calm homepage */}
      <Chapter
        id="practice"
        tone="black"
        side="left"
        moves={2}
        steps
        caps={['A short questionnaire', 'Your new homepage in 3 days', 'Live in 7 days']}
        hidden={ai}
        aud="business"
        copy={
          <>
            <p className="kicker">
              Practice Website Refresh <span>· Solo practices, therapists</span>
            </p>
            <Rise className="h2">
              A website that feels as <Mark>calm</Mark> as your office.
            </Rise>
            <Steps items={['A short questionnaire', 'Your new homepage in 3 days', 'Live in 7 days']} />
            <div className="acts">
              <Btn href="/practice-websites">See the refresh</Btn>
              <Meta items={[['Flat', was(PRICES.practice)], ['Takes', '7 days']]} />
            </div>
          </>
        }
        scene={<PracticeStory />}
      />

      {/* ===== both ===== */}

      {/* 05 · white: about us, ideas as bubbles, then one of them built (its own for each audience) */}
      <Chapter
        id="about"
        vkey="about"
        tone="white"
        side="left"
        moves={1}
        copy={
          <>
            <p className="kicker">About us</p>
            <Rise className="h2">
              <span className="nb">Our story</span> <span className="nb">is simple.</span>
            </Rise>
            <p className="lede" {...up()}>
              {STORY}
            </p>
          </>
        }
        scene={<Dream key={audience} biz={!ai} />}
      />

      {/* 06 · black: the other side of Qbix, after Wise's "Built for business too" */}
      <section className="block cross" data-tone="black" hidden={!ai} data-aud="ai">
        <div className="in">
          <div className="head head--split">
            <Rise className="h1">
              <span className="nb">Built for</span> <span className="nb"><Mark>local business</Mark> too.</span>
            </Rise>
            <p className="lede" {...up()}>
              Fixed-price design for local businesses, <b>ready in days.</b> A listing kit for real estate agents and a calm website for solo practices.
            </p>
          </div>
          <Rows
            v={cv}
            rows={[
              { href: '/listing-kit', t: 'Listing Launch Kit', d: 'A flyer, five posts and a 30-second video, in 48 hours.', e: <>{PRICES.listingKit.now}<del>{PRICES.listingKit.was}</del></>, img: '/samples/justin-allen/thumb.webp' },
              { href: '/practice-websites', t: 'Practice Website Refresh', d: 'A calm website for your practice, live in 7 days.', e: <>{PRICES.practice.now}<del>{PRICES.practice.was}</del></>, img: '/motion/thumbs/practice-story.jpg' },
              { href: '/samples', t: 'Samples', d: 'Videos and posters we made for local businesses.', e: '↗︎', img: '/samples/hemphill-tree-farm/thumb.webp' },
            ]}
          />
          <div className="acts">
            <Btn href="/business" variant="2" onClick={switchTo('business')}>
              See Qbix for business
            </Btn>
          </div>
        </div>
      </section>
      <section className="block cross" data-tone="black" hidden={ai} data-aud="business">
        <div className="in">
          <div className="head head--split">
            <Rise className="h1">
              <span className="nb">Built for</span> <span className="nb"><Mark>product teams</Mark> too.</span>
            </Rise>
            <p className="lede" {...up()}>
              Qbix never writes off a small idea. We’re a sharp team that moves fast, <b>from sketch to shipped product.</b>
            </p>
          </div>
          <Rows
            v={cv}
            rows={[
              { href: '/#services', t: 'Design service', d: 'From moodboard to a live domain in 1 to 3 weeks.', e: <><small className="state">from</small> $500</>, img: '/motion/thumbs/forma.jpg' },
              { href: '/#brand', t: 'Brand upgrade', d: 'From usable to worth sharing, merged into your repo.', e: <><small className="state">from</small> $5,000</>, img: '/motion/thumbs/kova.jpg' },
              { href: '/products/strata', t: 'Strata', d: 'A moodboard in, a working design system out.', e: 'Live ↗︎', img: '/previews/strata.jpg' },
            ]}
          />
          <div className="acts">
            <Btn href="/" variant="2" onClick={switchTo('ai')}>
              See Qbix for AI teams
            </Btn>
          </div>
        </div>
      </section>

      {/* 07 · white: the sign-off, the glass cube, its core lime */}
      <section className="block sign" id="contact" data-tone="white" data-v="4" ref={sign}>
        <div className="in">
          <div>
            <p className="kicker">Contact</p>
            <Rise className="h1" style={{ marginTop: 22 }}>
              <span className="nb">Bring the idea.</span> <span className="nb">We’ll build the thing.</span>
            </Rise>
            <div className="acts">
              <a className="link sign-mail" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>
          <div className="sign-cube" data-chapter="">
            <div className="scene" data-tone="paper" style={{ height: '100%' }}>
              <GlassCube />
            </div>
          </div>
        </div>
      </section>

      <Footer v={fv} />
      <Panel />
    </main>
  );
}

export default function Home({ audience }: { audience: Audience }) {
  return (
    <AudienceProvider initial={audience}>
      <Page />
    </AudienceProvider>
  );
}
