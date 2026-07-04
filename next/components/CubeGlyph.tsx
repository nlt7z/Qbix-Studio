/**
 * The studio's atomic bullet — a tiny axonometric cube. Used in place of
 * Linear-style round dots and pill chips, so every accent in the system
 * reads as cube-derived. Pure SVG, scales by `size`.
 */
export default function CubeGlyph({
  size = 14,
  lit = false,
  className,
}: {
  size?: number;
  lit?: boolean;
  className?: string;
}) {
  // 16×16 viewBox, center (8,8), r = 6. True isometric (30° edges).
  // top (8, 2.80), upL (2.80, 5), upR (13.20, 5), mid (8,8),
  // loL (2.80, 11), loR (13.20, 11), bot (8, 13.20).
  const topFill   = lit ? '#B8FF00'                : 'rgba(247,248,248,0.62)';
  const leftFill  = lit ? 'rgba(15,26,0,0.85)'     : 'rgba(255,255,255,0.18)';
  const rightFill = lit ? 'rgba(8,12,0,0.95)'      : 'rgba(255,255,255,0.08)';
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      className={className}
      style={{ display: 'block' }}
      aria-hidden
    >
      <path d="M 8 2.80 L 13.20 5 L 8 8 L 2.80 5 Z" fill={topFill} />
      <path d="M 2.80 5 L 8 8 L 8 13.20 L 2.80 11 Z" fill={leftFill} />
      <path d="M 13.20 5 L 8 8 L 8 13.20 L 13.20 11 Z" fill={rightFill} />
      {lit && (
        <>
          <path
            d="M 8 2.80 L 2.80 5"
            stroke="#E8FF7A"
            strokeWidth="0.5"
            strokeLinecap="round"
          />
          <circle cx="8" cy="13.20" r="0.7" fill="#E8FF7A" />
        </>
      )}
    </svg>
  );
}
