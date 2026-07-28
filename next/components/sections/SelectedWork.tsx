'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { projects, type Project } from '@/lib/data';
import { Reveal, Wipe } from '@/components/Reveal';

export default function SelectedWork() {
  const visible = projects.filter((p) => !p.hidden);
  return (
    <section id="work" className="section-pad" data-nav-theme="dark">
      <span id="product" aria-hidden style={{ position: 'absolute', top: 0 }} />
      <div className="container">
        <header className="section-head">
          <div>
            <Reveal as="span" className="eyebrow" speed="fast">
              Selected work
            </Reveal>
            <Wipe as="h2" style={{ marginTop: 14 }} delay={0.1}>
              Built and shipped.
            </Wipe>
            <Reveal as="p" className="lede" speed="base" delay={0.3} style={{ marginTop: 18 }}>
              The coolest ideas we wanted to exist, so we built them — a TTS
              editor, moodboard-to-design-system, AI bid, and an interview
              assistant, alongside work shipped with partners.
            </Reveal>
          </div>
        </header>

        <WorkShowcase items={visible} />
      </div>
    </section>
  );
}

/* Reusable big-media showcase: the hand of cards opens from a stacked fan,
   then yields to a pinned column that stacks the cards layer over layer —
   big media, small text. Fed by SelectedWork and the Products section alike. */
export function WorkShowcase({ items }: { items: Project[] }) {
  return (
    <>
      <WorkFan items={items} />
      <div className="work-stack">
        {items.map((p, i) => (
          <StackCard key={p.slug} project={p} index={i} />
        ))}
      </div>
    </>
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
  // Spring the scroll signal once so the whole hand turns, spreads and lifts
  // on a single eased curve — no per-frame stutter as the fan opens.
  const p = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 30,
    mass: 0.4,
  });

  // The whole hand turns about its pivot as you scroll…
  const groupRotate = useTransform(p, [0, 1], [-14, 10]);
  // …the fan opens over the first half…
  const spread = useTransform(p, [0.05, 0.45], [0.15, 1], {
    clamp: true,
  });
  // …and the hand rises away as the stack takes over.
  const y = useTransform(p, [0.55, 0.9], [0, -80]);
  const opacity = useTransform(p, [0.55, 0.85], [1, 0]);

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

/**
 * Case video that rests on its first frame and comes alive on hover — the
 * landonorris.com case-card pattern. On a fine pointer (mouse) the clip only
 * plays while the frame is hovered or focused, which saves the browser from
 * decoding every visible case at once. On a coarse pointer (touch, no hover)
 * it falls back to playing whenever the card is on screen.
 */
function LazyVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Load the source (metadata → first frame) once the card nears the viewport,
  // so a still frame is painted at rest without streaming the whole clip.
  useEffect(() => {
    const el = ref.current;
    if (!el || !src) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            if (!el.src) {
              el.src = src;
              setLoaded(true);
            }
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [src]);

  // Coarse-pointer (touch) fallback: no hover exists, so autoplay while in view.
  useEffect(() => {
    if (!loaded) return;
    const el = ref.current;
    if (!el) return;
    const coarse = window.matchMedia('(hover: none)').matches;
    if (!coarse) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) void el.play().catch(() => {});
          else el.pause();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loaded]);

  // Force a painted first frame so the resting state isn't blank.
  const onLoadedMetadata = () => {
    const el = ref.current;
    if (el && el.currentTime === 0) {
      try {
        el.currentTime = 0.05;
      } catch {
        /* seeking not ready yet — ignore */
      }
    }
  };

  const play = () => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(hover: none)').matches) return; // touch handles itself
    void el.play().catch(() => {});
  };
  const stop = () => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(hover: none)').matches) return;
    el.pause();
  };

  return (
    <video
      ref={ref}
      className="work-case-video"
      muted
      loop
      playsInline
      preload="metadata"
      onLoadedMetadata={onLoadedMetadata}
      onMouseEnter={play}
      onMouseLeave={stop}
      onFocus={play}
      onBlur={stop}
    />
  );
}
