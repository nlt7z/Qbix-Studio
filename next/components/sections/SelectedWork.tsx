'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { projects, brandLookbook } from '@/lib/data';
import { Reveal } from '@/components/Reveal';

export default function SelectedWork() {
  const bidking = projects.find((p) => p.slug === 'bidking');

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

        {bidking && bidking.media.kind === 'video' && (
          <div className="feature-case">
            <Link
              href={bidking.href ?? '#'}
              className="feature-case-media"
              aria-label={`Open ${bidking.title}`}
            >
              <Reveal
                className="feature-case-frame"
                speed="cinematic"
                gesture="media"
                delay={0.1}
              >
                <LazyVideo src={bidking.media.src} poster={bidking.media.poster} />
              </Reveal>
            </Link>

            <Reveal as="div" className="feature-case-info" speed="base" delay={0.18}>
              <div className="feature-case-meta">
                <div>
                  <div className="feature-case-meta-label">Project</div>
                  <div className="feature-case-meta-value">{bidking.title}</div>
                </div>
                <div>
                  <div className="feature-case-meta-label">Role</div>
                  <div className="feature-case-meta-value">{bidking.role}</div>
                </div>
                <div>
                  <div className="feature-case-meta-label">Year</div>
                  <div className="feature-case-meta-value">{bidking.year}</div>
                </div>
                <div>
                  <div className="feature-case-meta-label">Tags</div>
                  <div className="feature-case-meta-value">{bidking.tags.join(' · ')}</div>
                </div>
              </div>
              <p className="feature-case-hook">{bidking.hook}</p>
              <Link href={bidking.href ?? '#'} className="feature-case-link">
                Open case
                <span className="arrow">→</span>
              </Link>
            </Reveal>
          </div>
        )}

        <div className="brand-row">
          <Reveal as="div" className="brand-row-head" speed="fast">
            <span className="eyebrow">
              <span className="num">03 / b</span>
              Brand objects
            </span>
          </Reveal>

          <div className="brand-grid-2">
            {brandLookbook.map((item, i) => (
              <Reveal
                as="figure"
                key={item.src}
                className="brand-item"
                speed="base"
                gesture="tilt"
                index={i}
                delay={0.08 + i * 0.07}
              >
                <div className="brand-item-frame">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="brand-item-img"
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <figcaption className="brand-item-caption">
                  <span className="brand-item-num">{item.num}</span>
                  <span className="brand-item-label">{item.label} · 2026</span>
                </figcaption>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function LazyVideo({ src, poster }: { src: string; poster?: string }) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
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
      className="feature-case-video"
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
    />
  );
}
