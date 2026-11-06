'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import Btn from '@/components/blocks/Btn';
import Chapter, { Meta, Steps, up } from '@/components/blocks/Chapter';
import Footer from '@/components/blocks/Footer';
import { Line, Mark, Rise } from '@/components/blocks/Rise';
import VCard from '@/components/blocks/VCard';
import FormaShot from '@/components/blocks/art/FormaShot';
import FlowArt from '@/components/blocks/art/FlowArt';
import Wordmark from '@/components/blocks/Wordmark';
import Ideas from '@/components/blocks/Ideas';
import { AudienceProvider, useAudience, type Audience } from '@/components/Audience';
import Forma from '@/components/scenes/Forma';
import Labs from '@/components/scenes/Labs';
import { ListingStory } from '@/components/scenes/Listing';
import { PracticeStory } from '@/components/scenes/Practice';
import { CONTACT_EMAIL, PRICES } from '@/lib/data';
import Count from '@/components/blocks/variants/Count';
import { STRIP_SAMPLES } from '@/lib/samples';
import { smoothScrollTo } from '@/lib/smoothScroll';
import '@/app/home.css';

/**
 * The homepage, in blocks after Wise's: white for the most part, near-black where it counts, the
 * lime only as a point. / talks to AI teams, /business to local businesses (components/Audience.tsx); the
 * bar's two audiences switch it in place (the bar sends `qb:audience`). Each audience's blocks stay in the
 * page, hidden while the other shows, so the switch is instant and their scenes keep their place.
 */
// the brand upgrade's 3D (three.js), loaded on the page only
const KovaLayers = dynamic(() => import('@/components/blocks/three/KovaLayers'), { ssr: false });

const was = (p: { now: string; was: string }) => (
  <>
    {p.now} <del>{p.was}</del>
  </>
);

// the hero's two services, side by side under the claim: each opens its own part of the page (or its page)
type Offer = { k: string; name: string; line: string; tl: string; time: string; pl: string; price: ReactNode; href: string; pic: string; vid?: string; board?: boolean; forma?: boolean };
const OFFERS: Record<Audience, Offer[]> = {
  ai: [
    { k: 'web', name: 'Design service', line: 'From moodboard to a live domain.', tl: 'Ready in', time: '1 to 3 weeks', pl: 'Starts at', price: '$500', href: '#services', pic: '', forma: true },
    { k: 'brand', name: 'Brand upgrade', line: 'From usable to worth sharing.', tl: 'Ready in', time: '5 to 10 weeks', pl: 'Starts at', price: '$5,000', href: '#brand', pic: '', board: true },
  ],
  business: [
    { k: 'kit', name: 'Listing Launch Kit', line: 'A flyer, five posts and a video.', tl: 'Ready in', time: '48 hours', pl: 'Per listing', price: was(PRICES.listingKit), href: '/listing-kit', pic: '/samples/justin-allen/thumb.webp', vid: '/samples/justin-allen/preview.mp4' },
    { k: 'practice', name: 'Practice Website Refresh', line: 'A calm website for your practice.', tl: 'Live in', time: '7 days', pl: 'Flat', price: was(PRICES.practice), href: '/practice-websites', pic: '/motion/thumbs/practice-story.jpg' },
  ],
};

const STORY = (
  <>
    Anyone can build now; not everyone builds well. We bring 10 years of training, because <b>no idea deserves to be wasted.</b>
  </>
);

/** A service's film in the hero card: plays while its service is open. */
function OfferFilm({ src, poster, play }: { src: string; poster: string; play: boolean }) {
  const v = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = v.current;
    if (!el) return;
    if (play && !matchMedia('(prefers-reduced-motion: reduce)').matches) el.play().catch(() => {});
    else el.pause();
  }, [play]);
  return <video ref={v} src={src} poster={poster} muted loop playsInline preload="none" />;
}

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
  const [openOffer, setOpenOffer] = useState(-1);

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
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) scrollTo(0, 0);
    else smoothScrollTo(0);
  };

  return (
    <main className="blocks pg-home" data-stack="">
      {/* 01 · white: the claim in the middle, then a big card with the thing itself and the converter over it */}
      <section className="block block--flat hv2" data-tone="white" id="top">
        <div className="in">
          <div className="hv2-say">
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
          </div>

          {/* the two services side by side, three lines each; pointed at, one opens (an accordion) to show the real
              thing beside its words, and the other narrows */}
          <div className="hv2-wrap" {...up(220)}>
            <div className="hv2-card" ref={card}>
              <ul className="offers" onPointerLeave={() => setOpenOffer(-1)}>
                {OFFERS[audience].map((o, i) => (
                  <li key={o.k} className={openOffer === i ? 'is-open' : undefined} onPointerEnter={() => setOpenOffer(i)} onFocus={() => setOpenOffer(i)}>
                    <Link className="offer" href={o.href}>
                      <span className="offer-text">
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
                      <span className="offer-media" aria-hidden="true">
                        {o.forma ? (
                          <FormaShot />
                        ) : o.board ? (
                          <span className="offer-board">
                            <span className="ob-mark">
                              <Wordmark dot />
                            </span>
                            <span className="ob-lime">Lime</span>
                            <span className="ob-sage">Aa</span>
                          </span>
                        ) : o.vid ? (
                          <OfferFilm src={o.vid} poster={o.pic} play={openOffer === i} />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={o.pic} alt="" loading="lazy" />
                        )}
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

      {/* 02 · black: the design service, a case: the Forma moodboard becoming its site, live, on a phone too */}
      <Chapter
        id="services"
        tone="black"
        side="right"
        moves={2}
        hidden={!ai}
        aud="ai"
        copy={
          <>
            <p className="kicker">Design service</p>
            <Rise className="h2">
              <span className="nb">From moodboard</span> <span className="nb">to a <Mark>live domain.</Mark></span>
            </Rise>
            <div className="acts">
              <Meta items={[['Starts at', '$500'], ['Takes', '1 to 3 weeks']]} />
            </div>
          </>
        }
        scene={<Forma />}
      />

      {/* 03 · white: the brand upgrade, Kova's phone taken apart into its layers and put back with its brand */}
      <Chapter
        id="brand"
        tone="white"
        side="left"
        moves={2}
        hidden={!ai}
        aud="ai"
        copy={
          <>
            <p className="kicker">Brand upgrade</p>
            <Rise className="h2">
              <span className="nb">From usable</span> <span className="nb">to <Mark>worth sharing.</Mark></span>
            </Rise>
            <div className="acts">
              <Meta items={[['Starts at', '$5,000'], ['Takes', '5 to 10 weeks']]} />
            </div>
          </>
        }
        scene={<KovaLayers />}
      />

      {/* 04 · black: Qbix Labs, the products one after another on the faces of a cube of windows (as live) */}
      <Chapter
        id="products"
        tone="black"
        side="right"
        moves={3}
        steps
        caps={['Strata', 'AI Bidding', 'TTS Editor', 'Interview Assistant']}
        hidden={!ai}
        aud="ai"
        copy={
          <>
            <p className="kicker">Qbix Labs</p>
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
            <p className="kicker">Listing Launch Kit</p>
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
            <p className="kicker">Practice Website Refresh</p>
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

      {/* 05 · white: about us; the ideas we've been brought run under it, each pointing at what it became */}
      <section className="block about" id="about" data-tone="white">
        <div className="in">
          <div className="head about-head">
            <p className="kicker">About us</p>
            <Rise className="h2">
              <span className="nb">Our story</span> <span className="nb">is simple.</span>
            </Rise>
            <p className="lede" {...up()}>
              {STORY}
            </p>
          </div>
        </div>
        <Ideas />
      </section>

      {/* 06 · black: the other side of Qbix, after Wise's "Built for business too" */}
      <section className="block cross" data-tone="black" hidden={!ai} data-aud="ai">
        <div className="in">
          <Rise className="h1">
            <span className="nb">Built for</span> <span className="nb"><Mark>local business</Mark> too.</span>
          </Rise>
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
          <Rise className="h1">
            <span className="nb">Built for</span> <span className="nb"><Mark>product teams</Mark> too.</span>
          </Rise>
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

      {/* 07 · white: the sign-off, its words lit one by one, and water running beside them */}
      <section className="block sign" id="contact" data-tone="white" data-v="4" ref={sign}>
        <div className="in">
          <div className="sign-say">
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
          <FlowArt />
        </div>
      </section>

      <Footer v={fv} />
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
