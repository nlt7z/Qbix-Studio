'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Reveal, Stagger, RevealItem, Wipe } from '@/components/Reveal';
import SitePreviewFrame from '@/components/SitePreviewFrame';

type Media = { kind: 'image' | 'video' | 'iframe'; src: string };
type Product = {
  key: string;
  title: string;
  blurb: string;
  media: Media | null;
  url?: string;   // live link → "Explore the product"
  soon?: boolean; // no live build yet → "Coming soon"
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
    media: { kind: 'iframe', src: 'https://stratadesign.app' },
    url: 'https://stratadesign.app',
  },
  {
    key: 'ai-bid',
    title: 'AI Bidding',
    blurb:
      'Blind auctions as a game. Bid, bluff, or go all in, while the model on the other side reads your hand.',
    media: { kind: 'video', src: '/bidking-present.mp4' },
    url: '/games/bidking',
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
  const [show, setShow] = useState(false);

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
        <video src={media.src} muted loop playsInline autoPlay preload="metadata" />
      )}
      {media.kind === 'iframe' && show && (
        <SitePreviewFrame src={media.src} title="Product preview" />
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
  return (
    <section id="products" className="section-pad" data-nav-theme="dark">
      <div className="container">
        <header className="section-head section-head--right">
          <div>
            <Reveal as="span" className="eyebrow" speed="fast">
              No idea is too small
            </Reveal>
            <Wipe as="h2" style={{ marginTop: 14 }} delay={0.1}>
              Cool things we&rsquo;ve built.
            </Wipe>
            <Reveal as="p" className="sub-plain" speed="base" delay={0.3}>
              Qbix also builds products. Try the ones we have live.
            </Reveal>
          </div>
        </header>

        <Stagger className="product-row" stagger={0.1} delayChildren={0.1}>
          {products.map((p) => (
            <RevealItem key={p.key} speed="base">
              <article className="product-card">
                <ProductMedia media={p.media} />
                <div className="product-card-body">
                  <h3 className="product-title">{p.title}</h3>
                  <p className="product-blurb">{p.blurb}</p>
                  <div className="product-card-foot">
                    {p.url ? (
                      <ExploreButton url={p.url} />
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
