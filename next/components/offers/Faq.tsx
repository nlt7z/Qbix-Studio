/** Questions as native disclosure rows — keyboard and screen-reader friendly. */
export default function Faq({ items, className = '' }: { items: { q: string; a: string }[]; className?: string }) {
  return (
    <div className={`offer-faq ${className}`}>
      {items.map((it) => (
        <details key={it.q} className="offer-faq-item">
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
