/** The regular price, struck through, read out as "Regular price $X". */
export function WasPrice({ value, className = '' }: { value: string; className?: string }) {
  return (
    <del className={`was-price ${className}`} aria-label={`Regular price ${value}`}>
      {value}
    </del>
  );
}

/** Small "Exclusive offer" badge that sits next to a sale price. */
export function OfferBadge({ className = '' }: { className?: string }) {
  return <span className={`offer-badge mono ${className}`}>Exclusive offer</span>;
}
