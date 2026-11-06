'use client';

import { useEffect, useRef, useState } from 'react';
import type { Sample } from '@/lib/samples';

/**
 * A sample: its poster (thumb.webp, 540 × 960) and its first seconds (preview.mp4) playing while pointed at.
 * On a touch screen the first tap plays it and the second opens it, as the samples page says; it stops once
 * it leaves the screen. Opens the sample's own page (/samples/<slug>).
 */
export default function VCard({ s, town = 'before' }: { s: Sample; town?: 'before' | 'after' }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const hover = useRef(false);
  useEffect(() => {
    hover.current = matchMedia('(hover: hover) and (pointer: fine)').matches;
    const el = ref.current;
    if (!el || hover.current) return;
    const io = new IntersectionObserver(([e]) => !e.isIntersecting && stop());
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const play = () => {
    const v = vid.current;
    if (!v || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll<HTMLVideoElement>('.vcard.is-playing video').forEach((o) => o !== v && o.pause());
    v.currentTime = 0;
    v.play().then(() => setPlaying(true)).catch(() => {});
  };
  const stop = () => {
    vid.current?.pause();
    setPlaying(false);
  };
  return (
    <a
      ref={ref}
      className={`vcard${playing ? ' is-playing' : ''}`}
      href={`/samples/${s.slug}`}
      onPointerEnter={() => hover.current && play()}
      onPointerLeave={() => hover.current && stop()}
      onFocus={() => hover.current && play()}
      onBlur={() => hover.current && stop()}
      onClick={(e) => {
        if (hover.current || playing) return;
        e.preventDefault();
        play();
      }}
    >
      <span className="vcard-media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/samples/${s.slug}/thumb.webp`} alt="" loading="lazy" width={540} height={960} />
        <video ref={vid} src={`/samples/${s.slug}/preview.mp4`} muted loop playsInline preload="none" />
      </span>
      <span className="vcard-t">
        <span className="vcard-name">{s.name}</span>
        <span className="vcard-line">{town === 'before' ? `${s.town} · ${s.line}` : s.line}</span>
        {town === 'after' && <span className="vcard-line">{s.town}</span>}
      </span>
    </a>
  );
}
