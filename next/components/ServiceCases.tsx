'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { Project } from '@/lib/data';

// Editorial case strip for the service detail pages. Deliberately low on card
// chrome — each case is a media block with a thin frame and a quiet caption
// line beneath, not a boxed card. Media (video / iframe) lazy-loads on view.

export default function ServiceCases({ cases }: { cases: Project[] }) {
  if (!cases.length) return null;
  return (
    <ol className="svc-cases">
      {cases.map((p) => {
        const external = p.href ? /^https?:\/\//.test(p.href) : false;
        const frame = (
          <div
            className="svc-case-frame"
            style={p.aspect ? { aspectRatio: String(p.aspect) } : undefined}
          >
            <CaseMedia project={p} />
          </div>
        );
        return (
          <li key={p.slug} className="svc-case">
            {p.href ? (
              external ? (
                <a
                  href={p.href}
                  className="svc-case-media"
                  aria-label={`Open ${p.title}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {frame}
                </a>
              ) : (
                <Link href={p.href} className="svc-case-media" aria-label={`Open ${p.title}`}>
                  {frame}
                </Link>
              )
            ) : (
              frame
            )}
            <div className="svc-case-cap">
              <span className="svc-case-num mono">{p.num}</span>
              <span className="svc-case-text">
                <span className="svc-case-title">{p.title}</span>
                <span className="svc-case-meta mono">{p.role}</span>
              </span>
              <span className="svc-case-year mono">{p.year}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function CaseMedia({ project: p }: { project: Project }) {
  const media = p.media;
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
    <video ref={ref} className="work-case-video" muted loop playsInline preload="none" />
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
