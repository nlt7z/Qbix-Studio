import type { ReactNode } from 'react';

/** Questions as native disclosure rows — keyboard and screen-reader friendly.
 *  An item marked `open` starts expanded (the one answer worth showing). */
export default function Faq({
  items,
  className = '',
}: {
  items: { q: string; a: ReactNode; open?: boolean }[];
  className?: string;
}) {
  return (
    <div className={`offer-faq ${className}`}>
      {items.map((it) => (
        <details key={it.q} className="offer-faq-item" open={it.open}>
          <summary>
            <span>{it.q}</span>
            <span className="offer-faq-mark" aria-hidden>+</span>
          </summary>
          <p>{it.a}</p>
        </details>
      ))}
    </div>
  );
}
