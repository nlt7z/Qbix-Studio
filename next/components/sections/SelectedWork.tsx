'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { projects, brandLookbook, type Project } from '@/lib/data';

const ease = [0.16, 1, 0.3, 1] as const;

export default function SelectedWork() {
  return (
    <section id="work" className="section-pad">
      <div className="container">
        <header className="section-head">
          <div>
            <span className="eyebrow">
              <span className="num">03</span>
              Selected work
            </span>
            <h2 style={{ marginTop: 14 }}>Built and shipped.</h2>
          </div>
        </header>

        <div className="work-grid">
          {projects.map((p, i) => (
            <ProjectCard key={p.slug} project={p} index={i} />
          ))}
        </div>

        <div className="work-sub-head">
          <span className="fig">FIG 3.1 — Brand objects</span>
          <p className="work-sub-lede">
            The studio rendered as objects you can hold. Identity stills, brand props, and
            lookbook frames from the <span className="brand-q">Q</span>bix visual system.
          </p>
        </div>

        <div className="brand-grid">
          {brandLookbook.map((item, i) => (
            <motion.figure
              key={item.src}
              className="brand-card"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.32, ease, delay: i * 0.06 }}
            >
              <div className="brand-card-frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="brand-card-img"
                  src={item.src}
                  alt={item.alt}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <figcaption className="brand-card-caption">
                <span className="brand-card-num">{item.num}</span>
                <span className="brand-card-label">{item.label}</span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const hasLink = !!project.href;
  const inner = (
    <motion.article
      className="proj"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.32, ease, delay: index * 0.08 }}
    >
      <div className="proj-preview" style={{ aspectRatio: '16 / 10' }}>
        <ProjectMedia project={project} />
        <div className="proj-overlay">
          <span className="proj-view-chip">
            <span className="dot" />
            {hasLink ? 'Open case →' : 'View →'}
          </span>
        </div>
      </div>

      <div className="proj-body">
        <div className="proj-tags">
          {project.tags.map((t) => (
            <span key={t} className="tag">{t}</span>
          ))}
        </div>
        <h3 className="proj-title">{project.title}</h3>
        <div className="proj-sub">
          <span>{project.year}</span>
          <span>·</span>
          <span>{project.client}</span>
          <span>·</span>
          <span>{project.role}</span>
        </div>
        <p className="proj-hook">{project.hook}</p>
      </div>
    </motion.article>
  );

  if (!hasLink) return inner;
  return (
    <Link
      href={project.href!}
      style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
      aria-label={`Open ${project.title}`}
    >
      {inner}
    </Link>
  );
}

function ProjectMedia({ project }: { project: Project }) {
  const m = project.media;
  if (m.kind === 'video') {
    return <LazyVideo src={m.src} poster={m.poster} />;
  }
  if (m.kind === 'image') {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="proj-img" src={m.src} alt={project.title} loading="lazy" decoding="async" />;
  }
  // images
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="proj-img" src={m.srcs[0]} alt={project.title} loading="lazy" decoding="async" />;
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
      className="proj-video"
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
    />
  );
}
