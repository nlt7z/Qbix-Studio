'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { projects, type Project } from '@/lib/data';
import { Reveal } from '@/components/Reveal';

export default function SelectedWork() {
  return (
    <section id="work" className="section-pad">
      <div className="container">
        <Reveal as="header" className="section-head" speed="fast">
          <div>
            <span className="eyebrow">
              <span className="num">03</span>
              Selected work
            </span>
            <h2 style={{ marginTop: 14 }}>Built and shipped.</h2>
          </div>
        </Reveal>

        <div className="work-cases">
          {projects.map((p, i) => (
            <WorkCard key={p.slug} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkCard({ project, index }: { project: Project; index: number }) {
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

  return (
    <Reveal
      as="article"
      className={`work-case ${hasMedia ? 'work-case--has-media' : ''}`}
      speed="base"
      delay={0.05 + index * 0.06}
    >
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
              <div className="work-case-frame">
                <MediaInner />
              </div>
            </a>
          ) : (
            <Link
              href={p.href}
              className="work-case-media"
              aria-label={`Open ${p.title}`}
            >
              <div className="work-case-frame">
                <MediaInner />
              </div>
            </Link>
          )
        ) : (
          <div className="work-case-media">
            <div className="work-case-frame">
              <MediaInner />
            </div>
          </div>
        )
      )}

      <div className="work-case-head">
        <span className="work-case-num mono">{p.num}</span>
        <span className="work-case-year mono">{p.year}</span>
      </div>

      <h3 className="work-case-title">{p.title}</h3>
      <span className="work-case-client">{p.client}</span>

      {p.metric && <span className="work-case-metric mono">{p.metric}</span>}
    </Reveal>
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
