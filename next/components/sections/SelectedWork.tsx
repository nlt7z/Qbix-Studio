'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { projects, type Project } from '@/lib/data';
import { Reveal, Words } from '@/components/Reveal';

export default function SelectedWork() {
  const visible = projects.filter((p) => !p.hidden);
  return (
    <section id="work" className="section-pad">
      <div className="container">
        <header className="section-head">
          <div>
            <Reveal as="span" className="eyebrow" speed="fast">
              <span className="num">03</span>
              Selected work
            </Reveal>
            <Words
              as="h2"
              text="Built and shipped."
              style={{ marginTop: 14 }}
              speed="fast"
              delay={0.1}
              step={0.04}
            />
          </div>
        </header>

        <WorkFan items={visible} />

        <div className="work-stack">
          {visible.map((p, i) => (
            <StackCard key={p.slug} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Tarot fan — the cases open the section as a hand of cards
   pivoting around a low centre point; scrolling turns the whole
   hand and spreads the fan, then it yields to the stack below.
   ============================================================ */

function FanCard({
  project,
  baseAngle,
  spread,
}: {
  project: Project;
  baseAngle: number;
  spread: MotionValue<number>;
}) {
  const rotate = useTransform(spread, (s) => baseAngle * s);
  const still =
    project.media?.kind === 'image'
      ? project.media.src
      : project.media?.kind === 'images'
        ? project.media.srcs[0]
        : null;
  return (
    <motion.div
      className="work-fan-card"
      style={{ rotate, willChange: 'transform' }}
    >
      {still ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="work-fan-still" src={still} alt="" loading="lazy" decoding="async" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="work-fan-emblem" src="/qbix-cube.png" alt="" loading="lazy" decoding="async" />
      )}
      <span className="work-fan-num mono">{project.num}</span>
      <span className="work-fan-title">{project.title}</span>
    </motion.div>
  );
}

function WorkFan({ items }: { items: Project[] }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // The whole hand turns about its pivot as you scroll…
  const groupRotate = useTransform(scrollYProgress, [0, 1], [-14, 10]);
  // …the fan opens over the first half…
  const spread = useTransform(scrollYProgress, [0.05, 0.45], [0.15, 1], {
    clamp: true,
  });
  // …and the hand rises away as the stack takes over.
  const y = useTransform(scrollYProgress, [0.55, 0.9], [0, -80]);
  const opacity = useTransform(scrollYProgress, [0.55, 0.85], [1, 0]);

  if (reduced || items.length === 0) return null;

  const mid = (items.length - 1) / 2;
  return (
    <div ref={ref} className="work-fan-stage" aria-hidden>
      <motion.div
        className="work-fan"
        style={{ rotate: groupRotate, y, opacity, willChange: 'transform, opacity' }}
      >
        {items.map((p, i) => (
          <FanCard
            key={p.slug}
            project={p}
            baseAngle={(i - mid) * 26}
            spread={spread}
          />
        ))}
      </motion.div>
    </div>
  );
}

/* ============================================================
   Stack — one column, one card per product. Each card pins near
   the top of the viewport, and the next one slides up over it,
   layer over layer, so the work is dealt one case at a time.
   ============================================================ */

function StackCard({ project, index }: { project: Project; index: number }) {
  const p = project;
  const media = p.media;
  const hasMedia =
    media?.kind === 'video' ||
    media?.kind === 'images' ||
    media?.kind === 'image' ||
    media?.kind === 'iframe';

  const MediaInner = () => {
    if (!media) return null;
    if (media.kind === 'video') return <LazyVideo src={media.src} />;
    if (media.kind === 'images') return <ImageLoop srcs={media.srcs} alt={p.title} />;
    if (media.kind === 'image')
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="work-case-still"
          src={media.src}
          alt={p.title}
          loading="lazy"
          decoding="async"
        />
      );
    if (media.kind === 'iframe') return <LazyIframe src={media.src} title={p.title} />;
    return null;
  };

  const frame = (
    <Reveal className="work-case-frame" gesture="media" speed="base">
      <MediaInner />
    </Reveal>
  );

  return (
    <article
      className="work-stack-card"
      style={{ top: `calc(clamp(72px, 10vh, 110px) + ${index * 22}px)` }}
    >
      <div className="work-case-head">
        <span className="work-case-num mono">{p.num}</span>
        <span className="work-case-year mono">{p.year}</span>
      </div>

      {hasMedia && (
        p.href ? (
          /^https?:\/\//.test(p.href) ? (
            <a
              href={p.href}
              className="work-case-media"
              aria-label={`Open ${p.title}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {frame}
            </a>
          ) : (
            <Link
              href={p.href}
              className="work-case-media"
              aria-label={`Open ${p.title}`}
            >
              {frame}
            </Link>
          )
        ) : (
          <div className="work-case-media">{frame}</div>
        )
      )}

      <div className="work-stack-meta">
        <div>
          <h3 className="work-case-title">{p.title}</h3>
          <span className="work-case-client">{p.client}</span>
        </div>
        {p.metric && <span className="work-case-metric mono">{p.metric}</span>}
      </div>
    </article>
  );
}

function ImageLoop({ srcs, alt }: { srcs: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) setVisible(e.isIntersecting);
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || srcs.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % srcs.length);
    }, 2000);
    return () => window.clearInterval(id);
  }, [visible, srcs.length]);

  return (
    <div ref={containerRef} className="work-case-loop">
      {srcs.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt={`${alt} — frame ${i + 1}`}
          className={`work-case-loop-img${i === index ? ' is-active' : ''}`}
          loading={i === 0 ? 'eager' : 'lazy'}
          decoding="async"
        />
      ))}
    </div>
  );
}

function LazyIframe({ src, title }: { src: string; title: string }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShouldLoad(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="work-case-iframe-wrap" aria-hidden="true">
      {shouldLoad && (
        <iframe
          src={src}
          title={`${title} preview`}
          className="work-case-iframe"
          loading="lazy"
          referrerPolicy="no-referrer"
          sandbox="allow-same-origin allow-scripts"
          tabIndex={-1}
        />
      )}
    </div>
  );
}

function LazyVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !src) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            if (!el.src) el.src = src;
            void el.play().catch(() => {});
          } else {
            el.pause();
          }
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [src]);

  return (
    <video
      ref={ref}
      className="work-case-video"
      muted
      loop
      playsInline
      preload="none"
    />
  );
}
