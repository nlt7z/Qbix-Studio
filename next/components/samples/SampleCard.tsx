'use client';

import { useCallback, useEffect, useRef, useState, type FocusEvent, type MouseEvent, type PointerEvent } from 'react';
import { useReducedMotionSafe } from '@/components/useReducedMotionSafe';
import type { Sample } from '@/lib/samples';

/**
 * A sample: its cover, and under it who it was made for. Pointed at (or tapped once, on a
 * phone) it plays its preview in place, muted and looped, the video rising into the cover;
 * a click (or a second tap) opens the sample's own page. One card plays at a time, only
 * while it's on screen, and none with reduced motion (the card is then a plain link).
 * The preview isn't fetched until it's asked for (preload none).
 */

// the card that's playing, so the next one to start can stop it
let stopPlaying: (() => void) | null = null;

export default function SampleCard({ sample }: { sample: Sample }) {
  const { slug, name, town, line } = sample;
  const card = useRef<HTMLAnchorElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const pointer = useRef('');
  const playing = useRef(false);
  const attempt = useRef(0);
  // a preview that won't load: the card is just a link
  const broken = useRef(false);
  const [on, setOn] = useState(false);
  const [live, setLive] = useState(false);
  const reduced = useReducedMotionSafe();

  const stop = useCallback(() => {
    if (stopPlaying === stop) stopPlaying = null;
    attempt.current++;
    playing.current = false;
    video.current?.pause();
    setOn(false);
    setLive(false);
  }, []);

  const start = useCallback(() => {
    const v = video.current;
    if (!v || playing.current || broken.current) return;
    if (stopPlaying) stopPlaying();
    stopPlaying = stop;
    playing.current = true;
    setOn(true);
    v.muted = true;
    v.currentTime = 0;
    const id = ++attempt.current;
    v.play().catch((err: DOMException) => {
      // a pause that interrupts it, or a newer start, isn't a failure
      if (attempt.current !== id || err?.name === 'AbortError') return;
      if (err?.name !== 'NotAllowedError') broken.current = true;
      stop();
    });
  }, [stop]);

  // Off screen, it stops.
  useEffect(() => {
    const el = card.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (playing.current && (!e.isIntersecting || e.intersectionRatio < 0.5)) stop();
      },
      { threshold: [0, 0.5] },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (playing.current) stop();
    };
  }, [stop]);

  useEffect(() => {
    if (reduced && playing.current) stop();
  }, [reduced, stop]);

  const onPointerEnter = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && !reduced) start();
  };
  const onPointerLeave = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') stop();
  };
  // A first tap plays it; the second, while it plays, goes through to the sample.
  const onClick = (e: MouseEvent) => {
    const touch = pointer.current === 'touch' || pointer.current === 'pen';
    pointer.current = '';
    if (touch && !reduced && !broken.current && !playing.current) {
      e.preventDefault();
      start();
    }
  };
  const onFocus = (e: FocusEvent<HTMLAnchorElement>) => {
    if (!reduced && e.currentTarget.matches(':focus-visible')) start();
  };
  const onBlur = (e: FocusEvent<HTMLAnchorElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) stop();
  };

  return (
    <a
      ref={card}
      className="smp-card"
      href={`/samples/${slug}`}
      data-on={on || undefined}
      data-live={live || undefined}
      onPointerDown={(e) => (pointer.current = e.pointerType)}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onClick={onClick}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <span className="smp-media">
        <img src={`/samples/${slug}/thumb.webp`} alt="" width={540} height={960} loading="lazy" decoding="async" draggable={false} />
        {!reduced && (
          <video
            ref={video}
            className="smp-video"
            src={`/samples/${slug}/preview.mp4`}
            muted
            loop
            playsInline
            disablePictureInPicture
            preload="none"
            aria-hidden
            tabIndex={-1}
            onPlaying={() => {
              if (playing.current) setLive(true);
            }}
            onError={() => {
              broken.current = true;
              stop();
            }}
          />
        )}
      </span>
      <span className="smp-text">
        <span className="smp-name">
          {name}
          <span className="smp-arrow" aria-hidden>
            ↗︎
          </span>
        </span>
        <span className="smp-town">{town}</span>
        <span className="smp-line">{line}</span>
      </span>
    </a>
  );
}
