'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * A live website preview that always shows the *complete* desktop layout.
 *
 * The iframe is rendered at a fixed desktop viewport (default 1600px wide) so
 * the target site lays itself out exactly as it would on a real desktop, then
 * the whole thing is scaled down by `frameWidth / baseWidth` to fit the frame —
 * transform-origin at top-left, frame clipping the overflow. So every preview is
 * a faithful, un-squished miniature of the real site at that aspect, never a
 * cramped mobile reflow. The parent supplies the aspect box (position it, give
 * it a width/height); this fills it absolutely. Streams in once near viewport.
 */
export default function SitePreviewFrame({
  src,
  title,
  baseWidth = 1600,
}: {
  src: string;
  title: string;
  /** Logical desktop viewport width the site renders at before scaling. */
  baseWidth?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [load, setLoad] = useState(false);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);

  // Stream the iframe only once the frame nears the viewport.
  useEffect(() => {
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
  }, []);

  // Measure the frame so a full-desktop render can be scaled to fit it exactly.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect;
      setBox({ w: cr.width, h: cr.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = box ? box.w / baseWidth : null;
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
