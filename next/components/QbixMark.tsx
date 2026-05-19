type Variant = 'mark' | 'wordmark';

type QbixMarkProps = {
  variant?: Variant;
  height?: number;
  className?: string;
  title?: string;
};

/**
 * Qbix monogram: an axonometric cube viewed from upper-front, with a lime
 * tail-descender that turns the cube into a Q. The cube's three visible
 * faces carry the studio's gray-ladder. Tail is the lone lime cue.
 *
 * variant="mark"      — cube only, square viewBox.
 * variant="wordmark"  — cube + "bix" set in Instrument Serif italic.
 */
export default function QbixMark({
  variant = 'mark',
  height = 28,
  className,
  title = 'Qbix Studio',
}: QbixMarkProps) {
  if (variant === 'wordmark') {
    return (
      <span
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: height * 0.18,
          lineHeight: 1,
        }}
        aria-label={title}
      >
        <CubeQ size={height} />
        <span
          aria-hidden
          style={{
            fontFamily: 'var(--font-headline)',
            fontStyle: 'normal',
            fontWeight: 600,
            fontSize: height * 0.86,
            letterSpacing: '-0.045em',
            color: 'var(--ink)',
            lineHeight: 1,
          }}
        >
          bix
        </span>
      </span>
    );
  }

  return <CubeQ size={height} className={className} title={title} />;
}

function CubeQ({
  size = 32,
  className,
  title,
}: {
  size?: number;
  className?: string;
  title?: string;
}) {
  // 32×32 viewBox. Cube center (16,16). r = 11. True isometric (30° edges).
  // Apex points pre-computed: cos30 ≈ 0.866, sin30 = 0.5, sin60 ≈ 0.866.
  // top (16, 6.47), upL (6.47, 10.5), upR (25.53, 10.5),
  // mid (16, 16), loL (6.47, 21.5), loR (25.53, 21.5), bot (16, 25.53).
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={title}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="qx-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#F4F6F7" stopOpacity="0.96" />
          <stop offset="100%" stopColor="#C9CDD3" stopOpacity="0.78" />
        </linearGradient>
        <linearGradient id="qx-left" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#9CA0A7" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#3D4046" stopOpacity="0.78" />
        </linearGradient>
        <linearGradient id="qx-right" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#5B5E64" stopOpacity="0.66" />
          <stop offset="100%" stopColor="#1B1C1F" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="qx-tail" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stopColor="#D9FF5A" />
          <stop offset="100%" stopColor="#B8FF00" />
        </linearGradient>
      </defs>

      {/* TOP face */}
      <path
        d="M 16 6.47 L 25.53 10.5 L 16 16 L 6.47 10.5 Z"
        fill="url(#qx-top)"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="0.5"
      />
      {/* LEFT face */}
      <path
        d="M 6.47 10.5 L 16 16 L 16 25.53 L 6.47 21.5 Z"
        fill="url(#qx-left)"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="0.5"
      />
      {/* RIGHT face */}
      <path
        d="M 25.53 10.5 L 16 16 L 16 25.53 L 25.53 21.5 Z"
        fill="url(#qx-right)"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="0.5"
      />

      {/* Inner specular highlight along the top-left edge */}
      <path
        d="M 16 6.47 L 6.47 10.5"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="0.6"
        strokeLinecap="round"
      />

      {/* The TAIL — the cue that turns the cube into a Q.
          A short axonometric stroke breaking out of the lower-right vertex. */}
      <path
        d="M 25.53 21.5 L 30 24"
        stroke="url(#qx-tail)"
        strokeWidth="2.2"
        strokeLinecap="square"
      />
      {/* Tail joint dot — micro-detail, reads as a cube vertex */}
      <circle cx="25.53" cy="21.5" r="0.9" fill="#B8FF00" />
    </svg>
  );
}
