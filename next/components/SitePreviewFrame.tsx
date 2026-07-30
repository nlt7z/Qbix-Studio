'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * A website preview that always shows the *complete* desktop layout.
 *
 * Preferred mode — `poster`: a pre-captured 1600px-wide desktop screenshot of
 * the site, shown as a plain image filling the frame. Visually identical to a
 * live embed at these scales (the iframe was pointer-disabled and unreadable
 * anyway) but it cannot crash the page: three live sites rendering desktop
 * layouts with WebGL inside iframes was OOM-killing mobile Safari ("can't
 * open page") and could take down desktop tabs too.
 *
 * Fallback mode — no `poster`: a live iframe rendered at a fixed desktop
 * viewport (default 1600px) scaled down to fit the frame exactly. Kept for
 * cases where no capture exists yet; streams in only near the viewport.
 */
export default function SitePreviewFrame({
  src,
  title,
  poster,
  baseWidth = 1600,
}: {
  src: string;
  title: string;
  /** Path to a pre-captured desktop screenshot (public/…) — preferred. */
  poster?: string;
  /** Logical desktop viewport width the live site renders at before scaling. */
  baseWidth?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [load, setLoad] = useState(false);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);

  // Stream the live iframe only once the frame nears the viewport.
  useEffect(() => {
    if (poster) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setLoad(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [poster]);

  // Measure the frame so a full-desktop render can be scaled to fit it exactly.
  useEffect(() => {
    if (poster) return;
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect;
      setBox({ w: cr.width, h: cr.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [poster]);

  if (poster) {
    return (
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: 'var(--bg-2)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={poster}
          alt={title}
          loading="lazy"
          decoding="async"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top',
            maxWidth: 'none',
          }}
        />
      </div>
    );
  }

  const scale = box && box.w > 0 ? box.w / baseWidth : null;
  // Give the iframe enough logical height that, once scaled, it fills the frame.
  const baseHeight = box && scale ? box.h / scale : 0;

  return (
    <div
      ref={ref}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: 'var(--bg-2)' }}
    >
      {load && scale !== null && (
        <iframe
          src={src}
          title={title}
          loading="lazy"
          referrerPolicy="no-referrer"
          sandbox="allow-same-origin allow-scripts"
          tabIndex={-1}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${baseWidth}px`,
            height: `${baseHeight}px`,
            // Beat the global `iframe { max-width: 100% }` — the whole point is
            // rendering at desktop width and scaling down, so the cap must go.
            maxWidth: 'none',
            maxHeight: 'none',
            border: 0,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
}
