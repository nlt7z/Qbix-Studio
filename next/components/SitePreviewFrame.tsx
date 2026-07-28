'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * A live website preview that never distorts.
 *
 * The iframe fills its frame at 1:1 (no transform-scale), so the target site
 * simply lays itself out responsively at the frame's real pixel size — a live,
 * undistorted mini-browser on every device. The parent supplies the aspect box.
 * Streams the iframe only once it nears the viewport.
 */
export default function SitePreviewFrame({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [load, setLoad] = useState(false);

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

  return (
    <div
      ref={ref}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: 'var(--bg-2)' }}
    >
      {load && (
        <iframe
          src={src}
          title={title}
          loading="lazy"
          referrerPolicy="no-referrer"
          sandbox="allow-same-origin allow-scripts"
          tabIndex={-1}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            border: 0,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
}
