'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Reveal, Stagger, RevealItem } from '@/components/Reveal';
import SitePreviewFrame from '@/components/SitePreviewFrame';
import { PixelEdge, StripTitle } from '@/components/ScrollMotion';
import { useQuietPlayback } from '@/components/useQuietPlayback';
import { useAudience } from '@/components/Audience';

type Media = { kind: 'image' | 'video' | 'iframe'; src: string; poster?: string; motion?: string };
type Product = {
  key: string;
  title: string;
  blurb: string;
  media: Media | null;
  url?: string;   // live link → "Explore the product"
  soon?: boolean; // no live build yet → "Coming soon"
  live?: boolean; // shipped, no public link yet → a "Live" status, nothing to click
  wide?: boolean; // live-site iframe → double-width cell, same height
};

const products: Product[] = [
  {
    key: 'tts',
    title: 'TTS Editor',
    blurb:
      'Opens the black box of speech synthesis — shape pitch, pauses, and emotion, and edit the script until the voice is right.',
    media: { kind: 'image', src: '/tts-workflow.jpg' },
    soon: true,
  },
  {
    key: 'image-ds',
    title: 'Image to Design System',
    blurb:
      'Turn a moodboard into a working design system — tokens, components, and code, ready to hand off to AI or your library.',
    media: { kind: 'iframe', src: 'https://stratadesign.app', poster: '/previews/strata.jpg', motion: '/previews/strata.mp4' },
    url: '/products/strata',
    wide: true,
  },
  {
    key: 'ai-bid',
    title: 'AI Bidding',
    blurb:
      'Blind auctions as a game. Bid, bluff, or go all in, while the model on the other side reads your hand.',
    media: { kind: 'video', src: '/bidking-present.mp4' },
    live: true,
  },
  {
    key: 'interview',
    title: 'Interview Assistant',
    blurb:
      'AI thinks along with you in real time — live hints, follow-up questions, and clean notes, so you stay in the conversation.',
    media: null,
    soon: true,
  },
];

/** Streams video/iframe media only once the card nears the viewport. */
function ProductMedia({ media }: { media: Media | null }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [show, setShow] = useState(false);
  useQuietPlayback(videoRef, media?.kind === 'video' && show);

  useEffect(() => {
    if (!media || media.kind === 'image') return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShow(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [media]);

  if (!media) {
    return (
      <div className="product-media product-media--empty" ref={ref} aria-hidden>
        <span className="product-media-soon">Coming soon</span>
      </div>
    );
  }

  return (
    <div className="product-media" ref={ref}>
      {media.kind === 'image' && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={media.src} alt="" loading="lazy" decoding="async" />
      )}
      {media.kind === 'video' && show && (
        <video ref={videoRef} src={media.src} muted loop playsInline preload="metadata" />
      )}
      {media.kind === 'iframe' && show && (
        <SitePreviewFrame src={media.src} title="Product preview" poster={media.poster} motion={media.motion} />
      )}
    </div>
  );
}

function ExploreButton({ url }: { url: string }) {
  const external = /^https?:\/\//.test(url);
  const label = 'Explore the product';
  if (external) {
    return (
      <a className="product-explore" href={url} target="_blank" rel="noopener noreferrer">
        {label}<span className="arrow" aria-hidden>↗︎</span>
      </a>
    );
  }
  return (
    <Link className="product-explore" href={url}>
      {label}<span className="arrow" aria-hidden>↗︎</span>
    </Link>
  );
}

export default function QbixLabs() {
  // Qbix Labs speaks to founders and product teams; a local business sees
  // the kits and the story, not the lab.
  const { audience } = useAudience();
  if (audience !== 'ai') return null;
  return (
    <section id="products" className="section-pad" data-nav-theme="dark">
      <PixelEdge />
      <div className="container">
        <header className="section-head section-head--right">
          <div>
            <Reveal as="span" className="eyebrow" speed="fast">
              No idea is too small
            </Reveal>
            <StripTitle text="Things we’ve shipped." style={{ marginTop: 14 }} />
            <Reveal as="p" className="sub-plain" speed="base" delay={0.3}>
              Qbix also builds products. Try the ones we have live.
            </Reveal>
          </div>
        </header>

        <Stagger className="product-row" stagger={0.1} delayChildren={0.1}>
          {products.map((p, i) => (
            <RevealItem key={p.key} speed="base" className={p.wide ? 'product-cell--wide' : undefined}>
              <article
                className={`product-card${p.wide ? ' product-card--wide' : ''}${p.url ? ' product-card--live' : p.live ? ' product-card--static' : ' product-card--soon'}`}
                style={{ '--k': i } as CSSProperties}
                data-cursor={p.url ? 'Explore ↗' : p.live ? undefined : 'Not live yet'}
              >
                <ProductMedia media={p.media} />
                <div className="product-card-body">
                  <h3 className="product-title">{p.title}</h3>
                  <p className="product-blurb">{p.blurb}</p>
                  <div className="product-card-foot">
                    {p.url ? (
                      <ExploreButton url={p.url} />
                    ) : p.live ? (
                      <span className="product-status mono">
                        <i aria-hidden /> Live
                      </span>
                    ) : (
                      <span className="product-soon">Coming soon</span>
                    )}
                  </div>
                </div>
              </article>
            </RevealItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
